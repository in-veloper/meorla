import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Navbar, Nav, Card, Modal } from 'react-bootstrap';
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
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import logoImage from '../assets/img/main_header_logo_white.png';
import carouselImage1 from '../assets/img/carousel/carousel_test_1.jpg';
import carouselImage2 from '../assets/img/carousel/carousel_test_2.jpg';
import carouselImage3 from '../assets/img/carousel/carousel_test_3.jpg';
import TOU from 'components/documents/TOU';
import PP from 'components/documents/PP';
import LN from 'components/documents/LN';
import RCE from 'components/documents/RCE';
import '../assets/css/login.css';
import { Block } from 'notiflix';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const neis = new Neis({ KEY : "1addcd8b3de24aa5920d79df1bbe2ece", Type : "json" });

function Login() {
    const { login } = useUser();
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
    const [verificationCode, setVerificationCode] = useState('');
    const [inputVerificationCode, setInputVerificationCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isEmailVerificated, setIsEmailVerificated] = useState(false);
    const [certificateNameValue, setCertificateNameValue] = useState(null);
    const [touModal, setTouModal] = useState(false);
    const [ppModal, setPpModal] = useState(false);
    const [lnModal, setLnModal] = useState(false);
    const [rceModal, setRceModal] = useState(false);
    const [resetPasswordModal, setResetPasswordModal] = useState(false);
    const [resetId, setResetId] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [resetVerificationCode, setResetVerificationCode] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [initialPassword, setInitialPassword] = useState('');
    const [resetPasswordVerified, setResetPasswordVerified] = useState(false);
    const [matchedUserData, setMatchedUserData] = useState(null);

    const toggleTouModal = () => setTouModal(!touModal);
    const togglePpModal = () => setPpModal(!ppModal);
    const toggleLnModal = () => setLnModal(!lnModal);
    const toggleRceModal = () => setRceModal(!rceModal);
    const toggleResetPasswordModal = () => setResetPasswordModal(!resetPasswordModal);

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

    const sendVerificationCode = async () => {
        Block.dots('#registForm', '인증코드 메일 발송중');

        try {
            const response = await axios.post(`${BASE_URL}/api/send-email-verification`, { email });
            if (response.data.success) {
                setVerificationCode(response.data.code);
                setTimeLeft(180); // 3분
                setIsCodeSent(true);
                Block.remove('#registForm');
            } else {
                const warnMessage = "인증 코드 전송에 실패했습니다<br/>다시 시도해주세요";
                NotiflixWarn(warnMessage);
            }
        } catch (error) {
            console.log("인증코드 전송 중 ERROR", error);
        }finally{
            Block.remove('#registForm');
        }
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    // 계정 확인 후 로그인하는 함수 (계정 확인 및 Token 확인 로직 필요 -> 추가)
    const handleLogin = async (e) => {
        try {
            // ID와 비밀번호 모두 공란 없이 입력했을 때 로그인 Logic 수행
            if(confirmUserId && confirmPassword) {
                const response = await axios.post(`${BASE_URL}/api/user/login`, { userId: confirmUserId, password: confirmPassword });
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
                        await handleLoginHistory(userData);
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

    const handleLoginHistory = async (userData) => {
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        await axios.post(`${BASE_URL}/api/user/insertLoginHistory`, { 
            schoolName: userData.schoolName,
            name: userData.name,
            email: userData.email,
            userId: userData.userId,
            schoolCode: userData.schoolCode,
            loginDateTime: currentDateTime
        });
    };

    // 인증 코드 확인 및 회원가입으로 이동
    const verifyCodeAndRegister = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/verify-email-code`, { email, code: inputVerificationCode });
            if(response.data === 'Email Verified') {
                // 타이머가 유효한지 확인
                if (timeLeft > 0) {
                    const infoMessage = "인증이 완료되었습니다";
                    NotiflixInfo(infoMessage);
                    setIsCodeSent(false);   // 인증 성공 시, 인증 코드 입력 필드 숨김
                    setIsEmailVerificated(true);
                    
                    const emailSendButton = document.getElementById('sendVerificationButton');
                    emailSendButton.textContent = '인증 완료';
                }else{
                    const warnMessage = "인증 시간이 만료되었습니다<br/>다시 시도해주세요";
                    NotiflixWarn(warnMessage);
                    setIsCodeSent(false);
                    setInputVerificationCode("");
                }
            }else{
                const warnMessage = "인증 코드가 일치하지 않습니다<br/>다시 시도해주세요";
                NotiflixWarn(warnMessage);
                setIsCodeSent(false);
                setInputVerificationCode("");
            }
        } catch (error) {
            console.log("인증코드 검증 처리 중 ERROR", error);
        }
    };
    
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
    };

    const handleConfPasswordChange = (e) => {
        setConfPassword(e.target.value);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    };

    // 회원가입 Form 전송
    const registUser = async () => {
        if (!inputVerificationCode || timeLeft <= 0) {
            const warnMessage = "이메일 인증이 완료되지 않았습니다";
            NotiflixWarn(warnMessage);
            return;
        }

        if(!certificateNameValue) {
            const warnMessage = "인증서 파일이 업로드되지 않았습니다<br/>인증서 파일을 업로드해 주세요";
            NotiflixWarn(warnMessage);
            return;
        }

        if(certificateNameValue !== name) {
            const warnMessage = "인증서와 가입하려는 이름이 일치하지 않습니다";
            NotiflixWarn(warnMessage, '320px');
            return;
        }

        let warnMessage = "";
        let infoMessage = "";

        // 인증서 관련 정보 넣어야함
        // 학교명 임의로 입력해서 하도록 하지 못하게 막아야할듯 
        // 가입된 학교 비교 시에 학교명으로 하면 안되고 학교 코드 등으로 해야할듯
        try {
                const selectResponse = await axios.get(`${BASE_URL}/api/user/checkUser`, {
                params: {
                    userId: userId,
                    schoolName: schoolName
                }
            });
            const userData = selectResponse.data.user;
            
            if(userData.schoolName === schoolName) {
                warnMessage = "이미 가입된 학교입니다.<br/>학교당 하나의 계정만 가입 가능합니다.";
                NotiflixWarn(warnMessage);
                return;
            }else if(userData.userId === userId) {
                warnMessage = "이미 존재하는 ID입니다.<br/>다른 ID로 가입해 주세요.";
                NotiflixWarn(warnMessage);
                return;
            }else{
                // 입력할 곳에 Focus 처리 필요
                if(schoolName.length === 0) {
                    warnMessage = "학교명을 입력해 주세요";
                    NotiflixWarn(warnMessage);
                    return;
                }else if(name.length === 0) {
                    warnMessage = "이름을 입력해 주세요";
                    NotiflixWarn(warnMessage);
                    return;
                }else if(email.length === 0) {
                    warnMessage = "Email을 입력해 주세요";
                    NotiflixWarn(warnMessage);
                    return;
                }else if(userId.length === 0) {
                    warnMessage = "ID를 입력해 주세요";
                    NotiflixWarn(warnMessage);
                    return;
                }else if(!validatePassword(password)){
                    warnMessage = "비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다";
                    NotiflixWarn(warnMessage);
                    return;
                }else if(confPassword.length === 0){
                    warnMessage = "비밀번호 확인을 입력해 주세요";
                    NotiflixWarn(warnMessage);
                    return;
                }else if(password !== confPassword) {
                    warnMessage = "입력하신 비밀번호와 확인 비밀번호가 일치하지 않습니다<br/>확인 후 다시 입력해 주시기 바랍니다";
                    NotiflixWarn(warnMessage, '340px');
                    return;
                }else{
                    Loading.dots(1000);
                    if(password === confPassword) {
                        const response = await axios.post(`${BASE_URL}/api/user/insert`, {
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
                        const infoMessage = "정상적으로 인증되었습니다";
                        NotiflixInfo(infoMessage, true, '250px');
                        setFileMessage(<div className='text-muted'>{belongOOC} 소속 {certificateName} 보건교사님<br/>정상적으로 인증되었습니다</div>)
                        setCertificateNameValue(certificateName);
                    }else{
                        const warnMessage = "유효하지 않은 인증서입니다<br/>확인 후 다시 업로드해 주세요";
                        NotiflixWarn(warnMessage);
                        return;
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

    const resetForm = () => {

    };

    const showTOU = () => {
        toggleTouModal();
    };

    const showPP = () => {
        togglePpModal();
    };

    const showLN = () => {
        toggleLnModal();
    };

    const showRCE = () => {
        toggleRceModal();
    };

    const handleForgotPassword = () => {
        setShowVerification(false);
        setResetId('');
        setResetEmail('');
        setResetVerificationCode('');
        setInitialPassword('');
        toggleResetPasswordModal();
    };

    const verifiedIsMatchIdEmail = async () => {
        if(resetId.length === 0) {
            const warnMessage = "가입하신 ID를 입력해주세요";
            NotiflixWarn(warnMessage);
        }else if(resetEmail.length === 0) {
            const warnMessage = "가입하신 이메일을 입력해주세요";
            NotiflixWarn(warnMessage);
        }else{
            try {
                const response = await axios.get(`${BASE_URL}/api/user/checkMatchIdEmail`, {
                    params: {
                        resetId: resetId,
                        resetEmail: resetEmail
                    }
                });
    
                if(response.data.length > 0) {
                    setMatchedUserData(response.data);
                    return true;
                }else{
                    setMatchedUserData(null);
                    return false;
                }
            } catch (error) {
                console.log("ID와 이메일 회원정보 매칭 조회 중 ERROR", error);
                return false;
            }
        }
    };

    const sendResetVerificationCode = async () => {
        const isMatched = await verifiedIsMatchIdEmail();

        if(!isMatched) {
            const warnMessage = "일치하는 회원정보가 없습니다";
            NotiflixWarn(warnMessage);
            return;
        }

        Block.dots('.passwordSettingModal', '인증코드 메일 발송중');
        try {
            const response = await axios.post(`${BASE_URL}/api/send-email-verification`, { email: resetEmail });

            if (response.data.success) {
                setEmailCode(response.data.code);
                setTimeLeft(180);
                setShowVerification(true);
                startTimer();
                setResetVerificationCode("");
                setInitialPassword("");
                Block.remove('.passwordSettingModal');
            } else {
                const warnMessage = "인증코드 전송에 실패했습니다<br/>다시 시도해 주세요";
                NotiflixWarn(warnMessage);
            }
        } catch (error) {
            console.log("비밀번호 초기화 인증코드 전송 중 ERROR", error);
        } finally {
            Block.remove('.passwordSettingModal');
        }
    };

    const startTimer = () => {
        const timerInterval = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timerInterval);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
    };

    const handleVerifyCode = () => {
        if(resetVerificationCode === emailCode) {
            const infoMessage = "정상적으로 인증되었습니다";
            NotiflixInfo(infoMessage);
            setResetPasswordVerified(true);
        }else{
            const warnMessage = "인증코드가 일치하지 않습니다";
            NotiflixWarn(warnMessage);
            return;
        }
    };

    const saveResetPassword = () => {
        if(resetVerificationCode.length === 0) {
            const warnMessage = "인증 코드를 입력해주세요";
            NotiflixWarn(warnMessage);
            return;
        }else if(!resetPasswordVerified) {
            const warnMessage = "인증이 완료되지 않았습니다";
            NotiflixWarn(warnMessage);
            return;
        }else if(initialPassword.length === 0) {
            const warnMessage = "초기화 비밀번호를 입력해주세요";
            NotiflixWarn(warnMessage);
            return;
        }else if(!validatePassword(initialPassword)) {
            const warnMessage = "비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다<br/>확인 후 다시 입력해 주시기 바랍니다";
            NotiflixWarn(warnMessage, '340px');
            return;
        }else{
            if(matchedUserData) {
                axios.post(`${BASE_URL}/api/reset-password`, { userId: matchedUserData[0].userId, newPassword: initialPassword })
                .then((response) => {
                    if (response.data === 'success') {
                        const infoMessage = "비밀번호가 초기화 되었습니다";
                        NotiflixInfo(infoMessage);
                        toggleResetPasswordModal();
                    } else {
                        const warnMessage = "비밀번호 초기화에 실패하였습니다";
                        NotiflixWarn(warnMessage);
                    }
                })
                .catch((error) => {
                    console.log("비밀번호 초기화 중 ERROR", error);
                    const warnMessage = "비밀번호 초기화 중 문제가 발생하였습니다<br/>관리자에게 문의해 주세요";
                    NotiflixWarn(warnMessage);
                });
            }
        }
    };

    return (
        <div className={`App login_page login-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
            <Navbar className='pb-0 pt-0' bg="white" expand="lg" fixed="top" style={{ borderBottom: '1.5px dotted lightgray', height: 60 }}>
                <Navbar.Brand className='mr-5' href="/">
                    <img className='mr-2' src={logoImage} style={{ width: 40, height: 40 }} alt='logo'/>
                    <b>MEORLA</b>
                </Navbar.Brand>
                <Navbar.Brand className='mr-4' href="/">MEORLA</Navbar.Brand>
                <Navbar.Brand className='mr-4' href="/">플랫폼 메뉴얼 교육 신청</Navbar.Brand>
                <Navbar.Brand href="/">구독관련 문의사항</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto" style={{ fontSize: 20 }}>
                        <Nav.Link href="#home">BLOG</Nav.Link>
                        <Nav.Link href="#link">INSTAGRAM</Nav.Link>
                        <Nav.Link href="#link">EMAIL</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Card className='carousel-card' style={{ width: '800px', display: 'flex', flexDirection: 'column' }}>
                <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows autoPlay>
                    <div>
                        <img src={carouselImage1} alt="First Slide" style={{ height: '180px', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <img src={carouselImage2} alt="Second Slide" style={{ height: '180px', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <img src={carouselImage3} alt="Third Slide" style={{ height: '180px', objectFit: 'cover' }} />
                    </div>
                </Carousel>
            </Card>
            <Container id="container" style={{ height: '50%' }}>
                <Row>
                    <Col className={`form-container sign-up-container ${isRightPanelActive ? 'right-panel-active' : ''}`} style={{ overflowY: 'auto' }}>
                        <Form id="registForm" action="registUser">
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
                            <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: '3', marginRight: '10px' }} disabled={isEmailVerificated} />
                                <Button id='sendVerificationButton' className='verificationButton' onClick={sendVerificationCode} style={{ flex: '1' }} disabled={isEmailVerificated}>인증 코드</Button>
                            </div>
                            {isCodeSent && (
                                <>
                                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                        <input type="text" placeholder="인증 코드" value={inputVerificationCode} onChange={(e) => setInputVerificationCode(e.target.value)} style={{ flex: '1', marginRight: '10px' }} />
                                        <b style={{ flex: '1', marginRight: '10px' }}>{Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}</b>
                                        <Button className='verificationButton' onClick={verifyCodeAndRegister} style={{ flex: '1' }}>인증 코드 확인</Button>
                                    </div>
                                </>
                            )}
                            <input type="email" placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} />
                            <div style={{ display: 'flex', width: '100%' }}>
                                <input type="password" placeholder="비밀번호" value={password} onChange={handlePasswordChange} style={{ flex: '1', marginRight: '10px' }}/>
                                <input type='password' placeholder="비밀번호 확인" value={confPassword} onChange={handleConfPasswordChange} style={{ flex: '1' }} />
                            </div>
                            <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                                <Button onClick={resetForm} style={{ marginRight: '5px' }}>초기화</Button>
                                <Button onClick={registUser}>회원가입</Button>
                            </div>
                        </Form>
                    </Col>
                    <Col className={`form-container sign-in-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                        <Form action="#">
                        <h1>로그인</h1>
                        <input type="email" placeholder="아이디" value={confirmUserId} onChange={(e) => setConfirmUserId(e.target.value)} />
                        <input type="password" placeholder="비밀번호" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown}/>
                        {/* <input type='file' accept='.cer' onChange={handleCertChange} /> */}
                        <a onClick={handleForgotPassword} style={{ cursor: 'pointer' }}>비밀번호를 잊으셨나요?</a>
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
            <footer className="footer mt-auto py-3 bg-white" style={{ borderTop: '1.5px dotted lightgray' }}>
                <Row>
                    <Col className='d-flex justify-content-start ml-4'>
                        <ul>
                            <li className='text-muted mr-3' onClick={showTOU} style={{ cursor: 'pointer' }}>이용약관</li>
                            <li className='text-muted mr-3' onClick={showPP} style={{ cursor: 'pointer' }}>개인정보처리방침</li>
                            <li className='text-muted mr-3' onClick={showLN} style={{ cursor: 'pointer' }}>법적고지</li>
                            <li className='text-muted' onClick={showRCE} style={{ cursor: 'pointer' }}>이메일무단수집거부</li>
                        </ul>
                    </Col>
                    <Col className="text-center">
                        <div className="credits ml-auto text-muted">
                            <div className="copyright">
                                <span className="pr-2">이해컴퍼니 [사업자번호 : 473-43-01316]</span>
                                <span className="pr-2">대표 : 정영인</span>
                                <span className="pr-3">Email : meorla@meorla.com</span>
                                &copy; {1900 + new Date().getYear()} {" "}
                                {/* <i className="fa fa-heart heart" />  */}
                                Copyright 이해 컴퍼니. All right reserved.
                            </div>
                        </div>
                    </Col>
                </Row>
            </footer>

            <Modal show={touModal} onHide={toggleTouModal} centered style={{ minWidth: '40%' }}>
                <Modal.Header className='pt-0 pb-0'>
                <Modal.Title>이용약관</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '50vh', overflowY: 'scroll' }}>
                    <TOU />
                </Modal.Body>
                <Modal.Footer className='pt-0 pb-0'>
                    <Button variant="secondary" onClick={toggleTouModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={ppModal} onHide={togglePpModal} centered style={{ minWidth: '40%' }}>
                <Modal.Header className='pt-0 pb-0'>
                <Modal.Title>개인정보처리방침</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '50vh', overflowY: 'scroll' }}>
                    <PP />
                </Modal.Body>
                <Modal.Footer className='pt-0 pb-0'>
                    <Button variant="secondary" onClick={togglePpModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={lnModal} onHide={toggleLnModal} centered style={{ minWidth: '40%' }}>
                <Modal.Header className='pt-0 pb-0'>
                <Modal.Title>법적고지</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '50vh', overflowY: 'scroll' }}>
                    <LN />
                </Modal.Body>
                <Modal.Footer className='pt-0 pb-0'>
                    <Button variant="secondary" onClick={toggleLnModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={rceModal} onHide={toggleRceModal} centered style={{ minWidth: '40%' }}>
                <Modal.Header className='pt-0 pb-0'>
                    <Modal.Title>이메일무단수집거부</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: 'auto' }}>
                    <RCE />
                </Modal.Body>
                <Modal.Footer className='pt-0 pb-0'>
                    <Button variant="secondary" onClick={toggleRceModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={resetPasswordModal} onHide={toggleResetPasswordModal} centered style={{ minWidth: '20%' }}>
                <Modal.Header className='pt-0 pb-0'>
                    <Modal.Title><b className="text-muted">비밀번호 초기화</b></Modal.Title>
                </Modal.Header>
                <Modal.Body className="pb-0 passwordSettingModal">
                    <Form className="mt-2 mb-3">
                        {!showVerification && (
                            <>
                                <Row className="no-gutters">
                                    <Col md="4" className="text-center align-items-center">
                                        <label className="text-muted">가입한 ID</label>
                                    </Col>
                                    <Col md="8">
                                        <input
                                        type="text"
                                        value={resetId}
                                        style={{ width: '90%' }}
                                        onChange={(e) => setResetId(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                                <Row className="no-gutters mt-2">
                                    <Col md="4" className="text-center align-items-center">
                                        <label className="text-muted">가입한 이메일</label>
                                    </Col>
                                    <Col md="8">
                                        <input
                                        type="email"
                                        value={resetEmail}
                                        style={{ width: '90%' }}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </>
                        )}
                        {showVerification && (
                            <div>
                                <Row className="d-flex align-items-center mt-2 no-gutters">
                                <Col md="4" className="text-center align-tiems-center">
                                    <label className="text-muted">인증 코드</label>
                                </Col>
                                <Col md="8">
                                    <Row className="d-flex align-items-center">
                                    <Col md="4">
                                        <input
                                        type="text"
                                        placeholder="인증코드"
                                        value={resetVerificationCode}
                                        onChange={(e) => setResetVerificationCode(e.target.value)}
                                        style={{ width: '100%', marginRight: '10px' }}
                                        />
                                    </Col>
                                    <Col md="2">
                                        <span>{Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}</span>
                                    </Col>
                                    <Col md="6">
                                        <Button size="sm" onClick={handleVerifyCode}>인증 코드 확인</Button>
                                    </Col>
                                    </Row>
                                </Col>
                                </Row>
                                <Row className="mt-3 no-gutters">
                                <Col md="4" className="text-center align-items-center">
                                    <label className="text-muted">새 비밀번호</label>
                                </Col>
                                <Col md="8">
                                    <input
                                    type="password"
                                    value={initialPassword}
                                    style={{ width: '88%' }}
                                    onChange={(e) => setInitialPassword(e.target.value)}
                                    />
                                </Col>
                                </Row>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {!showVerification && (
                        <Button className="mr-1" onClick={sendResetVerificationCode}>인증코드 발송</Button>
                    )}
                    {showVerification && (
                        <Button className="mr-1" onClick={saveResetPassword}>저장</Button>
                    )}
                    <Button onClick={toggleResetPasswordModal}>취소</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Login;
