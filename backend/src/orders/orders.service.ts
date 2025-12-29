import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Subscription, SubscriptionStatus } from 'src/subscriptions/entities/subscription.entity';
import { Product } from 'src/products/entities/product.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { Pet } from 'src/pets/entities/pet.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}

  // 1. CREATE ORDER (Supports Guest)
  // Changed userId to allow null
  async create(userId: string | null, createOrderDto: CreateOrderDto) {
    const { addressId, items, paymentType, isGuest, guestInfo } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let addressSnapshot: any = {};

      // A. ADDRESS LOGIC
      if (userId) {
          // Member: Find saved address
          const address = await queryRunner.manager.findOne(Address, {
            where: { id: addressId, userId },
          });
          if (!address) throw new NotFoundException('Delivery address not found.');
          addressSnapshot = address;
      } else {
          // Guest: Use provided info
          if (!guestInfo) throw new BadRequestException('Guest information is missing.');
          addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      // B. Variables
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      // C. LOOP ITEMS
      for (const item of items) {
        const product = await queryRunner.manager.findOne(Product, { 
            where: { id: item.productId }
           });
        
        if (!product) throw new NotFoundException(`Product not found (ID: ${item.productId})`);
        
        // Stock Check
        if (product.stock < item.quantity) {
           throw new BadRequestException(`Insufficient stock for ${product.name}.`);
        }

        // --- 💰 PRICE CALCULATION ---
        let itemTotal = Number(product.price) * item.quantity;
        const itemDuration = item.duration || 1;

        if (paymentType === 'upfront') {
            itemTotal = itemTotal * itemDuration;
        } else {
            itemTotal = itemTotal * 1; 
        }

        totalPrice += itemTotal;

        // Create Order Item
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.productId = Number(product.id); 
        orderItem.quantity = item.quantity;
        orderItem.priceAtPurchase = product.price; 
        orderItem.productNameSnapshot = product.name; 
        orderItems.push(orderItem);

        // Deduct Stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        // --- 📅 SUBSCRIPTION LOGIC ---
        // (Only create subscription if it's a user, guests usually get one-time trial or simple record)
        // For this logic, we will create a subscription record but userId will be null for guests
        // or we skip subscription creation for guests if your business logic dictates.
        // Assuming we create it but without a user relation for guests:

        if (item.subscriptionId) {
            // EXTEND EXISTING
            const existingSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: item.subscriptionId } 
            });

            if (existingSub) {
                existingSub.totalMonths += itemDuration;
                existingSub.remainingMonths += itemDuration;
                
                if (existingSub.status === SubscriptionStatus.COMPLETED || existingSub.status === SubscriptionStatus.CANCELLED) {
                    existingSub.status = SubscriptionStatus.ACTIVE;
                }
                await queryRunner.manager.save(Subscription, existingSub);
            }
        } 
        else {
            // NEW SUBSCRIPTION
            const subscription = new Subscription();
            if (userId) subscription.user = { id: userId } as User; // Only link if user exists
            subscription.product = product;
            
            if (createOrderDto.petId) {
                 const pet = await queryRunner.manager.findOne(Pet, { where: { id: createOrderDto.petId } });
                 if (pet) subscription.pet = pet;
            }

            subscription.deliveryPeriod = item.deliveryPeriod || "1-5 of Month";
            subscription.totalMonths = itemDuration;
            subscription.remainingMonths = itemDuration;
            subscription.startDate = new Date();
            
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            subscription.nextDeliveryDate = nextDate;
            
            subscription.status = SubscriptionStatus.ACTIVE;
            
            await queryRunner.manager.save(Subscription, subscription);
        }
      }

      // D. SAVE ORDER
      const order = new Order();
      if (userId) order.user = { id: userId } as User; // Link user only if exists
      
      // We assume shippingAddressSnapshot is a JSON column or simple fields in your entity
      // If it's a relation, this needs adjustment. Assuming JSON/Embedded based on "Snapshot" name.
      order.shippingAddressSnapshot = addressSnapshot; 
      
      order.totalPrice = totalPrice;
      order.status = OrderStatus.PAID; 
      order.items = orderItems;
      order.paymentId = 'MOCK_' + Date.now(); 

      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return { success: true, orderId: savedOrder.id, message: 'Order received!' };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Other Methods ---
  async findMyOrders(userId: string) {
    return await this.dataSource.getRepository(Order).find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product'], 
    });
  }

  async findAll() {
    return await this.dataSource.getRepository(Order).find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'items'],
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.dataSource.getRepository(Order).findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    
    order.status = status;
    return await this.dataSource.getRepository(Order).save(order);
  }
}