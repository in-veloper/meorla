import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css'; 
import { useNavigate } from 'react-router-dom';
import '../assets/css/login.css';
import Neis from "@my-school.info/neis-api";
import axios from 'axios';

const neis = new Neis({ KEY : "1addcd8b3de24aa5920d79df1bbe2ece", Type : "json" });

function Login() {

    // useNavigate를 사용하여 routing 사용하기 위한 함수 생성
    const navigate = useNavigate();
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [schoolName, setSchoolName] = useState("");   // 입력한 학교명
    const [schoolList, setSchoolList] = useState([]);   // 검색 결과 학교 리스트
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [schoolCode, setSchoolCode] = useState("");
    const [dynamicOptions, setDynamicOptions] = useState([]);

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
    const handleLogin = () => {
        // 로그인 로직 처리한 후 dashboard 화면으로 이동
        navigate('/admin/dashboard');
    };

    // 회원가입 Form 전송
    const registUser = () => {
        if(password === confPassword) {
            try {
                axios.post('http://localhost:8000/user/insert', {
                    schoolName: schoolName,
                    name: name,
                    userId: userId,
                    email: email,
                    password: password,
                    confPassword: confPassword,
                    schoolCode: schoolCode
                });
                navigate("/");
            } catch (error) {
                console.log("회원가입 중 Error", error);
            }
        }else{
            alert("입력하신 비밀번호와 확인 비밀번호가 일치하지 않습니다.<br/> 확인 후 다시 입력해 주시기 바랍니다.");
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
        setSchoolName(selectedSchool.SCHUL_NM);
        setSchoolCode(selectedSchool.SD_SCHUL_CODE);
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
                    <input type="email" placeholder="아이디" />
                    <input type="password" placeholder="비밀번호" />
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
