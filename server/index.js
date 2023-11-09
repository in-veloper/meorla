const express = require('express');
const app = express();
const mysql = require('mysql2');
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
    const schoolName = req.body.schoolName;
    const name = req.body.name;
    const email = req.body.email;
    const userId = req.body.userId;
    const password = req.body.password;
    const schoolCode = req.body.schoolCode;
    const refresh_token = req.body.refresh_token;
    const createdAt = req.body.createAt;
    const updatedAt = req.body.updatedAt;
    
    const sqlQuery = "INSERT INTO teaform_db.users (schoolName, name, email, userId, password, schoolCode, refresh_token, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [schoolName, name, email, userId, password, schoolCode, refresh_token, createdAt, updatedAt], (err, result) => {
        if(err) {
            console.log(err);
        }else{
            res.send('success');
        }
    });
});

app.post("/user/login", (req, res) => {
    const userId = req.body.userId;
    const sqlQuery = "SELECT * FROM teaform_db.users WHERE userId = ?";

    db.query(sqlQuery, [userId], (err, results) => {
        if (err) {
            console.error("로그인 Query 실행 중 Error " + err);
            res.status(500).json({ error: "내부 Server Error" });
        } else {
            console.log(results)
            if (results.length > 0) {
                const user = results[0]; // 첫 번째 사용자 정보만 사용 (userId는 고유해야 함)
                res.json({ user });
            } else {
                const user = "N";
                res.json({ user });
                // res.status(404).json({ error: "일치하는 사용자를 찾을 수 없음" });
            }
        }
    })
})

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});