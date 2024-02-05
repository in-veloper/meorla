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

app.use(cors({ origin: true, credentials: true, methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD']}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const setCookie = (name, value, options) => {
    const result = cookies.set(name, value, { ...options });
    return result;
}

const getCookie = (name) => {
    return cookies.get(name);
}

const removeCookie = (name) => {
    return cookies.remove(name);
}

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "yeeh01250412!@",
    database: "teaform_db"
});

dotenv.config();

app.get("/token", async (req, res) => {
    try {
        const refreshToken = getCookie('refreshToken');
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
    db.query(query, [userId, schoolName], async(err, results) => {
        if(err) {
            console.log("기존 ID 및 학교명 검사 중 ERROR" + err);
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
                console.log(user)
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

                    res.json({ user, accessToken });
                } 
            } else {
                // res.status(404).json({ msg: "사용자 정보를 찾을 수 없음"});
                const user = "N";
                res.json({ user });
            }
        }
    })
});

app.post("/user/logout", (req, res) => {
    const refreshToken = null;
    const userId = req.body.userId;
    const sqlQuery = "UPDATE teaform_db.users SET refresh_token = ? WHERE userId = ?";
    db.query(sqlQuery, [refreshToken, userId], (err, result) => {
        if(err) {
            console.log("REFRESH TOKEN 업데이트 중 ERROR" + err);
            res.status(500).json({ error: "내부 Server ERROR" });
        }else{
            // res.send('success');
            removeCookie('refreshToken');
            res.status(200).json({ msg: "로그아웃 - 쿠키 삭제 정상 처리 완료"});
        }
    });
    // removeCookie('refreshToken');
    // res.status(200).json({ msg: "로그아웃 - 쿠키 삭제 정상 처리 완료"});
})

app.post("/bookmark/insert", async (req, res) => {
    const userId = req.body.userId;
    const userEmail = req.body.userEmail;
    const userName = req.body.userName;
    const schoolName = req.body.schoolName;
    const schoolCode = req.body.schoolCode;
    const bookmarkArray = req.body.bookmarkArray;
    const bookmarkArrayString = bookmarkArray.map(bookmark => `${bookmark.bookmarkName}::${bookmark.bookmarkAddress}`).join(',');

    const sqlQuery = "INSERT INTO teaform_db.bookmark (userId, email, name, schoolName, schoolCode, bookmark) VALUES (?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, userEmail, userName, schoolName, schoolCode, bookmarkArrayString], (err, result) => {
        if(err) {
            console.log("북마크 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/bookmark/update", async (req, res) => {
    const userId = req.body.userId;
    const userEmail = req.body.userEmail;
    const schoolCode = req.body.schoolCode;
    const bookmarkArray = req.body.bookmarkArray;
    const bookmarkArrayString = bookmarkArray.map(bookmark => `${bookmark.bookmarkName}::${bookmark.bookmarkAddress}`).join(',');

    const sqlQuery = "UPDATE teaform_db.bookmark SET bookmark = ? WHERE userId = ? AND email = ? AND schoolCode = ?";
    db.query(sqlQuery, [bookmarkArrayString, userId, userEmail, schoolCode], (err, result) => {
        if(err) {
            console.log("북마크 데이터 Update 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/bookmark/getBookmark", async (req, res) => {
    const userId = req.body.userId;
    const userEmail = req.body.userEmail;

    const sqlQuery = "SELECT * FROM teaform_db.bookmark WHERE userId = ? AND email = ?";
    db.query(sqlQuery, [userId, userEmail], (err, result) => {
        if(err) {
            console.log("기존 ID 및 학교명 검사 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const bookmark = result[0];
                res.json({ bookmark });
            }
        }
    });
});

app.get("/studentsTable/getStudentInfo", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT * FROM students WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("학생 정보 조회 중 ERROR", err);
            res.status(500).json({ error: "Internal Server Error" });
        }else{
            res.json({ studentData: result });
        }
    });
});

app.get("/studentsTable/getStudentInfoByGrade", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;
    const sGrade = req.query.sGrade;

    const sqlQuery = "SELECT * FROM students WHERE userId = ? AND schoolCode = ? AND sGrade = ?";
    db.query(sqlQuery, [userId, schoolCode, sGrade], (err, result) => {
        if(err) {
            console.log("학생 정보 조회 중 ERROR", err);
            res.status(500).json({ error: "Internal Server Error" });
        }else{
            res.json({ studentData: result });
        }
    });
});

app.get("/studentsTable/getStudentInfoBySearch", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;
    const sGrade = req.query.sGrade;
    const sClass = req.query.sClass;
    const sNumber = req.query.sNumber;
    const sName = req.query.sName;
    console.log(req.query)
    // 초기 쿼리
    let sqlQuery = "SELECT * FROM students WHERE userId = ? AND schoolCode = ?";
    const queryParams = [userId, schoolCode];

    // 동적으로 조건 추가
    if (sGrade) {
        sqlQuery += " AND sGrade = ?";
        queryParams.push(sGrade);
    }

    if (sClass) {
        sqlQuery += " AND sClass = ?";
        queryParams.push(sClass);
    }

    if (sNumber) {
        sqlQuery += " AND sNumber = ?";
        queryParams.push(sNumber);
    }

    if (sName) {
        // 이름 일부만 입력되었을 때를 위한 LIKE 구문 사용
        sqlQuery += " AND sName LIKE ?";
        queryParams.push(`%${sName}%`);
    }

    // 최종 쿼리 수행
    db.query(sqlQuery, queryParams, (err, result) => {
        if (err) {
            console.log("학생 정보 조회 중 ERROR", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json({ studentData: result });
        }
    });
});

app.post("/symptom/insert", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const symptomString = req.body.symptom;

    const sqlQuery = "INSERT INTO teaform_db.symptom (userId, schoolCode, symptom) VALUES (?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, symptomString], (err, result) => {
        if(err) {
            console.log("증상 데이터 Insert 중 ERROR" + err);
        }else{
            console.log("증상 데이터 Insert 처리 완료");
            res.send('success');
        }
    });
});

