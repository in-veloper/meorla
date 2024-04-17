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
const PORT = process.env.PORT || 8000;
const { Cookies } = require('react-cookie');
const cookies = new Cookies();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

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

                        const payload = {
                            userId: user.userId,
                            name: user.name,
                            schoolName: user.schoolName,
                            schoolCode: user.schoolCode,
                            schoolAddress: user.schoolAddress,
                            email: user.email,
                            commonPassword: user.commonPassword,
                            workStatus: user.workStatus,
                            bedCount: user.bedCount,
                            pmStation: user.pmStation,
                            notifyPm: user.notifyPm
                        };

                        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                            expiresIn: '15s'
                        });
                        
                        res.json({ accessToken });
                    });
                }else{
                    return res.sendStatus(403);
                }
            }
        });
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
});

app.post("/user/insert", async (req, res) => {
    const schoolName = req.body.schoolName;
    const name = req.body.name;
    const email = req.body.email;
    const userId = req.body.userId;
    const password = req.body.password;
    const schoolCode = req.body.schoolCode;
    const schoolAddress = req.body.schoolAddress;
    const refresh_token = req.body.refresh_token;
    const commonPassword = req.body.commonPassword;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const sqlQuery = "INSERT INTO teaform_db.users (schoolName, name, email, userId, password, schoolCode, schoolAddress, refresh_token, commonPassword) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [schoolName, name, email, userId, hashPassword, schoolCode, schoolAddress, refresh_token, commonPassword], (err, result) => {
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
                        secure: true,
                        sameSite: 'none',
                        expires: new Date(Date.now() + 3600 * 1000)
                    });

                    res.json({ user, accessToken });
                } 
            } else {
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
            removeCookie('refreshToken');
            res.status(200).json({ msg: "로그아웃 - 쿠키 삭제 정상 처리 완료"});
        }
    });
});

app.post("/user/updateUserInfo", (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const userName = req.body.userName;
    const userEmail = req.body.userEmail;
    const bedCount = req.body.bedCount;

    const sqlQuery = "UPDATE teaform_db.users SET name = ?, email = ?, bedCount = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userName, userEmail, bedCount, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("사용자 정보 Update 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get("/user/getMaskedStatus", (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT masked FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("학생 조회 이름 마스킹 여부 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post("/user/updateMaskedStatus", (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const masked = req.body.masked;

    const sqlQuery = "UPDATE teaform_db.users SET masked = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [masked, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("학생 조회 마스킹 여부 Update 중 ERROR", err);
        }else{
            res.send('success');
        }
    })
});

app.get("/user/getAlertHiddenStatus", (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT alertHidden FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건실 방문요청 알람 숨김 여부 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post("/user/updateAlertHiddenStatus", (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const alertHidden = req.body.alertHidden;

    const sqlQuery = "UPDATE teaform_db.users SET alertHidden = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [alertHidden, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건실 방문요청 알람 숨김 여부 Update 중 ERROR", err);
        }else{
            res.send('success');
        }
    })
});

