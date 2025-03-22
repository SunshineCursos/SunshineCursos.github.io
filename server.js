const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do SQLite
const db = new sqlite3.Database('./locations.db');

// Cria a tabela para armazenar as localizações
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// Middleware para permitir requisições JSON e CORS
app.use(express.json());
app.use(cors());

// Rota para salvar a localização
app.post('/save-location', (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude e longitude são obrigatórias.' });
    }

    const query = `INSERT INTO locations (latitude, longitude) VALUES (?, ?)`;
    db.run(query, [latitude, longitude], function (err) {
        if (err) {
            console.error('Erro ao salvar localização:', err);
            return res.status(500).json({ error: 'Erro ao salvar localização.' });
        }
        res.status(200).json({ success: true, id: this.lastID });
    });
});

// Rota para listar todas as localizações (opcional)
app.get('/locations', (req, res) => {
    db.all('SELECT * FROM locations', (err, rows) => {
        if (err) {
            console.error('Erro ao buscar localizações:', err);
            return res.status(500).json({ error: 'Erro ao buscar localizações.' });
        }
        res.status(200).json(rows);
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});