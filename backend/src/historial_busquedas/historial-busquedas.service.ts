import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialBusqueda } from './entities/historial-busqueda.entity';
import { CreateHistorialBusquedaDto } from './dto/create-historial-busqueda.dto';

@Injectable()
export class HistorialBusquedasService {
  constructor(
    @InjectRepository(HistorialBusqueda)
    private readonly historialRepository: Repository<HistorialBusqueda>,
  ) {}

  async guardarBusqueda(
    uid_firebase: string,
    createDto: CreateHistorialBusquedaDto,
  ) {
    const nuevoRegistro = this.historialRepository.create({
      uid_firebase,
      termino_busqueda: createDto.termino_busqueda,
    });
    return this.historialRepository.save(nuevoRegistro);
  }

  async listarPorUsuario(uid_firebase: string) {
    return this.historialRepository.find({
      where: { uid_firebase },
      order: { id: 'DESC' },
    });
  }
}
