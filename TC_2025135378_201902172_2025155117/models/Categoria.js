module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Categorias', {
        nome: { type: DataTypes.STRING, allowNull: false, unique: true }
    }, {
        timestamps: false
    });
};
