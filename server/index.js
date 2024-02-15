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
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
                            email: user.email,
                            commonPassword: user.commonPassword,
                            workStatus: user.workStatus,
                            bedCount: user.bedCount
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
})

app.post("/user/insert", async (req, res) => {
    const schoolName = req.body.schoolName;
    const name = req.body.name;
    const email = req.body.email;
    const userId = req.body.userId;
    const password = req.body.password;
    const schoolCode = req.body.schoolCode;
    const refresh_token = req.body.refresh_token;
    const commonPassword = req.body.commonPassword;

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const sqlQuery = "INSERT INTO teaform_db.users (schoolName, name, email, userId, password, schoolCode, refresh_token, commonPassword) VALUES (?,?,?,?,?,?,?,?)";
    db.query(sqlQuery, [schoolName, name, email, userId, hashPassword, schoolCode, refresh_token, commonPassword], (err, result) => {
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
    console.log(req.query)
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

    const sqlQuery = "SELECT medicineName AS medication FROM teaform_db.stockMedicine WHERE userId = ? AND schoolCode = ?";
    db.query(sqlQuery, [userId, schoolCode], (err, result) => {
        if(err) {
            console.log("보건일지 > 재고 약품 조회 중 ERROR", err);
        }else{
            res.json(result);
        }
    });
});

app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
});