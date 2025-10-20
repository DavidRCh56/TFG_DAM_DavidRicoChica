import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RecetasModule } from './recetas/recetas.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsuariosModule, RecetasModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
