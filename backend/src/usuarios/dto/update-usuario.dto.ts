import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  password?: string;
  foto_url?: string;

  @IsOptional()
  @IsIn(['cliente', 'admin'])
  rol?: 'cliente' | 'admin';
}
