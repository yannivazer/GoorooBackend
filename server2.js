require("dotenv").config();
const express = require("express");
const fs = require("fs");
const mysql = require("mysql2/promise");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const nodemailer = require("nodemailer");

const mailjetTransport = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY,
  },
});


// Connexion à la base
let db;
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}).then((connection) => {
  db = connection;
  console.log("✅ Connecté à MySQL");
}).catch(err => {
  console.error("❌ Erreur connexion MySQL", err);
});

// Génère une licence aléatoire
function generateLicense() {
  const part = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${part()}-${part()}-${part()}`;
}

app.post("/generate", async (req, res) => {
    const email = req.body.email;
    const license = generateLicense();
  
    await db.query(
      "INSERT INTO licenses (email, license_key) VALUES (?, ?)",
      [email, license]
    );
  
    // Envoi de l'email
    const emailBody = `
  Bonjour,
  
  Voici votre clé de licence Gooroo :
  
  🔑 ${license}
  
  Merci d'utiliser notre application ! 🎧
  `;
  
    try {
      await mailjetTransport.sendMail({
        from: `"Gooroo Bridge" <${process.env.MAILJET_SENDER}>`,
        to: email,
        subject: "Votre clé de licence",
        text: emailBody,
      });
      console.log("📤 Email envoyé à", email);
    } catch (err) {
      console.error("❌ Erreur envoi email :", err);
    }
  
    res.json({ license });
  });
  

// Vérification avec signature
app.post("/verify", async (req, res) => {
  const key = req.body.licenseKey;
  const [rows] = await db.query("SELECT * FROM licenses WHERE license_key = ?", [key]);

  const valid = rows.length > 0;
  const payload = {
    valid,
    user: valid ? rows[0].email : "",
    expires: valid ? "2025-12-31" : ""
  };

  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, "utf8");
  const sign = crypto.createSign("SHA256");
  sign.update(JSON.stringify(payload));
  sign.end();

  const signature = sign.sign(privateKey, "base64");

  res.json({ ...payload, signature });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend lancé sur http://localhost:${process.env.PORT}`);
});
