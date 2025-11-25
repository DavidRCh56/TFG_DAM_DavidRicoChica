import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecetaFavorita } from './entities/recetaFavorita.entity';
import { Receta } from '../recetas/entities/receta.entity';

@Injectable()
export class RecetasFavoritasService {
  constructor(
    @InjectRepository(RecetaFavorita)
    private readonly favoritaRepository: Repository<RecetaFavorita>,

    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
  ) {}

  async addFavorita(uid_firebase: string, receta_id: number): Promise<void> {
    const exists = await this.favoritaRepository.findOneBy({
      uid_firebase,
      receta_id,
    });
    if (exists) return;

    const favorita = this.favoritaRepository.create({
      uid_firebase,
      receta_id,
    });
    await this.favoritaRepository.save(favorita);
  }

  async removeFavorita(uid_firebase: string, receta_id: number): Promise<void> {
    const result = await this.favoritaRepository.delete({
      uid_firebase,
      receta_id,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Receta favorita no encontrada');
    }
  }

  async findFavoritas(uid_firebase: string): Promise<Receta[]> {
    const favoritas = await this.favoritaRepository.find({
      where: { uid_firebase },
      relations: ['receta'],
    });

    return favoritas.map((fav) => fav.receta);
  }
}
