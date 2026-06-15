const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('darkwebdecoded_db', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

// Importar modelos
const Utilizador = require('./Utilizador')(sequelize, DataTypes);
const Categoria = require('./Categoria')(sequelize, DataTypes);
const Artigo = require('./Artigo')(sequelize, DataTypes);

// Relações
Utilizador.hasMany(Artigo, { foreignKey: 'userId', onDelete: 'CASCADE' });
Artigo.belongsTo(Utilizador, { foreignKey: 'userId' });

Categoria.hasMany(Artigo, { foreignKey: 'categoriaId', onDelete: 'SET NULL' });
Artigo.belongsTo(Categoria, { foreignKey: 'categoriaId' });

module.exports = { sequelize, Utilizador, Artigo, Categoria };
