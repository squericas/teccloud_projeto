
const bcrypt = require('bcryptjs');
module.exports = (User, Artigo) => {
    return {
        // AUTENTICAÇÃO
        register: async (req, res) => {
            try {
                const { username, email, password } = req.body;
                const hashedPassword = await bcrypt.hash(password, 10);
                await User.create({ username, email, password: hashedPassword });
                res.status(201).json({ message: "Utilizador registado com sucesso!" });
            } catch (error) {
                res.status(400).json({ error: "Erro ao registar: utilizador ou email já existem." });
            }
        },
        login: async (req, res) => {
            try {
                const { username, password } = req.body;
                const user = await User.findOne({ where: { username } });
                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return res.status(401).json({ error: "Credenciais inválidas." });
                }
                req.session.userId = user.id;
                req.session.username = user.username;
                res.status(200).json({ message: `Bem-vindo ${user.username}!`, loggedIn: true });
            } catch (error) {
                res.status(500).json({ error: "Erro interno no servidor durante o login." });
            }
        },
        logout: (req, res) => {
            req.session.destroy((err) => {
                if (err) return res.status(500).json({ error: "Erro ao fechar sessão." });
                res.status(200).json({ message: "Sessão terminada." });
            });
        },
        authStatus: (req, res) => {
            if (req.session.userId) {
                res.status(200).json({ loggedIn: true, username: req.session.username });
            } else {
                res.status(200).json({ loggedIn: false });
            }
        },
        // CRUD
        getArtigos: async (req, res) => {
            try {
                const artigos = await Artigo.findAll();
                res.status(200).json(artigos);
            } catch (error) {
                res.status(500).json({ error: "Erro ao listar artigos." });
            }
        },
        createArtigo: async (req, res) => {
            if (!req.session.userId) return res.status(401).json({ error: "Não autorizado. Faça login primeiro." });
            try {
                const { titulo, conteudo, categoria } = req.body;
                const novo = await Artigo.create({ titulo, conteudo, categoria });
                res.status(201).json(novo);
            } catch (error) {
                res.status(400).json({ error: "Erro ao criar artigo." });
            }
        },
        deleteArtigo: async (req, res) => {
            if (!req.session.userId) return res.status(401).json({ error: "Acesso negado." });
            try {
                const { id } = req.params;
                const apagado = await Artigo.destroy({ where: { id } });
                if (!apagado) return res.status(404).json({ error: "Artigo não encontrado." });
                res.status(200).json({ message: "Artigo eliminado." });
            } catch (error) {
                res.status(500).json({ error: "Erro ao eliminar artigo." });
            }
        },
        updateArtigo: async (req, res) => {
            if (!req.session.userId) return res.status(401).json({ error: "Acesso negado." });
            try {
                const { id } = req.params;
                const { titulo, conteudo, categoria } = req.body;
                const atualizado = await Artigo.update(
                    { titulo, conteudo, categoria },
                    { where: { id } }
                );
                if (!atualizado[0]) return res.status(404).json({ error: "Artigo não encontrado." });
                res.status(200).json({ message: "Artigo atualizado." });
            } catch (error) {
                res.status(500).json({ error: "Erro ao atualizar artigo." });
            }
        }
    };
};