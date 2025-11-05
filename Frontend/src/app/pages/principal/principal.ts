import { Component, EnvironmentInjector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ScraperService } from '../../services/scraper.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient, private scraperService: ScraperService, private router: Router) {}


  async enviarPreguntaIA() {
    if (!this.preguntaIA.trim()) return;
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
      console.error('[FRONT] Error en consulta IA:', err);
      if (err.error) {
        console.error('Detalle del error:', err.error);
      }
    } finally {
      this.cargandoIA = false;
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
  }

  alert(mensaje: string) {
    window.alert(mensaje);
  }

}
