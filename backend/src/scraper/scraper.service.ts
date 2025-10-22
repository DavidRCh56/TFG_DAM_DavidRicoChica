import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

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
  // Ruta donde se encuentra el entorno virtual venv
  private venvFolder = path.join(process.cwd(), '..', 'scraper', 'venv');

  //Uso execAsync (exec promisificado) para controlar la ejecución y esperar su finalización
  //de forma secuencial con async/await, ya que el archivo main_supermarket.py tarda unos 12 minutos
  //en completarse y necesito que termine antes de ejecutar import_csv.py.
  //Los logs via Logger sirven para entender en la consola el flujo y depurar.

  async ejecutarScraper(): Promise<void> {
    try {
      if (!fs.existsSync(this.venvFolder)) {
        this.logger.log(
          'No se detecta entorno virtual venv, creando uno nuevo...',
        );
        // Crear entorno virtual y acceder a él, luego instalar dependencias
        await execAsync(`python -m venv venv`, { cwd: this.scraperPath });
        this.logger.log(
          'Entorno virtual creado. Instalando paquetes necesarios...',
        );
        // Instalar paquetes uno por uno (puedes concatenar o crear un script .bat/.sh)
        // Ejemplo simplificado (en Windows, adapta si usas Linux/Mac)
        await execAsync(
          `venv\\Scripts\\Activate && python -m pip install --upgrade pip setuptools wheel`,
          { cwd: this.scraperPath },
        );
        await execAsync(
          `venv\\Scripts\\Activate && python -m pip install "numpy>=2,<3"`,
          { cwd: this.scraperPath },
        );
        await execAsync(
          `venv\\Scripts\\Activate && python -m pip install "pandas==2.2.3"`,
          { cwd: this.scraperPath },
        );
        await execAsync(
          `venv\\Scripts\\Activate && python -m pip install selenium==4.0.0 webdriver-manager==3.5.2 chromedriver-autoinstaller==0.6.3 chromedrivermanager==0.0.1 requests python-dotenv==1.0.0 bs4==0.0.1 by==0.0.4 discord-webhook==1.1.0 discordwebhook==1.0.3 pipdeptree==2.13.2 pylint==2.6.0 mysql-connector-python pyOpenSSL==23.3.0 pyowm==3.3.0 pywhatkit==5.4 service==0.6.0 cfscrape==2.1.1`,
          { cwd: this.scraperPath },
        );
        this.logger.log('Instalación de paquetes completada.');
      } else {
        this.logger.log(
          'Entorno virtual detectado, saltando creación y configuración.',
        );
      }

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
