const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");

const app = express();
app.use(cors());
app.use(express.json());

const config = {
    connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=mapa;Trusted_Connection=yes;"
};

async function iniciarServidor() {
    try {
        const pool = await sql.connect(config);
        console.log("CONECTADO A SQL SERVER");

        // Ruta de prueba
        app.get("/", (req, res) => {
            res.send("API funcionando");
        });

        // Guardar ubicación
        app.post("/ubicacion", async (req, res) => {
            try {
                const { lat, lon, hora } = req.body;

                console.log("RECIBIDO:", lat, lon, hora);
                await pool.request().query(`
                    INSERT INTO ubicacione (lat, lon, hora)
                    VALUES (${lat}, ${lon}, ${hora})
                `);

                console.log("GUARDADO EN SQL");
                res.send("OK");

            } catch (err) {
                console.log("ERROR INSERT:", err);
                res.status(500).send("Error");
            }
        });

        // Obtener última ubicación
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

        app.listen(3000, "0.0.0.0", () => {
            console.log("Servidor en http://192.168.0.16:3000");
        });

    } catch (err) {
        console.log("ERROR CONEXIÓN:", err);
    }
}

iniciarServidor();