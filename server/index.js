const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');
const PORT = process.env.port || 8000;

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "yeeh01250412!@",
    database: "teaform_db"
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/user/insert", (req, res) => {
    const id = req.body.id;
    const schoolName = req.body.schoolName;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.email;
    const schoolCode = req.body.schoolCode;
    const refresh_token = req.body.refresh_token;
    const createAt = req.body.createAt;
    const updatedAt = req.body.updatedAt;
    
    const sqlQuery = "INSERT INTO teaform_db (id, schoolName, name, email, password, schoolCode, refresh_token, createAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [id, schoolName, name, email, password, schoolCode, refresh_token, createAt, updatedAt], (err, result) => {
        res.send('success');
    });
});

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});