import csv
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 33306))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD", "zx76wbz7FG89k")
MYSQL_DB = os.getenv("MYSQL_DB", "proyecto_db")

CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), "export/products.csv")

def import_csv_to_mysql():
    try:
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB
        )
        cursor = connection.cursor()
        
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            print("Cabeceras del CSV:", reader.fieldnames)
            
            query = """
            INSERT INTO productos (Id, Nombre, Precio, Precio_Pack, Formato, Categoria, Supermercado, Url, Url_imagen, Favorito)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                Nombre=VALUES(Nombre),
                Precio=VALUES(Precio),
                Precio_Pack=VALUES(Precio_Pack),
                Formato=VALUES(Formato),
                Categoria=VALUES(Categoria),
                Supermercado=VALUES(Supermercado),
                Url=VALUES(Url),
                Url_imagen=VALUES(Url_imagen),
                Favorito=VALUES(Favorito)
            """
            
            for row in reader:
                favorito = row.get("Favorito", "FALSE").upper() in ["TRUE", "1", "YES"]
                precio = float(row["Precio"]) if row["Precio"] else None
                
                data = (
                    row["Id"],
                    row["Nombre"],
                    precio,
                    row.get("Precio Pack"),
                    row.get("Formato"),
                    row.get("Categoria"),
                    row.get("Supermercado"),
                    row.get("Url"),
                    row.get("Url_imagen"),
                    favorito
                )
                cursor.execute(query, data)

        connection.commit()
        print("Importación completada con éxito.")

    except mysql.connector.Error as err:
        print(f"Error al conectar o insertar: {err}")

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    import_csv_to_mysql()
