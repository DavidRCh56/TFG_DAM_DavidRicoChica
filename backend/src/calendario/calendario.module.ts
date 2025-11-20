import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendario } from './entities/calendario.entity';
import { CalendarioService } from './calendario.service';
import { CalendarioController } from './calendario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Calendario])],
  controllers: [CalendarioController],
  providers: [CalendarioService],
})
export class CalendarioModule {}
