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
- Autenticación: firebase

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
│ │ ├─ auth.controller.ts
│ │ ├─ auth.module.ts
│ │ └─ auth.service.ts
│ ├─ firebase
│ │ └─ firebase.service.ts
│ ├─ recetas
│ ├─ usuarios
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
│ ├─ firebaseConfig
│ │ └─ firebase.config.ts
│ └─ enviroments
│   └─ enviroments.ts
├─ tailwind.config.js
└─ .env

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

2. Configurar todas las variables de entorno (`.env`)

3. Levantar servicios con Docker Compose

```bash
docker-compose up --build
```

4. Acceder a:
- Adminer: http://localhost:8181  
- db: http://localhost:33306

5. Levantar el backend:
```bash
cd backend
npm install
npm run start
```

6. Levantar el frontend:
```bash
cd frontend
npm install
ng serve
```

7. Ejecutar por primera vez el scraper para añadir los datos a la base de datos:

He creado una funcion en el backend que ejecuta el scraper sin necesidad de acceder
a la carpeta del scraper, creando la variable de entorno e instalando las dependencias
en el caso de que sea necesario y realizando el scrapeo recogiendo los datos y 
subiendolos.

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
de productos en la base de datos cuando se cree la misma.
voy a empezar a hacer el login register y recoverpasword en el back he ire probando el funcionamiento en postman
he creado mi proyecto en firebase y voy a seguir las instrucciones propias de firebase para implementarlo

He terminado de hacer el login register y recoverpasword hecho todo con firebase, he subido a la misma vez el back y el front
ya que se me hacia mas facil hacer las dos cosas a la vez en vez de hacer promero el back y luego el front o al reves.
Tiene un estilo muy basico, que ya cambiare en un futuro, de momento funciona bien creo, me crea usuarios en firebase,
puedo hacer login y puedo mandarme un correo de recueracion de contraseña, de momento solo hasta ahí.

ayer me dijeron en l aempresa que me interesaria mas hacer el tema del login sin firebase porque se podria llegar a complicar 
a la hora de conectar datos en el caso de que el proyecto en un futuro fuera a mas, tengo que pensarlo pero creo que aprovechare
el login que hicimos aqui para implementarlo en el proyecto y cambiar el de firebase aunque tendria que añadir gmail, etc.

Me dijeron en la empresa de no tener varias vistas para varios usuarios, sino que yo recoja el rol
del usuario y despues con un ngif gestione que roles pueden ver una parte de la pagina y a que roles no les aparece,
esto en un listado lateral o similar, que a algunos usuarios le aparezcan mas elementos en la lista que a otros.
Tambien me han recomendado poner logs para ver desde el backend para controlar mejor los errores.

Ahora que tengo mas o menos la base del login con firebase, voy a intentar crear una funcion en el backend 
que se encargue de ejecutar el scraper(el archivo main_supermarket.py), que espere aproximadamente 11-12
minutos que es lo que he medido que tarda en recoger los datos y poner los csv en la carpeta export y 
que despues de ese tiempo ejecute el archivo import_csv.py para actualizar la base de datos en adminer.

