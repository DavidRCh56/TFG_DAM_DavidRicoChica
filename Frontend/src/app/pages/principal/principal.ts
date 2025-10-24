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
  // Estados de cada sección
  resumenSemanal: boolean = true;
  miCalendario: boolean = false;
  listaCompra: boolean = false;
  recetas: boolean = false;
  foroRecetas: boolean = false;
  sidebarHidden = true;
  darkMode: boolean = true; // O true si quieres modo oscuro por defecto


  // Estado para actualizar precios (scraper)
  ejecutando: boolean = false;
  mensajeScraper: string = '';

  constructor(private http: HttpClient, private scraperService: ScraperService) {}

  // Cambia la sección activa según el botón pulsado
  setActiveSection(nombre: string) {
    // Todas a false, la seleccionada a true
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

  // Funcionalidad para ejecutar el scraper
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
