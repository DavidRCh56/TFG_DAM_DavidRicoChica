import {
  Controller,
  Post,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  private readonly logger = new Logger(ScraperController.name);

  constructor(private readonly scraperService: ScraperService) {}

  @Post('ejecutar')
  async ejecutar() {
    this.logger.log('Solicitud recibida en /scraper/ejecutar');

    try {
      this.logger.log('Iniciando ejecución del scraper...');
      await this.scraperService.ejecutarScraper();

      this.logger.log(
        'Scraper ejecutado correctamente, importación finalizada.',
      );
      return {
        success: true,
        message: 'Scraper ejecutado y datos importados correctamente.',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error durante la ejecución del scraper: ${error.message}`,
        );
        throw new HttpException(
          {
            success: false,
            message: 'Error al ejecutar el scraper.',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        this.logger.error(
          'Error desconocido durante la ejecución del scraper',
          error,
        );
        throw new HttpException(
          {
            success: false,
            message: 'Error desconocido al ejecutar el scraper.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
