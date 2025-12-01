import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ListaCompraService } from './lista-compra.service';
import { CreateListaCompraDto } from './dto/create-lista-compra.dto';
import { UpdateListaCompraDto } from './dto/update-lista-compra.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

interface RequestConUser extends Request {
  user: { uid: string };
}

@UseGuards(FirebaseAuthGuard)
@Controller('lista-compra')
export class ListaCompraController {
  constructor(private readonly listaCompraService: ListaCompraService) {}

  @Post()
  create(
    @Body() createListaCompraDto: CreateListaCompraDto,
    @Req() req: RequestConUser,
  ) {
    return this.listaCompraService.create(createListaCompraDto, req.user.uid);
  }

  @Get()
  findAll(@Query('uid_firebase') uid_firebase: string) {
    return this.listaCompraService.findAll(uid_firebase);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestConUser) {
    return this.listaCompraService.findOne(Number(id), req.user.uid);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateListaCompraDto: UpdateListaCompraDto,
    @Req() req: RequestConUser,
  ) {
    return this.listaCompraService.update(
      Number(id),
      updateListaCompraDto,
      req.user.uid,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listaCompraService.remove(Number(id));
  }
}
