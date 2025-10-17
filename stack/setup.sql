CREATE DATABASE IF NOT EXISTS `proyecto_db`;

USE `proyecto_db`;

CREATE TABLE IF NOT EXISTS productos (
    Id VARCHAR(255) PRIMARY KEY,
    Nombre VARCHAR(255),
    Precio DECIMAL(10,2),
    Precio_Pack VARCHAR(50),
    Formato VARCHAR(50),
    Categoria VARCHAR(255),
    Supermercado VARCHAR(50),
    Url TEXT,
    Url_imagen TEXT,
    Favorito BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
