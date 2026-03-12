import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity'; 
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async create(createPetDto: CreatePetDto) {
    const newPet = this.petRepository.create(createPetDto);
    return await this.petRepository.save(newPet);
  }

  async findAll() {
    // Tüm petleri ve varsa sahiplerini getirir
    return await this.petRepository.find({ relations: ['user'] });
  }

  async findOne(id: number) {
    const pet = await this.petRepository.findOne({ 
      where: { id: id as any }, 
      relations: ['user'] 
    });
    if (!pet) throw new NotFoundException('Pet bulunamadı');
    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto) {
    await this.petRepository.update(id, updatePetDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const pet = await this.findOne(id);
    return await this.petRepository.remove(pet);
  }
}