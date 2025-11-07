# Authentikasi Dengan Menggunakan JSON Web Token
## JSON Web Tokens (JWT)
Setelah pengguna berhasil diautentikasi, server perlu memberikan ”bukti” autentikasi yang dapat digunakan klien pada permintaan berikutnya. JWT (JSON Web Token) adalah standar
terbuka (RFC 7519) untuk membuat token akses semacam ini yang bersifat self-contained dan
ideal untuk API stateless.

# instalasi
install dependensi keamanan
```bash
npm install jsonwebtoken bcryptjs
```

Definisikan Kunci Rahasia JWT: Buka file .env dan tambahkan variabel baru.
```bash
PORT = 3300
DB_SOURCE = "./movies.db"
JWT_SECRET="Raafi60"
```

menjalankan server dengan menggunakan:
```bash
npm start
```

## Endpoint yang diuji
- **POST** `/auth/register` registrasi pengguna baru
- **POST** `/auth/login` login dan mendapatkan token JWT
- **GET** `/movies` ambil semua data film
- **GET** `/movies/:id` ambil film berdasarkan ID
- **POST** `/movies` tambah data film baru
- **PUT** `/movies/:id` update data film
- **DELETE** `/movies/:id` hapus data film
- **GET** `/directors` ambil semua data sutradara
- **GET** `/directors/:id` ambil sutradara berdasarkan ID
- **POST** `/directors` tambah data sutradara
- **PUT** `/directors/:id` update data sutradara
- **DELETE** `/directors/:id` hapus data sutradara

## Tangkapan Layar



