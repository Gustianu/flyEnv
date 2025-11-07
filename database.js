
require('dotenv').config();     // import package dotenv supaya bisa membaca konfigurasi dari file .env
const sqlite3 = require('sqlite3').verbose();       // import sqlite3.verbose() dipakai agar pesan error lebih detail
const DBSOURCE = process.env.DB_SOURCE || "db.sqlite"; // membaca environment variable DB_SOURCE jika ada pakai process.env.. jika tidak pakai db.sqlite
const db = new sqlite3.Database(DBSOURCE, (err) => {   // membuat koneksi database SQLite (jika belum ada otomatis terbuat)
    if (err) {
        console.error(err.message);     // jika ada error saat buka DB, cetak error.
        throw err;
    } else {
        console.log('Connected to the SQLite database.');   // kalau tidak ada error, cetak pesan DB Connected
        // membuat table movies jika belum ada
        db.run(`CREATE TABLE IF NOT EXISTS movies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL, 
                    director TEXT NOT NULL,
                    year INTEGER NOT NULL
                )`, (err) => {
            // jika tabel baru dibuat, otomatis masukkan data awal (3 film)
            if (!err) {
                console.log("Table 'movies' created. Seeding initial data...");
                const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
                db.run(insert, ["The Lord of the Rings", "Peter Jackson", 2001]);
                db.run(insert, ["The Avengers", "Joss Whedon", 2012]);
                db.run(insert, ["Spider-Man", "Sam Raimi", 2002]);
            } else {      // kalau tabel sudah ada sebelumnya, tampilkan pesan "sudah ada"
                console.log("Table 'movies' already exists.");
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS directors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    birthyear INTEGER NOT NULL
                )` ,(err) => {
            if (!err) {
                console.log("Table 'directors' created. Seeding initial data...");
                const insert2 = 'INSERT INTO directors (name, birthyear) VALUES (?,?)';
                db.run(insert2, ["Peter Jackson", 1989]);
                db.run(insert2, ["John Cena", 1978]);
                db.run(insert2, ["Jackie Chan", 1960]);
            } else{
                console.log("Table 'directors' already exists.");
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
                )`, (err)=> {
                    if (err) {
                        console.error("Gagal membuat tabel users:", err.message);
                    }
        });
    }
});
// mengekspor koneksi database supaya bisa dipakai di file lain
module.exports = db;