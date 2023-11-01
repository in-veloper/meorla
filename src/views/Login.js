import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../assets/css/login.css';

function Login() {

    // useNavigate를 사용하여 routing 사용하기 위한 함수 생성
    const navigate = useNavigate();

    const [isRightPanelActive, setIsRightPanelActive] = useState(false);

    // 좌우 패널 전환 함수 (Sign In <-> Sign Up)
    const togglePanel = () => {
      setIsRightPanelActive(!isRightPanelActive);
    };

    const handleLogin = () => {
        // 로그인 로직 처리한 후 dashboard 화면으로 이동
        navigate('/admin/dashboard');
    }

    return (
        <div className={`App login_page login-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
            <Container id="container">
                <Row>
                <Col className={`form-container sign-up-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                    <Form action="#">
                    <h1>회원가입</h1>
                    <br/>
                    <input type="text" placeholder="이름" />
                    <input type="email" placeholder="아이디" />
                    <input type="password" placeholder="비밀번호" />
                    <br/>
                    <Button>회원가입</Button>
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
                    <h1>안녕하세요 보건교사님!</h1>
                    <p>회원가입 후 저희의 회원이 되신다면 더욱 더 편한 업무로 안내해 드립니다!</p><br/>
                    <button className="ghost" onClick={togglePanel}>회원가입</button>
                    </div>
                </div>
                </div>
            </Container>
        </div>
    );
}

export default Login;