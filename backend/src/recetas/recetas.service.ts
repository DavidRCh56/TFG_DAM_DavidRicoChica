import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from './entities/receta.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  //basicamente como el de usuarios, comprueba si el usuario con el uid existe en mi base de datos,
  //si existe recoge el rol y lo devuelve
  private async getUserRole(uid: string): Promise<string> {
    const usuario = await this.usuarioRepository.findOneBy({
      uid_firebase: uid,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario.rol;
  }

  async create(
    createRecetaDto: CreateRecetaDto,
    userUid: string,
  ): Promise<Receta> {
    const userRole = await this.getUserRole(userUid);

    if (createRecetaDto.predeterminada && userRole !== 'admin') {
      throw new ForbiddenException(
        'Solo administradores pueden crear recetas predeterminadas',
      );
    }
    const receta = this.recetaRepository.create({
      ...createRecetaDto,
      ingredientes: JSON.stringify(createRecetaDto.ingredientes),
    });
    return this.recetaRepository.save(receta);
  }

  //devuelvo las recetas que tienen ese uid en la base de datos o las recetas
  //que tegan el valor de predeterminada en true/1
  async findAll(uid_firebase: string): Promise<Receta[]> {
    return this.recetaRepository
      .createQueryBuilder('receta')
      .where('receta.uid_firebase = :uid OR receta.predeterminada = true', {
        uid: uid_firebase,
      })
      .getMany();
  }

  async findOne(id: number): Promise<Receta> {
    const receta = await this.recetaRepository.findOneBy({ id });
    if (!receta) throw new NotFoundException('Receta no encontrada');
    return receta;
  }

  async update(
    id: number,
    updateRecetaDto: UpdateRecetaDto,
    userUid: string,
  ): Promise<Receta> {
    const receta = await this.findOne(id);
    const userRole = await this.getUserRole(userUid);

    if (receta.predeterminada && userRole !== 'admin') {
      throw new ForbiddenException(
        'Solo administradores pueden modificar recetas predeterminadas',
      );
    }

    if (userRole !== 'admin' && receta.uid_firebase !== userUid) {
      throw new ForbiddenException(
        'No puede modificar recetas de otros usuarios',
      );
    }

    if (updateRecetaDto.predeterminada !== undefined && userRole !== 'admin') {
      throw new ForbiddenException(
        'Solo administradores pueden cambiar el estado predeterminado',
      );
    }

    //esto transforma ingredientes en json, ya que lo que me devuelve la base de datos
    //es un texto y pense en hacer esto, para luego poder hacer un buscador a la hora
    //de añadir los ingredientes para que el prespuesto me sea mas facil,
    //no se si lo terminare haciendo asi
    Object.assign(receta, {
      ...updateRecetaDto,
      ingredientes: updateRecetaDto.ingredientes
        ? JSON.stringify(updateRecetaDto.ingredientes)
        : receta.ingredientes,
    });
    return this.recetaRepository.save(receta);
  }

  async remove(id: number, userUid: string): Promise<void> {
    const receta = await this.findOne(id);
    const userRole = await this.getUserRole(userUid);

    if (receta.predeterminada && userRole !== 'admin') {
      throw new ForbiddenException(
        'Solo administradores pueden eliminar recetas predeterminadas',
      );
    }

    if (userRole !== 'admin' && receta.uid_firebase !== userUid) {
      throw new ForbiddenException(
        'No puede eliminar recetas de otros usuarios',
      );
    }

    const result = await this.recetaRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Receta no encontrada');
  }
}
