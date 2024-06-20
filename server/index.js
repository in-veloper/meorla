require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Cookies } = require('react-cookie');
const cookies = new Cookies();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { startMedicineScheduler } = require('./scheduler/medicineScheduler');
const socketIo = require('socket.io');
const http = require('http');
const nodemailer = require('nodemailer');

const BASE_ORIGIN = process.env.REACT_APP_BASE_ORIGIN;
const PORT = process.env.REACT_APP_BASE_PORT || 8002;

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: BASE_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        optionsSuccessStatus: 200,
        credentials: true
    },
    pingInterval: 25000,    // ping을 보낼 간격
    pingTimeout: 60000      // pong 응답을 기다리는 시간
});

const transporter = nodemailer.createTransport({
    host: 'smtp.worksmobile.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

app.use(cors({
     origin: BASE_ORIGIN,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
     allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
     credentials: true,
     optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

const setCookie = (name, value, options) => {
    const result = cookies.set(name, value, { ...options });
    return result;
};

const getCookie = (name) => {
    return cookies.get(name);
};

const removeCookie = (name) => {
    return cookies.remove(name);
};


const db = mysql.createPool({
    host: process.env.REACT_APP_MYSQL_HOST,
    user: process.env.REACT_APP_MYSQL_USER,
    password: process.env.REACT_APP_MYSQL_PASSWORD,
    database: process.env.REACT_APP_MYSQL_DB
});

app.get("/api/token", async (req, res) => {
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
                            notifyPm: user.notifyPm,
                            isPopUpProtectStudent: user.isPopUpProtectStudent
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

app.get("/api/user/checkUser", async (req, res) => {
    const userId = req.query.userId;
    const schoolName = req.query.schoolName;

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

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

function verifyPassword(storedHash, inputPassword) {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(inputPassword, salt, 10000, 64, 'sha512').toString('hex');
    return hash === originalHash;
};

app.post("/api/user/insert", async (req, res) => {
    const { schoolName, name, email, userId, password, schoolCode, schoolAddress, refresh_token, commonPassword } = req.body;
    const hashedPassword = hashPassword(password);

    const sqlQuery = "INSERT INTO teaform_db.users (schoolName, name, email, userId, password, schoolCode, schoolAddress, refresh_token, commonPassword) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [schoolName, name, email, userId, hashedPassword, schoolCode, schoolAddress, refresh_token, commonPassword], (err, result) => {
        if(err) {
            console.log("회원가입 데이터 Insert 중 ERROR" + err);
        }else{
            const bodyPartSelectQuery = "SELECT bodyPart FROM teaform_db.physicalInfo";
            db.query(bodyPartSelectQuery, (err, bodyPartsSelectResult) => {
                if(err) {
                    console.log("회원 가입 중 인체 부위 INSERT 내 조회 중 ERROR", err);
                }else{
                    const bodyPartsArray = bodyPartsSelectResult.map(item => item.bodyPart);
                    const bodyPartsString = bodyPartsArray.join("::");  // 구분자 :: 로 결합

                    // bodyParts 테이블에 값 저장
                    const bodyPartsInsertQuery = "INSERT INTO teaform_db.bodyParts (userId, schoolCode, bodyParts) VALUES (?,?,?)";
                    db.query(bodyPartsInsertQuery, [userId, schoolCode, bodyPartsString], (err, bodyPartsInsertResult) => {
                        if(err) {
                            console.log("회원가입 중 인체 부위 INSERT 처리 중 ERROR", err);
                        }else{
                            res.send('success');
                        }
                    });
                }
            });
        }
    });
});

app.post("/api/user/login", async (req, res) => {
    const { userId, password } = req.body;

    const sqlQuery = "SELECT * FROM teaform_db.users WHERE userId = ?";
    db.query(sqlQuery, [userId], async (err, results) => {
        if (err) {
            console.error("로그인 Query 실행 중 ERROR " + err);
            res.status(500).json({ error: "내부 Server ERROR" });
        } else {
            if (results.length > 0) {
                const user = results[0]; // 첫 번째 사용자 정보만 사용 (userId는 고유해야 함)
                const match = verifyPassword(user.password, password);
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

app.post("/api/user/changePassword", async (req, res) => {
    const { userId, schoolCode, oldPassword, newPassword } = req.body;

    const sqlQuery = "SELECT * FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("비밀번호 변경 처리 로직 내 일치 ID 조회 중 ERROR", err);
        }else{
            if(result.length > 0) {
                const user = result[0];
                const match = verifyPassword(user.password, oldPassword);

                if(!match) {
                    res.send("NMCP");   // 현재 비밀번호와 일치하지 않음 (Not Match Current Password)
                }else{
                    const hashedPassword = hashPassword(newPassword);
                    const updateQuery = "UPDATE teaform_db.users SET password = ? WHERE userId = ? AND schoolCode = ?";
                    db.query(updateQuery, [hashedPassword, userId, schoolCode], (updateErr) => {
                        if(updateErr) {
                            console.log("비밀번호 변경 UPDATE 처리 중 ERROR", err);
                        }else{
                            res.send('success');
                        }
                    });
                }
            }else{
                res.send("NFU");        // 일치하는 사용자를 찾을 수 없음 (Not Found User)
            }
        }
    });
});

app.post("/api/user/logout", async (req, res) => {
    const userId = req.body.userId;
    const refreshToken = null;
    
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

app.post("/api/user/updateUserInfo", async (req, res) => {
    const { userId, schoolCode, userName, userEmail, bedCount } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET name = ?, email = ?, bedCount = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userName, userEmail, bedCount, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("사용자 정보 Update 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get("/api/user/getMaskedStatus", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT masked FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("학생 조회 이름 마스킹 여부 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post("/api/user/updateMaskedStatus", async (req, res) => {
    const { userId, schoolCode, masked } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET masked = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [masked, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("학생 조회 마스킹 여부 Update 중 ERROR", err);
        }else{
            res.send('success');
        }
    })
});

app.get("/api/user/getAlertHiddenStatus", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT alertHidden FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건실 방문요청 알람 숨김 여부 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post("/api/user/updateAlertHiddenStatus", async (req, res) => {
    const { userId, schoolCode, alertHidden } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET alertHidden = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [alertHidden, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건실 방문요청 알람 숨김 여부 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    })
});

app.post("/api/user/updatePmStation", async (req, res) => {
    const { userId, schoolCode, pmStation } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET pmStation = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [pmStation, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("미세먼지 측정소 선택 값 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/user/updateNotifyPmInfo", async (req, res) => {
    const { userId, schoolCode, notifyPm } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET notifyPm = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [notifyPm, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("미세먼지 알림 여부 Update 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/user/getNotifyPmInfo", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT notifyPm FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("미세먼지 알림 여부 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post("/api/user/updatePopUpProtectStudentStatus", async (req, res) => {
    const { userId, schoolCode, isPopUpProtectStudent } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET isPopUpProtectStudent = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [isPopUpProtectStudent, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보호학생 팝업 알림 여부 UPDATE 처리 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get("/api/user/getPopUpProtectStudentStatus", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT isPopUpProtectStudent FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보호학생 팝업 알림 여부 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

const verificationCodes = {};    // 간단한 메모리 저장소

app.post("/api/send-email-verification", async (req, res) => {
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();    // 6자리 인증코드 생성

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'MEORLA 회원가입 인증코드',
        html: `<p style="font-size:17px;">MEORLA플랫폼에서 회원가입 인증코드를 입력해주세요</p><p style="font-size:17px;">인증 코드: <b>${verificationCode}</b></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log("Email 인증 발송 중 ERROR", error);
            res.json({ success: false });
        }else{
            verificationCodes[email] = verificationCode;     // 메모리에 인증코드 저장
            res.json({ success: true });
        }
    })
});

app.post("/api/verify-email-code", (req, res) => {
    const { email, code } = req.body;

    if(verificationCodes[email] && verificationCodes[email] === code) {
        res.send('Email Verified');
    }else{
        res.send('Invalid verification code');
    }
});

app.post("/api/send-password-reset-code", async (req, res) => {
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();    // 6자리 인증코드 생성
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'MEORLA 비밀번호 초기화 인증코드',
      html: `<p style="font-size:17px;">MEORLA 플랫폼에서 비밀번호 초기화 인증코드를 입력해주세요</p><p style="font-size:17px;">인증 코드: <b>${verificationCode}</b></p>`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if(error) {
        console.log("Email 인증 발송 중 ERROR", error);
        res.json({ success: false });
      }else{
        verificationCodes[email] = verificationCode;     // 메모리에 인증코드 저장
        res.json({ success: true, verificationCode });   // 인증 코드 반환
      }
    })
  });
  
  app.post("/api/reset-password", (req, res) => {
    const { userId } = req.body;
    const newPassword = userId + "12!@"; // 임시 비밀번호 생성
    const hashedPassword = hashPassword(newPassword);
  
    const sqlQuery = "UPDATE teaform_db.users SET password = ? WHERE userId = ?";
    db.query(sqlQuery, [hashedPassword, userId], (err, result) => {
      if(err) {
        console.log("비밀번호 초기화 중 ERROR", err);
        res.status(500).json({ error: "내부 Server ERROR" });
      }else{
        res.send('success');
      }
    });
  });

app.post("/api/bookmark/insert", async (req, res) => {
    const { userId, userEmail, userName, schoolName, schoolCode, bookmarkArray } = req.body;
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

app.post("/api/bookmark/update", async (req, res) => {
    const { userId, userEmail, schoolCode, bookmarkArray } = req.body;
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

app.get("/api/bookmark/getBookmark", async (req, res) => {
    const { userId, userEmail } = req.query;

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

app.post("/api/studentsTable/insert", async (req, res) => {
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

app.get("/api/studentsTable/getStudentInfo", async (req, res) => {
    const { userId, schoolCode } = req.query;

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

app.get("/api/studentsTable/getStudentInfoByGrade", async (req, res) => {
    const { userId, schoolCode, sGrade } = req.query;

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

app.get("/api/studentsTable/getStudentInfoBySearch", async (req, res) => {
    const { userId, schoolCode, sGrade, sClass, sNumber, sName } = req.query;
    
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

    db.query(sqlQuery, queryParams, (err, result) => {
        if (err) {
            console.log("학생 정보 조회 중 ERROR", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json({ studentData: result });
        }
    });
});

app.get("/api/studentsTable/getStudentInfoBySearchInRequest", async (req, res) => {
    const { schoolCode, sGrade, sClass, sNumber, sName } = req.query;
    
    let sqlQuery = "SELECT * FROM teaform_db.students WHERE schoolCode = ?";
    const queryParams = [schoolCode];

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

    db.query(sqlQuery, queryParams, (err, result) => {
        if (err) {
            console.log("학생 정보 조회 중 ERROR", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json({ studentData: result });
        }
    });
});

app.post("/api/studentsTable/deleteStudentInfo", async (req, res) => {
    const { rowId, userId, schoolCode, sGrade, sClass, sNumber, sGender, sName } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.students WHERE id = ? AND userId = ? AND schoolCode = ? AND sGrade = ? AND sClass = ? AND sNumber = ? AND sGender = ? AND sName = ?";
    db.query(sqlQuery, [rowId, userId, schoolCode, sGrade, sClass, sNumber, sGender, sName], (err, result) => {
        if(err) {
            console.log("명렬표 학생 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/studentsTable/addTransferStudent", async (req, res) => {
    const { userId, schoolName, schoolCode, sGrade, sClass, sGender, sName } = req.body;

    const maxNumberResult = await new Promise((resolve, reject) => {
        const query = 'SELECT MAX(sNumber) as maxNumber FROM teaform_db.students WHERE userId = ? AND schoolCode = ? AND sGrade = ? AND sClass = ?';
        db.query(query, [userId, schoolCode, sGrade, sClass], (err, results) => {
            if(err) return reject(err);
            resolve(results)
        });
    });
    
    let newNumber = 1;
    if(maxNumberResult[0].maxNumber !== null) {
        newNumber = parseInt(maxNumberResult[0].maxNumber) + 1;
    }

    const insertStudentResult = await new Promise((resolve, reject) => {
        const query = 'INSERT INTO teaform_db.students (userId, schoolName, schoolCode, sGrade, sClass, sGender, sNumber, sName) VALUES (?,?,?,?,?,?,?,?)';
        db.query(query, [userId, schoolName, schoolCode, sGrade, sClass, sGender, newNumber, sName], (err, results) => {
            if(err) return reject(err);
            resolve(results);
        });
    });

    res.send('success');
});

app.post("/api/teachersTable/insert", async (req, res) => {
    const teachersArray = req.body.teachersArray;
    const values = teachersArray.map(teacher => {
        return [
            teacher.userId,
            teacher.schoolName,
            teacher.schoolCode,
            teacher.teacherName,
            teacher.teacherGrade,
            teacher.teacherClass,
            teacher.teacherSubject,
            teacher.teacherPhone
        ];
    });

    const sqlQuery = "INSERT INTO teaform_db.teachers (userId, schoolName, schoolCode, tName, tGrade, tClass, tSubject, tPhone) VALUES ?";
    db.query(sqlQuery, [values], (err, result) => {
        if(err) {
            console.log("교직원 데이터 INSERT 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/teachersTable/getTeacherInfo", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.teachers WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("교직원 정보 조회 중 ERROR", err);
            res.status(500).json({ error: "Internal Server Error" });
        }else{
            res.json({ teacherData: result });
        }
    });
});

app.post("/api/teachersTable/addTeacher", async (req, res) => {
    const { userId, schoolName, schoolCode, tName, tGrade, tClass, tSubject, tPhone } = req.body;
    
    const sqlQuery = "INSERT INTO teaform_db.teachers (userId, schoolName, schoolCode, tName, tGrade, tClass, tSubject, tPhone) VALUES (?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolName, schoolCode, tName, tGrade, tClass, tSubject, tPhone], (err, result) => {
        if(err) {
            console.log("교직원 정보 INSERT 처리 중 ERROR");
        }else{
            res.send('success');
        }
    });
});

app.post("/api/teachersTable/updateTeacher", async (req, res) => {
    const { rowId, userId, schoolCode, tName, tGrade, tClass, tSubject, tPhone } = req.body;

    const sqlQuery = "UPDATE teaform_db.teachers SET tName = ?, tGrade = ?, tClass = ?, tSubject = ?, tPhone = ? WHERE id = ? AND userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [tName, tGrade, tClass, tSubject, tPhone, rowId, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("교직원 정보 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/teachersTable/deleteTeacher", async (req, res) => {
    const { rowId, userId, schoolCode } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.teachers WHERE id = ? AND userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [rowId, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("교직원 정보 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/symptom/insert", async (req, res) => {
    const { userId, schoolCode, symptomString } = req.body;

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

app.post("/api/symptom/update", async (req, res) => {
    const { userId, schoolCode, symptomString } = req.body;

    const sqlQuery = "UPDATE teaform_db.symptom SET symptom = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [symptomString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("증상 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/symptom/getSymptom", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.symptom WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("증상 데이터 조회 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const symptom = result[0];
                res.json({ symptom });
            }else{
                res.json({ symptom: 'N' });
            }
        }
    });
});

app.post("/api/bodyParts/insert", async (req, res) => {
    const { userId, schoolCode, bodyPartsString } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.bodyParts (userId, schoolCode, bodyParts) VALUES (?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, bodyPartsString], (err, result) => {
        if(err) {
            console.log("조치사항 데이터 Insert 중 ERROR" + err);
        }else{
            console.log("조치사항 데이터 Insert 처리 완료");
            res.send('success');
        }
    });
});

app.post("/api/bodyParts/update", async (req, res) => {
    const { userId, schoolCode, bodyPartsString } = req.body;

    const sqlQuery = "UPDATE teaform_db.bodyParts SET bodyParts = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [bodyPartsString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("조치사항 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/bodyParts/getBodyParts", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT bodyParts FROM teaform_db.bodyParts WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("조치사항 데이터 조회 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const bodyParts = result[0];
                res.json({ bodyParts });
            }else{
                res.json({ bodyParts: 'N' });
            }
        }
    });
});

app.post("/api/treatmentMatter/insert", async (req, res) => {
    const { userId, schoolCode, treatmentMatterString } = req.body;

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

app.post("/api/treatmentMatter/update", async (req, res) => {
    const { userId, schoolCode, treatmentMatterString } = req.body;

    const sqlQuery = "UPDATE teaform_db.treatmentMatter SET treatmentMatter = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [treatmentMatterString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("처치사항 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/treatmentMatter/getTreatmentMatter", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.treatmentMatter WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("처치사항 데이터 조회 중 ERROR" + err);
        }else{
            if(result.length > 0) {
                const treatmentMatter = result[0];
                res.json({ treatmentMatter });
            }else{
                res.json({ treatmentMatter: 'N' });
            }
        }
    });
});

app.post("/api/medication/insert", async (req, res) => {
    const { userId, schoolCode, medicationString } = req.body;

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

app.post("/api/medication/update", async (req, res) => {
    const { userId, schoolCode, medicationString } = req.body;

    const sqlQuery = "UPDATE teaform_db.medication SET medication = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [medicationString, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("투약사항 데이터 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/medication/getMedication", async (req, res) => {
    const { userId, schoolCode } = req.body;

    const sqlQuery = "SELECT * FROM teaform_db.medication WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("약품 조회 중 ERROR" + err);
        }else{
            res.json(result);
        }
    });
});

app.post("/api/stockMedicine/insert", async (req, res) => {
    const { userId, schoolCode, medicineName, coporateName, unit, stockAmount, extinctAmount, latestPurchaseDate } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.stockMedicine (userId, schoolCode, medicineName, coporateName, unit, stockAmount, extinctAmount, purchaseDate) VALUES (?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, medicineName, coporateName, unit, stockAmount, extinctAmount, latestPurchaseDate], (err, result) => {
        if(err) {
            console.log("약품 재고 Insert 중 ERROR" + err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/stockMedicine/getStockMedicine", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.stockMedicine WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("약품 재고 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post("/api/stockMedicine/updateStockMedicine", async (req, res) => {
    const { userId, schoolCode, rowId, medicineName, coporateName, latestPurchaseDate, unit, stockAmount, extinctAmount, registrationUnitAmount } = req.body;

    const sqlQuery = "UPDATE teaform_db.stockMedicine SET medicineName = ?, coporateName = ?, latestPurchaseDate = ?, unit = ?, stockAmount = ?, extinctAmount = ?, registrationUnitAmount = ? WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [medicineName, coporateName, latestPurchaseDate, unit, stockAmount, extinctAmount, registrationUnitAmount, userId, schoolCode, rowId], (err, result) => {
        if(err) {
            console.log("약품 재고 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/stockMedicine/deleteStockMedicine", async (req, res) => {
    const { userId, schoolCode, rowId } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.stockMedicine WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [userId, schoolCode, rowId], (err, result) => {
        if(err) {
            console.log("약품 재고 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/stockFixt/saveStockFixt", async (req, res) => {
    const { userId, schoolCode, fixtName, fixtCoporate, fixtLatestPurchaseDate, fixtUnit, fixtStockAmount, fixtExtinctAmount, fixtRegistrationUnitAmount } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.stockFixt (userId, schoolCode, fixtName, fixtCoporate, fixtLatestPurchaseDate, fixtUnit, fixtStockAmount, fixtExtinctAmount, fixtRegistrationUnitAmount) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, fixtName, fixtCoporate, fixtLatestPurchaseDate, fixtUnit, fixtStockAmount, fixtExtinctAmount, fixtRegistrationUnitAmount], (err, result) => {
        if(err) { 
            console.log("비품 재고 INSERT 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get('/api/stockFixt/getStockFixt', async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.stockFixt WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("비품 재고 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/stockFixt/updateStockFixt', async (req, res) => {
    const { userId, schoolCode, rowId, fixtName, fixtCoporate, fixtLatestPurchaseDate, fixtUnit, fixtStockAmount, fixtExtinctAmount, fixtRegistrationUnitAmount } = req.body;

    const sqlQuery = "UPDATE teaform_db.stockFixt SET fixtName = ?, fixtCoporate = ?, fixtLatestPurchaseDate = ?, fixtUnit = ?, fixtStockAmount = ?, fixtExtinctAmount = ?, fixtRegistrationUnitAmount = ? WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [fixtName, fixtCoporate, fixtLatestPurchaseDate, fixtUnit, fixtStockAmount, fixtExtinctAmount, fixtRegistrationUnitAmount, userId, schoolCode, rowId], (err, result) => {
        if(err) {
            console.log("비품 재고 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post('/api/stockFixt/deleteStockFixt', async (req, res) => {
    const { userId, schoolCode, rowId } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.stockFixt WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [userId, schoolCode, rowId], (err, result) => {
        if(err) {
            console.log("비품 재고 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
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
        const decodedFileName = decodeURIComponent(file.originalname.replace(/\+/g, ' '));
        callback(null, decodedFileName)
    }
});

const upload = multer({ storage: storage });

app.post("/upload/image", upload.single('file'), (req, res) => {
    const fileUrl = `/uploads/${req.body.uploadPath}/${req.file.filename}`;
    res.json({
        message: 'Image가 업로드 성공',
        filename: req.file.filename,
        fileUrl: fileUrl
    });
});

app.use(express.static(path.join(__dirname, '/public')));

app.post("/api/upload/insert", async (req, res) => {
    const { userId, schoolCode, category, fileName } = req.body;

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

app.get("/api/upload/getFileName", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.uploadFile WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("Upload File명 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.get("/api/user/getCommonPassword", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT commonPassword FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("공통 비밀번호 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
})

app.post("/api/user/updateCommonPassword", async (req, res) => {
    const { userId, schoolCode, updatedCommonPassword } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET commonPassword = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [updatedCommonPassword, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("공통 비밀번호 Update 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get("/api/user/getWorkStatus", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT workStatus FROM teaform_db.users WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("근무상태 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.post("/api/user/updateWorkStatus", async (req, res) => {
    const { userId, schoolCode, workStatus } = req.body;

    const sqlQuery = "UPDATE teaform_db.users SET workStatus = ? WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [workStatus, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("근무상태 Update 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/workNote/getStockMedication", async (req, res) => {
    const { userId, schoolCode } = req.query;

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

app.post("/api/workNote/saveWorkNote", async (req, res) => {
    const { userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, symptom, medication, bodyParts, treatmentMatter, onBedStartTime, onBedEndTime, temperature, bloodPressure, pulse, oxygenSaturation, bloodSugar } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.workNote (userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, symptom, medication, bodyParts, treatmentMatter, onBedStartTime, onBedEndTime, temperature, bloodPressure, pulse, oxygenSaturation, bloodSugar) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, symptom, medication, bodyParts, treatmentMatter, onBedStartTime, onBedEndTime, temperature, bloodPressure, pulse, oxygenSaturation, bloodSugar], (err, result) => {
        if(err) {
            console.log("보건일지 INSERT 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/workNote/updateWorkNote", async (req, res) => {
    const { rowId, userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, symptom, medication, bodyParts, treatmentMatter, onBedStartTime, onBedEndTime, temperature, bloodPressure, pulse, oxygenSaturation, bloodSugar } = req.body;

    const sqlQuery = "UPDATE teaform_db.workNote SET symptom = ?, medication = ?, bodyParts = ?, treatmentMatter = ?, onBedStartTime = ?, onBedEndTime = ?, temperature = ?, bloodPressure = ?, pulse = ?, oxygenSaturation = ?, bloodSugar = ? WHERE id = ? AND userId = ? AND schoolCode = ? AND sGrade = ? AND sClass = ? AND sNumber = ? AND sGender = ? AND sName = ?";
    db.query(sqlQuery, [symptom, medication, bodyParts, treatmentMatter, onBedStartTime, onBedEndTime, temperature, bloodPressure, pulse, oxygenSaturation, bloodSugar, rowId, userId, schoolCode, sGrade, sClass, sNumber, sGender, sName], (err, result) => {
        if(err) {
            console.log("보건일지 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/workNote/deleteWorkNote", async (req, res) => {
    const { rowId, userId, schoolCode, sGrade, sClass, sNumber, sGender, sName } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.workNote WHERE id = ? AND userId = ? AND schoolCode = ? AND sGrade = ? AND sClass = ? AND sNumber = ? AND sGender = ? AND sName = ?";
    db.query(sqlQuery, [rowId, userId, schoolCode, sGrade, sClass, sNumber, sGender, sName], (err, result) => {
        if(err) {
            console.log("보건일지 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/workNote/getOnBedStudentList", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.workNote WHERE (onBedStartTime IS NOT NULL OR onBedEndTime IS NOT NULL) AND userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건일지 내 침상안정 내역 학생 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });    
});

app.get("/api/workNote/getProtectStudents", async (req, res) => {
    const {userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.students WHERE userId = ? AND schoolCode = ? AND isProtected = 1";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보호학생 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post("/api/workSchedule/insert", async (req, res) => {
    const { userId, schoolCode, eventTitle, eventColor, eventStartDate, eventEndDate } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.workSchedule (userId, schoolCode, eventTitle, eventColor, eventStartDate, eventEndDate) VALUES (?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, eventTitle, eventColor, eventStartDate, eventEndDate], (err, result) => {
        if(err) {
            console.log("보건일정 Insert 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/workSchedule/getWorkSchedule", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.workSchedule WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건일정 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.post("/api/workSchedule/update", async (req, res) => {
    const { userId, schoolCode, eventId, eventTitle, eventColor, eventStartDate, eventEndDate } = req.body;

    const sqlQuery = "UPDATE teaform_db.workSchedule SET eventTitle = ?, eventColor = ?, eventStartDate = ?, eventEndDate = ? WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [eventTitle, eventColor, eventStartDate, eventEndDate, userId, schoolCode, eventId], (err, result) => {
        if(err) {
            console.log("보건일정 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/workSchedule/deleteSchedule", async (req, res) => {
    const { userId, schoolCode, eventId } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.workSchedule WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [userId, schoolCode, eventId], (err, result) => {
        if(err) {
            console.log("보건일정 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post("/api/workSchedule/reSchedule", async (req, res) => {
    const { userId, schoolCode, eventId, eventStartDate, eventEndDate } = req.body;

    const sqlQuery = "UPDATE teaform_db.workSchedule SET eventStartDate = ?, eventEndDate = ? WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [eventStartDate, eventEndDate, userId, schoolCode, eventId], (err, result) => {
        if(err) {
            console.log("보건일정 리스케쥴링 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get("/api/workSchedule/getTodaySchedule", async (req, res) => {
    const { userId, schoolCode, today } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.workSchedule WHERE userId = ? AND schoolCode = ? AND ? >= eventStartDate AND ? <= eventEndDate";
    db.query(sqlQuery, [userId, schoolCode, today, today], (err, result) => {
        if(err) {
            console.log("보건일정 기능 내 오늘 일정 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.get("/api/workSchedule/getEntireSchedule", async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.workSchedule WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건일정 기능 내 전체 일정 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.get('/api/request/getCommonPassword', async (req, res) => {
    const { schoolCode, schoolName } = req.query;

    const sqlQuery = "SELECT commonPassword FROM teaform_db.users WHERE schoolCode = ? AND schoolName = ?";
    db.query(sqlQuery, [schoolCode, schoolName], (err, result) => {
        if(err) {
            console.log("보건실 사용 요청 > 로그인 시 공통 비밀번호 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.get('/api/workNote/getSelectedStudentData', async (req, res) => {
    const { userId, schoolCode, sGrade, sClass, sNumber, sGender, sName } = req.query;

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
app.get('/api/workNote/getEntireWorkNote', async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.workNote WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("전체 등록된 보건일지 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/workNote/updateOnBedEndTime', async (req, res) => {
    const { onBedEndTime, userId, schoolCode, rowId, targetStudentGrade, targetStudentClass, targetStudentNumber, targetStudentGender, targetStudentName } = req.body;

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

app.post('/api/workNote/saveProtectStudent', async (req, res) => {
    const { userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, isProtected, protectContent } = req.body;

    const sqlQuery = "UPDATE teaform_db.students SET isProtected = ?, protectContent = ? WHERE userId = ? AND schoolCode = ? AND sGrade = ? AND sClass = ? AND sNumber = ? AND sGender = ? AND sName = ?";
    db.query(sqlQuery, [isProtected, protectContent, userId, schoolCode, sGrade, sClass, sNumber, sGender, sName], (err, result) => {
        if(err) {
            console.log("보호학생 UPDATE 처리 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get('/api/request/getCurrentInfo', async (req, res) => {
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

app.get('/api/request/getOnBedRestInfo', async (req, res) => {
    const { schoolCode, today } = req.query;
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

app.post('/api/request/saveVisitRequest', async (req, res) => {
    const { schoolCode, targetGrade, targetClass, targetNumber, targetName, requestContent, teacherClassification, teacherName, requestTime } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.visitRequest (schoolCode, teacherClassification, teacherName, sGrade, sClass, sNumber, sName, requestContent, requestTime) VALUES (?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [schoolCode, teacherClassification, teacherName, targetGrade, targetClass, targetNumber, targetName, requestContent, requestTime ], (err, result) => {
        if(err) {
            console.log("보건실 방문 요청 내 요청 메시지 Insert 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

// DB에서 조회할때 오늘날짜로 등록된 목록만 조회하도록 수정 필요
app.get('/api/workNote/getVisitRequest', async (req, res) => {
    const { schoolCode, isRead } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.visitRequest WHERE schoolCode = ? AND isRead = ?";
    db.query(sqlQuery, [schoolCode, isRead], (err, result) => {
        if(err) {
            console.log("보건실 방문 신청 내역 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/workNote/updateRequestReadStatus', async (req, res) => {
    const { id, schoolCode, isRead } = req.body;

    const sqlQuery = "UPDATE teaform_db.visitRequest SET isRead = ? WHERE id = ? AND schoolCode = ?";
    db.query(sqlQuery, [isRead, id, schoolCode], (err, result) => {
       if(err) {
            console.log("보건실 방문 요청 알람 내역 읽음 처리 중 ERROR", err)
       }else{
            res.send("success");
       } 
    });
});

app.post('/api/workNote/updateEntireRequestReadStatus', async (req, res) => {
    const { requestIds, isRead } = req.body;

    const sqlQuery = "UPDATE teaform_db.visitRequest SET isRead = ? WHERE id IN (?)";
    db.query(sqlQuery, [isRead, requestIds], (err, result) => {
        if(err) {
            console.log("보건실 방문 요청 알람 내역 전체 읽음 처리 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get('/api/medicineInfo/getMedicineData', async (req, res) => {
    const sqlQuery = "SELECT * FROM teaform_db.medicineApiData";
    db.query(sqlQuery, [], (err, result) => {
        if(err) {
            console.log("약품정보 (e약은요) API 데이터 테이블 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.get('/api/medicineInfo/getGrainMedicineData', async (req, res) => {
    const sqlQuery = "SELECT * FROM teaform_db.grainMedicineApiData";
    db.query(sqlQuery, [], (err, result) => {
        if(err) {
            console.log("낱알 약품정보 API 데이터 테이블 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    })
});

app.post('/api/medicineInfo/saveBookmarkMedicine', async (req, res) => {
    const { userId, schoolCode, itemSeq } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.bookmarkMedicine (userId, schoolCode, itemSeq) VALUES(?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, itemSeq], (err, result) => {
        if(err) {
            console.log("약품정보 북마크 설정 처리 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.post('/api/medicineInfo/deleteBookmarkMedicine', async (req, res) => {
    const { userId, schoolCode, itemSeq } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.bookmarkMedicine WHERE userId = ? AND schoolCode = ? AND itemSeq = ?";
    db.query(sqlQuery, [userId, schoolCode, itemSeq], (err, result) => {
        if(err) {
            console.log("약품정보 북마크 해제 처리 중 ERROR", err);
        }else{
            res.send("success");
        }
    });
});

app.get('/api/medicineInfo/getBookmarkMedicine', async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.bookmarkMedicine WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("약품정보 북마크 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/manageEmergency/saveEmergencyManagement', async (req, res) => {
    const { userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, firstDiscoveryTime, teacherConfirmTime, occuringArea, firstWitness, vitalSign, mainSymptom, accidentOverview, emergencyTreatmentDetail, transferTime, guardianContact, transferHospital, homeroomTeacherName, registDate, registerName, bodyChartPoints, transferVehicle, transpoter } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.manageEmergency (userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, firstDiscoveryTime, teacherConfirmTime, occuringArea, firstWitness, vitalSign, mainSymptom, accidentOverview, emergencyTreatmentDetail, transferTime, guardianContact, transferHospital, homeroomTeacherName, registDate, registerName, bodyChartPoints, transferVehicle, transpoter) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, sGrade, sClass, sNumber, sGender, sName, firstDiscoveryTime, teacherConfirmTime, occuringArea, firstWitness, vitalSign, mainSymptom, accidentOverview, emergencyTreatmentDetail, transferTime, guardianContact, transferHospital, homeroomTeacherName, registDate, registerName, bodyChartPoints, transferVehicle, transpoter], (err, result) => {
        if(err) {
            console.log("응급학생관리 등록 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post('/manageEmergency/updateEmergencyManagement', async (req, res) => {
    const { userId, schoolCode, rowId, sGrade, sClass, sNumber, sGender, sName, firstDiscoveryTime, teacherConfirmTime, occuringArea, firstWitness, vitalSign, mainSymptom, accidentOverview, emergencyTreatmentDetail, transferTime, guardianContact, transferHospital, homeroomTeacherName, registDate, registerName, bodyChartPoints, transferVehicle, transpoter } = req.body;

    const sqlQuery = "UPDATE teaform_db.manageEmergency SET firstDiscoveryTime = ?, teacherConfirmTime = ?, occuringArea = ?, firstWitness = ?, vitalSign = ?, mainSymptom = ?, accidentOverview = ?, emergencyTreatmentDetail = ?, transferTime = ?, guardianContact = ?, transferHospital = ?, homeroomTeacherName = ?, registDate = ?, registerName = ?, bodyChartPoints = ?, transferVehicle = ?, transpoter = ? WHERE userId = ? AND schoolCode = ? AND id = ? AND sGrade = ? AND sClass = ? AND sNumber = ? AND sGender = ? AND sName = ?";
     db.query(sqlQuery, [firstDiscoveryTime, teacherConfirmTime, occuringArea, firstWitness, vitalSign, mainSymptom, accidentOverview, emergencyTreatmentDetail, transferTime, guardianContact, transferHospital, homeroomTeacherName, registDate, registerName, bodyChartPoints, transferVehicle, transpoter, userId, schoolCode, rowId, sGrade, sClass, sNumber, sGender, sName], (err, result) => {
        if(err) {
            console.log("응급학생관리 Update 처리 중 ERROR", err);
        }else{
            res.send("success");
        }
     });
});

app.get('/api/manageEmergency/getManageEmergencyData', async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.manageEmergency WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("응급학생관리 전체 목록 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/manageEmergency/deleteEmergencyManagement', async (req, res) => {
    const { rowId, userId, schoolCode, sGrade, sClass, sNumber } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.manageEmergency WHERE id = ? AND userId = ? AND schoolCode = ? AND sGrade = ? AND sClass = ? AND sNumber = ?";
    db.query(sqlQuery, [rowId, userId, schoolCode, sGrade, sClass, sNumber], (err, result) => {
        if(err) {
            console.log("응급학생 내역 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
})

app.post('/api/dashboard/saveMemo', async (req, res) => {
    const { userId, schoolCode, memo } = req.body

    const checkQuery = "SELECT * FROM teaform_db.memo WHERE userId = ? AND schoolCode = ?";
    db.query(checkQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("메모 등록 여부 조회 중 ERROR", err);
        }else{
            if(result.length > 0) {
                const updateQuery = "UPDATE teaform_db.memo SET memo = ? WHERE userId = ? AND schoolCode = ?";
                db.query(updateQuery, [memo, userId, schoolCode], (err, result) => {
                    if(err) {
                        console.log("메모 Update 처리 중 ERROR", err);
                    }else{
                        res.send("success");
                    }
                });
            }else{
                const insertQuery = "INSERT INTO teaform_db.memo (userId, schoolCode, memo) VALUES (?,?,?)";
                db.query(insertQuery, [userId, schoolCode, memo], (err, result) => {
                    if(err) {
                        console.log("대시보드 메모 저장 처리 중 ERROR", err);
                    }else{
                        res.send("success");
                    }
                });
            }
        }
    })
});

app.get('/api/dashboard/getMemo', async (req, res) => {
    const { userId, schoolCode } = req.query;

    const sqlQuery = "SELECT * FROM teaform_db.memo WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("대시보드 메모 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/qnaRequest/saveQnaRequest', async (req, res) => {
    const { userId, userName, schoolCode, writingCategory, qnaRequestTitle, qnaRequestContent, isSecret } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.qnaRequest (userId, userName, schoolCode, qrCategory, qrTitle, qrContent, isSecret) VALUES (?,?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, userName, schoolCode, writingCategory, qnaRequestTitle, qnaRequestContent, isSecret], (err, result) => {
        if(err) {
            console.log("문의 및 요청사항 INSERT 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get('/api/qnaRequest/getQnaRequest', async (req, res) => {
    const sqlQuery = "SELECT * FROM teaform_db.qnaRequest";
    db.query(sqlQuery, [], (err, result) => {
        if(err) {
            console.log("문의 및 요청사항 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/qnaRequest/updateQnaRequest', async (req, res) => {
    const { rowId, userId, schoolCode, writingCategory, qnaRequestTitle, qnaRequestContent, isSecret } = req.body;

    const sqlQuery = "UPDATE teaform_db.qnaRequest SET qrCategory = ?, qrTitle = ?, qrContent = ?, isSecret = ? WHERE id = ? AND userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [writingCategory, qnaRequestTitle, qnaRequestContent, isSecret, rowId, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("문의 및 요청사항 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post('/api/qnaRequest/incrementViewCount', async (req, res) => {
    const { rowId } = req.body;

    const sqlQuery = "UPDATE teaform_db.qnaRequest SET views = views + 1 WHERE id = ?";
    db.query(sqlQuery, [rowId], (err, result) => {
        if(err) {
            console.log("문의 및 요청사항 조회수 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post('/api/qnaRequest/replyQnaRequest', async (req, res) => {
    const { rowId, userId, reply } = req.body;

    const sqlQuery = "UPDATE teaform_db.qnaRequest SET reply = ? WHERE id = ?";
    if(userId === "admin") {
        db.query(sqlQuery, [reply, rowId], (err, result) => {
            if(err) {
                console.log("문의 및 요청사항 답변 UPDATE 처리 중 ERROR", err);
            }else{
                res.send('success');
            }
        });
    }
});

app.post('/api/community/saveOpinionSharing', async (req, res) => {
    const { userId, userName, schoolCode, osCategory, osTitle, osContent } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.opinionSharing (userId, userName, schoolCode, osCategory, osTitle, osContent) VALUES (?,?,?,?,?,?)";
    db.query(sqlQuery, [userId, userName, schoolCode, osCategory, osTitle, osContent], (err, result) => {
        if(err) {
            console.log("커뮤니티 의견공유 글 INSERT 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get('/api/community/getOpinionSharing', async (req, res) => {
    const sqlQuery = "SELECT os.*, COUNT(rec.postId) AS recommendationCount FROM teaform_db.opinionSharing AS os LEFT JOIN teaform_db.recommendations AS rec ON os.id = rec.postId GROUP BY os.id ORDER BY os.createdAt DESC";
    
    db.query(sqlQuery, [], (err, result) => {
        if(err) {
            console.log("커뮤니티 의견공유 글 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.post('/api/community/updateOpinionSharing', async (req, res) => {
    const { userId, schoolCode, rowId, osCategory, osTitle, osContent } = req.body;

    const sqlQuery = "UPDATE teaform_db.opinionSharing SET osCategory = ?, osTitle = ?, osContent = ? WHERE userId = ? AND schoolCode = ? AND id = ?";
    db.query(sqlQuery, [osCategory, osTitle, osContent, userId, schoolCode, rowId], (err, result) => {
        if(err) {
            console.log("커뮤니티 의견공유 글 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post('/api/community/deleteOpinionSharing', async (req, res) => {
    const { rowId, userId, schoolCode } = req.body;
     const sqlQuery = "DELETE FROM teaform_db.opinionSharing WHERE id = ? AND userId = ? AND schoolCode = ?";
     db.query(sqlQuery, [rowId, userId, schoolCode], (err, result) => {
        if(err) {
            console.log("의견공유 글 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
     });
});

app.post('/api/community/opinionSharingIncrementViewCount', async (req, res) => {
    const { rowId } = req.body;

    const sqlQuery = "UPDATE teaform_db.opinionSharing SET views = views + 1 WHERE id = ?";
    db.query(sqlQuery, [rowId], (err, result) => {
        if(err) {
            console.log("커뮤니티 의견공유 조회수 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post('/api/community/resourceSharingIncrementViewCount', async (req, res) => {
    const { rowId } = req.body;

    const sqlQuery = "UPDATE teaform_db.resourceSharing SET views = views + 1 WHERE id = ?";
    db.query(sqlQuery, [rowId], (err, result) => {
        if(err) {
            console.log("커뮤니티 자료공유 조회수 UPDATE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.post('/api/community/thumbsUp', async (req, res) => {
    const { viewType, userId, postId } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.recommendations (viewType, userId, postId) VALUES (?,?,?)";
    db.query(sqlQuery, [viewType, userId, postId], (err, result) => {
        if(err) {
            console.log("커뮤니티 글 추천 INSERT 처리 중 ERROR", err);
            if(err.code === 'ER_DUP_ENTRY') {
                res.send('duplicate');
            }
        }else{
            res.send('success');
        }
    });
});

app.post('/api/community/thumbsDown', async (req, res) => {
    const { viewType, userId, postId } = req.body;

    const sqlQuery = "DELETE FROM teaform_db.recommendations WHERE viewType = ? AND userId = ? AND postId = ?";
    db.query(sqlQuery, [viewType, userId, postId], (err, result) => {
        if(err) {
            console.log("커뮤니티 글 추천 DELETE 처리 중 ERROR", err);
        }else{
            res.send('success');
        }
    });
});

app.get('/api/community/opinionCheckThumbsUp', async (req, res) => {
    const { viewType, userId, postId } = req.query;

    const sqlQuery = "SELECT EXISTS (SELECT 1 FROM teaform_db.recommendations WHERE viewType = ? AND userId = ? AND postId = ?) AS hasThumbedUp";
    db.query(sqlQuery, [viewType, userId, postId], (err, result) => {
        if(err) {
            console.log("커뮤니티 의견공유 추천여부 조회 중 ERROR", err);
        }else{
            const hasThumbedUp = result[0].hasThumbedUp;
            res.json({hasThumbedUp: hasThumbedUp}); // 1: 추천 있음, 0: 추천 없음
        }
    });
});

app.get('/api/community/resourceCheckThumbsUp', async (req, res) => {
    const { viewType, userId, postId } = req.query;

    const sqlQuery = "SELECT EXISTS (SELECT 1 FROM teaform_db.recommendations WHERE viewType = ? AND userId = ? AND postId = ?) AS hasThumbedUp";
    db.query(sqlQuery, [viewType, userId, postId], (err, result) => {
        if(err) {
            console.log("커뮤니티 자료공유 추천여부 조회 중 ERROR", err);
        }else{
            const hasThumbedUp = result[0].hasThumbedUp;
            res.json({hasThumbedUp: hasThumbedUp}); // 1: 추천 있음, 0: 추천 없음
        }
    });
});

app.post("/api/community/saveResourceSharing", async (req, res) => {
    const { userId, userName, schoolCode, rsCategory, rsTitle, rsContent, fileName, fileUrl, category } = req.body;

    const sqlQuery = "INSERT INTO teaform_db.uploadFile (userId, schoolCode, category, fileName, fileUrl) VALUES (?,?,?,?,?)";
    db.query(sqlQuery, [userId, schoolCode, category, fileName, fileUrl], (err, result) => {
        if(err) {
            console.log("자료공유 업로드 파일 정보 INSERT 처리 중 ERROR", err);
        }else{
            const sqlQuery2 = "INSERT INTO teaform_db.resourceSharing (userId, userName, schoolCode, rsCategory, rsTitle, rsContent, fileName, fileUrl) VALUES (?,?,?,?,?,?,?,?)"
            db.query(sqlQuery2, [userId, userName, schoolCode, rsCategory, rsTitle, rsContent, fileName, fileUrl], (err, result) => {
                if(err) {
                    console.log("자료공유 글 INSERT 처리 중 ERROR", err);
                }else{
                    res.send('success');
                }
            });
        }
    });
});

app.get('/api/community/getResourceSharing', async (req, res) => {
    const sqlQuery = "SELECT rs.*, COUNT(rec.postId) AS recommendationCount FROM teaform_db.resourceSharing AS rs LEFT JOIN teaform_db.recommendations AS rec ON rs.id = rec.postId GROUP BY rs.id ORDER BY rs.createdAt DESC";
    
    db.query(sqlQuery, [], (err, result) => {
        if(err) {
            console.log("커뮤니티 자료공유 글 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

server.listen(PORT, () => {
// server.listen(8002, '0.0.0.0', () => {
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

        const handleSendVisitRequest = (data) => {
            io.emit('broadcastVisitRequest', {message: data.message });
        }
    
        socket.on('sendBedStatus', handleSendBedStatus);
        socket.on('sendWorkStatus', handleSendWorkStatus);
        socket.on('sendVisitRequest', handleSendVisitRequest);
    
        socket.on('disconnect', () => {
            console.log("클라이언트가 소켓 연결을 해제했습니다.");
            connectedSockets.delete(socket.id);
        });
    
        socket.on('error', (error) => {
            console.error("소켓 오류:", error);
        });
    }
});

startMedicineScheduler();