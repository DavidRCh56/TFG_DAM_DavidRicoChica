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
- Base de datos: MySQL (TypeORM, migraciones, semillas), seguramente use MySQL si se me complica con MariaDB
- Contenerización: Docker + Docker Compose
- Autenticación: firebase

---

## Roles y Permisos

| Acción                        | Usuario | Admin   |
|-------------------------------|:-------:|:-------:|
| CRUD recetas propias           | ✔️    | ✔️      |
| CRUD recetas predefinidas      | ❌    | ✔️      |
| Editar recetas de usuarios     | ❌    | ✔️      |
| CRUD Calendario propio         | ✔️    | ✔️      |
| Gestión usuarios y roles       | ❌    | ✔️      |
| Gestión lista de la compra     | ✔️    | ✔️      |
| Apartado para compartir recetas| ✔️    | ✔️      |
| Eliminar recetas compartidas   | ❌    | ✔️      |
| Eliminar TU receta compartida  | ✔️    | ✔️      |

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

<<<<<<< HEAD
he creado los componentes usuarios y recetas, he añadido el scraper pero tengo que corregirlo, me he fijado en el csvq eu devuelve y hay datos movidos que estan mal, no los recoje bien, tengo que solucionar eso.
=======
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
decorar un poco el login register y recover-password usando Tailwind y poniendolo algo mas decente, me he fijado en 
https://tailwindcss.com/plus/ui-blocks/application-ui/forms/sign-in-forms y hay uno que me ha gustado pero como es de pago
he ido a https://www.creative-tim.com/twcomponents/components/logins que tiene componentes varios y logins parecidos al que me gusta.
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

le he añadido la tipica ventana para iniciar sesion con una cuenta de google, esta accion tambien crea el usuario en caso 
de que no exista, todo para que el registro/login sea mucho mas dinámico. deberia de cambiarle el nombre al proyecto y 
modificar las plantillas por defecto que me da firebase, es un detalle que no es necesario pero le da un toque mas personalizado.
He mirado y firebase no te permite editar las plantillas para evitar temas de spam asi que asi se queda. 

He añadido un par de funciones al login y register, que son en ambos el poder visualizar la contraseña que se ha introdicido,
he creado una pagina principal base que tiene una funcion para no tener que crear muchas paginas, que se encarga de detectar en un
nav, que componente se esta mostrando, haciendo que se oculten los demas, y al pulsar en otro componente, se ocultan todos y
solo el pulsado se muestra, tengo pensado hacer algo parecido con el tema de los roles, como vi que lo hicieron en la empresa, 
simplificando mucho mas el codigo y ahorrando trabajo. ademas tengo que crear todavia el logout y ver como hacer si o si 
las bases de datos.
Ahora que tengo la pagina principal he eliminado el ejecutar scraper del login, porque lo habia puesto ahi para 
comprobar de que si funcionaba 

He creado ya la base de datos que usare para el proyecto, ahora me toca empezar a plantear como se realizarian los metodos
y tambien deberia empezar a ordenar la documentacion y a crear los archivos para los diagramas de clases y de casos de uso.

He creado los archivos base para la documentacion, ahora se me ha presentado una duda, como conecto el uid que se crea
en firebase al crear un usuario, con mi base de datos mysql para relacionar unos datos como las recetas a unos usuarios
en especifico. He modificado una cosa de la base de datos, que no habia caido antes, he puesto el nombre de usuario como
"UNIQUE" para que solo pueda haber un usuario con ese nombre.
Para resolver la duda de conectar firebase authentication con mi base de datos he navegado por internet adentrandome 
en varios foros donde hablaban del tema y he concluido que la mejor manera de conectarlos seria creando un metodo en el 
frontend que cuando un usuario se registre desde el register, este metodo, que es el mismo que usaba con solo lo de 
firebase, me recoja los datos que ha introducido el usuario y el uid que le asigna firebase, y los mando a un metodo
del backend que solicita estos datos para crear un usuario con dichos datos, sincronizando de esta manera el uid con 
los demas datos que voy a usar en la app. El backend tiene basicamente un endpoint /usuarios, con un metodo POST
dedicado por ahora a la creacion de los usuarios con los datos que he dicho antes que espera que le mande el frontend
guandandolo en mi base de datos.
Ahora me he dado cuenta que tambien tendria que recoger los datos de cuando un usuario inicia sesion con google,
porque de esta manera no introduce datos ninguno, y se salta el metodo, haciendo que no se guarden los datos en mi 
base de datos, en este hago algo parecido, habiendo ya recogido el objeto usuario que me proporcionan, verifico 
que este tenga los datos que necesito para crear el usuario, para evitar posibles errores, y hago basicamente un copia 
y pega de lo que hice en el register, pero en este caso defino todos los valores(uid, email, nombre), mientras que en 
el register, al tener el input con el correo y el nombre de usuario, tenia que definir el uid y recogerlo de las 
credenciales que me daba firebase.

