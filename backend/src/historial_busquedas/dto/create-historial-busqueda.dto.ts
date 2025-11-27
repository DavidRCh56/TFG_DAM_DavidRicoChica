import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHistorialBusquedaDto {
  @IsString()
  @IsNotEmpty()
  termino_busqueda: string;
}
