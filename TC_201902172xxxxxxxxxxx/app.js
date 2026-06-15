// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

// 1. Conexão ao MySQL
const sequelize = new Sequelize('darkwebdecoded_db', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

// 2. Definição dos Modelos para a Base de Dados
const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
});

const Artigo = sequelize.define('Artigo', {
    titulo: { type: DataTypes.STRING, allowNull: false },
    conteudo: { type: DataTypes.TEXT, allowNull: false },
    categoria: { type: DataTypes.STRING, defaultValue: 'Geral' }
});

// 3. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'chave_secreta_estg_tc',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Sessão expira em 1 dia
}));


app.use(express.static("www",{"index" : "index.html"}));

// 4. Importar os Request Handlers passando os Modelos do Sequelize
const handlers = require('./scripts/request-handlers')(User, Artigo);


// Endpoints de Autenticação
app.post('/api/auth/register', handlers.register);
app.post('/api/auth/login', handlers.login);
app.get('/api/auth/logout', handlers.logout);
app.get('/api/auth/status', handlers.authStatus);

// Endpoints da API REST para o CRUD
app.get('/api/artigos', handlers.getArtigos);
app.post('/api/artigos', handlers.createArtigo);
app.delete('/api/artigos/:id', handlers.deleteArtigo);
app.put('/api/artigos/:id', handlers.updateArtigo);

//Iniciar Base de Dados e Servidor

const PORT = 3000;

sequelize.sync({ force: false })
    .then(() => {
        console.log("Base de dados MySQL sincronizada!");
        app.listen(PORT, () => console.log(`Servidor Express online em http://localhost:${PORT}`));
    })
    .catch(err => console.error("Erro ao inicializar o servidor:", err));