import React, { useState, useRef } from "react";
import { Row, Col, Card, CardBody, Button, Input, Label, Modal, ModalHeader, ModalBody, InputGroup, InputGroupText, ModalFooter } from "reactstrap";
import HealthExaminationSurveyForm from "components/SurveyForm/HealthExaminationSurveyForm";
import { useReactToPrint } from "react-to-print";
import SurveyPhoneView from "components/SurveyForm/SurveyPhoneView";
import '../assets/css/survey.css';
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import { useUser } from "contexts/UserContext";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Survey() {
    const { user } = useUser();
    const [surveyTopic, setSurveyTopic] = useState("");
    const [surveyURLModal, setSurveyURLModal] = useState(false);
    const [surveyURLValue, setSurveyURLValue] = useState("");

    const surveyFormRef = useRef(null);

    const toggleSurveyURLModal = () => {
        setSurveyURLModal(!surveyURLModal);
        const surveyURL = `${BASE_URL}/meorla/surveyPhone/` + user.schoolCode;
        setSurveyURLValue(surveyURL);
    };


    const handleHealthStateSurvey = () => {

    };

    const printSurveyForm = (e) => {
        e.preventDefault();
        handlePrint();
    };

    const handlePrint = useReactToPrint({
        content: () => surveyFormRef.current,
        documentTitle: '건강실태조사'
    });

    const handleEalimeLink = () => {
        toggleSurveyURLModal();
    };

    const clipboardSurveyURL = () => {
        const URLText = document.getElementById("surveyURL").value;
        navigator.clipboard.writeText(URLText);
        NotiflixInfo("설문 이알리미 링크 URL이 클립보드에 복사되었습니다", true, '350px');
    };

    return (
        <>
            <div className="content" style={{ height: '84.1vh' }}>
                <Card style={{ width: '100%', height: '7vh', border: '1px solid lightgray'  }}>
                    <CardBody className="d-flex align-items-center pt-2">
                        <Row className="d-flex align-items-center w-100">
                            <Col md="8" className="d-flex align-items-center text-center pl-4">
                                <Label className="text-muted">설문</Label>
                                <Input
                                    className="ml-4"
                                    id="healthStateSurvey"
                                    name="healthStateSurvey"
                                    type="select"
                                    style={{ width: '450px' }}
                                    value={surveyTopic}
                                    onChange={handleHealthStateSurvey}
                                >
                                    <option value='none'>건강실태조사 및 학교 내 응급환자 관리 안내</option>
                                </Input>
                                <Button className="ml-3">PDF 다운로드</Button>
                                <Button className="ml-1" onClick={printSurveyForm}>프린트</Button>
                            </Col>
                            <Col md="4" className="d-flex justify-content-end">
                                <Button onClick={handleEalimeLink}>이알리미 링크 생성</Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card style={{ width: '50%', height: '75.1vh', overflowY: 'auto', float: 'left', border: '1px solid lightgray' }}>
                    <div className="p-3">
                        <div ref={surveyFormRef} style={{ border: '2px solid gray' }}>
                            <HealthExaminationSurveyForm/>
                        </div>
                    </div>
                </Card>
                <Card className="ml-4" style={{ width: '48.2%', height: '75.1vh', border: '1px solid lightgray', float: 'right', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="iphone-preview" style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="iphone" style={{ maxWidth: '100%', maxHeight: '90%' }}>
                            <div className="notch">
                                <div className="camera"></div>
                                <div className="speaker"></div>
                            </div>
                            <div className="screen" style={{ overflowY: 'scroll', maxHeight: '100%' }}>
                                <SurveyPhoneView />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <Modal isOpen={surveyURLModal} toggle={toggleSurveyURLModal} centered style={{ minWidth: '15%' }}>
                <ModalHeader><b className="text-muted">설문 이알리미 링크</b></ModalHeader>
                <ModalBody>
                    <Row className="d-flex align-items-center justify-content-center no-gutters">
                        <InputGroup>
                            <Input 
                                id="surveyURL"
                                defaultValue={surveyURLValue}
                                onChange={(e) => setSurveyURLValue(e.target.value)}
                            />
                            <InputGroupText onClick={clipboardSurveyURL}>
                                클립보드 복사
                            </InputGroupText>
                        </InputGroup>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Row className="d-flex justify-content-end no-gutters w-100">
                        <Button color="secondary" onClick={toggleSurveyURLModal}>취소</Button>
                    </Row>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default Survey;