import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RecetasModule } from './recetas/recetas.module';
import { AuthModule } from './auth/auth.module';
import { ScraperModule } from './scraper/scraper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseModule } from './firebase/firebase.module';
import { CalendarioModule } from './calendario/calendario.module';
import { ProductosModule } from './productos/productos.module';
import { RecetasFavoritasModule } from './recetasFavoritas/recetasFavoritas.module';
import { HistorialBusquedasModule } from './historial_busquedas/historial-busquedas.module';
import { ListaCompraModule } from './lista-compra/lista-compra.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT!, 10),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DB,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.SYNCHRONIZE === 'true',
    }),
    UsuariosModule,
    RecetasModule,
    AuthModule,
    ScraperModule,
    FirebaseModule,
    CalendarioModule,
    ProductosModule,
    RecetasFavoritasModule,
    HistorialBusquedasModule,
    ListaCompraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