app.post("/user/updatePmStation", (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const pmStation = req.body.pmStation;

    const sqlQuery = "UPDATE teaform_db.users SET pmStation = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [pmStation, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("미세먼지 측정소 선택 값 Update 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/user/updateNotifyPmInfo", (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const notifyPm = req.body.notifyPm;

    const sqlQuery = "UPDATE teaform_db.users SET notifyPm = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [notifyPm, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("미세먼지 알림 여부 Update 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/user/getNotifyPmInfo", (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT notifyPm FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("미세먼지 알림 여부 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

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

app.get("/bookmark/getBookmark", async (req, res) => {
    const userId = req.query.userId;
    const userEmail = req.query.userEmail;

    const sqlQuery = "SELECT * FROM teaform_db.bookmark WHERE userId = ? AND email = ?";
    db.query(sqlQuery, [userId, userEmail], (err, result) => {
        if(err) {
            console.log("기존 ID 및 학교명 검사 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const bookmark = result[0];
                res.json({ bookmark });
            }else{
                res.json(0);
            }
        }
    });
});

app.post("/studentsTable/insert", async (req, res) => {
    const studentsArray = req.body.studentsArray;
    const values = studentsArray.map(student => {
        return [
            student.userId,
            student.schoolName,
            student.schoolCode,
            student.sGrade,
            student.sClass,
            student.sNumber,
            student.sGender,
            student.sName
        ];
    });

    const sqlQuery = "INSERT INTO teaform_db.students (userId, schoolName, schoolCode, sGrade, sClass, sNumber, sGender, sName) VALUES ?";
    db.query(sqlQuery, [values], (err, result) => {
        if(err) {
            console.log("명렬표 데이터 INSERT 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.get("/studentsTable/getStudentInfo", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.students WHERE userId = ? AND schoolCode = ?";
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

    const sqlQuery = "SELECT * FROM teaform_db.students WHERE userId = ? AND schoolCode = ? AND sGrade = ?";
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
    
    // 초기 쿼리
    let sqlQuery = "SELECT * FROM teaform_db.students WHERE userId = ? AND schoolCode = ?";
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

app.get("/studentsTable/getStudentInfoBySearchInRequest", async (req, res) => {
    const schoolCode = req.query.schoolCode;
    const sGrade = req.query.sGrade;
    const sClass = req.query.sClass;
    const sNumber = req.query.sNumber;
    const sName = req.query.sName;
    
    // 초기 쿼리
    let sqlQuery = "SELECT * FROM teaform_db.students WHERE schoolCode = ?";
    const queryParams = [schoolCode];

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

    const sqlQuery = "UPDATE teaform_db.symptom SET symptom = ? WHERE userId = ? AND schoolCode = ?";
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
            console.log("증상 데이터 조회 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const symptom = result[0];
                res.json({ symptom });
            }
        }
    });
});

app.post("/actionMatter/insert", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const actionMatterString = req.body.actionMatter;

    const sqlQuery = "INSERT INTO teaform_db.actionMatter (userId, schoolCode, actionMatter) VALUES (?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, actionMatterString], (err, result) => {
        if(err) {
            console.log("조치사항 데이터 Insert 중 ERROR" + err);
        }else{
            console.log("조치사항 데이터 Insert 처리 완료");
            res.send('success');
        }
    });
});

app.post("/actionMatter/update", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const actionMatterString = req.body.actionMatter;

    const sqlQuery = "UPDATE teaform_db.actionMatter SET actionMatter = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [actionMatterString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("조치사항 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/actionMatter/getActionMatter", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.actionMatter WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("조치사항 데이터 조회 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const actionMatter = result[0];
                res.json({ actionMatter });
            }
        }
    });
});

app.post("/treatmentMatter/insert", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const treatmentMatterString = req.body.treatmentMatter;

    const sqlQuery = "INSERT INTO teaform_db.treatmentMatter (userId, schoolCode, treatmentMatter) VALUES (?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, treatmentMatterString], (err, result) => {
        if(err) {
            console.log("처치사항 데이터 Insert 중 ERROR" + err);
        }else{
            console.log("처치사항 데이터 Insert 처리 완료");
            res.send('success');
        }
    });
});

app.post("/treatmentMatter/update", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const treatmentMatterString = req.body.treatmentMatter;

    const sqlQuery = "UPDATE teaform_db.treatmentMatter SET treatmentMatter = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [treatmentMatterString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("처치사항 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/treatmentMatter/getTreatmentMatter", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.treatmentMatter WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("처치사항 데이터 조회 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const treatmentMatter = result[0];
                res.json({ treatmentMatter });
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
            console.log("약품 조회 중 ERROR" + err);
        }else{
            res.json(result);
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

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        const uploadPath = req.body.uploadPath;
        const dir = "./public/uploads/" + uploadPath;

        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        return callback(null, dir);
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

app.post("/upload/image", upload.single('file'), (req, res) => {
    res.json({
        message: 'Image가 업로드 성공',
        filename: req.file.filename
    });
});

app.use(express.static(path.join(__dirname, '/public')));

app.post("/upload/insert", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const category = req.body.category;
    const fileName = req.body.fileName;

    const sqlQuery = "INSERT INTO teaform_db.uploadFile (userId, schoolCode, category, fileName) VALUES (?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, category, fileName], (err, result) => {
        if(err) {
            console.log("Upload File 정보 INSERT 중 ERROR", err);
            res.status(500).json({ error: "Internal Server Error" });
        }else{
            res.send('success');
        }
    })
});

app.get("/upload/getFileName", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.uploadFile WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("Upload File명 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.get("/user/getCommonPassword", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT commonPassword FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("공통 비밀번호 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
})

app.post("/user/updateCommonPassword", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const updatedCommonPassword = req.body.updatedPassword;

    const sqlQuery = "UPDATE teaform_db.users SET commonPassword = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [updatedCommonPassword, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("공통 비밀번호 Update 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get("/user/getWorkStatus", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode =  req.query.schoolCode;

    const sqlQuery = "SELECT workStatus FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("근무상태 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.post("/user/updateWorkStatus", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const workStatus = req.body.workStatus;

    const sqlQuery = "UPDATE teaform_db.users SET workStatus = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [workStatus, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("근무상태 Update 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/workNote/getStockMedication", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.stockMedicine WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건일지 > 재고 약품 조회 중 ERROR", err);
        }else{
            const resultMedications = result.map(item => {
                if(item.registrationUnitAmount !== null && item.registrationUnitAmount.length > 0) {
                    return {
                        medication: `${item.medicineName} ${item.registrationUnitAmount}${item.unit}`,
                        registrationUnitAmount: `${item.registrationUnitAmount}`
                    };
                }else{
                    return {
                        medication: `${item.medicineName}`,
                        registrationUnitAmount: `${item.registrationUnitAmount}`
                    };
                }
            });

            res.json(resultMedications);
        }
    });
});