Se me habia presentado el problema de que para ejecutar los archivos .py tenia que ejecutar un par de comandos
en la terminal, e investigando un poco he descubierto que usando child_process, concretamente importando la funcion exec, 
me permite "ejecutar" comandos en consola haciendo que pueda introducir los comandos respectivos para poner en funcionamineto 
el scraper, tambien usando path puedo como decir la ruta en la que ejecutar dichos comandos, pudinedo navegar por las carpetas del 
proyecto donde se encuentran los archivos a ejecutar, a demas he usado la funcion promisify para poder usar async y await a la hora 
de ejecutar los archivos para asi conseguir que al ejecutar el archivo main_supermarket.py se espere a que finaliza su ejecucion 
para empezar con la ejecucion del archivo import_csv.py. Lo malo es que se necestia tener creado el entorno virtual con las
respectivas dependencias, etc, no se si lo cambiare para que al darle al boton se cree o no, ya que al menos en la primera
ejecucion tardaria mas(creo que aproximadamente unos 20 minutos en total para subir los datos a la base de datos, aunque podria
hacer para que solo lo ejecutara la primera vez usando un condicional). Creo que voy a hacer eso, pero primero voy a hacer
un commit push por si la lio. ahora usando lo mismo de antes, para poner los comandos y ir a algunas rutas, pondre un 
condicional de manera que si detecta o entiende que no existe la carpeta venv, que la cree e instale las dependencias, 
haciendo que en la siguiente vez, si detecta que ya si existe la carpeta, que se salte este paso. Al final he creado una 
variable con la ruta de la carpeta venv y usando un if-else y usando "fs.existsSync" para comprobar la ruta de la variable
que he creado, devolviendome un true o un false, y dependiendo de esto se ejecuta la creacion del entorno virtual y la instalacion
de las dependencias, y si se vuelve a pulsar el boton, ya si encuentra la carpeta y omite esta parte.
esto es el mismo dia 
Le he preguntado un par de dudas a juangu referente a la base de datos que usare en un futuro en la app y alguna duda
referente a la documentacion del proyecto, cuando me responda hare la base de datos que intentare que sea la definitiva 
para no tener que cambiar nada y trabajar durante todo el proyecto con la misma base de datos y cuando tenga claro eso,
hare los archivos .puml para crear los diagramas de clases y de casos de uso. Mientras espero su respuesta, voy a
decorar un poco el login register y recover-password usando Tailwind y poniendolo algo mas decente.
He estado viendo y hay calendarios ya hechos con Tailwinds en: https://freefrontend.com/tailwind-calendars/

Me ha surgido otro problema, y es que tailwinds no se detecta y no me muestra los estilos que hay puestos.
ya lo he conseguido solicionar, a lo visto era que han subido de version y habian cambiado la forma de importar
tailwinds, yo lo estaba haciendo como lo hice con el proyecto que me dieron aqui pero entre que lo hice y ahora 
han subido de version y han cambiado la manera de implementarlo, usando ahora "@import "tailwindcss";"
en vez de "@tailwind base; @tailwind components; @tailwind utilities;" ademas, habia desinstalado y reinstalado 
tailwind por si acaso "npm install/uninstall tailwindcss @tailwindcss/postcss postcss --force", ademas ahora 
a lo visto se usa un archivo ".postcssrc.json", cuando yo lo use antes con un archivo "postcss.config.json".
Tambien decir que ahora no hace falta un archivo "tailwind.config.js que se usaba antes.
Le he metido estilos al login register y recover-password, haciendo que se ven similares pero con sus funciones respectivas,
ademas he creado gracias a nanobanana un logotipo y una imagen que uso en el login que mas o menos representan
la idea de la app, estas imagenes las he subido a https://archive.org/ para que las imagenes no ocupen espacio en el 
proyecto y que sean mas faciles de importar, seguramente haga eso con mas imagenes que use.


# TODO
- Añadir protección de rutas en el backend (según rol de usuario).
- Implementar roles de usuario (cliente por defecto, moderador, admin).
- Crear un usuario admin por defecto en la base de datos al iniciar el proyecto.
- Permitir que un usuario cliente modifique sus propios datos (nombre, email, etc.).
- Permitir que un admin modifique los datos de otros usuarios.
- Implementar CRUD de recetas (crear, editar, eliminar, listar).
- Implementar favoritos de recetas y sistema de búsqueda.
- Implementar sección de recetas compartidas (todos los usuarios pueden ver/guardar).
- Crear calendario de comidas (mensual, con slots: desayuno, comida, cena).
- Generar lista de la compra automática basada en el calendario.
- Implementar cálculo de presupuesto diario/semanal.
- Integrar el scraper desde el backend (solo ejecutable por admin).
- Conectar la base de datos MySQL/MariaDB con TypeORM y probar importación CSV.
- Añadir notificaciones en tiempo real (Socket.IO) para cambios en la lista de la compra.(no seguro, tengo que ver)
- Implementar histórico de presupuestos (consultar días y semanas anteriores).(no seguro, tengo que ver)
- Añadir sistema de caché y cron jobs con Redis (actualizaciones automáticas).(no seguro, tengo que ver)
- Contenerizar todo el stack (frontend, backend, scraper, DB, Redis) con Docker Compose.
- Mejorar el diseño del frontend (Tailwind, componentes, UX).
- Añadir autenticación federada (Google, Facebook) con Firebase.
- Proteger el endpoint del scraper para que solo el admin lo pueda ejecutar.
- Documentar todas las rutas del backend en Swagger o Postman.
- Redactar la documentación final (README completo del proyecto + guía de despliegue).
