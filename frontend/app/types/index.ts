// Tüm proje bu tipleri kullanacak
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number; // 👈 YENİ: Stok bilgisini ekledik
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  // ... diğer detaylar ihtiyaca göre eklenir
}
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}
export interface Subscription {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}
export interface Admin {
  id: number;
  name: string;
  email: string;
}
export interface Pet {
  id: number;
  name: string;
  type: string;
  age: number;
  weight: number;
}
export interface Address {
  id: number;
  userId: number;
  city: string;
  address: string;
}
export interface Quiz {
  id: number;
  name: string;
  description: string;
  questions: {
    id: number;
    question: string;
    options: {
      id: number;
      option: string;
    }[];
  }[];
}
export interface QuizOption {
  id: number;
  option: string;
}
export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}
export interface Instruction {
  id: number;
  description: string;
  steps: string[];
}
export interface InstructionStep {
  id: number;
  step: string;
}
// Quiz verisi için tip
export interface GuestPetData {
  petName: string;
  petSize: string;
}
