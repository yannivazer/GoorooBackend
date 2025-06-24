const express = require("express");
const app = express();
app.use(express.json());

// On branche la route
const generateRoute = require("./routes/generate");
app.use("/", generateRoute);

app.listen(3000, () => {
  console.log("🟢 Serveur démarré sur http://localhost:3000");
});
