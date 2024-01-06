import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css'; 
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { useNavigate } from 'react-router-dom';
import '../assets/css/login.css';
import Neis from "@my-school.info/neis-api";
import axios from 'axios';

const neis = new Neis({ KEY : "1addcd8b3de24aa5920d79df1bbe2ece", Type : "json" });

function Login() {

    // useNavigate를 사용하여 routing 사용하기 위한 함수 생성
    const navigate = useNavigate();
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [schoolList, setSchoolList] = useState([]);           // 검색 결과 학교 리스트
    const [schoolName, setSchoolName] = useState("");           // 입력한 학교명
    const [name, setName] = useState("");                       // 입력한 이름
    const [userId, setUserId] = useState("");                   // 입력한 ID
    const [email, setEmail] = useState("");                     // 입력한 Email
    const [password, setPassword] = useState("");               // 입력한 Password
    const [confPassword, setConfPassword] = useState("");       // 입력한 확인 Password
    const [schoolCode, setSchoolCode] = useState("");           // 입력한 학교명과 일치하는 학교 코드
    const [dynamicOptions, setDynamicOptions] = useState([]);   // 학교 검색 시 Typeahead options에 값 Setting 위함

    const [confirmUserId, setConfirmUserId] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (schoolName) {
            try {
                // 학교명 검색 및 결과에서 학교 이름만 추출하여 배열 생성
                const searchOptions = schoolList.map((school) => school.SCHUL_NM);
                setDynamicOptions(searchOptions);
            } catch (error) {
                console.log("학교명 검색 중 에러", error);
            }
        } else {
            // 검색어가 없을 때는 빈 배열로 초기화
            setDynamicOptions([]);
        }
    }, [schoolName, schoolList]);


    // 좌우 패널 전환 함수 (Sign In <-> Sign Up)
    const togglePanel = () => {
      setIsRightPanelActive(!isRightPanelActive);
    };

    // 계정 확인 후 로그인하는 함수 (계정 확인 및 Token 확인 로직 필요 -> 추가)
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // ID와 비밀번호 모두 공란 없이 입력했을 때 로그인 Logic 수행
            if(confirmUserId && confirmPassword) {
                const response = await axios.post('http://localhost:8000/user/login', { userId: confirmUserId, password: confirmPassword });
                const responseData = response.data.user;
                if(responseData === 'N') {
                    alert("해당 ID로 가입된 내역이 없습니다.");
                }else if(responseData === "UPW") {
                    alert("비밀번호가 일치하지 않습니다.");
                }else{
                    navigate('/teaform/dashboard');
                }
            }else{
                alert("ID와 비밀번호를 입력해주세요."); // ID 또는 비밀번호를 입력하지 않은 경우
            }
        } catch (error) {
            console.log("로그인 중 ERROR", error);
        }
    };

    // 회원가입 Form 전송
    const registUser = async () => {
        if(password === confPassword) {
            try {
                const selectResponse = await axios.post('http://localhost:8000/user/getUser', {
                    userId: userId,
                    schoolName: schoolName
                });
                const userData = selectResponse.data.user;
                
                if(userData.schoolName === schoolName) {
                    alert("이미 가입된 학교입니다. 학교당 하나의 계정만 가입 가능합니다.");
                }else if(userData.userId === userId) {
                    alert("이미 존재하는 ID입니다. 다른 ID로 가입해 주세요.");
                }else{
                    if(schoolName.length === 0) {
                        alert("학교명을 입력해 주세요.");
                    }else if(email.length === 0) {
                        alert("Email을 입력해 주세요.");
                    }else if(name.length === 0) {
                        alert("이름을 입력해 주세요.");
                    }else if(userId.length === 0) {
                        alert("ID를 입력해 주세요");
                    }else if(password.length === 0){
                        alert("Password를 입력해 주세요.");
                    }else{
                        const response = await axios.post('http://localhost:8000/user/insert', {
                            schoolName: schoolName,
                            name: name,
                            userId: userId,
                            email: email,
                            password: password,
                            confPassword: confPassword,
                            schoolCode: schoolCode
                        });
                        
                        if(response.data === "success") {
                            alert("가입이 정상적으로 처리되었습니다.");
                        }
                        navigate("/");
                    }
                }
            } catch (error) {
                console.log("회원가입 중 ERROR", error);
            }
        }else{
            alert("입력하신 비밀번호와 확인 비밀번호가 일치하지 않습니다. 확인 후 다시 입력해 주시기 바랍니다.");
        }
    };

    // 회원가입 항목 > 소속학교 (+ 필요 데이터) 검색 함수
    const searchSchool = async (input) => {
        const searchKeyword = input;
        setSchoolName(searchKeyword);   // 입력한 학교명으로 업데이트
    
        if (searchKeyword) {
            try {
                const response = await neis.getSchoolInfo({ SCHUL_NM: searchKeyword }, { pIndex: 1, pSize: 100 });
                if (response.length > 20) {
                    setSchoolList([]);
                } else {
                    // const schoolList = response.map((school) => school.SCHUL_NM);
                    setSchoolList(response);
                }
            } catch (error) {
                console.log("회원가입 > 학교검색 중 ERROR", error);
            }
        } else {
            setSchoolList([]);
        }
    }

    // 검색 항목 중 학교 선택 함수
    const handleSchoolSelect = (selectedSchool) => {
        if(schoolList.length > 0) {
            setSchoolName(schoolList[0].SCHUL_NM);
            setSchoolCode(schoolList[0].SD_SCHUL_CODE);
        }
        setSchoolList([]);
    }

    return (
        <div className={`App login_page login-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
            <Container id="container">
                <Row>
                <Col className={`form-container sign-up-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                    <Form action="#">
                        {/* <h5>회원가입</h5> */}
                        <div style={{ width: '100%'}}>
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
                        <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="email" placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} />
                        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <input type='password' placeholder="비밀번호 확인" value={confPassword} onChange={(e) => setConfPassword(e.target.value)} />
                        <Button onClick={registUser}>회원가입</Button>
                    </Form>
                </Col>
                <Col className={`form-container sign-in-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                    <Form action="#">
                    <h1>로그인</h1>
                    <input type="email" placeholder="아이디" value={confirmUserId} onChange={(e) => setConfirmUserId(e.target.value)} />
                    <input type="password" placeholder="비밀번호" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <a href="/forgot-password">비밀번호를 잊으셨나요?</a>
                    <Button onClick={handleLogin}>로그인</Button>
                    </Form>
                </Col>
                </Row>
                <div className={`overlay-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                    <h1>환영합니다!</h1>
                    <p>보다 편한 업무 환경으로!</p>
                    <button className="ghost" onClick={togglePanel}>로그인</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                    <h1>안녕하세요<br/>보건교사님!</h1>
                    <p>회원가입 후 저희의 회원이 되신다면<br/>더욱 더 편한 업무로 안내해 드립니다!</p><br/>
                    <button className="ghost" onClick={togglePanel}>회원가입</button>
                    </div>
                </div>
                </div>
            </Container>
        </div>
    );
}

export default Login;
