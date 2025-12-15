import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Receta } from '../../recetas/entities/receta.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('recetas_favoritas')
export class RecetaFavorita {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  uid_firebase: string;

  @PrimaryColumn()
  receta_id: number;

  @ManyToOne(() => Usuario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'uid_firebase' })
  usuario: Usuario;

  @ManyToOne(() => Receta, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receta_id' })
  receta: Receta;
}
