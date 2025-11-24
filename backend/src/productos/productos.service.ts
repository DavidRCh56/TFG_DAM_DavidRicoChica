import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Producto } from './entities/productos.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private repo: Repository<Producto>,
  ) {}

  async findAll(supermercado?: string): Promise<Producto[]> {
    const where: Partial<Producto> = supermercado
      ? { Supermercado: supermercado }
      : {};
    return this.repo.find({ where });
  }

  async paginate(
    page = 1,
    limit = 40,
    supermercado?: string,
  ): Promise<{ products: Producto[]; total: number }> {
    const where: Partial<Producto> = supermercado
      ? { Supermercado: supermercado }
      : {};
    const [products, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { Nombre: 'ASC' },
    });
    return { products, total };
  }

  async buscarPorNombre(
    nombre: string,
    supermercado?: string,
  ): Promise<Producto[]> {
    const where: Partial<Producto> = supermercado
      ? { Supermercado: supermercado }
      : {};
    if (nombre) {
      (where as { Nombre?: any }).Nombre = Like(`%${nombre}%`);
    }
    return this.repo.find({ where, order: { Nombre: 'ASC' } });
  }
}
