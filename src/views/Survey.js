import React, { useState } from "react";
import { Row, Col, Card, CardBody, Button, Input, Label } from "reactstrap";
import HealthExaminationSurveyForm from "components/SurveyForm/HealthExaminationSurveyForm";
import { AiOutlineFilePdf } from "react-icons/ai";
import { AiOutlinePrinter } from "react-icons/ai";

function Survey() {
    const [surveyTopic, setSurveyTopic] = useState("");


    const handleSurveyTopic = () => {

    };


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
                                <Button className="ml-1">프린트</Button>
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
                <Card style={{ width: '60%', height: '75.8vh', overflow: 'scroll', float: 'left' }}>
                    <div className="p-3">
                        <div style={{ border: '1px solid orange'}}>
                            <Row className="d-flex no-gutters justify-content-center font-weight-bold text-muted pt-3" style={{ fontSize: 20 }}>
                                학생 건강실태조사 및 학교 내 응급환자 관리 안내
                            </Row>
                            <Row className="d-flex justify-content-center no-gutters text-muted pt-3 pl-3">
                                <span>아래 사항을 작성하시고 서명하신 후&nbsp;&nbsp;</span>
                                <Input 
                                    type="number"
                                    style={{ width: 35, height: 30 }}
                                />&nbsp;
                                <span>월</span>&nbsp;&nbsp;
                                <Input 
                                    type="number"
                                    style={{ width: 35, height: 30 }}
                                />
                                <span>일 (</span>
                                <Input 
                                    type="text"
                                    style={{ width: 35, height: 30 }}
                                />
                                <span>&nbsp;요일)까지 담임선생님께 보내주시기 바랍니다.</span><br/>
                            </Row>
                            <Row className="d-flex justify-content-center no-gutters text-muted pl-3 pt-2">
                                <span style={{ marginLeft: '-145px'}}>* 직접 방문이나 전화 상담도 가능합니다. (보건실 전화: </span>
                                <Input
                                    className="ml-2"
                                    type="text"
                                    style={{ width: 150, height: 30 }}
                                />
                                <span>)</span>
                            </Row>
                            <Row className="d-flex justify-content-center no-gutters text-muted font-weight-bold pl-3 pt-2">
                                <span>▣ 건강상태 파악을 위한 기초 조사</span>
                                <Input 
                                    type="number"
                                    style={{ width: 35, height: 30 }}
                                />
                                <span>학년</span>
                                <Input 
                                    type="number"
                                    style={{ width: 35, height: 30 }}
                                />
                                <span>반</span>
                                <Input 
                                    type="number"
                                    style={{ width: 35, height: 30 }}
                                />
                                <span>번 이름 (</span>
                                <Input 
                                    type="text"
                                    style={{ width: 100, height: 30 }}
                                />
                                <span>)</span>
                            </Row>
                            <Row className="d-flex justify-content-center no-gutters pl-3 pt-2">
                                <HealthExaminationSurveyForm/>
                            </Row>
                        </div>
                    </div>
                </Card>
                <Card style={{ width: '39%', height: '75.8vh', overflow: 'scroll', float: 'right' }}>

                </Card>
            </div>
        </>
    );
};

export default Survey;