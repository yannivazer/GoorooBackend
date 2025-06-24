const crypto = require("crypto");
const fs = require("fs");

// ⚠️ Copier-coller ici le JSON reçu du serveur
const response = {
  valid: true,
  user: "yanniv",
  expires: "2025-12-31",
  signature: "tmM7Vlib60ywAZ6SC92a2RSIKu7HAcFIQ9OuaKcjQwCrOTtEuarhVoJkMOhr40906WNWTMM9N83xQdJvt5oph5oZPrZ4+A1cDCm5nZQCbTNPsQSF3kkxLWZ5dekQ2I5gg8iuzFgi0UUw59mJsXe3jbYVtH14CWza8fVviZFGPfEou6fbfabk19VSxmueJpf4b7IwTHptwkDeCGbDIV7PXan//ijlVvuVLXLLIXa5EWWTFKfWLzpIG9BWGUA+DiN4Hj3+gj06LA68soXHmtHL4owflcq3sNk8EgjFMWzivN60gMyhRqv7Xn2ngbRajoE9pQHPwjFv8ZUrY3A1tWkvRg==" // 👈 colle ici la vraie signature reçue
};

// Séparer les données à vérifier
const { signature, ...payload } = response;

// Lire la clé publique
const publicKey = fs.readFileSync("public.pem", "utf8");

// Vérification de la signature
const verify = crypto.createVerify("SHA256");
verify.update(JSON.stringify(payload));
verify.end();

const isValid = verify.verify(publicKey, signature, "base64");
console.log("✅ Signature correcte ?", isValid);
