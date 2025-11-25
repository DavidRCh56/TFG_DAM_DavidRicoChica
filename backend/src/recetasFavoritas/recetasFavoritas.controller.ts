import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecetasFavoritasService } from './recetasFavoritas.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('favoritas')
export class RecetasFavoritasController {
  constructor(private readonly favoritasService: RecetasFavoritasService) {}

  @Get()
  findFavoritas(@Query('uid_firebase') uid_firebase: string) {
    return this.favoritasService.findFavoritas(uid_firebase);
  }

  @Post()
  addFavorita(
    @Query('uid_firebase') uid_firebase: string,
    @Query('receta_id') receta_id: string,
  ) {
    return this.favoritasService.addFavorita(uid_firebase, Number(receta_id));
  }

  @Delete()
  removeFavorita(
    @Query('uid_firebase') uid_firebase: string,
    @Query('receta_id') receta_id: string,
  ) {
    return this.favoritasService.removeFavorita(
      uid_firebase,
      Number(receta_id),
    );
  }
}
