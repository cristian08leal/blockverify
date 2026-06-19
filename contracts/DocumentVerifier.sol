// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentVerifier {
    struct Document {
        string fileName;
        address owner;
        uint256 timestamp;
        bool exists;
        bool revoked;
    }

    address public admin;
    mapping(bytes32 => Document) private documents;
    bytes32[] private documentHashes;

    event DocumentRegistered(bytes32 indexed documentHash, string fileName, address indexed owner, uint256 timestamp);
    event DocumentRevoked(bytes32 indexed documentHash, address indexed revokedBy, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    function registerDocument(bytes32 documentHash, string memory fileName) public {
        require(!documents[documentHash].exists, "El documento ya esta registrado");

        documents[documentHash] = Document({
            fileName: fileName,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true,
            revoked: false
        });
        
        documentHashes.push(documentHash);

        emit DocumentRegistered(documentHash, fileName, msg.sender, block.timestamp);
    }

    function verifyDocument(bytes32 documentHash) public view returns (bool exists, string memory fileName, address owner, uint256 timestamp, bool revoked) {
        Document memory doc = documents[documentHash];
        return (doc.exists, doc.fileName, doc.owner, doc.timestamp, doc.revoked);
    }

    function revokeDocument(bytes32 documentHash) public {
        require(documents[documentHash].exists, "El documento no existe");
        require(documents[documentHash].owner == msg.sender || admin == msg.sender, "No autorizado");
        require(!documents[documentHash].revoked, "El documento ya esta revocado");

        documents[documentHash].revoked = true;

        emit DocumentRevoked(documentHash, msg.sender, block.timestamp);
    }

    function getTotalDocuments() public view returns (uint256) {
        return documentHashes.length;
    }

    function getDocumentHashByIndex(uint256 index) public view returns (bytes32) {
        require(index < documentHashes.length, "Indice fuera de rango");
        return documentHashes[index];
    }
}
