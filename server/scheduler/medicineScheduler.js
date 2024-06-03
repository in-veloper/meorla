const mysqlPromise = require('mysql2/promise');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');

const dbConfig = {
    // host: 'localhost',
    host: '223.130.130.53',
    user: 'root',
    // password: 'yeeh01250412!@',
    password: 'Yeeh01250412!@',
    database: 'teaform_db'
};

const medicineApiUrl = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';
const grainMedicineApiUrl = 'http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01';

async function getMedicineUpdateDeFromDB() {
    const connection = await mysqlPromise.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT MAX(updateDe) AS updateDe FROM teaform_db.medicineApiData');

        if(rows.length > 0 && rows[0].updateDe) {
            const updateDe = rows[0].updateDe;
            return updateDe;
        }else{
            console.log('DB에 등록된 약품 정보 없음');
            return 0;
        }
    } catch (error) {
        console.log('DB에서 약품 조회 최종 수정일 조회 중 ERROR', error);
        return 0;
    } finally {
        connection.end();
    }
};

async function getGrainMedicineChangeDateFromDB() {
    const connection = await mysqlPromise.createConnection(dbConfig);

    try {
        const [rows] = await connection.execute('SELECT MAX(CHANGE_DATE) AS CHANGE_DATE FROM teaform_db.grainMedicineApiData');

        if(rows.length > 0 && rows[0].CHANGE_DATE) {
            const changeDate = rows[0].CHANGE_DATE;
            return changeDate;
        }else{
            console.log('DB에 등록된 낱알 약품 정보 없음');
            return 0;
        }
    } catch (error) {
        console.log('DB에서 낱알 약품 조회 최종 수정일 조회 중 ERROR', error);
        return 0;
    } finally {
        connection.end();
    }
};

async function fetchMedicineApiData() {
    try {
        const response = await axios.get(medicineApiUrl, {
            params: {
                serviceKey: "keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==",
                type: "json"
            }
        });
    
        if(response.data.hasOwnProperty('body')) {
            const totalCount = response.data.body.totalCount;               // 검색 결과 총 수
            const totalPages = calculateTotalPages(totalCount);             // 검색결과에 따른 총 페이지 수
            const allResults = [];                                          // 모든 결과 할당 변수
            const requests = [];

            for(let page = 1; page <= totalPages; page++) {                 // 페이지에 따른 결과 출력
                requests.push(axios.get(medicineApiUrl, {
                    params: {
                    serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
                    pageNo: page,                                                 // 페이지 수
                    numOfRows: 100,                                               // Row 수
                    type: 'json'                                                  // 조회 시 Return 받을 데이터 Type
                    }
                }));
            }

            const responses = await Promise.all(requests);
            responses.forEach(response => {
                if(response.data.hasOwnProperty('body')) {
                    allResults.push(...response.data.body.items);
                }
            });

            return allResults;
        }
    } catch (error) {
        console.log('약품정보 (e약은요) API 호출 -> 데이터 조회 중 ERROR', error);
    }
};

async function fetchGrainMedicineApiData() {
    try {
        const response = await axios.get(grainMedicineApiUrl, {
            params: {
                serviceKey: "keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==",
                type: "json"
            }
        });
        
        if(response.data.hasOwnProperty('body')) {
            const totalCount = response.data.body.totalCount;               // 검색 결과 총 수
            const totalPages = calculateTotalPages(totalCount);             // 검색결과에 따른 총 페이지 수
            const allResults = [];                                          // 모든 결과 할당 변수
            const requests = [];

            for(let page = 1; page <= totalPages; page++) {                 // 페이지에 따른 결과 출력
                requests.push(axios.get(grainMedicineApiUrl, {
                    params: {
                        serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
                        pageNo: page,                                                 // 페이지 수
                        numOfRows: 100,                                               // Row 수
                        type: 'json'                                                  // 조회 시 Return 받을 데이터 Type
                    }
                }));
            }
            
            const responses = await Promise.all(requests);
            responses.forEach(response => {
                if(response.data.hasOwnProperty('body')) {
                    allResults.push(...response.data.body.items);
                }
            });
            
            return allResults;
        }
    } catch (error) {
        console.log("낱알 약품정보 API 호출 -> 데이터 조회 중 ERROR", error);
    }
};

async function updateMedicineApiData(fetchedData) {
    const connection = await mysqlPromise.createConnection(dbConfig);

    try {
        for (const item of fetchedData) {
            await connection.execute(
                'INSERT INTO teaform_db.medicineApiData (entpName, itemName, itemSeq, efcyQesitm, useMethodQesitm, atpnWarnQesitm, atpnQesitm, intrcQesitm, seQesitm, depositMethodQesitm, openDe, updateDe, itemImage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [item.entpName, item.itemName, item.itemSeq, item.efcyQesitm, item.useMethodQesitm, item.atpnWarnQesitm, item.atpnQesitm, item.intrcQesitm, item.seQesitm, item.depositMethodQesitm, item.openDe, item.updateDe, item.itemImage]
            );
        }

        console.log('약품 정보 (e약은요) UPDATE 완료');
    } catch (error) {
        console.error('약품 정보 (e약은요) UPDATE 처리 중 ERROR', error);
    } finally {
        connection.end();
    }
};

