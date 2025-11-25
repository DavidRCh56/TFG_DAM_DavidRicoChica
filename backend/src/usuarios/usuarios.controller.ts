import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Delete,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import type { Request } from 'express';

/**
 * interface que extiende la interfaz Request de Express para incluir el campo "user"
 * esta propiedad "user" la inyecta el guardia de autenticación FirebaseAuthGuard una vez valida el token JWT,
 * user es un objeto que debe tener al menos un identificador único "uid" de tipo string para identificar al usuario,
 * el índice "[key: string]: any;" indica que "user" puede contener otras propiedades adicionales (como email, name, etc)
 * sin restricciones de tipo
 * este interface sirve para que en el controlador TypeScript entienda que req.user existe y tiene una estructura determinada,
 * evitando errores y warnings relacionados con el acceso a propiedades no declaradas en Request original
 */
interface RequestConUser extends Request {
  user: {
    uid: string;
    email?: string;
    rol?: string;
    [key: string]: any;
  };
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    return { success: true, usuario };
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('verificacion-token')
  verificarToken(@Req() req: RequestConUser) {
    // si el guardia pasa, el token es válido y usuario está en req.user
    return {
      esValido: true,
      uid: req.user.uid,
      mensaje: 'Token válido',
    };
  }

  // @UseGuards con FirebaseAuthGuard indica que esta ruta '/usuarios/logout' está protegida:
  // solo usuarios autenticados pueden acceder, y el guard valida el token con Firebase
  // al pasar el guardia, el objeto decodificado del token es inyectado en req.user
  @UseGuards(FirebaseAuthGuard)
  @Post('logout')
  async logout(@Req() req: RequestConUser) {
    // extraemos user del request de la interfaz que he creado
    // usamos el uid para llamar al servicio que revoca el token (logout)
    return this.usuariosService.logout(req.user.uid);
  }

  //este es para usarlo en metodos del back
  @UseGuards(FirebaseAuthGuard)
  private async getUserRole(req: RequestConUser): Promise<string> {
    if (req.user.rol) return req.user.rol;
    const usuario = await this.usuariosService.findByUid(req.user.uid);
    return usuario?.rol || 'cliente';
  }

  //este es para mandarlo al front
  @UseGuards(FirebaseAuthGuard)
  @Get('rol')
  async getRole(@Req() req: RequestConUser) {
    const user = await this.usuariosService.findByUid(req.user.uid);
    if (!user) {
      return { rol: null, mensaje: 'Usuario no encontrado' };
    }
    return { rol: user.rol };
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(':uid')
  async update(
    @Req() req: RequestConUser,
    @Param('uid') uid: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto & { password?: string },
  ) {
    const rol = await this.getUserRole(req);
    if (rol === 'admin') {
      if (updateUsuarioDto.password) {
        throw new ForbiddenException(
          'Admin no puede cambiar la contraseña de otros usuarios',
        );
      }
      return this.usuariosService.updateAdmin(uid, updateUsuarioDto);
    } else {
      if (uid !== req.user.uid) throw new ForbiddenException('No autorizado');
      return this.usuariosService.update(uid, updateUsuarioDto);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async findAll(@Req() req: RequestConUser) {
    const rol = await this.getUserRole(req);
    if (rol !== 'admin') throw new ForbiddenException('Acceso denegado');
    return this.usuariosService.findAll();
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':uid')
  async remove(@Req() req: RequestConUser, @Param('uid') uid: string) {
    const rol = await this.getUserRole(req);
    if (rol === 'admin') {
      return this.usuariosService.remove(uid);
    } else {
      if (uid !== req.user.uid) throw new ForbiddenException('No autorizado');
      return this.usuariosService.remove(uid);
    }
  }
}
