# Planificador de Compras Semanales

**Descripción**

- Aplicación web full-stack para planificar comidas diarias y generar listas de la compra con precios e información de productos de Mercadona y de Dia.
- Cada usuario dispone de un calendario mensual con 3 slots diarios (Desayuno, Comida, Cena) donde asigna recetas propias o predefinidas,
tambien tiene un CRUD con las recetas pudiendo crear, editar y eliminar las recetas que tiene en su lista, ademas estas recetas pueden
ser añadidas a una lista de favoritos, para falicitar su localizacion dentro de la app y tambien cuenta con un apartado donde todos 
los usuarios puede compartir sus recetas propias, pudiendo cualquier otro usuario ver dicha receta y gardarla en su lista personal.
- La app genera automáticamente la lista de la compra y el presupuesto diario y semanal, y permite añadir/eliminar productos manualmente.
- Los datos de los productos se recogen usando las apis de Mercadona y Dia mediante un scraper en python que me pasa los datos a CSV.
- Para no abusar del scraper, el usuario administrador, tendra un boton con el que cunado se pulse, se ejecute el scraper, actualizando
la base de datos(tarda aproximadamente unos 10-11 minutos en recoger todos los datos de nuevo para asi poder actualizar los
productos disponibles y sus precios).

---

## Tecnologías

- Frontend: Angular + Tailwind CSS
- Backend: NestJS (TypeORM, Passport.js, JWT, OAuth2)
- Scraper: Python
- WebSockets: Socket.IO (tengo que investigar como hacerlo)
- Base de datos: MySQL/MariaDB (TypeORM, migraciones, semillas), seguramente use MySQL si se me complica con MariaDB
- Caché y Cron: Redis (jobs diarios) (tengo que investigar como hacerlo)
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

4. **Generación Automática de Lista de la Compra y Presupuesto**(tengo que investigar como hacerlo)
   - Job diario en Redis recorre el calendario  
   - Scraper obtiene de Mercadona: precio, foto, peso, unidad, código  
   - Crea `ShoppingItem` y calcula `dailyTotal` y `weeklyTotal`  
   - Notificaciones en tiempo real con Socket.IO

5. **Gestión Manual de Productos**  
   - Buscador de productos: `GET /products/search?query=` invoca scraper  
   - Añadir productos manualmente con icono 🛒  
   - Eliminar productos con icono 🗑️  
   - Recalculo inmediato de presupuestos

6. **Notificaciones en Tiempo Real**(tengo que investigar como hacerlo)
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

/scraper
├─ export
│ ├─ products.csv
├─ supermarket
│ ├─ carrefour.py
│ ├─ dia.py
│ └─ mercadona.py
├─ .env
├─ .gitignore
├─ guia env.pdf
├─ import_csv.py
├─ main_supermarket.py
└─ README.md

/stack
├─ .env
├─ .env.template
├─ docker-compose.yml
└─ setup.sql
/.gitignore
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
- db-Adminer: http://localhost:8181

---

## Despliegue

- Para acceder al adminer y lo que tengo hecho por ahora:
```bash
cd stack
docker-compose up -d --build
```
- Para bajar el docker y eliminar recursos y todo:
```bash
docker-compose down
```
- Docker Compose para entornos de desarrollo y producción


# Progreso de lo que voy haciendo avanzando para luego documentar correctamente

he creado la carpeta stack con el docker-compose.yml, el .env y el setup.sql copiandolo del proyecto de juangu:
```bash
https://github.com/juangualberto/adt05-spring-web-zapapp/tree/main/stack-spring 
```
esto lo tomare como base para luego añadirle modificaciones en el futuro con forme lo vaya necesitando.


he creado el scraper usando python, tomando como ejemplo:
```bash
https://github.com/joseluam97/Supermarket-Price-Scraper
```
este lo he modificado ya para que solo me de los datos de los supermercados Dia y Mercadona, le he añadido un readme
para que donde sea que lo ejecutes (solo para windows), no te de fallos que a mi me dieron cuando lo intente usar conforme
lo pone en el repositorio del que me fijé. 

he creado los proyectos base del Frontend y el Backend, ahora implementare el scraper en la raiz del proyecto puesto
que quiero que haya una funcion que actualice la base de datos y que solo lo puedan hacer los administradores y
voy a empezar por el backend, para probar las posibles peticiones con postman y para configurar las rutas
de manera que se pueda acceder dependiendo del rol del usuario y del token que use para limitar el acceso y uso 
de algunas funciones de la app.

el error del scraper era por visualizarlo desde cscode, los datos estaban bien, y he creado un archivo nuevo en el scraper
llamado import_csv.py que si existe el archivo products.csv en la carpeta export, al ejecutarlo sube todos los datos 
del csv a la base de datos que esta abierta mediante docker, tambien he modificado el setup.sql para que me cree la tabla 
de productos en la base de datos cuando se cree la misma