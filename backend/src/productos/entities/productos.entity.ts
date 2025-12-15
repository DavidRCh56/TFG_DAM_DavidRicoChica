import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  Id: string;

  @Column({ type: 'varchar', length: 255 })
  Nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  Precio_Pack: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  Formato: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Categoria: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  Supermercado: string;

  @Column({ type: 'text', nullable: true })
  Url: string;

  @Column({ type: 'text', nullable: true })
  Url_imagen: string;

  @Column({ type: 'boolean', default: false })
  Favorito: boolean;
}
