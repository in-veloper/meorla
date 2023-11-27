const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');
const cookieParser = require('cookie-parser');
const PORT = process.env.port || 8000;
const { Cookies } = require('react-cookie');
const cookies = new Cookies();

const setCookie = (name, value, options) => {
    const result = cookies.set(name, value, { ...options });
    return result;
}

const getCookie = (name) => {
    return cookies.get(name);
}

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "yeeh01250412!@",
    database: "teaform_db"
});

app.use(cors({ origin: true, credentials: true, methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD']}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

dotenv.config();

app.get("/token", async (req, res) => {
    try {
        console.log(cookies.get('refreshToken'))
        const refreshToken = cookies.get('refreshToken');
        if(!refreshToken) return res.sendStatus(401);

        const query = "SELECT * FROM teaform_db.users WHERE refresh_token = ?";
        db.query(query, [refreshToken], async(err, results) => {
            if(err) {
                console.log("Refresh Token 일치 SELECT 조회 중 ERROR" + err);
            }else{
                if(results.length > 0) {
                    const user = results[0];
                    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
                        if(error) return res.sendStatus(403);
                        const userId = user.userId;
                        const name = user.name;
                        const schoolName = user.schoolName;
                        const schoolCode = user.schoolCode;
                        const email = user.email;
                        const accessToken = jwt.sign({ userId, name, email, schoolName, schoolCode }, process.env.ACCESS_TOKEN_SECRET, {
                            expiresIn: '15s'
                        });
                        res.json({ accessToken });
                    });
                }else{
                    return res.sendStatus(403);
                }
            }
        })
    }catch(error) {
        console.log("Refresh Token 로직 수행 중 ERROR" + error);
    }
});

app.post("/user/getUser", async (req, res) => {
    const userId = req.body.userId;
    const schoolName = req.body.schoolName;

    const query = "SELECT * FROM teaform_db.users WHERE userId = ? OR schoolName = ?";
    db.query(query, [userId, schoolName], async(Err, results) => {
        if(Err) {
            console.log("기존 ID 및 학교명 검사 중 ERROR" + Err);
        }else{
            if(results.length > 0) {
                const user = results[0];
                res.json({ user });
            }else{
                const user = "N";
                res.json({ user });
            }
        }
    });
})

app.post("/user/insert", async (req, res) => {
    const schoolName = req.body.schoolName;
    const name = req.body.name;
    const email = req.body.email;
    const userId = req.body.userId;
    const password = req.body.password;
    const schoolCode = req.body.schoolCode;
    const refresh_token = req.body.refresh_token;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const sqlQuery = "INSERT INTO teaform_db.users (schoolName, name, email, userId, password, schoolCode, refresh_token) VALUES (?,?,?,?,?,?,?)";
    db.query(sqlQuery, [schoolName, name, email, userId, hashPassword, schoolCode, refresh_token], (err, result) => {
        if(err) {
            console.log("회원가입 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/user/login", async (req, res) => {
    const userId = req.body.userId;
    const password = req.body.password;
    const sqlQuery = "SELECT * FROM teaform_db.users WHERE userId = ?";
    
    db.query(sqlQuery, [userId], async (err, results) => {
        if (err) {
            console.error("로그인 Query 실행 중 ERROR " + err);
            res.status(500).json({ error: "내부 Server ERROR" });
        } else {
            if (results.length > 0) {
                const user = results[0]; // 첫 번째 사용자 정보만 사용 (userId는 고유해야 함)
                const match = await bcrypt.compare(password, user.password);
                
                if(!match) {
                    const user = "UPW";
                    res.json({ user });
                }else{
                    const userId = user.userId;
                    const name = user.name;
                    const email = user.email;

                    const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '15s'
                    });
                    const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: '1d'
                    });
                    
                    const updateQuery = "UPDATE teaform_db.users SET refresh_token = ? WHERE userId = ?";
                    db.query(updateQuery, [refreshToken, userId], (updateErr, updateResults) => {
                        if(updateErr) {
                            console.log("Refresh Token 업데이트 중 ERROR" + updateErr);
                        }else{
                            console.log("Refresh Token 업데이트 완료");
                        }
                    });
                    setCookie('refreshToken', refreshToken, {
                        // path: '/',
                        secure: true,
                        sameSite: 'none',
                        expires: new Date(Date.now() + 3600 * 1000)
                    });

                    // res.json({ user, accessToken });
                    res.json({ accessToken });
                } 
            } else {
                const user = "N";
                res.json({ user });
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