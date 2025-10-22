import { Component } from '@angular/core';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScraperService } from '../../services/scraper.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  providers: [ScraperService],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  backendUrl = environment.backendUrl;

  // Estados extra para feedback scraper
  loggedIn = false;
  ejecutando = false;
  mensajeScraper = '';

  constructor(private http: HttpClient, private scraperService: ScraperService) {}

  async login() {
    if (!this.email || !this.password) {
      alert('Por favor completa los campos');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      const token = await userCredential.user.getIdToken();

      const response: any = await firstValueFrom(
        this.http.post(`${this.backendUrl}/auth/firebase-login`, { token })
      );

      console.log('Respuesta backend:', response);
      alert('Inicio de sesión exitoso ✅');
      this.loggedIn = true;
      this.mensajeScraper = '';

    } catch (error: any) {
      console.error('Error de autenticación Firebase:', error.message);
      alert('Error al iniciar sesión: ' + error.message);
      this.loggedIn = false;
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
}
