# Planificador de Compras Semanales

**Descripción**

Aplicación web full-stack para planificar comidas diarias y generar listas de la compra con precios e información de productos de Mercadona y de Dia.  
Cada usuario dispone de un calendario mensual con 3 slots diarios (Desayuno, Comida, Cena) donde asigna recetas propias o predefinidas.  
La app genera automáticamente la lista de la compra y el presupuesto diario y semanal, y permite añadir/eliminar productos manualmente.
Los datos de los productos se recogen usando las apis de Mercadona y Dia mediante un scraper en python que me pasa los datos a CSV.

---

## Tecnologías

- Frontend: Angular + Tailwind CSS  
- Backend: NestJS (TypeORM, Passport.js, JWT, OAuth2)  
- Scraper: Python
- WebSockets: Socket.IO  
- Base de datos: MySQL/MariaDB (TypeORM, migraciones, semillas)  
- Caché y Cron: Redis (jobs diarios)  
- Contenerización: Docker + Docker Compose  

---

## Roles y Permisos

| Acción                        | Usuario | Moderador                | Admin   |
|-------------------------------|:-------:|:------------------------:|:-------:|
| CRUD recetas propias           | ✔️    | ✔️                        | ✔️      |
| CRUD recetas predefinidas      | ❌    | ✔️                        | ✔️      |
| Editar recetas de usuarios     | ❌    | ✔️                        | ✔️      |
| CRUD Calendario propio         | ✔️    | ✔️                        | ✔️      |
| Editar calendarios ajenos      | ❌    | ❌                        | ✔️      |
| Gestión usuarios y roles       | ❌    | ❌                        | ✔️      |
| Gestión lista de la compra     | ✔️    | ✔️ (solo lectura)         | ✔️      |
| Apartado para compartir recetas| ✔️    | ✔️                        | ✔️      |
| Eliminar recetas compartidas   | ❌    | ✔️                        | ✔️      |
| Eliminar TU receta compartida  | ✔️    | ✔️                        | ✔️      |

---

## Funcionalidades Principales

1. **Autenticación**  
   - JWT y login federado (Google, Facebook)

2. **Gestión de Recetas**  
   - CRUD de recetas propias  
   - Moderador: CRUD recetas predefinidas, editar recetas de usuarios  
   - Admin: CRUD completo de todas las recetas

3. **Calendario de Comidas**  
   - Vista mensual con slots para Desayuno, Comida, Cena  
   - Selección de recetas propias o predefinidas

4. **Generación Automática de Lista de la Compra y Presupuesto**  
   - Job diario en Redis recorre el calendario  
   - Scraper obtiene de Mercadona: precio, foto, peso, unidad, código  
   - Crea `ShoppingItem` y calcula `dailyTotal` y `weeklyTotal`  
   - Notificaciones en tiempo real con Socket.IO

5. **Gestión Manual de Productos**  
   - Buscador de productos: `GET /products/search?query=` invoca scraper  
   - Añadir productos manualmente con icono 🛒  
   - Eliminar productos con icono 🗑️  
   - Recalculo inmediato de presupuestos

6. **Notificaciones en Tiempo Real**  
   - Evento `shoppingUpdated` para actualizar lista y totales

7. **Históricos y Consultas**  
   - Consultar presupuestos de días y semanas anteriores

---

## Estructura del Proyecto

```bash
/backend
├─ src
│ ├─ auth
│ ├─ recipes
│ ├─ calendar
│ ├─ shopping
│ └─ scraper
└─ dockerfile

/frontend
├─ src
│ ├─ app
│ │ ├─ components
│ │ ├─ services
│ │ └─ pages
└─ tailwind.config.js

/docker-compose.yml
/README.md
```

---

## Instalación y Ejecución

1. Clonar repositorio  

```bash
git clone https://github.com/DavidRCh56/TFG_DAM_DavidRicoChica
cd TFG_DAM_DavidRicoChica
```

2. Configurar variables de entorno (`.env`)  

3. Levantar servicios con Docker Compose (obviamente cuando lo haga)

```bash
docker-compose up --build
```

4. Acceder a:  (obviamente cuando lo haga) 
- Frontend: http://localhost:4200  
- Backend: http://localhost:3000  

---

## Despliegue

- Docker Compose para entornos de desarrollo y producción 
