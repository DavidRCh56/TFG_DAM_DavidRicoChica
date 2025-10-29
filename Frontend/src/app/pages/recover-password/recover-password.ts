import { Component } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.html',
  imports: [FormsModule],
  standalone: true,
})
export class RecoverPassword {
  email = '';
  loading = false;

  constructor(private auth: Auth, private router: Router) {}

  async onSubmit() {
    if (!this.email) return alert('Por favor, ingresa tu correo electrónico.');

    this.loading = true;

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      alert(
        'Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada o spam.'
      );
      this.router.navigate(['/login']);
    } catch (error) {
      console.error(error);
      alert('Error al enviar el correo. Verifica que el correo esté registrado.');
    } finally {
      this.loading = false;
    }
  }
}
