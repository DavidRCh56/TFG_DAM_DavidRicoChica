import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('calendario')
export class Calendario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 128 })
  uid_firebase: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int', nullable: true })
  desayuno: number | null;

  @Column({ type: 'int', nullable: true })
  comida: number | null;

  @Column({ type: 'int', nullable: true })
  cena: number | null;
}
