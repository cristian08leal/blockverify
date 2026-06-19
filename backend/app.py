"""
app.py
------
Punto de entrada de la API REST de BlockVerify.

Expone 4 endpoints principales que cubren el ciclo de vida de un documento:
  POST /api/register   -> registra un nuevo documento (escribe en blockchain)
  POST /api/verify      -> verifica el estado de un documento (lectura, gratis)
  GET  /api/history     -> lista todos los documentos registrados
  POST /api/revoke      -> revoca un documento (solo cuenta admin)

Todas las respuestas son JSON. Los errores de negocio (ej. "ya registrado")
devuelven 400 con un mensaje claro; los errores inesperados devuelven 500.
"""

import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

from blockchain_service import blockchain_service

# ============================================
# Configuración de logging (trazabilidad en consola)
# ============================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("blockverify")

app = Flask(__name__)
CORS(app)  # Permite que el frontend en React (otro puerto) consuma esta API


@app.route("/api/health", methods=["GET"])
def health_check():
    """Endpoint simple para confirmar que el backend y la conexión a Ganache están vivos."""
    return jsonify({
        "status": "ok",
        "blockchain_connected": blockchain_service.w3.is_connected(),
        "contract_address": blockchain_service.contract_address,
    })


@app.route("/api/register", methods=["POST"])
def register_document():
    """
    Registra un documento en la blockchain.
    Espera un archivo multipart/form-data con la clave 'file'.
    """
    if "file" not in request.files:
        return jsonify({"error": "No se envió ningún archivo. Usa el campo 'file'."}), 400

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({"error": "El archivo está vacío."}), 400

    try:
        file_bytes = uploaded_file.read()
        result = blockchain_service.register_document(file_bytes, uploaded_file.filename)

        logger.info(
            f"Documento registrado | archivo={uploaded_file.filename} "
            f"| hash={result['documentHash']} | tx={result['transactionHash']}"
        )

        return jsonify(result), 201

    except ValueError as ve:
        # Errores de negocio esperados (ej: documento duplicado)
        logger.warning(f"Registro rechazado | archivo={uploaded_file.filename} | motivo={ve}")
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        logger.error(f"Error inesperado al registrar documento: {e}")
        return jsonify({"error": "Error interno al registrar el documento."}), 500


@app.route("/api/verify", methods=["POST"])
def verify_document():
    """
    Verifica si un documento está registrado, es auténtico o fue revocado.
    Espera un archivo multipart/form-data con la clave 'file'.
    No cuesta gas: es una llamada de solo lectura (view) al contrato.
    """
    if "file" not in request.files:
        return jsonify({"error": "No se envió ningún archivo. Usa el campo 'file'."}), 400

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({"error": "El archivo está vacío."}), 400

    try:
        file_bytes = uploaded_file.read()
        result = blockchain_service.verify_document(file_bytes)

        logger.info(
            f"Verificación realizada | archivo={uploaded_file.filename} "
            f"| hash={result['documentHash']} | estado={result['status']}"
        )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error inesperado al verificar documento: {e}")
        return jsonify({"error": "Error interno al verificar el documento."}), 500


@app.route("/api/history", methods=["GET"])
def get_history():
    """Retorna la lista completa de documentos registrados, más recientes primero."""
    try:
        history = blockchain_service.get_history()
        return jsonify({"total": len(history), "documents": history}), 200

    except Exception as e:
        logger.error(f"Error inesperado al obtener historial: {e}")
        return jsonify({"error": "Error interno al obtener el historial."}), 500


@app.route("/api/revoke", methods=["POST"])
def revoke_document():
    """
    Revoca un documento previamente registrado.
    Espera JSON: { "documentHash": "0x..." }
    Solo la cuenta admin (definida en .env) puede ejecutar esta acción.
    """
    data = request.get_json(silent=True)
    if not data or "documentHash" not in data:
        return jsonify({"error": "Debes enviar 'documentHash' en el cuerpo JSON."}), 400

    document_hash = data["documentHash"]

    try:
        result = blockchain_service.revoke_document(document_hash)

        logger.info(f"Documento revocado | hash={document_hash} | tx={result['transactionHash']}")

        return jsonify(result), 200

    except ValueError as ve:
        logger.warning(f"Revocación rechazada | hash={document_hash} | motivo={ve}")
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        logger.error(f"Error inesperado al revocar documento: {e}")
        return jsonify({"error": "Error interno al revocar el documento."}), 500


if __name__ == "__main__":
    import os
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True") == "True"

    logger.info(f"Iniciando BlockVerify API en el puerto {port}...")
    logger.info(f"Conectado a Ganache: {blockchain_service.w3.is_connected()}")
    logger.info(f"Contrato: {blockchain_service.contract_address}")

    app.run(host="0.0.0.0", port=port, debug=debug)
