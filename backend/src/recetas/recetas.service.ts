import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
  ) {}

  async create(createRecetaDto: CreateRecetaDto): Promise<Receta> {
    const receta = this.recetaRepository.create({
      ...createRecetaDto,
      ingredientes: JSON.stringify(createRecetaDto.ingredientes),
    });
    return this.recetaRepository.save(receta);
  }

  findAll(): Promise<Receta[]> {
    return this.recetaRepository.find();
  }

  async findOne(id: number): Promise<Receta> {
    const receta = await this.recetaRepository.findOneBy({ id });
    if (!receta) throw new NotFoundException('Receta no encontrada');
    return receta;
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto): Promise<Receta> {
    const receta = await this.findOne(id);
    Object.assign(receta, {
      ...updateRecetaDto,
      ingredientes: updateRecetaDto.ingredientes
        ? JSON.stringify(updateRecetaDto.ingredientes)
        : receta.ingredientes,
    });
    return this.recetaRepository.save(receta);
  }

  async remove(id: number): Promise<void> {
    const result = await this.recetaRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Receta no encontrada');
  }
}
