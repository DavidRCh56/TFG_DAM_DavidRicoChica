import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaCompra } from './entities/lista-compra.entity';
import { ListaCompraService } from './lista-compra.service';
import { ListaCompraController } from './lista-compra.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([ListaCompra]), UsuariosModule],
  providers: [ListaCompraService],
  controllers: [ListaCompraController],
})
export class ListaCompraModule {}
