CREATE DATABASE IF NOT EXISTS `proyecto_db`;
USE `proyecto_db`;

CREATE TABLE IF NOT EXISTS productos (
    Id VARCHAR(30) PRIMARY KEY,
    Nombre VARCHAR(255),
    Precio DECIMAL(10,2),
    Precio_Pack DECIMAL(10,2),
    Formato VARCHAR(30),
    Categoria VARCHAR(255),
    Supermercado VARCHAR(20),
    Url TEXT,
    Url_imagen TEXT,
    Favorito BOOLEAN DEFAULT FALSE,
    INDEX idx_nombre_producto (Nombre),
    INDEX idx_categoria (Categoria),
    INDEX idx_supermercado (Supermercado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
    uid_firebase VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('cliente', 'admin') DEFAULT 'cliente',
    foto_url TEXT,
    INDEX idx_uid_firebase (uid_firebase),
    INDEX idx_nombre_usuario (nombre_usuario),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid_firebase VARCHAR(128) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ingredientes TEXT,
    pasos TEXT,
    Url_imagen TEXT,
    predeterminada BOOLEAN DEFAULT FALSE,
    compartida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (uid_firebase) REFERENCES usuarios(uid_firebase),
    INDEX idx_id_receta (id),
    INDEX idx_uid_firebase (uid_firebase),
    INDEX idx_titulo_receta (titulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recetas_favoritas (
    uid_firebase VARCHAR(128) NOT NULL,
    receta_id INT NOT NULL,
    PRIMARY KEY (uid_firebase, receta_id),
    FOREIGN KEY (uid_firebase) REFERENCES usuarios(uid_firebase),
    FOREIGN KEY (receta_id) REFERENCES recetas(id),
    INDEX idx_uid_firebase (uid_firebase),
    INDEX idx_receta_favorita (receta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS calendario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid_firebase VARCHAR(128) NOT NULL,
    fecha DATE NOT NULL,
    desayuno INT DEFAULT NULL,
    comida INT DEFAULT NULL,
    cena INT DEFAULT NULL,
    FOREIGN KEY (uid_firebase) REFERENCES usuarios(uid_firebase),
    FOREIGN KEY (desayuno) REFERENCES recetas(id),
    FOREIGN KEY (comida) REFERENCES recetas(id),
    FOREIGN KEY (cena) REFERENCES recetas(id),
    UNIQUE (uid_firebase, fecha),
    INDEX idx_uid_firebase (uid_firebase),
    INDEX idx_fecha_calendario (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS listas_compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid_firebase VARCHAR(128) NOT NULL,
    fecha DATE NOT NULL,
    id_producto VARCHAR(30) NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    supermercado VARCHAR(20) NOT NULL,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (uid_firebase) REFERENCES usuarios(uid_firebase),
    FOREIGN KEY (id_producto) REFERENCES productos(Id),
    UNIQUE (uid_firebase, id_producto, fecha),
    INDEX idx_uid_firebase (uid_firebase),
    INDEX idx_fecha_lista (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS historial_busquedas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid_firebase VARCHAR(128) NOT NULL,
    termino_busqueda VARCHAR(255) NOT NULL,
    FOREIGN KEY (uid_firebase) REFERENCES usuarios(uid_firebase),
    INDEX idx_termino_busqueda (termino_busqueda),
    INDEX idx_uid_firebase_historial (uid_firebase)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO usuarios (uid_firebase, email, nombre_usuario,rol, foto_url)
VALUES
('E3LfTyIO1sXMawkea9aeVyzoh9E3', 'davricchi@gmail.com', 'David Rico', 'admin', 'https://i.pinimg.com/736x/e7/70/51/e77051136cf95616fcb83bbd3f338c93.jpg');

INSERT INTO recetas (uid_firebase, titulo, descripcion, ingredientes, pasos, Url_imagen, predeterminada, compartida)
VALUES
('E3LfTyIO1sXMawkea9aeVyzoh9E3', 'Ensalada César', 'Ensalada con pollo y croutons',
'[{"idProducto":"5237","nombre":"Lechuga Batavia","cantidad":"200","unidad":"g"}, {"idProducto":"7413","nombre":"Pechuga de Pollo Cocida","cantidad":"150","unidad":"g"}, {"idProducto":"8504","nombre":"Picatostes Tradicionales","cantidad":"50","unidad":"g"}, {"idProducto":"9305","nombre":"Queso Parmesano Rallado","cantidad":"30","unidad":"g"}, {"idProducto":"10117","nombre":"Salsa César","cantidad":"50","unidad":"ml"}]',
'1. Lavar y picar la lechuga batavia.\n2. Añadir la pechuga de pollo troceada.\n3. Añadir picatostes tradicionales y queso parmesano rallado.\n4. Añadir la salsa César y mezclar.\n5. Servir fría.',
'https://ia600406.us.archive.org/33/items/nano-banana-2025-11-03T11-20-49/nano-banana-2025-11-03T10-59-43-ensalada-cesar.png',
1, 1),
('E3LfTyIO1sXMawkea9aeVyzoh9E3', 'Tortilla de patatas', 'Tortilla tradicional española',
'[{"idProducto":"6432","nombre":"Patata Larga Nacional","cantidad":"300","unidad":"g"}, {"idProducto":"6112","nombre":"Huevo L de Caserío","cantidad":"4","unidad":"uds"}, {"idProducto":"7120","nombre":"Cebolla blanca","cantidad":"100","unidad":"g"}, {"idProducto":"5337","nombre":"Aceite de Oliva Hacendado","cantidad":"50","unidad":"ml"}, {"idProducto":"9999","nombre":"Sal","cantidad":"al gusto","unidad":""}]',
'1. Pelar y cortar las patatas en rodajas finas.\n2. Cortar la cebolla en juliana.\n3. Freír patatas y cebolla en aceite de oliva hasta que estén tiernas.\n4. Batir los huevos y mezclar con patatas y cebolla.\n5. Verter la mezcla en la sartén y cocinar a fuego medio.\n6. Dar la vuelta a la tortilla y cocinar hasta que esté dorada.\n7. Añadir sal al gusto.\n8. Servir caliente.',
'https://archive.org/download/nano-banana-2025-11-03T11-20-49/nano-banana-2025-11-03T11-20-49.png',
1, 1);

INSERT INTO recetas_favoritas (uid_firebase, receta_id)
VALUES
('E3LfTyIO1sXMawkea9aeVyzoh9E3', 1);

INSERT INTO calendario (uid_firebase, fecha, desayuno, comida, cena)
VALUES
('E3LfTyIO1sXMawkea9aeVyzoh9E3', '2025-11-04', 1, 1, 1);


INSERT INTO historial_busquedas (uid_firebase, termino_busqueda)
VALUES
('E3LfTyIO1sXMawkea9aeVyzoh9E3', 'manzana');