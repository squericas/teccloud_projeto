module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Artigos', {
        titulo: { type: DataTypes.STRING, allowNull: false },
        conteudo: { type: DataTypes.TEXT, allowNull: false }
    });
};
