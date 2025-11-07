require('dotenv').config();     // import package dotenv untuk baca file .env
// impor express, cors, db
const bcrypt = require('bcryptjs');
const jwt = require(`jsonwebtoken`);
const JWT_SECRET = process.env.JWT_SECRET;
// impor middleware
const authenticateToken = require(`./middleware/authMiddleware`);
const express = require('express'); // framework web server, express = library untuk membuat REST API dengan mudah
const cors = require('cors');   // untuk mengizinkan server bisa diakses dari frontend berbeda domain (react, flutter web)
const db = require('./database.js');    // koneksi database SQLite
const app = express();
const port = process.env.PORT || 3100;  // port server dari file .env atau fallback ke 3100
app.use(cors());

// const port = 3100;

//middleware data
// untuk parsing body request JSON??
app.use(express.json());

//dummy data (id,title,director,year)
// digunakan untuk pengganti database jika belum ada database
// let movies = [
//     { id: 1, title: 'LOTR', director: 'Peter Jackson', year: 1999 },
//     { id: 2, title: 'avenger', director: 'Peter Jackson', year: 2010 },
//     { id: 3, title: 'spiderman-', director: 'Peter Jackson', year: 2004 },
// ];

// dummy data
// sama seperti movies, director dibawah digunakan untuk pengganti database
// let director = [
//     { id: 1, name: 'Peter Jackson' },
//     { id: 2, name: 'Peter Jackson' },
//     { id: 3, name: 'Peter Jackson' },
// ];

// console.log(movies);

// app.get('/', (req, res) => {
//     res.send('Selamat Datang diserver Node.js Tahap awal, terimakasih');
// });

//  === AUTH ROUTES REGISTER === 
app.post(`/auth/register`, (req, res) =>{
    const {username, password} = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({erorr: `Username dan Password (min 6 char) harus diisi`});
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing:", err);
            return res.status(500).json({error: `Gagal memproses pendaftaran` });
        }

        const sql=`INSERT INTO users (username, password) VALUES(?, ?)`;
        const params = [username.toLowerCase(), hashedPassword];

        db.run(sql, params, function(err) {
            if (err) {
                if (err.message.includes(`UNIQUE constraint`)) {
                    return res.status(409).json({ error: `Username sudah digunakan` });
                }
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: `Gagal menyimpan pengguna`});
            }
            res.status(201).json({ message: `Registrasi berhasil`, userId: this.lastID});
        });
    });
});


// === AUTH ROUTES LOGIN === 
app.post(`/auth/login`, (req, res) => {
    const { username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: `Username dan password harus diisi`});
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username.toLowerCase()], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: `Kredensial tidak valid`});
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: `Kredensial tidak valid`});
            }

            const payload = { user: {id: user.id, username: user.username}};

            jwt.sign(payload, JWT_SECRET, { expiresIn: `1h`}, (err, token) => {
                if (err) {
                    console.error("Error signing token:", err);
                    return res.status(500).json({ error: `Gagal membuat token`});
                }
                res.json({ message: `Login berhasil`, token: token});
            });
        });
    });
});

// Route
// Route GET /status untuk mengecek server aktif atau tidak
app.get('/status', (req, res) => {
        res.json({
            status: 'OK',
            message: 'Server is running',
            timestamp: new Date()
        });
    }
);


// Route GET /movies -> ambil semua data film dari tabel movies
app.get('/movies', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC  ";  // ASC =  dari kecil ke besar, terlama ke terbaru
    db.all(sql, [], (err, rows) => {  // ambil semua hasil query
        if (err) {  // kalau error return status 404
            return res.status(400).json({ "error": err.message });
        }
        res.json(rows);  // kalau berhasil return JSON list movie
    });
});


// Route GET /directors -> ambil semua data film dari tabel directors
app.get('/directors', (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC  "; // ASC =  dari kecil ke besar, terlama ke terbaru
    db.all(sql, [], (err, rows) => {  // ambil semua hasil query
        if (err) {  // kalau error return status 404
            return res.status(400).json({ "error": err.message });
        }
        res.json(rows);  // kalau berhasil return JSON list movie
    });
});


