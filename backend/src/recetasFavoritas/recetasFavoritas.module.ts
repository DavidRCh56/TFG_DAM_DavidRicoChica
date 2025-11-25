import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetaFavorita } from './entities/recetaFavorita.entity';
import { RecetasFavoritasService } from './recetasFavoritas.service';
import { RecetasFavoritasController } from './recetasFavoritas.controller';
import { Receta } from '../recetas/entities/receta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecetaFavorita, Receta])],
  providers: [RecetasFavoritasService],
  controllers: [RecetasFavoritasController],
})
export class RecetasFavoritasModule {}