async function updateGrainMedicineApiData(fetchedData) {
    const connection = await mysqlPromise.createConnection(dbConfig);

    try {
        for (const item of fetchedData) {
            await connection.execute(
                'INSERT INTO teaform_db.grainMedicineApiData (ITEM_SEQ, ITEM_NAME, ENTP_SEQ, ENTP_NAME, CHART, ITEM_IMAGE, PRINT_FRONT, PRINT_BACK, DRUG_SHAPE, COLOR_CLASS1, COLOR_CLASS2, LINE_FRONT, LINE_BACK, LENG_LONG, LENG_SHORT, THICK, IMG_REGIST_TS, CLASS_NO, CLASS_NAME, ETC_OTC_NAME, ITEM_PERMIT_DATE, FORM_CODE_NAME, MARK_CODE_FRONT_ANAL, MARK_CODE_BACK_ANAL, MARK_CODE_FRONT_IMG, MARK_CODE_BACK_IMG, CHANGE_DATE, MARK_CODE_FRONT, MARK_CODE_BACK, ITEM_ENG_NAME, EDI_CODE) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [item.ITEM_SEQ, item.ITEM_NAME, item.ENTP_SEQ, item.ENTP_NAME, item.CHART, item.ITEM_IMAGE, item.PRINT_FRONT, item.PRINT_BACK, item.DRUG_SHAPE, item.COLOR_CLASS1, item.COLOR_CLASS2, item.LINE_FRONT, item.LINE_BACK, item.LENG_LONG, item.LENG_SHORT, item.THICK, item.IMG_REGIST_TS, item.CLASS_NO, item.CLASS_NAME, item.ETC_OTC_NAME, item.ITEM_PERMIT_DATE, item.FORM_CODE_NAME, item.MARK_CODE_FRONT_ANAL, item.MARK_CODE_BACK_ANAL, item.MARK_CODE_FRONT_IMG, item.MARK_CODE_BACK_IMG, item.CHANGE_DATE, item.MARK_CODE_FRONT, item.MARK_CODE_BACK, item.ITEM_ENG_NAME, item.EDI_CODE]
            );
        }

        console.log('낱알 약품 정보 UPDATE 완료');
    } catch (error) {
        console.error('낱알 약품 정보 UPDATE 처리 중 ERROR', error);
    } finally {
        connection.end();
    }
};

async function getMedicineMaxUpdateDe(fetchedData) {
    let maxUpdateDe = new Date(0); // 초기 값으로 가장 작은 날짜 설정

    // fetchedData 배열을 순회하면서 updateDe가 가장 큰 값을 찾음
    fetchedData.forEach(item => {
        const itemUpdateDe = new Date(item.updateDe);
        if (itemUpdateDe > maxUpdateDe) {
            maxUpdateDe = itemUpdateDe;
        }
    });

    return maxUpdateDe;
};

async function getGrainMedicineMaxChangeDate(fetchedData) {
    let maxChangeDate = new Date(0); // 초기 값으로 가장 작은 날짜 설정

    // fetchedData 배열을 순회하면서 updateDe가 가장 큰 값을 찾음
    fetchedData.forEach(item => {
        const itemChangeDate = new Date(item.CHANGE_DATE);
        if (itemChangeDate > maxChangeDate) {
            maxChangeDate = itemChangeDate;
        }
    });

    return maxChangeDate;
};

// 약품정보 (e약은요) 획득 Scheduler (매일 자정 실행)
const medicineTask = cron.schedule('0 0 * * *', async () => {
    console.log('약품정보 (e약은요) DB UPDATE SCHEDULER 시작');
    const updateDeFromDB = await getMedicineUpdateDeFromDB();
    const fetchedMedicineData = await fetchMedicineApiData();
    const maxUpdateDe = await getMedicineMaxUpdateDe(fetchedMedicineData);

    try {
        const currentDateTime = new Date().toISOString().slice(0, 10);
        const maxUpdateDeDate = new Date(maxUpdateDe).toISOString().slice(0, 10);
        
        if(updateDeFromDB === 0 || moment(maxUpdateDeDate).isAfter(currentDateTime)) {
            updateMedicineApiData(fetchedMedicineData);
        }
    } catch (error) {
        console.error('약품정보 UPDATE SCHEDULER 실행 중 ERROR', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Seoul"
});

// 낱알 약품정보 (e약은요) 획득 Scheduler (매일 자정 실행)
const grainMedicineTask = cron.schedule('0 0 * * *', async () => {
    console.log('낱알 약품정보 DB UPDATE SCHEDULER 시작');
    const changeDateFromDB = await getGrainMedicineChangeDateFromDB();
    const fetchedGrainMedicineData = await fetchGrainMedicineApiData();
    const maxChangeDate = await getGrainMedicineMaxChangeDate(fetchedGrainMedicineData);

    try {
        const currentDateTime = new Date().toISOString().slice(0, 10);
        const maxChangeConvertDate = new Date(maxChangeDate).toISOString().slice(0, 10);
        
        if(changeDateFromDB === 0 || moment(maxChangeConvertDate).isAfter(currentDateTime)) {
            updateGrainMedicineApiData(fetchedGrainMedicineData)
        }
    } catch (error) {
        console.error('낱알 약품정보 UPDATE SCHEDULER 실행 중 ERROR', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Seoul"
});

 // 검색 결과 총 페이지 수 계산 Function
const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / 100); // 페이지당 보여질 개수 100 Row로 Divide
};


const startMedicineScheduler = () => {
    medicineTask.start();
    grainMedicineTask.start();
};

module.exports = {
    startMedicineScheduler
}