import { Sequelize } from "sequelize";

const db = new Sequelize('teaform_db', 'root', 'yeeh01250412!@', {
    host: "localhost",
    dialect: "mysql"
});

export default db;