// Route GET /movies/:id = ambil detail movie berdasarkan ID
app.get('/movies/:id', authenticateToken, (req, res) => {
    const sql = "SELECT * FROM movies WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => { // hanya ambil satu row/baris
        if (err) {
            return res.status(404).json({"error": err.message }); // tidak ada return error 404
        }
        res.json(row);
    });
});


// Route GET /directors/:id = ambil detail directors berdasarkan ID
app.get('/directors/:id', (req, res) => {
    const sql = "SELECT * FROM directors WHERE id = ?";
    const params = [req.params.id];     // digunakan untuk menyimpan id dari url
    db.get(sql, params, (err, row) => { // hanya ambil satu row/baris
        if (err) {
            return res.status(404).json({"error": err.message }); // tidak ada return error 404
        }
        res.json(row);
    });
});


// tambah movie baru
app.post("/movies", authenticateToken, (req, res) => {             // req (objek request, isi data yang dikirim ke client), res (objek response, untuk kirim balasan ke client)
    const {title, director, year} = req.body;   // menggunakan object detructuring untuk mengambil langsung field dari req.body ({} -> digabung jadi 1)
    if (!title || !director || !year) {         // mengecek apakah ada data yang kosong
        return res.status(404).json({error: `title,director,year, is required`});
    }
    const sql = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)'; // query SQL untuk menambahkan data ke tabel movies
    db.run(sql, [title, director, year], function(err) {                     // eksekusi query ke database (function(err) dijalankan setelah query)
        if (err) {
            return res.status(404).json({ error: err.message});              // jika error menampilkan error message
        }
        res.status(201).json({id: this.lastID, title, director, year });     // jika insert sukses respons ke client -> 201 status created
    });
});


// tambah director baru
app.post("/directors", authenticateToken, (req, res) => {
    const {name, birthyear} = req.body;       // didalam kurung kurawa{} diraple menjadi 1/digabung jadi 1
    if (!name|| !birthyear) {
        return res.status(404).json({error: `name, birthyear, is required`});
    }
    const sql = 'INSERT INTO directors (name, birthyear) VALUES (?,?)';
    db.run(sql, [name, birthyear], function(err) {
        if (err) {
            return res.status(404).json({ error: err.message});
        }
        res.status(201).json({id: this.lastID, name, birthyear });
    });
});


// Update Movie berdasarkan ID
app.put("/movies/:id", authenticateToken, (req, res) => {
    const { title, director, year } = req.body;
    const id = req.params.id;

    if (!title || !director || !year) {
        return res.status(400).json({ error: "title, director, year, is required"});
    }

    const sql = "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?";
    db.run(sql, [title, director, year, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(500).json({ error:"Movies not found"});
        }

        res.json({ id, title, director, year });
    });
});


// Update director berdasarkan ID
app.put("/directors/:id", authenticateToken, (req, res) => {
    const { name, birthyear } = req.body;
    const { id } = req.params;

    if (!name || !birthyear) {
        return res.status(400).json({ error: "name, birthyear, is required"});
    }

    const sql = "UPDATE directors SET name = ?, birthyear = ? WHERE id = ?";
    db.run(sql, [name, birthyear, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(500).json({ error:"Director not found"});
        }

        res.json({ id, name, birthyear });
    });
});

// Delete Movie berdasarkan ID
app.delete("/movies/:id", authenticateToken, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM movies WHERE id = ?";
    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Movies not found"});
        }

        res.json({  message: `Movie with id ${id} succesfully deleted`});
    });
});


// Delete director berdasarkan ID
app.delete("/directors/:id", authenticateToken, (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM directors WHERE id = ?";
    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Director not found"});
        }

        res.json({  message: `Director with id ${id} succesfully deleted`});
    });
});


//handle 404
// kalau ada request ke route yang tidak didefinikan -> return 404 JSON
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

//information server listening
// Menjalankan server Express di http://localhost:3100 (port sesuai file .env)
app.listen(port, () => {
    console.log(`Server Running on localhost:  ${port}`);
});