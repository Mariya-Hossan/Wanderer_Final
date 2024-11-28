const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({ origin: 'http://127.0.0.1:5500' }));
app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'motu',
    database: 'wanderer',
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Connected to the Wanderer database.');
});

const validateNonNullFields = (data, fields) => {
    for (const field of fields) {
        if (!data[field] || data[field].trim() === '') {
            return { valid: false, error: `${field} is required and cannot be null or empty.` };
        }
    }
    return { valid: true };
};

app.get('/api/bookings', (req, res) => {
    db.query('SELECT * FROM bookings', (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Failed to fetch bookings' });
        }
        res.json(results);
    });
});

app.get('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    db.query('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Failed to fetch booking' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(results[0]);
    });
});

app.post('/api/bookings', (req, res) => {
    const requiredFields = ['email', 'name', 'destination', 'category'];
    const validation = validateNonNullFields(req.body, requiredFields);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    const { email, name, destination, category } = req.body;

    db.query(
        'INSERT INTO bookings (email, name, destination, category) VALUES (?, ?, ?, ?)',
        [email, name, destination, category],
        (err, result) => {
            if (err) {
                console.error('Error inserting booking:', err);
                return res.status(500).json({ error: 'Failed to create booking.' });
            }
            res.status(201).json({ id: result.insertId, message: 'Booking created successfully!' });
        }
    );
});

app.put('/api/bookings/:id', (req, res) => {
    const requiredFields = ['email', 'name', 'destination', 'category'];
    const validation = validateNonNullFields(req.body, requiredFields);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    const { email, name, destination, category } = req.body;

    db.query(
        'UPDATE bookings SET email = ?, name = ?, destination = ?, category = ? WHERE id = ?',
        [email, name, destination, category, req.params.id],
        (err) => {
            if (err) {
                console.error('Error updating booking:', err);
                return res.status(500).json({ error: 'Failed to update booking.' });
            }
            res.json({ message: 'Booking updated successfully!' });
        }
    );
});

app.delete('/api/bookings/:id', (req, res) => {
    db.query('DELETE FROM bookings WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Failed to delete booking' });
        }
        res.sendStatus(200);
    });
});

app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
