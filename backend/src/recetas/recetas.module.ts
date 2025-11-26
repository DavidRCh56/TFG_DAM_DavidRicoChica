import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receta } from './entities/receta.entity';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receta, Usuario]),
    FirebaseModule,
    UsuariosModule,
  ],
  providers: [RecetasService],
  controllers: [RecetasController],
})
export class RecetasModule {}
