import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('firebase-login')
  async firebaseLogin(@Body('token') token: string) {
    if (!token) {
      return { error: 'Token no proporcionado' };
    }

    return this.authService.verifyToken(token);
  }
  @Post('firebase-register')
  async firebaseRegister(@Body('token') token: string) {
    return this.authService.registerFirebaseUser(token);
  }
}
