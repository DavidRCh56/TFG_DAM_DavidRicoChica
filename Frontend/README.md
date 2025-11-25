# 🧩 Frontend - Proyecto TFG (Angular + Firebase)

Este es el **frontend** del proyecto TFG desarrollado con **Angular**, **Firebase Authentication** y **TailwindCSS**.  
Proporciona un sistema de autenticación con **inicio de sesión**, **registro** y **recuperación de contraseña**, conectado al backend NestJS.

---

## 🚀 Tecnologías utilizadas

- **Angular 17+ (Standalone Components)**
- **Firebase Authentication**
- **TailwindCSS**
- **TypeScript**
- **Angular Router**
- **Angular Forms**

---

## ⚙️ Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Angular CLI](https://angular.io/cli)

Instalar Angular CLI si no lo tienes:
```bash
npm install -g @angular/cli
```

## 📦 Instalación del proyecto

### Clona el repositorio (o copia la carpeta del frontend):

```bash
git clone <url-del-repo>
cd frontend
npm install
```
---

## 🌐 Rutas disponibles

| Ruta | Descripción |
|------|--------------|
| `/login` | Página de inicio de sesión. Permite autenticarse con correo y contraseña. |
| `/register` | Página de registro de usuario. Permite crear una nueva cuenta en Firebase. |
| `/recover-password` | Página de recuperación de contraseña. Envía un correo de restablecimiento usando Firebase. |
| `/` | Redirección automática a `/login`. |

## 🔑 Flujo de autenticación

### Inicio de sesión:
- Los usuarios ingresan correo y contraseña.
- Se autentica con Firebase y se envía el token al backend (`/auth/firebase-login`).

### Registro:
- El usuario crea una cuenta nueva con Firebase.
- Se guarda o valida desde el backend (`/auth/firebase-register`).

### Recuperar contraseña:
- Se ingresa un correo válido registrado en Firebase.
- Firebase envía un enlace al correo para restablecer la contraseña.

## Para ejecutar Angular

- Primero fijate que el backend este en ejecucion.
- Usa este comando:
```bash
ng serve -o
```
- "ng serve" ejecuta Angular en http://localhost:4200 
- "-o" te abre automaticamente la ruta donde se ejecuta.


USO UN N8N PROPIO PARA GESTIONAR LAS PREGUNTAS A LA IA, ES ESTA PARTE DEL CODIGO:

**PRINCIPAL.HTML**
```bash
<div class="mt-10 flex flex-col items-start max-w-lg">
    <label for="ia-input" class="mb-2 text-md">Pregunta a la IA:</label>
    <div class="flex w-full">
      <input
        id="ia-input"
        [(ngModel)]="preguntaIA"
        (keydown.enter)="enviarPreguntaIA()"
        class="flex-1 p-2 rounded-l border border-gray-400"
        placeholder="Ej. Dame una receta con pollo"
        [disabled]="cargandoIA"
      />
      <button
        (click)="enviarPreguntaIA()"
        class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
        [disabled]="cargandoIA || !preguntaIA.trim()"
      >
        Enviar
      </button>
    </div>
    <div *ngIf="cargandoIA" class="mt-2 text-gray-500 text-sm">Consultando IA...</div>
    <div *ngIf="respuestaIA" class="mt-4 bg-gray-100 p-3 rounded shadow">
      <b>Respuesta de la IA:</b>
      <div class="whitespace-pre-line mt-2">{{ respuestaIA }}</div>
    </div>
    <div *ngIf="errorIA" class="mt-2 text-red-500 text-sm">{{ errorIA }}</div>
</div>
```

**PRINCIPAL.TS**
```bash
async enviarPreguntaIA() {
    if (await this.validarToken() === true) {
      if (!this.preguntaIA.trim())
        return;
      this.cargandoIA = true;
      this.respuestaIA = '';
      this.errorIA = '';

      try {
        const resp: any = await firstValueFrom(
          this.http.post(this.n8nUrl, { pregunta: this.preguntaIA })
        );
        this.respuestaIA = (resp.respuesta !== undefined ? resp.respuesta : JSON.stringify(resp));
      } catch (err: any) {
        this.errorIA = 'No se pudo consultar la IA. Intenta de nuevo.';
        console.error('Error en consulta IA:', err);
        if (err.error) {
          console.error('Detalle del error:', err.error);
        }
      } finally {
        this.cargandoIA = false;
      }
    } else {
      this.alert('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('userToken');
      this.router.navigate(['/login']);
    }
  }
```

SI NO LO CONTROLAS CON TU PROPIO N8N ELIMINA ESTA PARTE.