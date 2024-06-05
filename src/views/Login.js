import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css'; 
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from "contexts/UserContext";
import axios from 'axios';
import Neis from "@my-school.info/neis-api";
import moment from 'moment';
import * as asn1js from "asn1js";
import { Certificate } from 'pkijs';
import { useDropzone } from 'react-dropzone';
import NotiflixWarn from 'components/Notiflix/NotiflixWarn';
import NotiflixInfo from 'components/Notiflix/NotiflixInfo';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import '../assets/css/login.css';

const BASE_PORT = process.env.REACT_APP_BASE_PORT;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const neis = new Neis({ KEY : "1addcd8b3de24aa5920d79df1bbe2ece", Type : "json" });

function Login() {
    const { login } = useUser();

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
    const [schoolAddress, setSchoolAddress] = useState("");
    const [dynamicOptions, setDynamicOptions] = useState([]);   // 학교 검색 시 Typeahead options에 값 Setting 위함
    const [confirmUserId, setConfirmUserId] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fileMessage, setFileMessage] = useState(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br/>인증서 파일(.cer)을 업로드 해주세요</div>);

    const clearRegisterInput = () => {
        setSchoolName("");
        setName("");
        setUserId("");
        setEmail("");
        setPassword("");
        setConfPassword("");
    };

    useEffect(() => {
        clearRegisterInput();
    }, []);

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
      clearRegisterInput();
    };

    // 계정 확인 후 로그인하는 함수 (계정 확인 및 Token 확인 로직 필요 -> 추가)
    const handleLogin = async (e) => {
        try {
            // ID와 비밀번호 모두 공란 없이 입력했을 때 로그인 Logic 수행
            if(confirmUserId && confirmPassword) {
                const response = await axios.post(`http://${BASE_URL}/api/user/login`, { userId: confirmUserId, password: confirmPassword });
                const accessToken = response.data.accessToken;
                const userData = response.data.user;
                
                if(accessToken === 'N') {
                    const warnMessage = "해당 ID로 가입된 내역이 없습니다.";
                    NotiflixWarn(warnMessage);
                }else if(accessToken === "UPW") {
                    const warnMessage = "비밀번호가 일치하지 않습니다.";
                    NotiflixWarn(warnMessage);
                }else{
                    if(userData === "N") {
                        const warnMessage = "등록되지 않은 ID입니다<br/>회원가입 후 이용 바랍니다";
                        NotiflixWarn(warnMessage);
                    }else if(userData === "UPW"){
                        const warnMessage = "비밀번호가 일치하지 않습니다";
                        NotiflixWarn(warnMessage);
                    }else{
                        login(userData, accessToken);
                        navigate('/meorla/dashboard');
                    }
                }
            }else{
                const warnMessage = "ID와 비밀번호를 입력해주세요";
                NotiflixWarn(warnMessage);
            }
        } catch (error) {
            console.log("로그인 중 ERROR", error);
        }
    };

    // 회원가입 Form 전송
    const registUser = async () => {
        let warnMessage = "";
        let infoMessage = "";

        // 인증서 관련 정보 넣어야함
        // 학교명 임의로 입력해서 하도록 하지 못하게 막아야할듯 
        // 가입된 학교 비교 시에 학교명으로 하면 안되고 학교 코드 등으로 해야할듯
        try {
                const selectResponse = await axios.get(`http://${BASE_URL}/api/user/checkUser`, {
                params: {
                    userId: userId,
                    schoolName: schoolName
                }
            });
            const userData = selectResponse.data.user;
            debugger
            if(userData.schoolName === schoolName) {
                warnMessage = "이미 가입된 학교입니다.<br/>학교당 하나의 계정만 가입 가능합니다.";
                NotiflixWarn(warnMessage);
            }else if(userData.userId === userId) {
                warnMessage = "이미 존재하는 ID입니다.<br/>다른 ID로 가입해 주세요.";
                NotiflixWarn(warnMessage);
            }else{
                // 입력할 곳에 Focus 처리 필요
                if(schoolName.length === 0) {
                    warnMessage = "학교명을 입력해 주세요";
                    NotiflixWarn(warnMessage);
                }else if(name.length === 0) {
                    warnMessage = "이름을 입력해 주세요.";
                    NotiflixWarn(warnMessage);
                }else if(email.length === 0) {
                    warnMessage = "Email을 입력해 주세요.";
                    NotiflixWarn(warnMessage);
                }else if(userId.length === 0) {
                    warnMessage = "ID를 입력해 주세요";
                    NotiflixWarn(warnMessage);
                }else if(password.length === 0){
                    warnMessage = "비밀번호를 입력해 주세요.";
                    NotiflixWarn(warnMessage);
                }else if(confPassword.length === 0){
                    warnMessage = "비밀번호 확인을 입력해 주세요.";
                    NotiflixWarn(warnMessage);
                }else{
                    Loading.dots(1000);
                    if(password === confPassword) {
                        const response = await axios.post(`http://${BASE_URL}/api/user/insert`, {
                            schoolName: schoolName,
                            name: name,
                            userId: userId,
                            email: email,
                            password: password,
                            confPassword: confPassword,
                            schoolCode: schoolCode,
                            schoolAddress: schoolAddress,
                            commonPassword: userId + "12!@"
                        });
                        
                        if(response.data === "success") {
                            infoMessage = "가입이 정상적으로 처리되었습니다.";
                            NotiflixInfo(infoMessage);
                        }
                        
                        Loading.remove();
                        navigate("/");
                    }else{
                        warnMessage = "입력하신 비밀번호와 확인 비밀번호가 일치하지 않습니다.<br/>확인 후 다시 입력해 주시기 바랍니다.";
                        NotiflixWarn(warnMessage, '380px');
                    }
                }
            }
        } catch (error) {
            console.log("회원가입 중 ERROR", error);
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
                    setSchoolList(response);
                }
            } catch (error) {
                if(error.message.split('-')[1].split(' ')[0] !== '200') {
                    console.log("회원가입 > 학교검색 중 ERROR", error);
                }
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
            setSchoolAddress(schoolList[0].ORG_RDNMA);
        }
        setSchoolList([]);
    };

    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        // 허용된 파일 처리
        acceptedFiles.forEach((file) => {
            if(!file.name.toLowerCase().endsWith('.cer')) {
                const warnMessage = "인증서 파일(.cer)이 아닙니다<br/>.cer 확장자인 인증서 파일을 업로드 해주세요";
                NotiflixWarn(warnMessage, '320px');
                setFileMessage(
                    <div className='text-muted'>
                        인증서 파일(.cer)이 아닙니다
                        <br/>
                        .cer 확장자인 인증서 파일을 업로드해주세요
                    </div>
                );
            }else{
                const reader = new FileReader();
                reader.onload = async () => {
                    const arrayBuffer = reader.result;

                    const asn1 = asn1js.fromBER(arrayBuffer);
                    const certificate = new Certificate({ schema: asn1.result });

                    // 발급기관 정보
                    const issuer = certificate.issuer.typesAndValues.map(typesAndValues => {
                        const type = typesAndValues.type;
                        const value = typesAndValues.value.valueBlock.value;
                        return { type, value };
                    });

                    // 인증서 정보
                    const subject = certificate.subject.typesAndValues.map(typesAndValues => {
                        const type = typesAndValues.type;
                        const value = typesAndValues.value.valueBlock.value;
                        return { type, value };
                    });

                    const belongOOC = subject[2].value;                            // 소속 교육청
                    const certificateName = subject[4].value.match(/[가-힣]+/g)[0];    // 이름 추출 시 '856이름012'와 같은 형식 -> 정규식 사용하여 이름만 추출

                    // 인증서 유효기간 정보
                    const notBefore = certificate.notBefore.value; // 유효기간 시작일
                    const notAfter = certificate.notAfter.value;   // 유효기간 만료일

                    const currentDate = moment();
                    const notBeforeDate = moment(notBefore, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
                    const notAfterDate = moment(notAfter, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");

                    const isValid = currentDate.isBetween(notBeforeDate, notAfterDate);
                    
                    if(isValid) {
                        const infoMessage = "정상적으로 인증되었습니다.";
                        NotiflixInfo(infoMessage, true, '250px');
                        setFileMessage(<div className='text-muted'>{belongOOC} 소속 {certificateName} 보건교사님<br/>정상적으로 인증되었습니다</div>)
                    }
                };

                reader.readAsArrayBuffer(file);
            }
        });
    }, []);

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        onDrop,
        onFileDialogCancel: () => setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br/>인증서 파일(.cer)을 업로드 해주세요</div>) // 사용자가 파일 선택을 취소했을 때 초기 메시지로 재설정
    });

    const file = acceptedFiles.map(file => {
        
    });

    const handleKeyDown = (e) => {
        if(e.key === "Enter") handleLogin();
    };

    return (
        <div className={`App login_page login-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
            <Container id="container">
                <Row>
                <Col className={`form-container sign-up-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                    <Form action="registUser">
                        {/* <h5>회원가입</h5> */}
                        <div {...getRootProps({className: 'dropzone'})} style={{ width: '100%', border: '2px dashed grey', padding: '10px', marginBottom: '10px', textAlign: 'center' }}>
                            <input {...getInputProps()}/>
                            {fileMessage}
                        </div>
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
                    <input type="password" placeholder="비밀번호" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown}/>
                    {/* <input type='file' accept='.cer' onChange={handleCertChange} /> */}
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
