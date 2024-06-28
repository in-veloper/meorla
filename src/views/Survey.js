import React, { useState, useRef } from "react";
import { Row, Col, Card, CardBody, Button, Input, Label } from "reactstrap";
import HealthExaminationSurveyForm from "components/SurveyForm/HealthExaminationSurveyForm";
import { useReactToPrint } from "react-to-print";
import SurveyPhoneView from "components/SurveyForm/SurveyPhoneView";
import '../assets/css/survey.css';


function Survey() {
    const [surveyTopic, setSurveyTopic] = useState("");

    const surveyFormRef = useRef(null);


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
                                <Button>이알리미 링크 생성</Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card style={{ width: '50%', height: '75.1vh', overflowY: 'auto', float: 'left', border: '1px solid lightgray' }}>
                    <div className="p-3">
                        <div ref={surveyFormRef} style={{ border: '1px solid gray' }}>
                            <HealthExaminationSurveyForm/>
                        </div>
                    </div>
                </Card>
                <Card className="ml-4" style={{ width: '48.4%', height: '75.1vh', border: '1px solid lightgray', float: 'left' }}>
                    <div className="iphone-preview">
                        <div className="iphone">
                            <div className="notch">
                                <div className="camera"></div>
                                <div className="speaker"></div>
                            </div>
                            <div className="screen" style={{ overflowY: 'scroll'}}>
                                <SurveyPhoneView />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default Survey;