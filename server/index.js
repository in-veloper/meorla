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
            console.error("로그인 Query 실행 중 ERROR " + err);
            res.status(500).json({ error: "내부 Server ERROR" });
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
});

app.post("/medicine/checkLikedMedicine", (req, res) => {
    const itemName = req.body.itemName;
    const itemSeq = req.body.itemSeq;
    
    const sqlQuery = "SELECT COUNT(*) AS count FROM teaform_db.likedMedicine WHERE itemName = ? AND itemSeq = ?";
    db.query(sqlQuery, [itemName, itemSeq], (err, result) => {
        if(err) {
            console.log("약품정보 북마크 여부 체크 Query 실행 중 ERROR", err);
            res.status(500).send('Internal Server Error');
        }else{
            const count = result[0].count;
            if(count > 0) {
                res.send('true');
            }else{
                res.send('false');
            }
        }
    });
});

app.post("/medicine/bookmarkMedicine", (req, res) => {
    const itemName = req.body.itemName;
    const entpName = req.body.entpName;
    const itemSeq = req.body.itemSeq;
    const efcyQesitm = req.body.efcyQesitm;
    const useMethodQesitm = req.body.useMethodQesitm;
    const atpnQesitm = req.body.atpnQesitm;
    const intrcQesitm = req.body.intrcQesitm;
    const seQesitm = req.body.seQesitm;
    const depositMethodQesitm = req.body.depositMethodQesitm;
    const createdAt = req.body.createAt;
    
    const sqlQuery = "INSERT INTO teaform_db.likedMedicine (itemName, entpName, itemSeq, efcyQesitm, useMethodQesitm, atpnQesitm, intrcQesitm, seQesitm, depositMethodQesitm, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [itemName, entpName, itemSeq, efcyQesitm, useMethodQesitm, atpnQesitm, intrcQesitm, seQesitm, depositMethodQesitm, createdAt], (err, result) => {
        if(err) {
            console.log("약품정보 북마크 Query 실행 중 ERROR", err);
            res.status(500).send('내부 Server ERROR');
        }else{
            res.send('success');
        }
    });
});

app.post("/medicine/unbookmarkMedicine", (req, res) => {
    const itemName = req.body.itemName;
    const itemSeq = req.body.itemSeq;
    
    const sqlQuery = "DELETE FROM teaform_db.likedMedicine WHERE itemName = ? AND itemSeq = ?";
    db.query(sqlQuery, [itemName, itemSeq], (err, result) => {
        if(err) {
            console.log("약품정보 북마크 해제 Query 실행 중 ERROR", err);
            res.status(500).send('Internal Server Error');
        }else{
            res.send('success');
        }
    });
});

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});