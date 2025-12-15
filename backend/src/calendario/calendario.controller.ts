import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { CalendarioService } from './calendario.service';
import { CreateCalendarioDto } from './dto/create-calendario.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('calendario')
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  @Get()
  findByUser(@Query('uid_firebase') uid_firebase: string) {
    return this.calendarioService.findByUser(uid_firebase);
  }

  @Post('crear-actualizar')
  crearActualizarCalendario(@Body() body: CreateCalendarioDto) {
    return this.calendarioService.crearActualizarCalendario(body);
  }
}
