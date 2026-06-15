const express = require('express');
const session = require('express-session');
const path = require('path');
const { sequelize, Utilizador, Artigo, Categoria } = require('./models');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: '835f8acbe85b06af38e1f78affb394fd',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Sessão expira em 1 dia
}));

app.use(express.static("www", { index: "index.html" }));

const handlers = require('./scripts/request-handlers')(Utilizador, Artigo, Categoria);

// Rotas API
app.post('/api/utilizador/register', handlers.register);
app.post('/api/utilizador/login', handlers.login);
app.get('/api/utilizador/logout', handlers.logout);
app.get('/api/utilizador/status', handlers.authStatus);

app.get('/api/artigos', handlers.getArtigos);
app.get('/api/artigos/:id', handlers.getArtigoById);
app.post('/api/artigos', handlers.createArtigo);
app.put('/api/artigos/:id', handlers.updateArtigo);
app.delete('/api/artigos/:id', handlers.deleteArtigo);

app.get('/api/categorias', handlers.getCategorias);
app.post('/api/categorias', handlers.createCategoria);

// Página pública individual
app.get('/artigos/:id', async (req, res) => {
    const artigo = await Artigo.findByPk(req.params.id, {
        include: Categoria
    });

    if (!artigo) return res.status(404).send("Artigo não encontrado.");

    res.render("artigo-individual", { artigo });
});

// Iniciar servidor
sequelize.sync().then(() => {
    app.listen(3000, () => console.log("Servidor online em http://localhost:3000"));
});
