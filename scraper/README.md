# 🧠 Guía paso a paso: Activar entorno virtual, instalar dependencias y ejecutar el scraper

Evita los choques de versiones entre **pandas** y **NumPy** siguiendo el orden exacto de instalación.  
Sí, el orden importa más que tu café de las mañanas.

---

## 🔧 Requisitos previos

- **Python** 3.11 o 3.13 instalado.  
- **Entorno virtual** en la raíz del proyecto (`.venv`).  
  - Si no existe, créalo.

# ⚙️ Crear y activar el entorno virtual
Windows (PowerShell/cmd)

```bash
python -m venv nombre_del_entorno
.nombre_del_entorno\Scripts\Activate.ps1
```

Al activarlo verás el prefijo (.nombre_del_entorno) en la terminal y el comando python pertenecerá al entorno.

# 🧩 Elegir combinación pandas / NumPy
Elige una de estas combinaciones para evitar el error de incompatibilidad binaria:

Opción A (Python 3.13): pandas 2.2.3 con NumPy 2.x

Opción B (Python 3.11): pandas 2.0.3 con NumPy 1.x

# 🪄 Instalación uno a uno — Opción A (Python 3.13 + pandas 2.2.3)
Ejecuta con el entorno virtual activo en este orden:

powershell
Copiar código
```bash
python -m pip install --upgrade pip setuptools wheel
```

# Núcleo numérico compatible
```bash
python -m pip install "numpy>=2,<3"
python -m pip install "pandas==2.2.3"
```

# Selenium y drivers
```bash
python -m pip install "selenium==4.0.0"
python -m pip install "webdriver-manager==3.5.2"
python -m pip install "chromedriver-autoinstaller==0.6.3"
python -m pip install "chromedrivermanager==0.0.1"
```
# Web y utilidades
```bash
python -m pip install "requests" "python-dotenv==1.0.0"
```
# Webhooks y otras libs
```bash
python -m pip install "bs4==0.0.1"
python -m pip install "by==0.0.4"
python -m pip install "discord-webhook==1.1.0"
python -m pip install "discordwebhook==1.0.3"
```
# Análisis y linting (opcionales)
```bash
python -m pip install "pipdeptree==2.13.2"
python -m pip install "pylint==2.6.0"
```
# Seguridad / APIs varias
```bash
python -m pip install "pyOpenSSL==23.3.0"
python -m pip install "pyowm==3.3.0"
python -m pip install "pywhatkit==5.4"
python -m pip install "service==0.6.0"
```
# cfscrape (requiere Node.js)
```bash
python -m pip install "cfscrape==2.1.1"
```
# 🪄 Instalación uno a uno — Opción B (Python 3.11 + pandas 2.0.3)
Si usas Python 3.11, fija NumPy en versión 1.x:

# Núcleo numérico compatible
```bash
python -m pip install "numpy<2.0"          # Ejemplo: 1.26.4
python -m pip install "pandas==2.0.3"
```
# ✅ Verificaciones rápidas
Comprueba que estás usando el python del venv y las versiones correctas:

powershell
Copiar código
python -c "import sys, numpy, pandas; print(sys.executable); print(numpy.__version__); print(pandas.__version__)"
python -m pip check
Si aparece un error tipo “numpy.dtype size changed…”, reinstala la pareja elegida (A o B).

# 📁 Preparar configuración y carpetas
Crea la carpeta export/ en la raíz del proyecto:

```bash
mkdir .\export
```

# 🏁 Notas finales
Instala en el orden indicado para evitar conflictos.

Si seguiste todo esto al pie de la letra, tu scraper debería funcionar.

# Errores sin solucionar

- La cookie del carrefour no funciona, sospecho que es porque la api esta en mantenimiento, no es seguro,
en un tiempo volvere a probar y si sigue sin funcionar lo eliminare del scraper.