import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ListaCompra } from './entities/lista-compra.entity';
import { CreateListaCompraDto } from './dto/create-lista-compra.dto';
import { UpdateListaCompraDto } from './dto/update-lista-compra.dto';

@Injectable()
export class ListaCompraService {
  constructor(
    @InjectRepository(ListaCompra)
    private readonly listaCompraRepository: Repository<ListaCompra>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(
    createListaCompraDto: CreateListaCompraDto,
    userUid: string,
  ): Promise<ListaCompra> {
    const listaCompra = this.listaCompraRepository.create({
      ...createListaCompraDto,
      uid_firebase: userUid,
    });
    return this.listaCompraRepository.save(listaCompra);
  }

  async findAll(uid_firebase: string): Promise<ListaCompra[]> {
    return this.listaCompraRepository
      .createQueryBuilder('lista')
      .where('lista.uid_firebase = :uid', { uid: uid_firebase })
      .orderBy('lista.fecha', 'DESC')
      .addOrderBy('lista.nombre_producto', 'ASC')
      .getMany();
  }

  async findOne(id: number, userUid: string): Promise<ListaCompra> {
    const lista = await this.listaCompraRepository.findOneBy({ id });
    if (!lista) throw new NotFoundException('Elemento de lista no encontrado');

    if (lista.uid_firebase !== userUid) {
      throw new ForbiddenException('No puedes ver listas de otros usuarios');
    }

    return lista;
  }

  async update(
    id: number,
    updateListaCompraDto: UpdateListaCompraDto,
    userUid: string,
  ): Promise<ListaCompra> {
    const lista = await this.findOne(id, userUid);

    Object.assign(lista, updateListaCompraDto);
    return this.listaCompraRepository.save(lista);
  }

  async remove(id: number): Promise<void> {
    const result = await this.listaCompraRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Elemento de lista no encontrada');
  }
}
