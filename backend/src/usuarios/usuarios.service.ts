import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
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

  async update(
    uid: string,
    updateUsuarioDto: UpdateUsuarioDto & { password?: string },
  ): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({
      uid_firebase: uid,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    try {
      await this.firebaseService.getAuth().updateUser(uid, {
        email: updateUsuarioDto.email,
        password: updateUsuarioDto.password,
        displayName: updateUsuarioDto.nombre_usuario,
        photoURL: updateUsuarioDto.foto_url,
      });

      const { password, ...usuarioActualizado } = updateUsuarioDto;
      Object.assign(usuario, usuarioActualizado);

      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al actualizar usuario: ' + message);
    }
  }

  async remove(uid: string): Promise<{ message: string }> {
    const usuario = await this.usuarioRepository.findOneBy({
      uid_firebase: uid,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    try {
      await this.firebaseService.getAuth().deleteUser(uid);
      await this.usuarioRepository.delete({ uid_firebase: uid });
      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al eliminar usuario: ' + message);
    }
  }

  async logout(uid: string): Promise<{ message: string }> {
    try {
      await this.firebaseService.getAuth().revokeRefreshTokens(uid);
      // revocar el token es para que cuando se haga logout no se pueda utilizar el
      // token de esa sesion
      return {
        message: 'Tokens revocados, logout exitoso',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al revocar tokens: ' + message);
    }
  }

  async findByUid(uid: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { uid_firebase: uid } });
  }
}
