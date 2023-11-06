import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../assets/css/login.css';
import Neis from "@my-school.info/neis-api";
// import axios from 'axios';

const neis = new Neis({ KEY : "1addcd8b3de24aa5920d79df1bbe2ece", Type : "json" });

function Login() {

    // useNavigate를 사용하여 routing 사용하기 위한 함수 생성
    const navigate = useNavigate();
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [schoolName, setSchoolName] = useState("");   // 입력한 학교명
    const [schoolList, setSchoolList] = useState([]);   // 검색 결과 학교 리스트

    // 좌우 패널 전환 함수 (Sign In <-> Sign Up)
    const togglePanel = () => {
      setIsRightPanelActive(!isRightPanelActive);
    };

    const handleLogin = () => {
        // 로그인 로직 처리한 후 dashboard 화면으로 이동
        navigate('/admin/dashboard');
    };

    const registUser = () => {
        // axios.post('http://localhost:8000/user/insert', {
        //     id: 'admin',
        //     schoolName: '송촌중학교',
        //     name: '정영인',
        //     email: 'yiniwinidev@gmail.com',
        //     password: '1234'
        // }).then(() => {
        //     alert('사용자 등록 완료');
        // })
    };

    // const SearchSchoolResultBox = () => {
    //     const schoolListData = [];
    //     if(schoolList.length > 0 && !isSelected) {
    //         if(schoolList.length > 20) {
    //             return <div className='box'>
    //                 <ul>
    //                     <li>해당하는 학교의 수가 많아 표시할 수 없습니다.</li>
    //                 </ul>
    //             </div>
    //         }else{
    //             for(let i = 0; i < schoolList.length; i++) {
    //                 let info = schoolList[i];
    //                 schoolListData.push(<li key={i} onClick={(event) => {selectSchool(info.SCHUL_NM)}} style={{ cursor: 'pointer'}}><b>{info.SCHUL_NM}</b> [{ info.ORG_RDNMA }]</li>)
    //             }
    
    //             return <div className='box'>
    //                 <ul>{schoolListData}</ul>
    //             </div>
    //         }
    //     }
    // }

    const searchSchool = async (e) => {
        const searchKeyword = e.target.value;
        setSchoolName(searchKeyword);   // 입력한 학교명으로 업데이트

        if(searchKeyword) {
            try{
                const response = await neis.getSchoolInfo({ SCHUL_NM: searchKeyword},{pIndex: 1, pSize: 100});
                if(response.length > 20) {
                    setSchoolList([]);
                }else{
                    const schoolList = response.map((school) => school.SCHUL_NM);
                    setSchoolList(schoolList);
                }
            }catch (error) {
                console.log("회원가입 > 학교검색 중 ERROR", error);
            }   
        }else{
            setSchoolList([]);
        }
        // if(searchKeyword) {
        //     neis.searchSchool({ searchKeyword })
        //         .then((respose) => {
        //             setSchoolList(respose.schoolList);
        //         })
        //         .catch((error) => {
        //             console.log("학교 검색 오류", error);
        //         })
        // }else{
        //     setSchoolList([]);
        // }
    }

    const handleSchoolSelect = (selectedSchool) => {
        setSchoolName(selectedSchool);
        setSchoolList([]);
    }

    // const selectSchool = (props) => {
    //     setSchoolName(props);
    //     setIsSelected(true);
    // }

    return (
        <div className={`App login_page login-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
            <Container id="container">
                <Row>
                <Col className={`form-container sign-up-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                    <Form action="#">
                    <h1>회원가입</h1>
                    <br/>
                    <input type="text" placeholder="소속학교" value={schoolName} onChange={searchSchool}/>
                    <div className='search-results'>
                        {schoolList.length > 0 && (
                            schoolList.length > 20 ? (
                                <p>검색된 결과가 너무 많아 표시할 수 없습니다.</p>
                            ) : (
                                schoolList.map((school, index) => (
                                    <div
                                        key={index}
                                        className="search-result-item"
                                        onClick={() => handleSchoolSelect(school)}
                                    >
                                        {school}
                                    </div>
                                ))
                            )
                        )}
                    </div>
                    <input type="text" placeholder="이름" />
                    <input type="email" placeholder="아이디" />
                    <input type="password" placeholder="비밀번호" />
                    <br/>
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