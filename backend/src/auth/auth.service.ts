import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async verifyToken(token: string) {
    try {
      const auth = this.firebaseService.getAuth();
      const decoded = await auth.verifyIdToken(token);

      return {
        uid: decoded.uid,
        email: decoded.email,
        message: 'Autenticación exitosa',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException('Token inválido o expirado: ' + message);
    }
  }

  async registerFirebaseUser(token: string) {
    const auth = this.firebaseService.getAuth();
    const decoded = await auth.verifyIdToken(token);

    // Aquí podrías guardar el usuario en tu base de datos si lo deseas
    return {
      message: 'Usuario registrado correctamente',
      uid: decoded.uid,
      email: decoded.email,
    };
  }
}
