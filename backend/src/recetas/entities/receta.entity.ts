import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 128 })
  uid_firebase: string;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text' })
  ingredientes: string;

  @Column({ type: 'text' })
  pasos: string;

  @Column({ type: 'text' })
  url_imagen: string;

  @Column({ type: 'boolean', default: false })
  predeterminada: boolean;

  @Column({ type: 'boolean', default: false })
  compartida: boolean;
}
