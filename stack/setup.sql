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
    nombre_usuario VARCHAR(100) NOT NULL,
    rol ENUM('cliente', 'moderador', 'admin') DEFAULT 'cliente',
    INDEX idx_uid_firebase (uid_firebase),
    INDEX idx_nombre_usuario (nombre_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid_firebase VARCHAR(128) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ingredientes TEXT,
    pasos TEXT,
    Url_imagen TEXT,
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
    id_producto VARCHAR(20) NOT NULL,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (uid_firebase) REFERENCES usuarios(uid_firebase),
    FOREIGN KEY (id_producto) REFERENCES productos(Id),
    UNIQUE (uid_firebase, id_producto),
    INDEX idx_uid_firebase (uid_firebase)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS historial_busquedas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid_firebase VARCHAR(128) NOT NULL,
    termino_busqueda VARCHAR(255) NOT NULL,
    FOREIGN KEY (uid_firebase) REFERENCES usuarios(uid_firebase),
    INDEX idx_termino_busqueda (termino_busqueda),
    INDEX idx_uid_firebase_historial (uid_firebase)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
