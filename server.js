const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

const config = {
    user: "mapaUser1",
    password: "1234567",
    server: "192.168.0.16", // tu IP si es local
    database: "mapa",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function iniciarServidor() {
    try {
        const pool = await sql.connect(config);
        console.log("CONECTADO A SQL SERVER");

        app.get("/", (req, res) => {
            res.send("API funcionando en la nube");
        });

        app.post("/ubicacion", async (req, res) => {
            try {
                const { lat, lon, hora } = req.body;

                await pool.request()
                    .input("lat", sql.Float, lat)
                    .input("lon", sql.Float, lon)
                    .input("hora", sql.BigInt, hora)
                    .query(`
                        INSERT INTO ubicacione (lat, lon, hora)
                        VALUES (@lat, @lon, @hora)
                    `);

                console.log("GUARDADO EN SQL");
                res.send("OK");

            } catch (err) {
                console.log("ERROR INSERT:", err);
                res.status(500).send("Error");
            }
        });

        app.get("/ubicacion", async (req, res) => {
            try {
                const result = await pool.request().query(`
                    SELECT TOP 1 * FROM ubicacione ORDER BY id DESC
                `);

                res.json(result.recordset[0] || null);

            } catch (err) {
                console.log("ERROR GET:", err);
                res.status(500).send("Error");
            }
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Servidor en puerto", PORT);
        });

    } catch (err) {
        console.log("ERROR CONEXIÓN:", err);
    }
}

iniciarServidor();
