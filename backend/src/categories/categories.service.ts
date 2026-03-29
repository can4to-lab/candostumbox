import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../products/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // URL dostu isim (slug) oluşturucu
  private generateSlug(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  async findAll() {
    return this.categoryRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Kategori bulunamadı');
    return category;
  }

  async create(data: any) {
    let slug = this.generateSlug(data.name);
    
    // Aynı isimde kategori varsa sonuna sayı ekle çakışmasın
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newCategory = this.categoryRepository.create({
      name: data.name,
      slug: slug,
      description: data.description,
    });

    return this.categoryRepository.save(newCategory);
  }

  async update(id: string, data: any) {
    const category = await this.findOne(id);
    const updatedCategory = this.categoryRepository.merge(category, {
      name: data.name,
      description: data.description,
    });
    return this.categoryRepository.save(updatedCategory);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    return this.categoryRepository.remove(category);
  }
}