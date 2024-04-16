import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, CardBody, CardFooter, Label, Input, Button, Badge } from "reactstrap";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import Neis from "@my-school.info/neis-api";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import moment from "moment";
import "../assets/css/request.css";
import axios from "axios";

import io from 'socket.io-client';

const serverUrl = 'http://localhost:8000';
const socket = io(serverUrl);

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
        document.getElementsByClassName('fixed-plugin')[0].setAttribute('hidden', true);
        document.getElementsByClassName('navbar-toggler')[0].setAttribute('hidden', true);
        document.getElementsByClassName('navbar-toggler')[1].setAttribute('hidden', true);
        document.getElementsByClassName('navbar-brand')[0].setAttribute('href', '#');
        document.getElementsByClassName('navbar-nav')[0].setAttribute('hidden', true);

        const navbarBrand = document.querySelector('.navbar-brand');
        if(navbarBrand) navbarBrand.getElementsByTagName('b')[0].textContent = '보건실 방문 요청';
    }, []);

    useEffect(() => {
        const schoolCode = params['*'].split('/')[1];
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
            // 로그인 페이지가 아니라 404 띄워줘야 할듯... (일치하는 학교명으로 조회할 수 없다는)
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
        const schoolCode = params.thirdPartyUserCode;
        let commonPassword = "";

        if(schoolName && schoolCode) {
            const response = await axios.get('http://localhost:8000/request/getCommonPassword', {
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
                const height = window.innerHeight - 163;
                setContentHeight(height);
                
                document.getElementsByClassName('footer')[0].style.paddingTop = 0;
            }else{
                setContentHeight("auto");
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <div className="content d-flex justify-content-center align-items-center" style={{ height: isBrowser ? '83.3vh' : contentHeight }}>
                <BrowserView>
                    <Card style={{ width: '100%', height: '33vh' }}>
                        <CardBody className="mt-3">
                            <Row className="mt-2 align-items-center">    
                                <Col md="3" className="text-center">
                                    <Label>학교명</Label>
                                </Col>
                                <Col md="9">
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
                                <Col md="3" className="text-center">
                                    <Label>비밀번호</Label>
                                </Col>
                                <Col md="9">
                                    <Input type="password" placeholder="학교 공통 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '93%' }}/>
                                </Col>
                            </Row>
                            <Row className="p-3 ml-1 mr-1">
                                <blockquote className="request-blockquote text-center" style={{ width: '100%' }}>
                                    <FaCheck className="mr-2" style={{ color: 'gray' }}/>학교 공통 비밀번호를 모르는 경우, 보건교사님께 문의하세요.                                 
                                </blockquote>
                            </Row>
                        </CardBody>
                        <CardFooter className="mb-3">
                            <Row className="d-flex justify-content-center align-items-center">
                                <Button className="mr-1" onClick={handleLogin}>로그인</Button>
                                <Button className="ml-1">초기화</Button>
                            </Row>
                        </CardFooter>
                    </Card>
                </BrowserView>

                <MobileView>
                    <Card style={{ width: '100%', height: '40vh' }}>
                        <CardBody className="mt-3">
                            <Row className="mt-2 align-items-center">    
                                <Col xs="3" className="text-center">
                                    <Label>학교명</Label>
                                </Col>
                                <Col xs="9">
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
                                <Col xs="3" className="text-center">
                                    <Label>비밀번호</Label>
                                </Col>
                                <Col xs="9">
                                    <Input type="password" placeholder="학교 공통 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '93%' }}/>
                                </Col>
                            </Row>
                            <Row className="p-3 ml-1 mr-1">
                                <blockquote className="request-blockquote text-center" style={{ width: '100%' }}>
                                    <FaCheck className="mr-2" style={{ color: 'gray' }}/>학교 공통 비밀번호를 모르는 경우, 보건교사님께 문의하세요.                                 
                                </blockquote>
                            </Row>
                        </CardBody>
                        <CardFooter className="mb-3">
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

    const params = useParams();
    
    useEffect(() => {
        document.getElementsByClassName('fixed-plugin')[0].setAttribute('hidden', true);
        document.getElementsByClassName('navbar-toggler')[0].setAttribute('hidden', true);
        document.getElementsByClassName('navbar-toggler')[1].setAttribute('hidden', true);
        document.getElementsByClassName('navbar-brand')[0].setAttribute('href', '#');
        document.getElementsByClassName('navbar-nav')[0].setAttribute('hidden', true);

        const navbarBrand = document.querySelector('.navbar-brand');
        if(navbarBrand) navbarBrand.getElementsByTagName('b')[0].textContent = '보건실 방문 요청';

        const logoutButton = document.createElement('button');
        logoutButton.className = 'btn btn-secondary mobile-logout-btn';
        logoutButton.textContent = "로그아웃";
        logoutButton.onclick = onLogOut;
        logoutButton.style.display = 'block';
        
        if(!document.getElementsByClassName('mobile-logout-btn')[0]) document.getElementsByClassName('container-fluid')[0].appendChild(logoutButton);

        if(params) setSchoolCode(params.thirdPartyUserCode);
    }, []);

    useEffect(() => {
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

            if(workStatus === "working") infoMessage = "보건교사님의 상태가 근무중으로 변경되었습니다";
            else if(workStatus === "outOfOffice") infoMessage = "보건교사님의 상태가 부재중으로<br/>보건실 방문 요청이 불가합니다";
            else if(workStatus === "businessTrip") infoMessage = "보건교사님의 상태가 출장중으로<br/>보건실 방문 요청이 불가합니다";
            else if(workStatus === "vacation") infoMessage = "보건교사님의 상태가 휴가중으로<br/>보건실 방문 요청이 불가합니다";

            let messageWidth = '250px';
            if(workStatus === "working") messageWidth = '320px';

            NotiflixInfo(infoMessage, true, messageWidth);

            setRenderWorkStatus(true);
        };

        if(!socket.connected) {
            socket.on('connect', () => {
                console.log("Request 컴포넌트에서 소켓 연결 성공");
            });
    
            socket.on('broadcastBedStatus', handleBroadcastBedStatus);
            socket.on('broadcastWorkStatus', handleBroadcastWorkStatus);
    
            socket.on('connect_error', (error) => {
                console.error("소켓 연결 오류:", error);
            });
            
            socket.on('connect_timeout', () => {
                console.error("소켓 연결 시간 초과");
            });
            
            socket.on('disconnect', (reason) => {
                console.log("소켓 연결 해제:", reason);
            });
        }

        // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
        return () => {
            socket.off('broadcastBedStatus', handleBroadcastBedStatus);
            socket.off('broadcastWorkStatus', handleBroadcastWorkStatus);
        };
    }, []);

    const [contentHeight, setContentHeight] = useState("auto");

    useEffect(() => {
        function handleResize() {
            if(window.innerWidth <= 768) {
                const height = window.innerHeight - 163;
                setContentHeight(height);
                
                document.getElementsByClassName('footer')[0].style.paddingTop = 0;
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
            const response = await axios.get("http://localhost:8000/request/getCurrentInfo", {
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
            const response = await axios.get("http://localhost:8000/request/getOnBedRestInfo", {
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
            if(workStatus === "working") convertedWorkStatus = "근무";
            else if(workStatus === "outOfOffice") convertedWorkStatus = "부재";
            else if(workStatus === "businessTrip") convertedWorkStatus = "출장";
            else if(workStatus === "vacation") convertedWorkStatus = "휴가";
        }

        return convertedWorkStatus;
    };

    const generateBedBox = () => {
        if(onBedRestInfo && onBedRestInfo.length > 0) {
            return onBedRestInfo.map((item, index) => (
                <div key={index} className="ml-1 mr-1">
                    <Card className="p-2 text-muted text-center" style={{ border: '1px dashed lightgrey', fontSize: 11, backgroundColor: '#F5F1E7' }}>
                        <span className="flex-nowrap">{item.sGrade}학년 {item.sClass}반 {item.sNumber}번</span><span><b>{item.sName}</b></span>
                        <span className="flex-nowrap">{item.onBedStartTime} ~ {item.onBedEndTime}</span>
                    </Card>

                </div>
            ));
        }else{
            return null;
        };
         
    };

    return(
        <>
            <div className="content" style={{ height: isBrowser ? '83.4vh' : contentHeight }}>
                <BrowserView>
                    <Row>
                        <p>PC View</p>
                        <Button onClick={onLogOut}>로그아웃</Button>
                    </Row>
                </BrowserView>

                <MobileView>
                    <Card style={{ width: '100%', height: '15vh' }}>
                        <Row className="d-flex align-items-center no-gutters justify-content-center p-2">
                            <span className="text-muted font-weight-bold">보건교사님은 현재 </span> <Badge className="ml-2" style={{ fontSize: 13 }}>{workStatusInfo()}중</Badge> <span className="text-muted font-weight-bold">&nbsp;입니다</span>
                        </Row>
                        <Row className="d-flex align-items-center no-gutters flex-nowrap p-1">
                            {generateBedBox()}
                        </Row>
                    </Card>
                    <Card style={{ width: '100%', height: '59.7vh' }}>

                    </Card>
                    <Row className="justify-content-end no-gutters">
                    </Row>
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