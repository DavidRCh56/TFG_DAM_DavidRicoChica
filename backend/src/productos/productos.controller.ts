import { Controller, Get, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  async getAll(@Query('supermercado') supermercado?: string) {
    return this.productosService.findAll(supermercado);
  }

  @Get('paginar')
  async getPaginated(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('supermercado') supermercado?: string,
  ) {
    return this.productosService.paginate(
      Number(page) || 1,
      Number(limit) || 40,
      supermercado,
    );
  }

  @Get('buscar')
  async buscar(
    @Query('nombre') nombre: string,
    @Query('supermercado') supermercado?: string,
  ) {
    return this.productosService.buscarPorNombre(nombre, supermercado);
  }
}
