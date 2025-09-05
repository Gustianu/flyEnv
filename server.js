// express = nama framework node.js (dipanggil dengan require('expresss'))
const express = require('express'); //  import library dari express
const app = express();              // membuat instance aplikasi express
const port = 3100;

// Mulai dari ID berikutnya yang tersedia
let idSeq  = 4;


// app.use(core)


//ROOT
app.get('/' /*dikiri ini endpoint*/, (req, res) => {
        res.send(`Selamat Datang di Node.Js!`);
});
app.use(express.json());

// middleware
// dummy data (id,tittle,director,year)
let movies = [
    {id: 1, title: 'LOTR', director: 'Peter Jackson', year: 1990},
    {id: 2, title: 'avenger', director: 'Peter Jackson', year: 2010},
    {id: 3, title: 'spiderman', director: 'Peter Jackson', year: 2004},
];
// console.log(movies); /*bersifat data statis*/


app.listen(port, () => {
    console.log(`Server Running on localhost:  ${port}`);
});

// agar express bisa otomatis baca dan proses json dari request bodys
app.use(express.json());


app.get('/movies',(req, res) => {
    res.json(movies);
});


// harus req, es
app.get('/movies/:id', (req, res) => {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if(movie){
        res.json(movie);    
    } else{
        res.status(404).send('Movie not found');
    }
});


// POST /movies - membuat film baru 
app.post('/movies', (req, res) => {
    const { title, director, year} = req.body || {};
    if (!title || !director || !year) {
        return res.status(400).json({ error: 'title, director, year wajib diisi'});
    }
    const newMovie = { id: idSeq++, title, director, year };
    movies.push(newMovie);
    res.status(201).json(newMovie);
});


// PUT /movies/:id - Memperbarui data film
app.put('/movies/:id', (req, res) => {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movies tidak ditemukan'});
    }
    const { title, director, year } = req.body || {};
    const updateMovie = {id, title, director, year };
    movies[movieIndex] = updateMovie;
    res.json(updateMovie);
});


// DELETE /movies/:id - menghapus film
app.delete('/movies/:id', (req, res) => {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === id);
    if (movieIndex === -1) {
        return res.status(404).json({ error: 'Movie tidak ditemukan'});
    }
    movies.splice(movieIndex, 1);
    res.status(204).send();
});

let directors = [
    {id: 1, name:'James Hetfield', birthyear: 1968},
    {id: 2, name:'Lars Ulrich', birthyear: 1970},
    {id: 3, name:'Jason Newsted', birthyear: 1971},
];

app.get('/directors', (req, res) => {
    res.json(directors);
});

app.get('/directors/:id', (req, res) => {
    const director = directors.find(m => m.id === parseInt(req.params.id));
    if (director) {
        res.json(director);
    } else{
        res.status(404).send('Director not found');
    }
});

// Make New Film
app.post('/directors', (req, res) => {
    const{ name, birthyear } = req.body || {};
    if (!name || !birthyear) {
        return res.status(400).json ({error: 'name, birthyear wajib diisi'});
    }
    const newDirector = { id: idSeq++, name, birthyear};
    directors.push(newDirector);
    res.status(201).json(newDirector);
});

// Update Data Film
app.put('/directors/:id', (req, res) => {
    const id = Number(req.params.id);
    const directorIndex = directors.findIndex(m => m.id === id);
    if (directorIndex == -1) {
        return res.status(404).json({ error: 'Director tidak ditemukan'});
    }
    const {name, birthyear} = req.body || {};
    const updateDirector = {id, name, birthyear};
    directors[directorIndex] = updateDirector;
    res.json(updateDirector);
});

app.delete('/directors/:id', (req, res) => {
    const id = Number(req.params.id);
    const directorIndex = directors.findIndex(m => m.id === id);
    if (directorIndex === -1) {
        return res.status(404).json({error: 'Director tidak ditemukan'});
    }
    directors.splice(directorIndex, 1);
    res.status(204).send();
});