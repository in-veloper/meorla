import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, CardBody, CardFooter, Label, Input, Button, Badge, CardHeader, Form, FormGroup } from "reactstrap";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { BrowserView, MobileView, TabletView, isBrowser, isIOS, isTablet } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import { getSocket } from "components/Socket/socket";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import moment from "moment";
import axios from "axios";
import Neis from "@my-school.info/neis-api";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { RiSearchLine } from "react-icons/ri";
import "../assets/css/request.css";
import mainLogoWhite from "../assets/img/main_header_logo_white.png";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const neis = new Neis({ KEY : "1addcd8b3de24aa5920d79df1bbe2ece", Type : "json" });

// Local Storage에 로그인 정보 저장
const saveLoginInfoToSessionStorage = (schoolName, password) => {
    const loginInfo = { schoolName, password };
    sessionStorage.setItem("loginInfo", JSON.stringify(loginInfo));
};

// Local Storage에서 로그인 정보 획득
const getLoginInfoFromSessionStorage = () => {
    const storedLoginInfo = sessionStorage.getItem("loginInfo");
    return storedLoginInfo ? JSON.parse(storedLoginInfo) : null;
};

// Local Storage에서 로그인 정보 제거
const removeLoginInfoFromSessionStorage = () => {
    sessionStorage.removeItem("loginInfo");
    sessionStorage.removeItem("authenticated");
};

