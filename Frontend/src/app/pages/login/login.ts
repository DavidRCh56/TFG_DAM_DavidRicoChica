import { Component } from '@angular/core';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

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

    } catch (error: any) {
      console.error('Error de autenticación Firebase:', error.message);
      alert('Error al iniciar sesión: ' + error.message);
    }
  }
}
