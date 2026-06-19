# 🔐 BlockVerify

BlockVerify es un sistema de verificación de integridad documental usando tecnología blockchain 🌐. Permite registrar el hash criptográfico (SHA-256) de un archivo de forma inmutable en una blockchain local (Ganache) a través de un smart contract en Solidity 📜. Posteriormente, permite verificar si el documento ha sido alterado o si ha sido revocado por su emisor, garantizando confianza y transparencia en entornos digitales 🤝.

## 🏗 Arquitectura / Stack

* 📝 **Smart Contract:** Desarrollado en Solidity, desplegado en Ganache (red local de prueba).
* 🐍 **Backend:** API REST en Python construida con Flask y `Web3.py` para la interacción con el smart contract.
* ⚛️ **Frontend:** Aplicación web moderna en React (construida con Vite).

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

1. 🍫 [**Ganache**](https://trufflesuite.com/ganache) — Aplicación de escritorio para emular la blockchain Ethereum localmente.
2. 🟢 [**Node.js 18+**](https://nodejs.org/) y `npm` — Necesarios para levantar el frontend.
3. 🐍 [**Python 3.11+**](https://www.python.org/) y `pip` — Necesarios para el backend.

---

## 🚀 Instrucciones de Instalación y Ejecución

Sigue estos pasos en orden para levantar el proyecto completo:

### a) 🦊 Levantar Ganache

1. Abre la aplicación de Ganache y selecciona **"Quickstart Ethereum"** ⚡.
2. Verifica en la configuración (o en la parte superior) que el RPC Server esté ejecutándose en `http://127.0.0.1:7545` 🔌. Si usa un puerto distinto, deberás ajustarlo en tu archivo `.env` más adelante.

### b) 📜 Desplegar el Smart Contract

*(Nota: Solo necesitas hacer esto si deseas levantar tu propia instancia independiente; de lo contrario, si el contrato ya está desplegado, puedes utilizar la dirección existente.)*

1. Abre [Remix IDE](https://remix.ethereum.org) 💻 en tu navegador.
2. En el explorador de archivos de Remix, crea un nuevo archivo llamado `DocumentVerifier.sol` y pega el contenido exacto de la carpeta `contracts/DocumentVerifier.sol` 📄.
3. Ve a la pestaña "Solidity Compiler" ⚙️. En **Advanced Configurations**, asegúrate de que el **EVM version** esté configurado en `london` (Ganache no soporta versiones más modernas del EVM).
4. Compila el contrato 🔨.
5. Ve a la pestaña "Deploy & Run Transactions" 🚀.
6. Cambia el **Environment** a `Custom - External Http Provider` 🌍.
7. Ingresa la URL de Ganache: `http://127.0.0.1:7545` y presiona OK.
8. Asegúrate de que tu contrato esté seleccionado y haz clic en **Deploy** ✨.
9. En la parte inferior ("Deployed Contracts"), copia la dirección del contrato que acaba de crearse 📋.

### c) ⚙️ Levantar el Backend (Flask)

Abre una terminal y colócate en la carpeta del proyecto:

```bash
cd backend
python -m venv venv
```

Activa el entorno virtual 🛡️:
* **Windows:** `venv\Scripts\activate`
* **Mac/Linux:** `source venv/bin/activate`

Instala las dependencias 📦:
```bash
pip install -r requirements.txt
```

Configura las variables de entorno 🔑:
1. Copia el archivo de ejemplo: `cp .env.example .env` (o cópialo y renómbralo manualmente).
2. **Edita el archivo `.env`** 📝 para que contenga tu propia configuración. Debes llenar:
   * `CONTRACT_ADDRESS`: Pega la dirección que copiaste desde Remix 📍.
   * `ADMIN_PRIVATE_KEY` y `ADMIN_ADDRESS`: Ve a Ganache, haz clic en el icono de llave 🗝️ de la primera cuenta y copia la clave privada y su dirección correspondiente.

Inicia el servidor Flask 🔥:
```bash
python app.py
```
Deberías ver en consola el mensaje `Conectado a Ganache: True` ✅, indicando éxito en la conexión. Deja esta terminal abierta y corriendo.

### d) 🎨 Levantar el Frontend (React + Vite)

Abre una **segunda terminal**, dejando la del backend en ejecución.

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo iniciará y mostrará una URL local 🌐, por lo general `http://localhost:5173/`. Abre esa URL en tu navegador y ya podrás interactuar con la aplicación 🎉.

---

## 📡 Endpoints de la API Backend

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| 💚 **GET** | `/api/health` | Retorna el estado de conexión a la blockchain y la dirección del contrato instanciado. |
| 🆕 **POST** | `/api/register` | Recibe un archivo, calcula su hash SHA-256 localmente, y envía una transacción a la blockchain para registrar su autenticidad, autor y fecha. |
| 🔍 **POST** | `/api/verify` | Recibe un archivo, lo hashea en tiempo real y consulta en la blockchain (operación de lectura, sin costo de gas) para verificar su autenticidad, existencia y estado de vigencia. |
| 📜 **GET** | `/api/history` | Retorna el listado cronológico de todos los documentos previamente registrados por el contrato. |
| 🚫 **POST** | `/api/revoke` | Revoca permanentemente la validez de un documento registrado. Genera una transacción inmutable. Solo puede hacerlo el propietario o el administrador. |

---

## ⚠️ Problemas Comunes

* 🐛 **Falla `pip install` al compilar `lru-dict` en Windows:** Este problema suele estar resuelto en este proyecto ya que se fuerza `web3==7.6.0` en `requirements.txt`. Si por alguna razón ocurre el error, ejecuta `pip install lru-dict --only-binary :all:` de manera aislada y vuelve a instalar los requirements.
* ❌ **Remix arroja "invalid opcode" al desplegar el contrato:** Esto ocurre porque el compilador de Solidity está utilizando un EVM muy reciente (ej. Shanghai o Paris). Ganache solo soporta versiones hasta **London**. Ajusta la "EVM Version" a `london` en la configuración avanzada del compilador de Remix y vuelve a compilar y desplegar.
* 🔒 **El backend dice "ADMIN_PRIVATE_KEY no está configurada":** Te has olvidado de configurar el archivo `.env` o no le pusiste el nombre correcto. Asegúrate de copiar el contenido de `.env.example` en un archivo llamado explícitamente `.env` y llenarlo con los datos de Ganache.

---

## 👥 Integrantes del Equipo

* 🧑‍💻 [Nombre del integrante 1]
* 🧑‍💻 [Nombre del integrante 2]
* 🧑‍💻 [Nombre del integrante 3]