// 보건교사가 가입되지 않은 학교일 경우 에러 -> 처리 필요
function RequesterLogin({onLogin}) {
    const navigate = useNavigate();
    const [schoolName, setSchoolName] = useState("");           // 입력한 학교명
    const [schoolCode, setSchoolCode] = useState("");           // 입력한 학교명과 일치하는 학교 코드
    const [schoolList, setSchoolList] = useState([]);           // 검색 결과 학교 리스트
    const [dynamicOptions, setDynamicOptions] = useState([]);   // 학교 검색 시 Typeahead options에 값 Setting 위함
    const [password, setPassword] = useState("");               // 입력한 Password
    const [schoolCodeByParams, setSchoolCodeByParams] = useState("");
    const [schoolInfoByParams, setSchoolInfoByParams] = useState(null);

    const params = useParams();

    useEffect(() => {
        const schoolCode = params['*'];
        setSchoolCodeByParams(schoolCode);
    }, [params]);

    useEffect(() => {
        if(schoolCodeByParams) {
            searchSchoolCodeByParams(schoolCodeByParams);
        }
    }, [schoolCodeByParams]);

    const searchSchoolCodeByParams = async (code) => {
        try {
            const response = await neis.getSchoolInfo({ SD_SCHUL_CODE: code }, { pIndex: 1, pSize: 1 });
            if(response.length > 0)  {
                setSchoolName(response[0].SCHUL_NM);
                setSchoolInfoByParams(response[0]);
            }
        } catch (error) {
            // 로그인 페이지가 아니라 404 처리 필요 (일치하는 학교명으로 조회할 수 없다는 메시지 필요)
            navigate('/');
            console.log("Parameter 유입 학교 코드로 학교명 검색중 ERROR", error);
        }
    };


    useEffect(() => {
        const storedLoginInfo = getLoginInfoFromSessionStorage();
        if (storedLoginInfo) {
            // 이미 로그인된 상태라면 저장된 정보를 사용
            setSchoolName(storedLoginInfo.schoolName);
            setPassword(storedLoginInfo.password);
        }
    }, []);

    useEffect(() => {
        if (schoolName) {
            try {
                const searchOptions = schoolList.map((school) => school.SCHUL_NM);     // 학교명 검색 및 결과에서 학교 이름만 추출하여 배열 생성
                setDynamicOptions(searchOptions);                                      // 검색 결과 Option 값에 할당
            } catch (error) {
                console.log("학교명 검색 중 에러", error);
            }
        } else {
            setDynamicOptions([]);                                                     // 검색어가 없을 경우 빈 배열로 초기화
        }
    }, [schoolName, schoolList]);

    // 입력 학교 (+ 필요 데이터) 검색 Function
    const searchSchool = async (input) => {
        const searchKeyword = input;                            // Input에 검색어 입력 시 searchKeyword 변수에 할당
        setSchoolName(searchKeyword);                           // 입력한 학교명으로 schoolName Update
    
        if (searchKeyword) {                                    // 입력한 검색어 존재하는 경우
            try {
                const response = await neis.getSchoolInfo({ SCHUL_NM: searchKeyword }, { pIndex: 1, pSize: 100 });  // neis API 입력된 검색어를 Parameter로 호출
                
                if (response.length > 20) setSchoolList([]);    // 조회결과 20개 초과할 경우 빈 배열 초기화 (많은 양의 결과 출력 시 View 이상)
                else setSchoolList(response);                   // 조회결과 20개 이내일 경우 Option으로 출력 위해 schoolList 변수에 할당
                
            } catch (error) {
                console.log("보건실 사용 요청 > 학교검색 중 ERROR", error);
            }
        } else {
            setSchoolList([]);                                  // 입력한 검색어 존재하지 않을 경우 빈 배열로 초기화
        }
    };

    // 검색 항목 중 학교 선택 Function
    const handleSchoolSelect = (selectedSchool) => {
        if(schoolList.length > 0) {
            setSchoolName(schoolList[0].SCHUL_NM);
            setSchoolCode(schoolList[0].SD_SCHUL_CODE);
        }
        setSchoolList([]);
    };

    const handleLogin = async () => {
        const schoolCode = params['*'];
        let commonPassword = "";

        if(schoolName && schoolCode) {
            const response = await axios.get(`${BASE_URL}/api/request/getCommonPassword`, {
                params: {
                    schoolCode: schoolCode,
                    schoolName: schoolName
                }
            });

            if(response.data) commonPassword = response.data[0].commonPassword;
        }
        
        if(password === commonPassword) {
            onLogin(true);
            saveLoginInfoToSessionStorage(schoolName, password);
        }else{
            alert("비밀번호가 일치하지 않습니다.");
        }
    };

    const [contentHeight, setContentHeight] = useState("auto");

    useEffect(() => {
        function handleResize() {
            if(window.innerWidth <= 768) {
                const height = window.innerHeight;
                setContentHeight(height);
            }else{
                setContentHeight("auto");
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isIpad = () => {
        return /iPad|Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document;
    };

    if (isIpad()) {
        return (
            <div className="content d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f6f5f7' }}>
                <Card style={{ width: '400px', height: 'auto' }}>
                    <CardBody className="text-center">
                        <h4><b>iPad 사용 제한</b></h4>
                        <p>MEORLA 서비스는</p>
                        <p>학생들의 무단 사용을 방지하기 위해 iPad에서 사용할 수 없습니다</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (isTablet) {
        return (
            <div className="content d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f6f5f7' }}>
                <Card style={{ width: '400px', height: 'auto' }}>
                    <CardBody className="text-center">
                        <h4><b>태블릿 사용 제한</b></h4>
                        <p>MEORLA 서비스는</p>
                        <p>학생들의 무단 사용을 방지하기 위해 태블릿에서 사용할 수 없습니다</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="content d-flex justify-content-center align-items-center" style={{ height: isBrowser ? '100vh' : contentHeight, backgroundColor: '#f6f5f7' }}>
                <BrowserView>
                    <Card style={{ width: '400px', height: 'auto' }}>
                        <CardBody className="text-center">
                            <h4><b>서비스 준비중</b></h4>
                            <p>PC로 접속하는 보건실 방문 요청 페이지는</p>
                            <p>현재 서비스 준비중입니다</p>
                            <p>빠른 시일 내에 준비될 수 있도록 하겠습니다</p>
                        </CardBody>
                    </Card>
                    {/* <Card style={{ width: '400px', height: 'auto' }}>
                        <CardBody className="mt-2">
                            <Row className="mt-2 align-items-center">    
                                <Col md="4" className="text-center">
                                    <Label>학교명</Label>
                                </Col>
                                <Col md="8">
                                    <div style={{ width: '93%'}}>
                                        <Typeahead
                                            id="basic-typeahead-single"
                                            labelKey="name"
                                            onChange={handleSchoolSelect}
                                            options={dynamicOptions}
                                            placeholder="소속학교"
                                            onInputChange={(input) => {
                                                searchSchool(input);
                                            }}
                                            selected={[{ name: schoolName }]}
                                            emptyLabel="검색 결과가 없습니다."
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-3 align-items-center">
                                <Col md="4" className="text-center">
                                    <Label>비밀번호</Label>
                                </Col>
                                <Col md="8">
                                    <Input type="password" placeholder="학교 공통 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '93%' }}/>
                                </Col>
                            </Row>
                            <Row className="d-flex align-items-center no-gutters mt-3">
                                <div className="p-2 text-muted align-items-center text-center" style={{ border: '1px dashed lightgrey', width: '100%', fontSize: 12, borderRadius: 5, backgroundColor: '#fcfcfc' }}>
                                    <span>학교 공통 비밀번호를 모르는 경우<br/>보건교사님께 문의하세요</span>
                                </div>
                            </Row>
                        </CardBody>
                        <CardFooter className="mb-2">
                            <Row className="d-flex justify-content-center align-items-center">
                                <Button className="mr-1" onClick={handleLogin}>로그인</Button>
                                <Button className="ml-1">초기화</Button>
                            </Row>
                        </CardFooter>
                    </Card> */}
                </BrowserView>

                <MobileView>
                    <Card className="p-2">
                        <Row className="d-flex align-items-center justify-content-center">
                            <img className="mr-2" src={mainLogoWhite} alt="logo" style={{ width: 50, height: 50}}/>
                            <b style={{ color: '#66615B', fontSize: 20 }}>MEORLA</b>
                        </Row>
                    </Card>
                    <Card style={{ height: 'auto' }}>
                        <CardBody className="mt-2">
                            <Row className="mt-2 align-items-center">    
                                <Col xs="4" className="text-center">
                                    <Label>학교명</Label>
                                </Col>
                                <Col xs="8">
                                    <div style={{ width: '93%' }}>
                                        <Typeahead
                                            id="basic-typeahead-single"
                                            labelKey="name"
                                            onChange={handleSchoolSelect}
                                            options={dynamicOptions}
                                            placeholder="소속학교"
                                            onInputChange={(input) => {
                                                searchSchool(input);
                                            }}
                                            selected={[{ name: schoolName }]}
                                            emptyLabel="검색 결과가 없습니다."
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-3 align-items-center">
                                <Col xs="4" className="text-center">
                                    <Label>비밀번호</Label>
                                </Col>
                                <Col xs="8">
                                    <Input type="password" placeholder="학교 공통 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '93%' }}/>
                                </Col>
                            </Row>
                            <Row className="d-flex align-items-center no-gutters mt-3">
                                <div className="p-2 text-muted align-items-center text-center" style={{ border: '1px dashed lightgrey', width: '100%', fontSize: 12, borderRadius: 5, backgroundColor: '#fcfcfc' }}>
                                    <span>학교 공통 비밀번호를 모르는 경우<br/>보건교사님께 문의하세요</span>
                                </div>
                            </Row>
                        </CardBody>
                        <CardFooter className="mb-2">
                            <Row className="d-flex justify-content-center align-items-center">
                                <Button className="mr-1" onClick={handleLogin}>로그인</Button>
                                <Button className="ml-1">초기화</Button>
                            </Row>
                        </CardFooter>
                    </Card>
                </MobileView>
            </div>
        </>
    )
}

function Request({onLogOut}) {
    const [schoolCode, setSchoolCode] = useState("");
    const [currentInfo, setCurrentInfo] = useState(null);
    const [onBedRestInfo, setOnBedRestInfo] = useState(null);
    const [renderBedRest, setRenderBedRest] = useState(false);
    const [renderWorkStatus, setRenderWorkStatus] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState({ iGrade: "", iClass: "", iNumber: "", iName: "" });
    const [searchStudentRowData, setSearchStudentRowData] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [personalStudentRowData, setPersonalStudentRowData] = useState([]);
    const [selectedTeacherClassification, setSelectedTeacherClassification] = useState("hr");
    const [workNoteData, setWorkNoteData] = useState([]);
    const [originalVisitListRowData, setOriginalVisitListRowData] = useState([]);
    const [visitListRowData, setVisitListRowData] = useState([]);
    const [originalBedRestRowData, setOriginalBedRestRowData] = useState([]);
    const [bedRestRowData, setBedRestRowData] = useState([]);

    const searchStudentGridRef = useRef(null);
    const visitListGridRef = useRef(null);
    const bedRestGridRef = useRef(null);

    const visitTimeRenderer = (params) => {
        let visitTime = params.data.visitDateTime;
        const formattedVisitTime = moment(visitTime, 'HH:mm:ss').format('A h:mm').replace('AM', '오전').replace('PM', '오후');
        return formattedVisitTime
    };

    const visitDateRenderer = (params) => {
        let visitDate = params.data.visitDateTime;
        const formattedVisitDate = moment(visitDate).format('YYYY년 M월 D일');
        return formattedVisitDate;
    };

    const bedRestTimeRenderer = (params) => {
        let bedRestStartTime = params.data.onBedStartTime;
        let bedRestEndTime = params.data.onBedEndTime;
        const formattedBedRestStartTime = moment(bedRestStartTime, 'HH:mm').format('A h:mm').replace('AM', '오전').replace('PM', '오후');
        const formattedBedRestEndTime = moment(bedRestEndTime, 'HH:mm').format('A h:mm').replace('AM', '오전').replace('PM', '오후');
        return formattedBedRestStartTime + " ~ " + formattedBedRestEndTime;
    };

    const bedRestDateRenderer = (params) => {
        let visitDate = params.data.visitDateTime.split(' ')[0];
        const formattedVisitDate = moment(visitDate).format('YYYY년 M월 D일');
        return formattedVisitDate;
    };

    const [searchStudentColumnDefs] = useState([
        { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
        { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
        { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
        { field: "sName", headerName: "이름", flex: 1.3, cellStyle: { textAlign: "center" }}
    ]);

    const [visitListColumnDefs] = useState([
        { field: "visitTime", headerName: "방문시간", flex: 1.5, cellStyle: { textAlign: "center" }, cellRenderer: visitTimeRenderer },
        { field: "visitDate", headerName: "방문일자", flex: 2, cellStyle: { textAlign: "center" }, cellRenderer: visitDateRenderer }
    ]);

    const [bedRestColumnDefs] = useState([
        { field: "bedRestTime", headerName: "침상안정 시간", flex: 2.5, cellStyle: { textAlign: "center" }, cellRenderer: bedRestTimeRenderer },
        { field: "bedRestDate", headerName: "침상안정 일자", flex: 2, cellStyle: { textAlign: "center" }, cellRenderer: bedRestDateRenderer }
    ]);

    const notEditDefaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

    const params = useParams();
    
    useEffect(() => {
        if(params) setSchoolCode(params['*']);
    }, []);

    useEffect(() => {
        const socket = getSocket();

        const connectedSockets = new Set();

        if(!connectedSockets.has(socket.id)) {
            connectedSockets.add(socket.id);

            const handleBroadcastBedStatus = (data) => {
                const bcMessage = data.message;
                const bcStatus = bcMessage.split('::')[0];
                const studentInfo = bcMessage.split('::')[1];
                const targetGrade = studentInfo.split(',')[0];
                const targetClass = studentInfo.split(',')[1];
                const targetNumber = studentInfo.split(',')[2];
                const targetName = studentInfo.split(',')[3];

                let infoMessage = "";

                if(bcStatus === "registBed") infoMessage = targetGrade + "학년 " + targetClass + "반 " + targetNumber + "번 " + targetName + " 학생이<br/>" + "침상안정을 시작하였습니다";
                else if(bcStatus === "endBed") infoMessage = targetGrade + "학년 " + targetClass + "반 " + targetNumber + "번 " + targetName + " 학생이<br/>" + "침상안정을 종료하였습니다";
                
                NotiflixInfo(infoMessage, true, '230px');

                setRenderBedRest(true);
            };

            const handleBroadcastWorkStatus = (data) => {
                const workStatus = data.message;

                let infoMessage = "";

                if(workStatus === "working") infoMessage = "보건교사님의 상태가 온라인으로 변경되었습니다";
                else infoMessage = "보건교사님의 상태가 오프라인으로 변경되었습니다";

                let messageWidth = '250px';
                if(workStatus === "working") messageWidth = '320px';

                NotiflixInfo(infoMessage, true, messageWidth);

                setRenderWorkStatus(true);
            };
        
            socket.on('broadcastBedStatus', handleBroadcastBedStatus);
            socket.on('broadcastWorkStatus', handleBroadcastWorkStatus);
            
            // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
            return () => {
                socket.off('broadcastBedStatus', handleBroadcastBedStatus);
                socket.off('broadcastWorkStatus', handleBroadcastWorkStatus);
            };
        }
    }, []);

    const [contentHeight, setContentHeight] = useState("auto");

    useEffect(() => {
        function handleResize() {
            if(window.innerWidth <= 768) {
                const height = window.innerHeight;
                setContentHeight(height);
            }else{
                setContentHeight("auto");
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchCurrentInfo = useCallback(async () => {
        if(schoolCode) {
            const response = await axios.get(`${BASE_URL}/api/request/getCurrentInfo`, {
                params: {
                    schoolCode: schoolCode
                }
            });

            if(response.data) setCurrentInfo(response.data[0]);
        }

        if(renderWorkStatus) setRenderWorkStatus(false);
    }, [schoolCode, renderWorkStatus]);

    useEffect(() => {
        fetchCurrentInfo();
    }, [fetchCurrentInfo]);

    const fetchOnBedRestInfo = useCallback(async () => {
        const today = moment().format('YYYY-MM-DD');

        if(schoolCode) {
            const response = await axios.get(`${BASE_URL}/api/request/getOnBedRestInfo`, {
                params: {
                    schoolCode: schoolCode,
                    today: today
                }
            });

            if(response.data) setOnBedRestInfo(response.data);
        }

        if(renderBedRest) setRenderBedRest(false);
    }, [schoolCode, renderBedRest]);

    useEffect(() => {
        fetchOnBedRestInfo();
    }, [fetchOnBedRestInfo]);

    const workStatusInfo = () => {
        let convertedWorkStatus = "";
        if(currentInfo) {
            const workStatus = currentInfo.workStatus;
            if(workStatus === "working") convertedWorkStatus = "온라인";
            else convertedWorkStatus = "오프라인";
        }

        return convertedWorkStatus;
    };

    const generateBedBox = () => {
        if(onBedRestInfo && onBedRestInfo.length > 0) {
            return onBedRestInfo.map((item, index) => (
                <div key={index} className="ml-1 mr-1">
                    <Card className="p-2 text-muted text-center" style={{ border: '1.5px solid lightgrey', fontSize: 11, backgroundColor: '#F5F1E7' }}>
                        <span className="flex-nowrap">{item.sGrade}학년 {item.sClass}반 {item.sNumber}번</span><span><b>{item.sName}</b></span>
                        <span className="flex-nowrap">{item.onBedStartTime} ~ {item.onBedEndTime}</span>
                    </Card>

                </div>
            ));
        }else{
            return <div className="text-center w-100">
                        <span className="text-muted">현재 침상안정중인 학생이 없습니다</span>
                   </div>
        };
         
    };

    const onInputChange = (field, value) => {
        setSearchCriteria((prevCriteria) => ({
          ...prevCriteria,
          [field]: value
        }));
    };

    const onResetSearch = () => {
        const api = searchStudentGridRef.current.api;
        setSearchCriteria({ iGrade: "", iClass: "", iNumber: "", iName: "" });
        api.setRowData([]);
        setSelectedStudent('');
        setPersonalStudentRowData([]);
    };
    
    const onSearchStudent = async (criteria) => {
        try {
            const studentData = await fetchStudentData(criteria);

            if (Array.isArray(studentData) && searchStudentGridRef.current) searchStudentGridRef.current.api.setRowData(studentData); // Update the grid
            setSearchStudentRowData(studentData);
        } catch (error) {
            console.error("학생 조회 중 ERROR", error);
        }
    };
    
    const handleKeyDown = (e, criteria) => {
        if(e.key === 'Enter') onSearchStudent(searchCriteria);
    };

    const fetchStudentData = async (criteria) => {
        try {
          const { iGrade, iClass, iNumber, iName } = criteria;
          
          if(schoolCode) {
            const response = await axios.get(`${BASE_URL}/api/studentsTable/getStudentInfoBySearchInRequest`, {
              params: {
                schoolCode: schoolCode,
                sGrade:  iGrade,
                sClass: iClass,
                sNumber:  iNumber,
                sName: iName
              }
            });
    
            return response.data.studentData;
          }
        } catch (error) {
          console.error("학생 정보 조회 중 ERROR", error);
          return [];
        }
    };

    const onGridSelectionChanged = (event) => {
        const selectedRow = event.api.getSelectedRows()[0];
        setSelectedStudent(selectedRow);
    
        fetchSelectedStudentData();
        
        if(selectedRow && workNoteData) {
            const filteredData = workNoteData.filter(data => 
                data.sGrade === selectedRow.sGrade &&
                data.sClass === selectedRow.sClass &&
                data.sNumber === selectedRow.sNumber &&
                data.sGender === selectedRow.sGender &&
                data.sName === selectedRow.sName
            );
            
            const filteredVisitListData = filteredData.filter(data => data.visitDateTime && data.visitDateTime.length > 0);
            const filteredBedRestData = filteredData.filter(data => data.onBedStartTime && data.onBedStartTime.length > 0 && (!data.onBedEndTime || data.onBedEndTime.length > 0));
            setOriginalVisitListRowData(filteredVisitListData);
            setVisitListRowData(filteredVisitListData);
            setOriginalBedRestRowData(filteredBedRestData);
            setBedRestRowData(filteredBedRestData);
        }
    };

    const fetchSelectedStudentData = useCallback(async () => {
        if(schoolCode && selectedStudent) {
          const response = await axios.get(`${BASE_URL}/api/workNote/getSelectedStudentData`, {
            params: {
              schoolCode: schoolCode,
              sGrade: selectedStudent.sGrade,
              sClass: selectedStudent.sClass,
              sNumber: selectedStudent.sNumber,
              sGender: selectedStudent.sGender,
              sName: selectedStudent.sName
            }
          });
          
          if(response.data) {
            const resultData = response.data.map(item => ({
              ...item,
              createdAt: new Date(item.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
              symptom: item.symptom.replace(/::/g, ', '),
              medication: item.medication.replace(/::/g, ', '),
              actionMatter: item.actionMatter.replace(/::/g, ', '),
              treatmentMatter: item.treatmentMatter.replace(/::/g, ', '),
              onBedTime: (!item.onBedStartTime && !item.onBedEndTime) ? "" :  item.onBedStartTime + " ~ " + item.onBedEndTime
            }));
    
            setPersonalStudentRowData(resultData);
          }
        }
    }, [schoolCode, selectedStudent]);
    
    useEffect(() => {
        fetchSelectedStudentData();
    }, [fetchSelectedStudentData]);

    const sendVisitRequest = async (e) => {
        e.preventDefault();
        const socket = getSocket();
        const currentTime = moment().format('HH:mm');
        
        if(selectedStudent) {
            const schoolCode = selectedStudent.schoolCode;
            const targetGrade = selectedStudent.sGrade;
            const targetClass = selectedStudent.sClass;
            const targetNumber = selectedStudent.sNumber;
            const targetName = selectedStudent.sName;
            const requestContent = document.getElementById('requestContent').value;
            const teacherName = document.getElementById('teacherName').value;

            const response = await axios.post(`${BASE_URL}/api/request/saveVisitRequest`, {
                schoolCode: schoolCode,
                targetGrade: targetGrade,
                targetClass: targetClass,
                targetNumber: targetNumber,
                targetName: targetName,
                requestContent: requestContent,
                teacherClassification: selectedTeacherClassification,
                teacherName: teacherName,
                requestTime: currentTime
            });

            if(response.data === "success") {
                if(socket) socket.emit('sendVisitRequest', { message : "visitRequest::" + targetGrade + "," + targetClass + "," + targetNumber + "," + targetName });
                resetVisitRequestForm();

                const infoMessage = "보건실 방문 요청이 정상적으로 처리되었습니다";
                NotiflixInfo(infoMessage, true, '320px');
            }
        }
    };

    const resetVisitRequestForm = () => {
        const api = searchStudentGridRef.current.api;
        api.setRowData([]);
        setSearchCriteria({ iGrade: "", iClass: "", iNumber: "", iName: "" });
        document.getElementById('requestContent').value = "";
        document.getElementById('teacherName').value = "";
        setSelectedTeacherClassification('hr');
        setSelectedStudent("");

        setVisitListRowData([]);
        setBedRestRowData([]);
    };

    const handleTeacherClassificationChange = (e) => {
        setSelectedTeacherClassification(e.target.value);
    };

    const fetchWorkNoteData = useCallback(async() => {
        const response = await axios.get(`${BASE_URL}/api/request/getWorkNoteData`, {
            params: {
                schoolCode: schoolCode
            }
        });

        if(response.data) setWorkNoteData(response.data);
    }, [schoolCode]);

    useEffect(() => {
        fetchWorkNoteData();
    }, [fetchWorkNoteData]);

    const visitListOnToday = () => {
        if(originalVisitListRowData) {
            const today = moment().format('YYYY-MM-DD');
            const filteredData = originalVisitListRowData.filter(data => {
                const visitDate = moment(data.visitDateTime).format('YYYY-MM-DD');
                return visitDate === today;
            });

            setVisitListRowData(filteredData);
        }
    };

    const visitListOnWeek = () => {
        if(originalVisitListRowData) {
            const today = moment();
            const oneWeekAgo = moment().subtract(7, 'days').startOf('day');
            const filteredData = originalVisitListRowData.filter(data => {
                const visitDate = moment(data.visitDateTime);
                return visitDate.isSameOrAfter(oneWeekAgo) && visitDate.isSameOrBefore(today);
            });

            setVisitListRowData(filteredData);
        }
    };

    const visitListOnEntire = () => {
        if(originalVisitListRowData) setVisitListRowData(originalVisitListRowData);
    };

    const bedRestListOnToday = () => {
        if(originalBedRestRowData) {
            const today = moment().format('YYYY-MM-DD');
            const filteredData = originalBedRestRowData.filter(data => {
                const visitDate = moment(data.visitDateTime).format('YYYY-MM-DD');
                return visitDate === today;
            });

            setBedRestRowData(filteredData);
        }
    };

    const bedRestListOnWeek = () => {
        if(originalBedRestRowData) {
            const today = moment();
            const oneWeekAgo = moment().subtract(7, 'days').startOf('day');
            const filteredData = originalBedRestRowData.filter(data => {
                const visitDate = moment(data.visitDateTime);
                return visitDate.isSameOrAfter(oneWeekAgo) && visitDate.isSameOrBefore(today);
            });

            setBedRestRowData(filteredData);
        }
    };

    const bedRestListOnEntire = () => {
        if(originalBedRestRowData) setBedRestRowData(originalBedRestRowData);
    };

    return(
        <>
            <div className="content" style={{ height: isBrowser ? '100vh' : contentHeight, backgroundColor: '#f6f5f7' }}>
                <BrowserView>
                    <Row>
                        <p>PC View</p>
                        <Button onClick={onLogOut}>로그아웃</Button>
                    </Row>
                </BrowserView>

                <MobileView>
                    <Card className="mb-3">
                        <Row>
                            <Col className="d-flex align-items-center justify-content-start no-gutters ml-2">
                                <img className="mr-2" src={mainLogoWhite} alt="logo" style={{ width: 35, height: 35}}/>
                                <b style={{ color: '#66615B', fontSize: 15 }}>MEORLA</b>
                            </Col>
                            <Col className="d-flex justify-content-end no-gutters mr-2">
                                <Button size="sm" onClick={onLogOut}>로그아웃</Button>
                            </Col>
                        </Row>
                    </Card>
                    <Card className="mb-2" style={{ width: '100%', height: '19vh' }}>
                        <CardHeader className="text-muted text-center pt-2" style={{ fontSize: '17px' }}>
                            <b>보건실 현황</b>
                        </CardHeader>
                        <Row className="d-flex align-items-center no-gutters justify-content-center p-1 pb-2">
                            <div className="pt-1 pb-1 pl-2 pr-2" style={{ border: '0.5px solid lightgrey', borderRadius: 5, backgroundColor: '#fcfcfc' }}>
                                <span className="text-muted font-weight-bold">보건실은 현재 </span> <Badge className="ml-2" style={{ fontSize: 13 }}>{workStatusInfo()}</Badge> <span className="text-muted font-weight-bold">&nbsp;상태입니다</span>
                            </div>
                        </Row>
                        <Row className="d-flex align-items-center no-gutters flex-nowrap p-1" style={{ verticalAlign: 'middle', height: '100%' }}>
                            {generateBedBox()}
                        </Row>
                    </Card>
                    <Card className="mb-3" style={{ width: '100%', height: '105vh', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                        <CardHeader className="text-muted text-center pt-2" style={{ fontSize: '17px' }}>
                            <b>보건실 방문 요청</b>
                        </CardHeader>
                        <CardBody className="pb-3 pt-0">
                            <Row className="d-flex align-items-center mt-3" style={{ height: 23, marginLeft: 7 }}>
                                <Col xs="auto">
                                    <Input
                                        id="hr"
                                        name="teacherClassification"
                                        type="radio"
                                        value="hr"
                                        checked={selectedTeacherClassification === "hr"}
                                        onChange={handleTeacherClassificationChange}
                                    />
                                    <Label htmlFor="hr" style={{ fontSize: 13, marginLeft: '0.3rem', color: 'black' }}>담임교사</Label>
                                </Col>
                                <Col xs="auto" style={{ }}>
                                    <Input
                                        id="sb"
                                        name="teacherClassification"
                                        type="radio"
                                        value="sb"
                                        checked={selectedTeacherClassification === "sb"}
                                        onChange={handleTeacherClassificationChange}
                                    />
                                    <Label htmlFor="sb" style={{ fontSize: 13, marginLeft: '0.3rem', color: 'black' }}>교과교사</Label>
                                </Col>
                                <Col xs="auto" className="d-flex justify-content-end" style={{ flexGrow: 1 }}>
                                    <Label style={{ fontSize: 13, color: 'black' }}>요청교사</Label>
                                    <Input
                                        id="teacherName"
                                        type="text"
                                        style={{ width: '65px', height: '27px', marginLeft: '0.5rem' }}
                                    />
                                </Col>
                            </Row>
                            <Row className="d-flex align-items-center no-gutters flex-nowrap" style={{ gap: '0.5rem'}}>
                                <Label className="pt-1" style={{ fontSize: 13, flex: '0 0 auto', color: 'black' }}>학년</Label>
                                <Input
                                    className="text-right"
                                    style={{ width: '30px', height: '27px', flex: '1 1 auto' }}
                                    onChange={(e) => onInputChange("iGrade", e.target.value)}
                                    value={searchCriteria.iGrade}
                                    onKeyDown={(e) => handleKeyDown(e, "iGrade")}
                                />
                                <Label className="pt-1" style={{ fontSize: 13, flex: '0 0 auto', color: 'black' }}>반</Label>
                                <Input
                                    className="text-right"
                                    style={{ width: '30px', height: '27px', flex: '1 1 auto' }}
                                    onChange={(e) => onInputChange("iClass", e.target.value)}
                                    value={searchCriteria.iClass}
                                    onKeyDown={(e) => handleKeyDown(e, "iClass")}
                                />
                                <Label className="pt-1" style={{ fontSize: 13, flex: '0 0 auto', color: 'black' }}>번호</Label>
                                <Input
                                    className="text-right"
                                    style={{ width: '42px', height: '27px', flex: '1 1 auto', color: 'black' }}
                                    onChange={(e) => onInputChange("iNumber", e.target.value)}
                                    value={searchCriteria.iNumber}
                                    onKeyDown={(e) => handleKeyDown(e, "iNumber")}
                                />
                                <label className="pt-1" style={{ fontSize: 13, flex: '0 0 auto', color: 'black' }}>이름</label>
                                <Input
                                    className="text-right"
                                    style={{ width: '65px', height: '27px',flex: '2 1 auto', marginRight: 5 }}
                                    onChange={(e) => onInputChange("iName", e.target.value)}
                                    value={searchCriteria.iName}
                                    onKeyDown={(e) => handleKeyDown(e, "iName")}
                                />
                                <Button size="sm" style={{ height: '27px', flex: '0 0 auto', paddingLeft: '10px', paddingRight: '10px' }} onClick={() => onSearchStudent(searchCriteria)}><RiSearchLine style={{ fontSize: '15px' }}/></Button>
                            </Row>
                            <Row className="pt-1">
                                <Col md="12">
                                    <div className="ag-theme-alpine" style={{ height: '18.7vh' }}>
                                        <AgGridReact
                                            rowHeight={27}
                                            headerHeight={32}
                                            ref={searchStudentGridRef}
                                            rowData={searchStudentRowData} 
                                            columnDefs={searchStudentColumnDefs}
                                            defaultColDef={notEditDefaultColDef}
                                            paginationPageSize={4}
                                            overlayNoRowsTemplate={ '<span>일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                            rowSelection="single"
                                            onSelectionChanged={onGridSelectionChanged}
                                            suppressCellFocus={true}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Form onSubmit={sendVisitRequest} className="mt-3" style={{ border: '1px dotted #babfc7', backgroundColor: '#fcfcfc', borderRadius: 4, height: 'auto', padding: '0.5rem' }}>
                                <Row className="d-flex align-items-center justify-content-center no-gutters mt-1">
                                    <b className="p-1 pl-2 pr-2 text-muted" style={{ float: 'right', fontSize: '12px', backgroundColor: '#F5F1E7', borderRadius: '7px'}}>
                                        {selectedStudent ? `${selectedStudent.sGrade} 학년 ${'\u00A0'} ${selectedStudent.sClass} 반 ${'\u00A0'} ${selectedStudent.sNumber}번 ${'\u00A0'} ${selectedStudent.sName}` :  '학생을 선택하세요'}
                                    </b>
                                </Row>
                                <Row className="d-flex align-items-center no-gutters pt-2 pl-1 pr-1 pb-0" style={{ marginTop: 3 }}>
                                    <Input
                                        id="requestContent"
                                        className="p-2"
                                        type="textarea"
                                        placeholder="특이사항을 입력해주세요"
                                        style={{ height: '6rem', width: '100%' }}
                                    />
                                </Row>
                                <Row className="d-flex align-items-center justify-content-center no-gutters mt-1">
                                    <div className="d-flex justify-content-center" style={{ width: '100%', gap: '0.5rem' }}>
                                        <Button size="sm" onClick={resetVisitRequestForm}>초기화</Button>
                                        <Button size="sm" onClick={sendVisitRequest}>전송</Button>
                                    </div>
                                </Row>
                            </Form>

                            <hr />

                            <Row className="mt-3">
                                <Col md="12">
                                    <Row className="d-flex align-items-center">
                                        <Col className="d-flex">
                                            <span><b className="text-muted">보건실 방문 내역</b></span>
                                        </Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button className="m-0" size="sm" style={{ whiteSpace: 'nowrap' }} onClick={visitListOnToday}>오늘</Button>
                                            <Button className="m-0 ml-1" size="sm" style={{ whiteSpace: 'nowrap' }} onClick={visitListOnWeek}>일주일</Button>
                                            <Button className="m-0 ml-1" size="sm" style={{ whiteSpace: 'nowrap' }} onClick={visitListOnEntire}>전체</Button>
                                        </Col>
                                    </Row>
                                    <div className="ag-theme-alpine pt-1" style={{ height: '13.7vh' }}>
                                        <AgGridReact
                                            rowHeight={27}
                                            headerHeight={32}
                                            ref={visitListGridRef}
                                            rowData={visitListRowData} 
                                            columnDefs={visitListColumnDefs}
                                            defaultColDef={notEditDefaultColDef}
                                            paginationPageSize={4}
                                            overlayNoRowsTemplate={ '<span>보건실 방문 내역이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                            rowSelection="single"
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col md="12">
                                    <Row className="d-flex align-items-center">
                                        <Col className="d-flex">
                                            <span><b className="text-muted">침상안정 내역</b></span>
                                        </Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button className="m-0" size="sm" style={{ whiteSpace: 'nowrap' }} onClick={bedRestListOnToday}>오늘</Button>
                                            <Button className="m-0 ml-1" size="sm" style={{ whiteSpace: 'nowrap' }} onClick={bedRestListOnWeek}>일주일</Button>
                                            <Button className="m-0 ml-1" size="sm" style={{ whiteSpace: 'nowrap' }} onClick={bedRestListOnEntire}>전체</Button>
                                        </Col>
                                    </Row>
                                    <div className="ag-theme-alpine pt-1" style={{ height: '13.7vh' }}>
                                        <AgGridReact
                                            rowHeight={27}
                                            headerHeight={32}
                                            ref={bedRestGridRef}
                                            rowData={bedRestRowData} 
                                            columnDefs={bedRestColumnDefs}
                                            defaultColDef={notEditDefaultColDef}
                                            paginationPageSize={4}
                                            overlayNoRowsTemplate={ '<span>침상안정 내역이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                            rowSelection="single"
                                        />
                                    </div>
                                </Col>

                            </Row>
                        </CardBody>
                        <CardFooter style={{ borderTop: '1px solid lightgray' }}>
                            <Row>
                                <nav className="footer-nav">
                                    <span className="text-muted pl-2" style={{ fontWeight: 'bold' }}>MEORLA</span>
                                    <span className="copyright ml-4">
                                        &copy; {" "}
                                        Copyright 이해 컴퍼니. All right reserved.
                                    </span>
                                </nav>
                            </Row>
                        </CardFooter>
                    </Card>
                </MobileView>
            </div>
        </>
    )
}

// 로그아웃 시 로그인화면으로 돌아오는 부분, alert -> Notiflix 교체 등부터 작업

function ExternalView() {
    // const loginInfo = getLoginInfoFromSessionStorage();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 새로고침 시 로그인 상태 확인
        const storedAuthenticated = sessionStorage.getItem("authenticated");
        if (storedAuthenticated === "true") {
          setAuthenticated(true);
        }

        setLoading(false);
    }, []);

    const authenticatedUser  = (isAuthenticated) => {
        if(isAuthenticated) {
            setAuthenticated(true);
            sessionStorage.setItem("authenticated", "true");  
        }else{
            alert("비밀번호가 일치하지 않습니다.");
        }
    };

    const onLogOut = () => {
        setAuthenticated(false);
        removeLoginInfoFromSessionStorage();
        sessionStorage.setItem("authenticated", "false");
    };

    if(loading) return null;

    return (
        <>
            {authenticated ? (
                <Request onLogOut={onLogOut}/>
            ) : (
                <RequesterLogin onLogin={authenticatedUser} />
            )}
        </>
    )
}

export default ExternalView;


/**
 * Row 안의 Label을 수직 중앙 정렬 하고 싶으면 Row의 className에 align-items-cneter 정의
 * 
 */