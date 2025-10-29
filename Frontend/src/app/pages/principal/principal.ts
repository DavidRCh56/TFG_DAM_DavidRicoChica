import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ScraperService } from '../../services/scraper.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.html',
  providers: [ScraperService],
  imports: [CommonModule, HttpClientModule],
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

  constructor(private http: HttpClient, private scraperService: ScraperService) {}

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
