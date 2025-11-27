import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { HistorialBusquedasService } from './historial-busquedas.service';
import { CreateHistorialBusquedaDto } from './dto/create-historial-busqueda.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

interface RequestConUser extends Request {
  user: {
    uid: string;
    [key: string]: any;
  };
}

@UseGuards(FirebaseAuthGuard)
@Controller('historial-busquedas')
export class HistorialBusquedasController {
  constructor(private readonly historialService: HistorialBusquedasService) {}

  @Post()
  async guardarBusqueda(
    @Req() req: RequestConUser,
    @Body() createDto: CreateHistorialBusquedaDto,
  ) {
    return this.historialService.guardarBusqueda(req.user.uid, createDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('listar')
  async listar(@Req() req: RequestConUser) {
    return this.historialService.listarPorUsuario(req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  async eliminarBusqueda(@Req() req: RequestConUser, @Param('id') id: string) {
    return this.historialService.eliminarBusqueda(Number(id), req.user.uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete()
  async eliminarTodoHistorial(@Req() req: RequestConUser) {
    return this.historialService.eliminarTodoHistorial(req.user.uid);
  }
}