app.post("/workNote/saveWorkNote", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const sGrade = req.body.sGrade;
    const sClass = req.body.sClass;
    const sNumber = req.body.sNumber;
    const sGender = req.body.sGender;
    const sName = req.body.sName;
    const symptom = req.body.symptom;
    const medication = req.body.medication;
    const actionMatter = req.body.actionMatter;
    const treatmentMatter = req.body.treatmentMatter;
    const onBedStartTime = req.body.onBedStartTime;
    const onBedEndTime = req.body.onBedEndTime;
    const temperature = req.body.temperature;
    const bloodPressure = req.body.bloodPressure;
    const pulse = req.body.pulse;
    const oxygenSaturation = req.body.oxygenSaturation;
    const bloodSugar = req.body.bloodSugar;

    const sqlQuery = "INSERT INTO teaform_db.workNote (userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, symptom, medication, actionMatter, treatmentMatter, onBedStartTime, onBedEndTime, temperature, bloodPressure, pulse, oxygenSaturation, bloodSugar) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, symptom, medication, actionMatter, treatmentMatter, onBedStartTime, onBedEndTime, temperature, bloodPressure, pulse, oxygenSaturation, bloodSugar], (err, result) => {
        if(err) {
            console.log("보건일지 Insert 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/workSchedule/insert", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const eventTitle = req.body.eventTitle;
    const eventColor = req.body.eventColor;
    const eventStartDate = req.body.eventStartDate;
    const eventEndDate = req.body.eventEndDate;

    const sqlQuery = "INSERT INTO teaform_db.workSchedule (userId, schoolCode, eventTitle, eventColor, eventStartDate, eventEndDate) VALUES (?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, eventTitle, eventColor, eventStartDate, eventEndDate], (err, result) => {
        if(err) {
            console.log("보건일정 Insert 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/workSchedule/getWorkSchedule", async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.workSchedule WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건일정 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.post("/workSchedule/update", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const eventId = req.body.eventId;
    const eventTitle = req.body.eventTitle;
    const eventColor = req.body.eventColor;
    const eventStartDate = req.body.eventStartDate;
    const eventEndDate = req.body.eventEndDate;

    const sqlQuery = "UPDATE teaform_db.workSchedule SET eventTitle = ?, eventColor = ?, eventStartDate = ?, eventEndDate = ? WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [eventTitle, eventColor, eventStartDate, eventEndDate, userId, schoolCode, eventId], (err, result) => {
        if(err) {
            console.log("보건일정 Update 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/workSchedule/reSchedule", async (req, res) => {
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const eventId = req.body.eventId;
    const eventStartDate = req.body.eventStartDate;
    const eventEndDate = req.body.eventEndDate;

    const sqlQuery = "UPDATE teaform_db.workSchedule SET eventStartDate = ?, eventEndDate = ? WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [eventStartDate, eventEndDate, userId, schoolCode, eventId], (err, result) => {
        if(err) {
            console.log("보건일정 리스케쥴링 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get('/request/getCommonPassword', async (req, res) => {
    const schoolCode = req.query.schoolCode;
    const schoolName = req.query.schoolName;

    const sqlQuery = "SELECT commonPassword FROM teaform_db.users WHERE schoolCode = ? AND schoolName = ?";
    db.query(sqlQuery, [schoolCode, schoolName], (err, result) => {
        if(err) {
            console.log("보건실 사용 요청 > 로그인 시 공통 비밀번호 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.get('/workNote/getSelectedStudentData', async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;
    const sGrade = req.query.sGrade;
    const sClass = req.query.sClass;
    const sNumber = req.query.sNumber;
    const sGender = req.query.sGender;
    const sName = req.query.sName;

    const sqlQuery = "SELECT * FROM teaform_db.workNote WHERE userId = ? AND schoolCode = ? AND sGrade = ? AND sClass = ? AND sNumber = ? AND sGender = ? AND sName = ?";
    db.query(sqlQuery, [userId, schoolCode, sGrade, sClass, sNumber, sGender, sName], (err, result) => {
        if(err) {
            console.log("보건일지 선택한 학생별 일지 등록 내역 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

// 추후 기간 등 조건 추가하여 조회 필요
app.get('/workNote/getEntireWorkNote', async (req, res) => {
    const userId = req.query.userId;
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT * FROM teaform_db.workNote WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("전체 등록된 보건일지 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/workNote/updateOnBedEndTime', async (req, res) => {
    const onBedEndTime = req.body.onBedEndTime;
    const userId = req.body.userId;
    const schoolCode = req.body.schoolCode;
    const rowId = req.body.rowId;
    const targetStudentGrade = req.body.targetStudentGrade;
    const targetStudentClass = req.body.targetStudentClass;
    const targetStudentNumber = req.body.targetStudentNumber;
    const targetStudentGender = req.body.targetStudentGender;
    const targetStudentName = req.body.targetStudentName;

    // 침상안정 종료시간 update 처리 필요
    const sqlQuery = "UPDATE teaform_db.workNote SET onBedEndTime = ? WHERE userId = ? AND schoolCode = ? AND id = ? AND sGrade = ? AND sClass = ? AND sNumber = ? AND sGender = ? AND sName = ?";
    db.query(sqlQuery, [onBedEndTime, userId, schoolCode, rowId, targetStudentGrade, targetStudentClass, targetStudentNumber, targetStudentGender, targetStudentName], (err, result) => {
        if(err) {
            console.log("침상종료 시간 Update 처리 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get('/request/getCurrentInfo', async (req, res) => {
    const schoolCode = req.query.schoolCode;

    const sqlQuery = "SELECT workStatus FROM teaform_db.users WHERE schoolCode = ?";
    db.query(sqlQuery, [schoolCode], (err, result) => {
        if(err) {
            console.log("학교코드로 보건실 현황 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.get('/request/getOnBedRestInfo', async (req, res) => {
    const schoolCode = req.query.schoolCode;
    const today = req.query.today;
    const currentDateTime = new Date();
    const currentTime = currentDateTime.getHours() + ":" + currentDateTime.getMinutes();

    const sqlQuery = "SELECT sGrade, sClass, sNumber, sGender, sName, onBedStartTime, onBedEndTime FROM teaform_db.workNote " +
                     "WHERE schoolCode = ? AND DATE(updatedAt) = ? " +
                     "AND (" +
                     "(onBedEndTime != '' AND TIME(onBedStartTime) <= TIME(?) AND TIME(onBedEndTime) > TIME(?)) " +
                     "OR " +
                     "(onBedEndTime = '' AND TIME(onBedStartTime) <= TIME(?))" +
                     ")";

    db.query(sqlQuery, [schoolCode, today, currentTime, currentTime, currentTime], (err, result) => {
        if(err) {
            console.log("보건실 요청 기능 내 침상정보 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});









// 여기서 계속 에러 발생함 - 수정필요
app.post('/request/saveVisitRequest', async (req, res) => {
    const schoolCode = req.body.schoolCode;
    const targetGrade = req.body.targetGrade;
    const targetClass = req.body.targetClass;
    const targetNumber = req.body.targetNumber;
    const targetName = req.body.targetName;
    const requestContent = req.body.requestContent;
    const teacherClassification = req.body.teacherClassification;
    const teacherName = req.body.teacherName;

    const sqlQuery = "INSERT INTO teaform_db.visitRequest (schoolCode, teacherClassification, teacherName, sGrade, sClass, sNumber, sName) VALUES (?,?,?,?,?,?,?)";
    db.query(sqlQuery, [schoolCode, teacherClassification, teacherName, targetGrade, targetClass, targetNumber, targetName, requestContent ], (err, result) => {
        if(err) {
            console.log("보건실 방문 요청 내 요청 메시지 Insert 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});









server.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});

const connectedSockets = new Set();

io.on('connection', (socket) => {
    // 이미 연결된 소켓이 아닌 경우에만 Event Listener를 등록
    if(!connectedSockets.has(socket.id)) {
        connectedSockets.add(socket.id);

        console.log("Connection Socket Success");
    
        const handleSendBedStatus = (data) => {
            io.emit('broadcastBedStatus', { message: data.message });
        };
    
        const handleSendWorkStatus = (data) => {
            io.emit('broadcastWorkStatus', { message: data.message });
        };
    
        socket.on('sendBedStatus', handleSendBedStatus);
        socket.on('sendWorkStatus', handleSendWorkStatus);
    
        socket.on('disconnect', () => {
            console.log("클라이언트가 소켓 연결을 해제했습니다.");
            connectedSockets.delete(socket.id);
        });
    
        socket.on('error', (error) => {
            console.error("소켓 오류:", error);
        });
    }
});