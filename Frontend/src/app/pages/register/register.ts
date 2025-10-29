import { Component } from '@angular/core';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../app';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './register.html',
})
export class Register {
  email = '';
  password = '';
  nombreUsuario = ''; // Nuevo campo
  backendUrl = environment.backendUrl;
  mostrarContrasena = false;

  constructor(private http: HttpClient, private router: Router) {}

  cambiarVisibilidadContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  async register() {
    if (!this.email || !this.password || !this.nombreUsuario) {
      alert('Por favor completa todos los campos');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
      const uid = userCredential.user.uid;

      await firstValueFrom(
        this.http.post(`${this.backendUrl}/usuarios`, {
          uid_firebase: uid,
          email: this.email,
          nombre_usuario: this.nombreUsuario
        })
      );

      alert('Registro exitoso');
      this.router.navigate(['/login']);
    } catch (error: any) {
      alert('Error al registrar: ' + error.message);
    }
  }
}
