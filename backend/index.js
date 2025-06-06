import express, { json } from 'express';
import cors from 'cors';
import db from './base/conecction.js';
import dotenv from 'dotenv';
dotenv.config();


const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();

app.use(express.json());
app.use(cors());

function isValidURL(string) {
    try {
        new URL(string); 
        return true;
    } catch (_) {
        return false;
    }
}

function generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function convert(url_temp, url_new) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO URLS_CONVERTS (url_temporal, url_new) VALUES (?, ?)',
            [url_temp, url_new],
            function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

function getShortLink(code) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT url_temporal, clicks FROM URLS_CONVERTS WHERE url_new = ?',
            [code],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/TakeLinks', async function (req, res) {
    const url_temp = req.body.url;
    if (!url_temp) {
        return res.status(400).json({ error: 'URL is Required' });
    }

    if (!isValidURL(url_temp)){
        return res.status(400).json({error:'Invalid URL Format'})
    }

    const code = generateShortCode();

    try {
        await convert(url_temp, code);
        res.json({
            ShortLink: code,
            shortUrl: `${BASE_URL}/${code}`
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Database error' });
    }
});


// Redirect + count clicks
app.get('/:code', async function (req, res) {
    const code = req.params.code;

    try {
        const row = await getShortLink(code);

        if (row && row.url_temporal) {
            // Count click
            await db.run('UPDATE URLS_CONVERTS SET clicks = clicks + 1 WHERE url_new = ?', [code]);
            // Redirect
            res.redirect(row.url_temporal);
        } else {
            res.status(404).send('Short link not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error');
    }
});


app.get('/stats/:code', async (req, res) => {
    const code = req.params.code;

    try {
        const row = await getShortLink(code);

        if (row) { 
            res.json({
                shortCode: code,
                originalUrl: row.url_temporal,
                clicks: row.clicks
            });
        } else {
            res.status(404).send('Short link not found');
        }
    } catch (err) {
        res.status(500).send('Database error');
    }
});


app.post('/reset-db', (req, res) => {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS URLS_CONVERTS', (err) => {
      if (err) return res.status(500).send('Error al borrar tabla');

      db.run(`CREATE TABLE URLS_CONVERTS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url_temporal TEXT NOT NULL,
        url_new TEXT NOT NULL,
        clicks INTEGER DEFAULT 0
      )`, (err) => {
        if (err) return res.status(500).send('Error al crear tabla');
        res.send('Base de datos reiniciada');
      });
    });
  });
});


app.listen(PORT, () => {
     console.log(`Server running at ${BASE_URL}`);
});
