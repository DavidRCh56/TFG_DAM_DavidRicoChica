import { Component } from '@angular/core';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './register.html',
})
export class Register {
  email = '';
  password = '';
  backendUrl = environment.backendUrl;
  mostrarContrasena = false;

  constructor(private http: HttpClient) {}

  cambiarVisibilidadContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  async register() {
    if (!this.email || !this.password) {
      alert('Por favor completa los campos');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
      const token = await userCredential.user.getIdToken();

      const response: any = await firstValueFrom(
        this.http.post(`${this.backendUrl}/auth/firebase-register`, { token })
      );

      console.log('Respuesta backend:', response);
      alert('Registro exitoso 🎉');
    } catch (error: any) {
      console.error('Error al registrar:', error.message);
      alert('Error al registrar: ' + error.message);
    }
  }
}
