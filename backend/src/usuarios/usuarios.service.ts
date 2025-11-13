import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      const usuario = this.usuarioRepository.create(createUsuarioDto);
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al guardar usuario: ' + message);
    }
  }

  async logout(uid: string): Promise<{ message: string }> {
    try {
      await this.firebaseService.getAuth().revokeRefreshTokens(uid);
      //revocar el token es para que cuando se haga logout no se pueda utilizar el
      //token de esa sesion
      return { message: 'Tokens revocados, logout exitoso' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al revocar tokens: ' + message);
    }
  }
}