He añadido index al email del usuario para poder buscarlo tambien por el email ya que tengo pensado que teniendo el 
email, que puedo obtener desde firebase, lo busque en la base de datos, y de esta manera pueda relacionar un usuario
con el rol que tenga asignado en mi base de datos, y ahora quiero crear una funcion logout que este en la pagina principal, 
donde puse el boton, que cuando lo pulse, quite el token del navegador, te mande al login, y ademas que el token lo invalide 
de manera que si se vuelve a intentar acceder a la pagina principal sin el token, no te deje y tambien, si intentas acceder 
con un token que ha sido invalidado, que te de otro error, tambien voy a hacer el CRUD de recetas que es lo mas sencillo 
por ahora, creo yo y ya vere como sigo con el progreso de la app.
He pensado que en el CRUD de recetas, que puedas, directamente desde la creacion/edicion de recetas, buscar de 
alguna manera los ingredientes en la tabla de productos, para que todo sea mas facil de manejar en un futuro, 
ademas de implementar una funcion para subir imagenes o enlaces a fotos que eso ya no tengo ni idea de como lo 
hare.

He estado pensando una manera de hacer que un usuario sin logear no pueda acceder a la pagina principal, y se me ha ocurrido
añadir en la base de datos un valor asociado a cada usuario que default sea false, cuando se hace login se pone true y cuando
se hace logout se pone false, y que en la pagina principal, haya un condicionarl que ocupe todo el codigo haciendo que si
este valor booleano es false redirija al login o muestre un error al usuario y que si es true muestre lo que el usuario
pueda ver dependiendo de su rol. Voy a mantener esta idea hasta que se me ocurra una mejor manera de hacerlo, ya que esta
es una mala manera de manejar el estado de la sesion de un usuario, en caso de que no encuentre otra manera, lo haré asi.
Para las recetas, quiero usar un componente card para no crear codigo repetido innecesariamente, y me estoy fijando en 
componentes card ya hechos con tailwind para usarlo como base y modificarlo a corde como quiero que se vea al final.
He modificado lo que llevo para que me mande un log cada vez que se registren inicien sesion o recuperen la contraseña 
esto lo eliminare en un futuro, tambien he añadido a setup.sql el usuario base que tendré siempre en la app y un par de
recetas para tenerlas como predefinidas.
He empezado a hacer los archivos .puml y creo que ya tengo el diagrama de clases.
He encontrado el codigo para un calendario que me ha gustado y usa tailwind en: https://pagedone.io/blocks/application/calendar
Tambien se me ha ocurrido de poner una lista de productos favoritos, ya que el scraper que cogí ya me daba para ponerlos
como favoritos o no.
ademas he creado inserts para tener como base minimo un objeto para cada tabla.

quiero actualizar la base de datos para que en la tabla de usuarios me admita fotos pero no se hacerlo

Nos han propuesto que el proyecto que no podiamos hacer en n8n, lo hicieramos pero con n8n en local, es decir, 
descargarnos nosotros n8n por nuestra cuenta y porbarlo, a mi ya me ha funcionado y he estado mirando y me ha dado una idea, crear
como un "chat bot" que no llega a serlo, basicamente uso una peticion http post en el front para mandar una informacion a n8n,
esta informacion la recoje n8n y se la manda a una IA, y esta ia me manda una respuesta que desde n8n la mando a mi front 
para mostrarla, esta IA le he puesto un prompt poniendole un rol de dietista. Cada peticion me consume aprox. de 0.005€ a 0.008€ 
usando la api de perplexity. he añadido la url que me proporciona webhook desde n8n en environment.
Me he puesto a investigar como hacer lo de los tokens, invalidarlos, pillar el uid y todo y he encontrado una pagina curiosa donde
explican mas o menos todo y como hacerlo "https://dev.to/alpha018/integrating-firebase-authentication-into-nestjs-with-nestjs-firebase-auth-55m6"
seguramente use de las opciones que da la pagina las opciones: "3. Extracción de usuarios a partir de tokens y reclamaciones" y 
"4. Gestión de la revocación de tokens". 
He añadido una cosa en el ligon para poder ver el token y hacer pruebas en el backend.

