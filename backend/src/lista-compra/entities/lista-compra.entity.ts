import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('listas_compra')
export class ListaCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 128 })
  uid_firebase: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.uid_firebase)
  @JoinColumn({ name: 'uid_firebase' })
  usuario: Usuario;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 30 })
  id_producto: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_producto: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'varchar', length: 20 })
  supermercado: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;
}
