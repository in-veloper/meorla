import React, { useState, useRef } from "react";
import { Row, Col, Card, CardBody, Button, Input, Label } from "reactstrap";
import HealthExaminationSurveyForm from "components/SurveyForm/HealthExaminationSurveyForm";
import { useReactToPrint } from "react-to-print";
import { AiOutlineFilePdf } from "react-icons/ai";
import { AiOutlinePrinter } from "react-icons/ai";
import '../assets/css/survey.css';


function Survey() {
    const [surveyTopic, setSurveyTopic] = useState("");

    const surveyFormRef = useRef(null);


    const handleSurveyTopic = () => {

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
            <div className="content" style={{ height: '84.8vh' }}>
                <Card style={{ width: '100%', height: '7vh' }}>
                    <CardBody className="d-flex align-items-center pt-2">
                        <Row className="d-flex align-items-center w-100">
                            <Col md="6" className="d-flex align-items-center text-center pl-4">
                                <Label className="text-muted">설문</Label>
                                <Input
                                    className="ml-4"
                                    id="surveyTopic"
                                    name="surveyTopic"
                                    type="select"
                                    style={{ width: '300px' }}
                                    value={surveyTopic}
                                    onChange={handleSurveyTopic}
                                >
                                    <option value='none'>건강실태조사</option>
                                </Input>
                                <Button className="ml-2">PDF 다운로드</Button>
                                <Button className="ml-1" onClick={printSurveyForm}>프린트</Button>
                                {/* <AiOutlineFilePdf className="text-muted ml-3" style={{ fontSize: 30 }} />
                                <AiOutlinePrinter className="text-muted ml-1" style={{ fontSize: 33 }}/> */}
                            </Col>
                            <Col md="6" className="d-flex justify-content-end">
                                <Button>설문대상 등록</Button>
                                <Button className="ml-1">설문대상 명단</Button>
                                <Button className="ml-1">설문 발송</Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card style={{ width: '50%', height: '75.8vh', overflow: 'scroll', float: 'left' }}>
                    <div className="p-3">
                        <div ref={surveyFormRef} style={{ border: '1px solid orange' }}>
                            <HealthExaminationSurveyForm/>
                        </div>
                    </div>
                </Card>
                <Card style={{ width: '49%', height: '75.8vh', overflow: 'scroll', float: 'right' }}>

                </Card>
            </div>
        </>
    );
};

export default Survey;