He hecho el logout que revoca el token para que ya no se pueda usar después de cerrar sesión, para hacer esto, tuve que crear una interfaz llamada 
RequestConUser dentro del controlador, esto es porque el objeto request que viene por defecto no tiene la propiedad user, que es 
donde el guard de autenticación (FirebaseAuthGuard) guarda datos del usuario autenticado. Si intento acceder directamente a req.user.uid sin 
esa interfaz, TypeScript da error porque no sabe que existe user en el request, la interfaz le dice a TypeScript que en realidad el 
request tiene un campo user con ciertas propiedades, así el código puede usarlo sin errores, esto lo he hecho a recomendacion de las personas de la empresa,
tambien he añadido un firebase-auth.gard, para la validacion del token, comprueba si es valido, lo guarda y los controladores gestionan este token, 
tengo que hacer paraq que cada usuario tenga cosas individuales aprovechando esto, tambien he "protegido" la ruta /recetas y /usuarios/logout para 
que se necesite token, pero lo dicho, tengo que hacer que muestre solo las recetas asociadas a ese token o nose algo asi.

He conectado el logout del back con el frontend, y me he dado cuenta que puedo acceder a la pagina principal sin token, eso no es lo ideal,
por lo que en el html he puesto un ngif para que si la app no recoge ningun token, que no muestre nada de la pagina principal, y que muestre
un "unauthorized page" que he sacado de aqui: "https://codepen.io/The-Anmol/pen/qBQQQLp?editors=1000", he puesto estta porque me ha resultado 
graciosa y ademas usa tailwind, tambien le he añadido un boton para volver al login, este le he puesto otro ngif haciendo lo contrario que el 
de antes, si tiene token no se muestra. Me estaba dando errores porque intentaba usar "getAuth().currentUser" y me lo devolvia como "nadie",
por lo que me explotaba la app, me han dicho en la empresa de crear un archivo "datosCompartidos.service" para guardar ahi los datos que recivo del login
y poder mandarlos a la pagina principal, pero lo he estado intentando y no conseguia hacerlo funcionar, por lo que me he decantado por guardar
el token en  localStorage usando "localStorage.setItem('userToken', token);" para desde principal hacer de manera mucho mas sencilla la recogida
del token usando "token = localStorage.getItem('userToken');" y en el logout, eliminarlo usando "localStorage.removeItem('userToken');"
lo unico malo, es que si descubre alguien el nombre 'userToken' podria acceder al ponerlo en el local storage pero he creado unu metodo en el back
para usarlo en el front, para comprobar que el token del localstorage es valido, por si alguien manipula el local storage, que no pueda hacer nada
si el token no es valido. he creado otra variable booleana, para que usando un ngoninit, me diga si el token es valido o no y ya mostrar lo que 
yo quiera dependiendo de si es true o false.

He creado el crud de calendario, para luego implementarlo en el front, he eliminado el ejemplo que tenia en el setup.sql de la receta, porque al 
tenerlo ahi, el scraper no me metia bien los datos en la base de datos, porque directamente no los metia, y me he decantado por eliminar ese ejemplo
para solventar el problema, ademas he actualizado el recetas controller y service, para que me filtre los datos mostrados de recetas por usuario,
añadiendo el uid del usuario como un query.
Ahora que he creado el crud de calendario quiero intentar hacer el crud de la lista de la compra que recoge los datos de las recetas que hay
en calendario, devolviendo los ingredientes de la receta, estos los busco en productos y recojo el nombre y el precio de cada producto que hay
y lo añado a la lista, con un buscador para añadir mas productos y poder tambien eliminarlos, esto me gustaria hacerlo filtrando por Supermercado
para que haya dos listas y veas cual es el que mas rentable te sale.

Estaba intentando hacer un listado de productos que muestre todos los productos de mi base de datos y cuando he intentado ejecutar el scraper me ha dado
un error sin que yo haya tocado nada del mismo, ahora me voy a c¡poner a ver que error esta dando centrandome solo en el scraper, porque sin el no puedo 
probar si funciona lo que estaba haciendo. A lo visto han cambiado algo en la API del dia y he tenido que poner una comprobacion, puesto que hay
rutas que intenta recoger unos datos que ahora no existen aunque antes si, lo comprobacion hace que si la respuesta HTTP es correcta (status_code == 200), 
pero el texto está vacío, no intento convertirlo en JSON y simplemente salto esa categoría.
Ya me muestra todos los productos de mi base de datos con un filtro por supermercado ademas de un buscador, en el que uso like para encontrar resultados
parecidos sin la necesidad de tener que poner el nombre completo, que tambien funciona el filtro, para buscar productos que necesites y añadirlos a la 
lista de la compra(todavia no implementado, es la idea).
Tambien he creado un metodo para encontrar usuarios por uid y para recoger el rol, para poder filtrar lo que ve cada rol.
Me falta hacer que en el resumen semanal se muestren las recetas de esa semana y algo mas. hago commit push para guardar los datos.

