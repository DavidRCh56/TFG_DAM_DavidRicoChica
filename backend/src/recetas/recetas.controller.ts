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
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

//wste interface tiene el mismo uso aqui que en usuarios.controller,
//es basicamnete para que el program se crea que existe user con esas
//propiedades
interface RequestConUser extends Request {
  user: {
    uid: string;
  };
}

//todas las rutas protegidas deberian usar esto de useGuards
@UseGuards(FirebaseAuthGuard)
@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  create(@Body() createRecetaDto: CreateRecetaDto, @Req() req: RequestConUser) {
    return this.recetasService.create(createRecetaDto, req.user.uid);
  }

  @Get()
  findAll(@Query('uid_firebase') uid_firebase: string) {
    return this.recetasService.findAll(uid_firebase);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recetasService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecetaDto: UpdateRecetaDto,
    @Req() req: RequestConUser,
  ) {
    return this.recetasService.update(
      Number(id),
      updateRecetaDto,
      req.user.uid,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestConUser) {
    return this.recetasService.remove(Number(id), req.user.uid);
  }
}
