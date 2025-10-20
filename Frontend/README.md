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