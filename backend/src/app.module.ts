import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RecetasModule } from './recetas/recetas.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsuariosModule, RecetasModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
