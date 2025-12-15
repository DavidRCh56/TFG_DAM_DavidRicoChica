## 📦 Instalación del proyecto

### Clona el repositorio (o copia la carpeta del backend):

```bash
git clone <url-del-repo>
cd backend
npm install
```

### Crea el archivo .env

## Para ejecutar el back

```bash
npm run start
```
Esto hara que el back este disponible en "http://localhost:3000"

## Rutas principales

| Ruta | Método | Descripción |
|------|---------|--------------|
| `/auth/firebase-login` | `POST` | Verifica el token JWT recibido desde Firebase y genera sesión. |
| `/auth/firebase-register` | `POST` | Registra un nuevo usuario autenticado por Firebase. |
| `/usuarios` | `GET` | Devuelve la lista de usuarios registrados. |
| `/recetas` | `GET` | Obtiene las recetas disponibles en el sistema. |

---

##  Integración con Firebase

El proyecto usa **Firebase Admin SDK** para autenticar usuarios y validar tokens.

El archivo `firebase.service.ts`:
- Carga las credenciales desde `FIREBASE_SERVICE_ACCOUNT_KEY` del `.env`.
- Inicializa Firebase de forma segura.
- Expone `getAuth()` para interactuar con Firebase Authentication.

Ejemplo de uso:
```ts
import { FirebaseService } from './firebase/firebase.service';

constructor(private readonly firebaseService: FirebaseService) {}

async verifyToken(token: string) {
  const decoded = await this.firebaseService.getAuth().verifyIdToken(token);
  return decoded;
}
```
