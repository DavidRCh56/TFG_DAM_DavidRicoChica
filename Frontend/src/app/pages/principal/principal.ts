import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ScraperService } from '../../services/scraper.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.html',
  providers: [ScraperService],
  imports: [CommonModule, HttpClientModule, FormsModule],
})
export class Principal {
  resumenSemanal: boolean = true;
  miCalendario: boolean = false;
  listaCompra: boolean = false;
  recetas: boolean = false;
  foroRecetas: boolean = false;
  sidebarHidden = true;
  darkMode: boolean = true;


  ejecutando: boolean = false;
  mensajeScraper: string = '';

  preguntaIA: string = '';
  respuestaIA: string = '';
  cargandoIA: boolean = false;
  errorIA: string = '';
  n8nUrl = environment.n8nUrl;
  backendUrl = environment.backendUrl;
  token = localStorage.getItem('userToken');
  tokenValido: boolean | null = null;

  constructor(private http: HttpClient, private scraperService: ScraperService, private router: Router) {}

  async ngOnInit() {
    this.tokenValido = await this.validarToken();
    if (!this.tokenValido) {
      localStorage.removeItem('userToken');
    }
  }

  // uso un metodo del back para validar el token guardado en el local storage, para que si alguien se le ocurre
  // manipular el local storage y poner un token falso no pueda acceder a la app
  async validarToken(): Promise<boolean> {
    const token = localStorage.getItem('userToken');
    if (!token) return false;
    try {
      await firstValueFrom(
        this.http.post(`${this.backendUrl}/usuarios/verificacion-token`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async enviarPreguntaIA() {
    if (await this.validarToken() === true) {
      if (!this.preguntaIA.trim())
        return;
      this.cargandoIA = true;
      this.respuestaIA = '';
      this.errorIA = '';

      try {
        const resp: any = await firstValueFrom(
          this.http.post(this.n8nUrl, { pregunta: this.preguntaIA })
        );
        this.respuestaIA = (resp.respuesta !== undefined ? resp.respuesta : JSON.stringify(resp));
      } catch (err: any) {
        this.errorIA = 'No se pudo consultar la IA. Intenta de nuevo.';
        console.error('Error en consulta IA:', err);
        if (err.error) {
          console.error('Detalle del error:', err.error);
        }
      } finally {
        this.cargandoIA = false;
      }
    } else {
      this.alert('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('userToken');
      this.router.navigate(['/login']);
    }
  }



  setActiveSection(nombre: string) {
    this.resumenSemanal = false;
    this.miCalendario = false;
    this.listaCompra = false;
    this.recetas = false;
    this.foroRecetas = false;

    switch (nombre) {
      case 'resumenSemanal':
        this.resumenSemanal = true;
        break;
      case 'miCalendario':
        this.miCalendario = true;
        break;
      case 'listaCompra':
        this.listaCompra = true;
        break;
      case 'recetas':
        this.recetas = true;
        break;
      case 'foroRecetas':
        this.foroRecetas = true;
        break;
    }
  }

  async ejecutarScraper() {
    if (await this.validarToken() === true) {
      this.ejecutando = true;
      this.mensajeScraper = '';
      try {
        const resp: any = await firstValueFrom(this.scraperService.ejecutarScraper());
        this.mensajeScraper = resp.message || 'Scraper ejecutado con éxito.';
      } catch (err) {
        this.mensajeScraper = 'Error al ejecutar el scraper.';
      } finally {
        this.ejecutando = false;
      }
    } else {
      this.alert('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('userToken');
      this.router.navigate(['/login']);
    }
  }

  alert(mensaje: string) {
    window.alert(mensaje);
  }

  async bearerTokenAuth() {
    const user = await getAuth().currentUser;
    const token = user ? await user.getIdToken() : null;
    console.log('Usando token para autorización:', token);
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  async logout() {
    if (await this.validarToken() === true) {
      console.log('Iniciando cierre de sesión...');
      this.http.post(`${this.backendUrl}/usuarios/logout`, {}, await this.bearerTokenAuth())
        .subscribe({
          next: () => {
            console.log('Token revocado.');
            localStorage.removeItem('userToken');
            console.log('Redirigido a la página de login.');
            this.router.navigate(['/login']);
            console.log('Cierre de sesión exitoso.');
          },
          error: (err) => {
            console.error('Error durante el logout:', err);
            window.alert('Error al cerrar sesión. Inténtalo de nuevo.');
          }
        });
      } else {
        this.alert('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('userToken');
        this.router.navigate(['/login']);
      }
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}
