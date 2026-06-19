"""
blockchain_service.py
----------------------
Encapsula toda la comunicación con la blockchain local (Ganache) a través
de Web3.py. Aquí vive la lógica de: conectar al nodo, cargar el contrato,
firmar y enviar transacciones, y leer datos del contrato.

Separar esto en su propio módulo (en vez de meterlo todo en app.py) es una
buena práctica de arquitectura: los endpoints de Flask no necesitan saber
CÓMO se habla con la blockchain, solo QUÉ pedirle a este servicio.
"""

import os
import json
import hashlib
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# ============================================
# Configuración desde variables de entorno
# ============================================
GANACHE_RPC_URL = os.getenv("GANACHE_RPC_URL", "http://127.0.0.1:7545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
ADMIN_PRIVATE_KEY = os.getenv("ADMIN_PRIVATE_KEY")
ADMIN_ADDRESS = os.getenv("ADMIN_ADDRESS")

# Ruta al ABI del contrato (generado al compilar en Remix)
ABI_PATH = os.path.join(os.path.dirname(__file__), "contracts", "DocumentVerifier_ABI.json")


class BlockchainService:
    """
    Clase que administra la conexión única (singleton-like) hacia Ganache
    y expone métodos de alto nivel para registrar, verificar, revocar
    y listar documentos.
    """

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(GANACHE_RPC_URL))

        if not self.w3.is_connected():
            raise ConnectionError(
                f"No se pudo conectar a Ganache en {GANACHE_RPC_URL}. "
                "Verifica que Ganache esté abierto y corriendo."
            )

        with open(ABI_PATH, "r", encoding="utf-8") as f:
            self.abi = json.load(f)

        if not CONTRACT_ADDRESS:
            raise ValueError("CONTRACT_ADDRESS no está configurado en el archivo .env")

        self.contract_address = Web3.to_checksum_address(CONTRACT_ADDRESS)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)

        if not ADMIN_PRIVATE_KEY or ADMIN_PRIVATE_KEY == "PEGA_AQUI_TU_PRIVATE_KEY_DE_GANACHE":
            raise ValueError(
                "ADMIN_PRIVATE_KEY no está configurada. Edita el archivo .env "
                "y pega la private key de tu cuenta de Ganache."
            )

        self.admin_address = Web3.to_checksum_address(ADMIN_ADDRESS)

    # ------------------------------------------------------------------
    # Utilidad: calcular el hash SHA-256 de un archivo en bytes
    # ------------------------------------------------------------------
    @staticmethod
    def calculate_file_hash(file_bytes: bytes) -> str:
        """
        Calcula el hash SHA-256 de un archivo y lo retorna en formato
        hexadecimal con prefijo 0x, listo para usarse como bytes32 en Solidity.
        """
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()
        return "0x" + sha256_hash

    # ------------------------------------------------------------------
    # Construye, firma y envía una transacción (operaciones de escritura)
    # ------------------------------------------------------------------
    def _send_transaction(self, function_call):
        """
        Toma una llamada de función del contrato (sin ejecutar aún),
        construye la transacción, la firma con la private key del admin
        y la envía a la blockchain. Espera el recibo (receipt) antes
        de retornar, para confirmar que fue minada.
        """
        nonce = self.w3.eth.get_transaction_count(self.admin_address)

        transaction = function_call.build_transaction({
            "from": self.admin_address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": self.w3.eth.gas_price,
        })

        signed_tx = self.w3.eth.account.sign_transaction(transaction, private_key=ADMIN_PRIVATE_KEY)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return tx_receipt

    # ------------------------------------------------------------------
    # 1. Registrar un documento
    # ------------------------------------------------------------------
    def register_document(self, file_bytes: bytes, file_name: str) -> dict:
        document_hash = self.calculate_file_hash(file_bytes)

        # Verificamos primero si ya existe, para dar un mensaje claro
        existing = self.contract.functions.verifyDocument(document_hash).call()
        if existing[0]:  # existing[0] = "exists"
            raise ValueError("Este documento ya está registrado en la blockchain.")

        function_call = self.contract.functions.registerDocument(document_hash, file_name)
        receipt = self._send_transaction(function_call)

        return {
            "success": True,
            "documentHash": document_hash,
            "fileName": file_name,
            "transactionHash": receipt.transactionHash.hex(),
            "blockNumber": receipt.blockNumber,
        }

    # ------------------------------------------------------------------
    # 2. Verificar un documento (solo lectura, no cuesta gas)
    # ------------------------------------------------------------------
    def verify_document(self, file_bytes: bytes) -> dict:
        document_hash = self.calculate_file_hash(file_bytes)

        exists, file_name, owner, timestamp, revoked = self.contract.functions.verifyDocument(
            document_hash
        ).call()

        if not exists:
            return {
                "documentHash": document_hash,
                "status": "no_registrado",
                "exists": False,
            }

        return {
            "documentHash": document_hash,
            "status": "revocado" if revoked else "autentico",
            "exists": True,
            "fileName": file_name,
            "owner": owner,
            "timestamp": timestamp,
            "revoked": revoked,
        }

    # ------------------------------------------------------------------
    # 3. Revocar un documento (solo el admin puede hacerlo)
    # ------------------------------------------------------------------
    def revoke_document(self, document_hash: str) -> dict:
        existing = self.contract.functions.verifyDocument(document_hash).call()
        if not existing[0]:
            raise ValueError("El documento no existe en la blockchain.")
        if existing[4]:  # existing[4] = "revoked"
            raise ValueError("El documento ya estaba revocado.")

        function_call = self.contract.functions.revokeDocument(document_hash)
        receipt = self._send_transaction(function_call)

        return {
            "success": True,
            "documentHash": document_hash,
            "transactionHash": receipt.transactionHash.hex(),
            "blockNumber": receipt.blockNumber,
        }

    # ------------------------------------------------------------------
    # 4. Historial completo de documentos registrados
    # ------------------------------------------------------------------
    def get_history(self) -> list:
        total = self.contract.functions.getTotalDocuments().call()
        history = []

        for i in range(total):
            doc_hash = self.contract.functions.getDocumentHashByIndex(i).call()
            exists, file_name, owner, timestamp, revoked = self.contract.functions.verifyDocument(
                doc_hash
            ).call()

            history.append({
                "documentHash": doc_hash.hex() if isinstance(doc_hash, bytes) else doc_hash,
                "fileName": file_name,
                "owner": owner,
                "timestamp": timestamp,
                "revoked": revoked,
            })

        # Más recientes primero
        history.reverse()
        return history


# Instancia única que se importa en app.py
blockchain_service = BlockchainService()
