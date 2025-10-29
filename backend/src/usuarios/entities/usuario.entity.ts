import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  uid_firebase: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  nombre_usuario: string;

  @Column({
    type: 'enum',
    enum: ['cliente', 'moderador', 'admin'],
    default: 'cliente',
  })
  rol: 'cliente' | 'moderador' | 'admin';
}
