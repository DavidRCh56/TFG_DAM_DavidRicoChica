import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendario } from './entities/calendario.entity';
import { CreateCalendarioDto } from './dto/create-calendario.dto';

@Injectable()
export class CalendarioService {
  constructor(
    @InjectRepository(Calendario)
    private calendarioRepository: Repository<Calendario>,
  ) {}

  findByUser(uid_firebase: string) {
    return this.calendarioRepository.find({ where: { uid_firebase } });
  }

  async crearActualizarCalendario(dto: CreateCalendarioDto) {
    let row = await this.calendarioRepository.findOne({
      where: { uid_firebase: dto.uid_firebase, fecha: dto.fecha },
    });

    if (row) {
      row.desayuno = dto.desayuno ?? null;
      row.comida = dto.comida ?? null;
      row.cena = dto.cena ?? null;
      return this.calendarioRepository.save(row);
    } else {
      row = this.calendarioRepository.create(dto);
      return this.calendarioRepository.save(row);
    }
  }
}
