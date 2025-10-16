import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RecetasModule } from './recetas/recetas.module';

@Module({
  imports: [UsuariosModule, RecetasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
