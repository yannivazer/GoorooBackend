const express = require("express");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// Simule une "base" de licences valides
const licencesValides = ["ABC123", "DEF456"];

app.post("/", (req, res) => {
    res.send("Backend de Gooroo Interface prêt !");
});


app.post("/verify", (req, res) => {
  const licenceReçue = req.body.licenseKey;

  const estValide = licencesValides.includes(licenceReçue);

  // Les données à signer
  const payload = {
    valid: estValide,
    user: estValide ? "yanniv" : "",
    expires: estValide ? "2025-12-31" : ""
  };

  // Lire la clé privée
  const privateKey = fs.readFileSync("private.pem", "utf8");

  // Signer les données
  const sign = crypto.createSign("SHA256");
  sign.update(JSON.stringify(payload));
  sign.end();

  const signature = sign.sign(privateKey, "base64");

  // Envoyer les données + la signature
  res.json({
    ...payload,
    signature: signature
  });
});

//app.listen(3000, () => {
//  console.log("🔐 Serveur backend prêt sur http://localhost:3000");
//});

const https = require("https");

const httpsOptions = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem")
};

https.createServer(httpsOptions, app).listen(443, () => {
  console.log("🔒 Serveur HTTPS lancé sur le port 443");
});
