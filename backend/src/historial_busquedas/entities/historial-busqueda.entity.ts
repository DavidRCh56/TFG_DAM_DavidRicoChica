import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historial_busquedas')
export class HistorialBusqueda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 128 })
  uid_firebase: string;

  @Column({ type: 'varchar', length: 255 })
  termino_busqueda: string;
}
