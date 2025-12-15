import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialBusqueda } from './entities/historial-busqueda.entity';
import { HistorialBusquedasService } from './historial-busquedas.service';
import { HistorialBusquedasController } from './historial-busquedas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialBusqueda])],
  providers: [HistorialBusquedasService],
  controllers: [HistorialBusquedasController],
})
export class HistorialBusquedasModule {}
