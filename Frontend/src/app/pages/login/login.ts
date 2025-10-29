import { Component } from '@angular/core';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../app';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  providers: [],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  backendUrl = environment.backendUrl;
  mostrarContrasena = false;

  loggedIn = false;
  ejecutando = false;
  mensajeScraper = '';

  constructor(private http: HttpClient, private router: Router) {}

  cambiarVisibilidadContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

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
      alert('Inicio de sesión exitoso');
      this.loggedIn = true;
      this.mensajeScraper = '';
      this.router.navigate(['/principal']);

    } catch (error: any) {
      console.error('Error de autenticación Firebase:', error.message);
      alert('Error al iniciar sesión: ' + error.message);
      this.loggedIn = false;
    }
  }

  async loginConGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user.email || !user.displayName) {
        alert('No se pudo obtener nombre o email de Google.');
        return;
      }

      const uid = user.uid;
      const email = user.email;
      const nombre_usuario = user.displayName;

      await firstValueFrom(
        this.http.post(`${this.backendUrl}/usuarios`, {
          uid_firebase: uid,
          email: email,
          nombre_usuario: nombre_usuario,
        })
      );

      alert('Inicio de sesión con Google exitoso');
      this.loggedIn = true;
      this.mensajeScraper = '';
      this.router.navigate(['/principal']);
    } catch (error: any) {
      this.loggedIn = false;
      console.error('Error al iniciar sesión con Google:', error.message);
      alert('Error al iniciar sesión con Google: ' + error.message);
    }
  }
}
