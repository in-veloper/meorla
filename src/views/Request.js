import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, CardFooter, Label, Input, Button } from "reactstrap";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { FaCheck } from "react-icons/fa";
import "../assets/css/request.css";
import Neis from "@my-school.info/neis-api";

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


function RequesterLogin({onLogin}) {
    const [schoolName, setSchoolName] = useState("");           // 입력한 학교명
    const [schoolCode, setSchoolCode] = useState("");           // 입력한 학교명과 일치하는 학교 코드
    const [schoolList, setSchoolList] = useState([]);           // 검색 결과 학교 리스트
    const [dynamicOptions, setDynamicOptions] = useState([]);   // 학교 검색 시 Typeahead options에 값 Setting 위함
    const [password, setPassword] = useState("");               // 입력한 Password

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
    }

    // 검색 항목 중 학교 선택 Function
    const handleSchoolSelect = (selectedSchool) => {
        if(schoolList.length > 0) {
            setSchoolName(schoolList[0].SCHUL_NM);
            setSchoolCode(schoolList[0].SD_SCHUL_CODE);
        }
        setSchoolList([]);
    }

    const handleLogin = () => {
        if(password === "1234") {
            onLogin(schoolName, password);
            saveLoginInfoToSessionStorage(schoolName, password);
        }else{
            alert("비밀번호가 일치하지 않습니다.");
        }
    }


    return (
        <>
            <div className="content d-flex justify-content-center align-items-center">
                <Card style={{ width: '35%', height: '32vh' }}>
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
            </div>
        </>
    )
}

function Request({onLogOut}) {
    return(
        <>
            <div className="content">
                <Row>
                    <p>메인 화면 영역</p>
                    <Button onClick={onLogOut}>로그아웃</Button>
                </Row>
            </div>
        </>
    )
}

// 로그아웃 시 로그인화면으로 돌아오는 부분, alert -> Notiflix 교체 등부터 작업

function ExternalView() {
    // const loginInfo = getLoginInfoFromSessionStorage();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        // 새로고침 시 로그인 상태 확인
        const storedAuthenticated = sessionStorage.getItem("authenticated");
        if (storedAuthenticated === "true") {
          setAuthenticated(true);
        }
    }, []);

    const authenticatedUser  = (schoolName, password) => {
        if(password === "1234") {
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
    }

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