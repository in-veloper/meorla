// import axios from 'axios';
// import React, { createContext, useContext, useEffect, useState } from 'react';

// const MedicineContext = createContext();
// const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

// export const MedicineProvider = ({ children }) => {
//     const [medicineData, setMedicineData] = useState(null);
//     const [grainMedicineAllResult, setGrainMedicineAllResult] = useState(null);

//     const fetchMedicineData = async () => {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 const response = await axios.get(URL, {
//                     params: {
//                         serviceKey: "keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==",
//                         type: "json"
//                     }
//                 });
            
//                 if(response.data.hasOwnProperty('body')) {
//                     const totalCount = response.data.body.totalCount;               // 검색 결과 총 수
//                     const totalPages = calculateTotalPages(totalCount);             // 검색결과에 따른 총 페이지 수
//                     const allResults = [];                                          // 모든 결과 할당 변수
//                     const requests = [];
    
//                     for(let page = 1; page <= totalPages; page++) {                 // 페이지에 따른 결과 출력
//                         requests.push(axios.get(URL, {
//                             params: {
//                             serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
//                             pageNo: page,                                                 // 페이지 수
//                             numOfRows: 100,                                               // Row 수
//                             type: 'json'                                                  // 조회 시 Return 받을 데이터 Type
//                             }
//                         }));
//                     }
    
//                     const responses = await Promise.all(requests);
//                     responses.forEach(response => {
//                         if(response.data.hasOwnProperty('body')) {
//                             allResults.push(...response.data.body.items);
//                         }
//                     });
    
//                     setMedicineData(allResults);
//                     resolve();
//                 }
//             } catch (error) {
//                 console.log("약품 정보 조회 중 ERROR", error);
//                 reject();
//             }
//         });
//     };

//     const fetchGrainMedicine = async () => {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 const response = await axios.get("http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01", {
//                     params: {
//                         serviceKey: "keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==",
//                         type: "json"
//                     }
//                 });
                
//                 if(response.data.hasOwnProperty('body')) {
//                     const totalCount = response.data.body.totalCount;               // 검색 결과 총 수
//                     const totalPages = calculateTotalPages(totalCount);             // 검색결과에 따른 총 페이지 수
//                     const allResults = [];                                          // 모든 결과 할당 변수
//                     const requests = [];

//                     for(let page = 1; page <= totalPages; page++) {                 // 페이지에 따른 결과 출력
//                         requests.push(axios.get("http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01", {
//                             params: {
//                                 serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
//                                 pageNo: page,                                                 // 페이지 수
//                                 numOfRows: 100,                                               // Row 수
//                                 type: 'json'                                                  // 조회 시 Return 받을 데이터 Type
//                             }
//                         }));
//                     }
                    
//                     const responses = await Promise.all(requests);
//                     responses.forEach(response => {
//                         if(response.data.hasOwnProperty('body')) {
//                             allResults.push(...response.data.body.items);
//                         }
//                     });
                    
//                     setGrainMedicineAllResult(allResults);
//                     resolve();
//                 }
//             } catch (error) {
//                 console.log("약품 낱알정보 조회 중 ERROR", error);
//                 reject();
//             }
//         });
//     };

//     useEffect(() => {
//         Promise.all([fetchMedicineData(), fetchGrainMedicine()])
//         .then(() => console.log("두 함수 모두 호출 완료"))
//         .catch(error => console.error("하나 이상 호출 중 ERROR", error));
//     }, []);

//       // 검색 결과 총 페이지 수 계산 Function
//     const calculateTotalPages = (totalCount) => {
//         return Math.ceil(totalCount / 100); // 페이지당 보여질 개수 100 Row로 Divide
//     };

//     return (
//         <MedicineContext.Provider value={{ medicineData, grainMedicineAllResult }}>
//             {children}
//         </MedicineContext.Provider>
//     );
// };

// export const useMedicineContext = () => useContext(MedicineContext);