import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

// Promisify exec para poder usarlo con async/await,
// facilitando la ejecución de comandos shell y el manejo de errores.
const execAsync = promisify(exec);

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  // Esto es la ruta absoluta al ejecutable python dentro del entorno virtual (venv).
  // Esto asegura que los scripts python se ejecuten con las dependencias correctas.
  private venvPath = path.join(
    process.cwd(), // Directorio actual de ejecución del backend
    '..', // Subimos un nivel para salir del backend hacia la raíz del proyecto
    'scraper', // Carpeta donde están los scripts python
    'venv', // Carpeta del entorno virtual
    'Scripts', // Ruta en Windows donde está python.exe dentro del venv
    'python.exe', // Ejecutable python dentro del entorno virtual
  );

  // Ruta base donde residen los scripts Python, usada para establecer directorio de trabajo
  // (main_supermarket.py e import_csv.py).
  private scraperPath = path.join(process.cwd(), '..', 'scraper');

  //Uso execAsync (exec promisificado) para controlar la ejecución y esperar su finalización
  //de forma secuencial con async/await, ya que el archivo main_supermarket.py tarda unos 12 minutos
  //en completarse y necesito que termine antes de ejecutar import_csv.py.
  //Los logs via Logger sirven para entender en la consola el flujo y depurar.

  async ejecutarScraper(): Promise<void> {
    try {
      this.logger.log(
        'Ejecutando main_supermarket.py con entorno virtual python',
      );
      this.logger.log('En 12 minutos aprox. se ejecutará import_csv.py');

      // Ejecutamos main_supermarket.py, con el working directory en la carpeta scraper.
      await execAsync(`"${this.venvPath}" main_supermarket.py`, {
        cwd: this.scraperPath,
      });

      // Ejecutamos import_csv.py para importar los datos scrapeados
      this.logger.log('Ejecutando import_csv.py con entorno virtual python');
      await execAsync(`"${this.venvPath}" import_csv.py`, {
        cwd: this.scraperPath,
      });

      this.logger.log('Proceso del scraper completado');
    } catch (error) {
      this.logger.error('Error ejecutando scripts Python', error);
      throw error;
    }
  }
}
