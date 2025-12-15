import { PartialType } from '@nestjs/mapped-types';
import { CreateListaCompraDto } from './create-lista-compra.dto';

export class UpdateListaCompraDto extends PartialType(CreateListaCompraDto) {}