ahora he creado en el backend, el "CRUD" de recetas favoritas, puedo añadir una receta a un usuario ver las recetas favoritas o eliminarla de favoritas.

he estado haciendo el proyecto de manera desorganizada, me he hecho una hoja con lo que tengo y lo que falta de todo el proyecto, asique a partir de ahora
intentare seguir un orden para no estar saltando entre un lado y otro.
De momento he modificado mi base de datos para que me acepte un enlace para foto de usuario y los valores booleanos para que una receta
sea predeterminada o este compartida en el foro.
para actualizar y borrar usuarios,he consultado la documentacion de firebase: 
https://firebase.google.com/docs/auth/admin/manage-users?hl=es-419#update_a_user,
https://firebase.google.com/docs/auth/admin/manage-users?hl=es-419#delete_a_user
Ya he creado el update y el delete a tener en cuenta, que si se modifica el correo o la contraseña, firebase automaticamente revoca el token, por lo que 
se debe de volver a iniciar sesion.

ahora estoy haciendo para que un usuario administrador pueda eliminar o editar otros usuarios, excluyendo la contraseña de usuarios que no sean el suyo,
tambien puede cambiar el rol de los demas usuarios.

he hecho ahora que a la hora de gestionar las recetas, como modifique ayer en el sql, que tenga un apartado de predeterminada, que todas las recetas que 
tengan ese apartado en true que en mi base de datos he visto que se guarda como un 0 o 1, que si tienen true o 1 que todos los usuarios al hacer un get
puedan ver sus recetas y ademas las recetas predetermiandas, pero no las recetas de los demas, resumen, cliente puede crear editar y eliminar recetas suyas,
que no sean de otro usuario y que tampoco sean predeterminadas, si es su receta, pero es predeterminada no le deja nada mas que verla, admin,
puede editar y eliminar sus recetas y las de otras personas por id, sin importar si es predeterminada o no, este tambien puede crear una predeterminada, el 
cliente no puede.
al principio como en el insert del sql puse true, no me lo pillaba bien, por lo que he cambiado y en vez de ponerle true le he puesto 1, para que me detecte
la base de datos que ese dato es true, ya que literalmente el "true" no lo reconocia.

No entiendo que le ha estado pasando al scraper ultimamente, antes no funcionaba, y ahora le pongo un simple try catch para ver que errores me da y ya si me
deja, pero si se lo quito me vuelve a dar error, y todo esto solo con "Dia" asique lo voy a dejar con el try catch por si acaso.
He creado el historial de busquedas en productos, recoge el contenido del input cuando se realiza el buscar y actualiza el listado que se muestra a la derecha
de los productos, este listado de busquedas es navegable, es decir, cuando tu pulsas sobre un elemento de la lista, se realiza automaticamente una busqueda
de ese elemento pulsado, le he hecho el back y tambien el front porque creo que era la manera mas sencilla para probarlo y pues lo he puesto medio decente
y no lo voy a borrar ya que esta hecho.
Se me habia olvidado añadir el eliminar historial y eliminar un elemento del historial. tambien me he fijado de que cuando busco un producto, y despues 
quiero buscar otro, mientras lo estoy buscando, antes de pulsar intro o darle a biscar, me muestra los resultados de la busqueda anterior, y eso no me interesa,
por lo que he creado "inputBusquedaValue" (tambien le he añadido el id a los valores buscados), he modificado la funcion de "buscarProductos" para que si 
se presiona intro o buscar estando el input vacio, que devuelva todos los productos.
he modificado una cosa en calendario para que se pueda quitar la receta de un dia en concreto.

he usado n8n para que cunado se haga un post de las recetas que se añadan en el calendario a n8n
para recoger primero el body del post, que tiene los datos de uid, id de la receta, fecha y tipo de comida,
despues filtro lo que recoge para solo usar ese body con esos datos, luego hago un apeticion SQL 
donde solicito toda la informacion de la receta que tenga el id que se ha recogido, y filtro y parseo
los ingredientes de la receta para obtener el nombre de cada producto y otros de sus datos,
luego hago otra peticion SQL que se encargar de buscar en mi base de datos los datos id, nombre,
precio y supermercado del producto que se ha obtenido de la receta, y luego realizo un insert 
en sql a la tabla de lista de la compra correspondiendo los datos recibidos con los apartados en los que iria.
a parte tambien he hecho el CRUD de lista de la compra, para que se pueda crear(añadir) productos, editar esos productos, que hare en el front
que solo se pueda modificar la cantidad y eliminar algun producto de la lista.
>>>>>>> 930390767c996901254ab7b0e0cac88974096767