app.post("/symptom/update", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const symptomString = req.body.symptom;

    const sqlQuery = "UPDATE teaform_db.symptom  SET symptom = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [symptomString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("증상 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/symptom/getSymptom", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.symptom WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("기존 ID 및 학교명 검사 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const symptom = result[0];
                res.json({ symptom });
            }
        }
    });
});

app.post("/medication/insert", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const medicationString = req.body.medication;

    const sqlQuery = "INSERT INTO teaform_db.medication (userId, schoolCode, medication) VALUES (?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, medicationString], (err, result) => {
        if(err) {
            console.log("투약사항 데이터 Insert 중 ERROR" + err);
        }else{
            console.log("투약사항 데이터 Insert 처리 완료");
            res.send('success');
        }
    });
});

app.post("/medication/update", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const medicationString = req.body.medication;

    const sqlQuery = "UPDATE teaform_db.medication  SET medication = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [medicationString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("투약사항 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/medication/getMedication", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.medication WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("기존 ID 및 학교명 검사 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const medication = result[0];
                res.json({ medication });
            }
        }
    });
});

app.post("/stockMedicine/insert", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const medicineName = req.body.medicineName;
    const coporateName = req.body.coporateName;
    const unit = req.body.unit;
    const stockAmount = req.body.stockAmount;
    const extinctAmount = req.body.extinctAmount;
    const latestPurchaseDate = req.body.latestPurchaseDate;

    const sqlQuery = "INSERT INTO teaform_db.stockMedicine (userId, schoolCode, medicineName, coporateName, unit, stockAmount, extinctAmount, purchaseDate) VALUES (?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, medicineName, coporateName, unit, stockAmount, extinctAmount, latestPurchaseDate], (err, result) => {
        if(err) {
            console.log("약품 재고 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/stockMedicine/getStockMedicine", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.stockMedicine WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("약품 재고 조회 중 ERROR", err);
        }else{
            res.json({ stockMedicineData: result });
        }
    })
});

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});