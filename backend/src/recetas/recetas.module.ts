import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receta } from './entities/receta.entity';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [TypeOrmModule.forFeature([Receta]), FirebaseModule],
  providers: [RecetasService],
  controllers: [RecetasController],
})
export class RecetasModule {}
