import React, { useState } from "react";
import { Row, Input, Col, Label, Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import ReactSignatureCanvas from "react-signature-canvas";
import moment from 'moment';
import { useUser } from "contexts/UserContext";
import "../../assets/css/surveyPhoneView.css";

function SurveyPhoneView() {
    const { user } = useUser();
    const [showSignature, setShowSignature] = useState(false);
    const [signature, setSignature] = useState(null);
    const [sigCanvas, setSigCanvas] = useState(null);

    const toggleSignature = () => {
        setShowSignature(!showSignature);
    };

    const clearSignature = () => {
        if(sigCanvas) sigCanvas.clear();
    };

    const saveSignature = () => {
        if(sigCanvas) setSignature(sigCanvas.getTrimmedCanvas().toDataURL('image/png'));
        toggleSignature();
    };
    
    const generateCurrentDate = () => {
        const currentDate = moment().format('YYYY. MM. DD.');
        return currentDate;
    };
    
    const generateSchoolName = () => {
        if(user) {
            return (
                <span>{user.schoolName}장 귀 하</span>
            )
        }
    };

    return (
        <div className="pt-4">
            <Row className="d-flex justify-content-center no-gutters font-weight-bold" style={{ fontSize: 15, color: 'orange' }}>
                학생 건강실태조사 및 학교 내 응급환자 관리 안내
            </Row>
            <div className="mt-4 pt-3 pb-3" style={{ border: '1px dotted orange', borderRadius: 5 }}>
                <Row className="d-flex justify-content-center no-gutters">
                    아래 사항을 작성 및 서명 후 제출해주시기 바랍니다
                </Row>
                <Row className="d-flex align-items-center no-gutters mt-3">
                    <span className='pr-1 pl-1'>학년</span>
                    <Input 
                        type="number"
                        style={{ width: 35, height: 30, marginRight: 5 }}
                    />
                    <span className='pr-1'>반</span>
                    <Input 
                        type="number"
                        style={{ width: 35, height: 30, marginRight: 5 }}
                    />
                    <span className="pr-1">번</span>
                    <Input 
                        type="number"
                        style={{ width: 40, height: 30, marginRight: 5 }}
                    />
                    <span className="pr-1">이름</span>
                    <Input 
                        type="text"
                        style={{ width: 75, flexGrow: 1, height: 30, marginRight: 5 }}
                    />
                </Row>
            </div>
            <div id="questionArea">
                <Row className="d-flex no-gutters mt-5 font-weight-bold">
                    <Col md="2">
                        <span>Q 1 .</span>
                    </Col>
                    <Col md="10">
                        <span>현재 건강문제로 인한 학교 내 활동에 지장이 없습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='effectSchoolActivitty'
                            value='y'
                        />
                        <Label htmlFor='y'>예</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='effectSchoolActivitty'
                            value='n'
                        />
                        <Label htmlFor='y'>아니요</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 2 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 받은 감염병 예방접종은 다음 중 어느 것입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='japaneseVirus'
                            type='radio'
                            name='vaccine'
                            value='japaneseVirus'
                        />
                        <Label htmlFor='japaneseVirus'>일본뇌염</Label>
                    </div> 
                    <div className='radio-group'>
                        <Input
                            id='tdTdap'
                            type='radio'
                            name='vaccine'
                            value='tdTdap'
                        />
                        <Label htmlFor='tdTdap'>Td/Tdap</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='cervix'
                            type='radio'
                            name='vaccine'
                            value='cervix'
                        />
                        <Label htmlFor='cervix'>자궁경부</Label>
                    </div>
                </Row>
                <Row>
                    <div className='radio-group  ml-5'>
                        <Input
                            id='vaccineEtc'
                            type='radio'
                            name='vaccine'
                            value='vaccineEtc'
                        />
                        <Label htmlFor='vaccineEtc'>기타</Label>
                    </div>
                    <div className='radio-group' style={{ marginLeft: '60px'}}>
                        <Input
                            id='vaccineNone'
                            type='radio'
                            name='vaccine'
                            value='vaccineNone'
                        />
                        <Label htmlFor='vaccineNone'>없음</Label>
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 3 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 알레르기를 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='allergy'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='allergy'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 3-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(알레르기 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='allergyCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='allergyCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 3-2 .</span>
                    </Col>
                    <Col md="10">
                        <span>(알레르기 질환이 있는 경우) 알레르기 물질, 증상, 완화방법을 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">물질 : </span>
                    <Input
                        id="allergyMaterial"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">증상 : </span>
                    <Input
                        id="allergyMaterial"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">완화방법 : </span>
                    <Input
                        id="allergyEaseMethod"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 4 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 아토피피부염를 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='atopy'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='atopy'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 4-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(아토피피부염 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='atopyCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='atopyCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 4-2 .</span>
                    </Col>
                    <Col md="10">
                        <span>(아토피피부염 질환이 있는 경우) 알레르기 물질, 증상, 완화방법을 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">물질 : </span>
                    <Input
                        id="atopyMaterial"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">증상 : </span>
                    <Input
                        id="atopyMaterial"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">완화방법 : </span>
                    <Input
                        id="atopyEaseMethod"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 5 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 천식를 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='asthma'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='asthma'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 5-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(천식 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='asthmaCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='asthmaCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 5-2 .</span>
                    </Col>
                    <Col md="10">
                        <span>(천식 질환이 있는 경우) 알레르기 물질, 증상, 완화방법을 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">물질 : </span>
                    <Input
                        id="asthmaMaterial"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">증상 : </span>
                    <Input
                        id="asthmaMaterial"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">완화방법 : </span>
                    <Input
                        id="asthmaEaseMethod"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 6 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 결핵를 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='Tuberculosis'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='Tuberculosis'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 6-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(결핵 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='TuberculosisCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='TuberculosisCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 7 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 경련성 질환을 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='convulsion'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='convulsion'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 7-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(경련성 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='convulsionCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='convulsionCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 8 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 암 질환을 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='cancer'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='cancer'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 8-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(암 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='cancerCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='cancerCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 9 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 당뇨병 질환을 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='diabetes'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='diabetes'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 9-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(당뇨병 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='diabetesCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='diabetesCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 10 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 치과 질환을 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='dentist'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='dentist'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 10-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(치과 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='dentistCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='dentistCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 11 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 소아정신과 질환(우울 등)을 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='childPsy'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='childPsy'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 11-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(소아정신과 질환 (우울 등)이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='childPsyCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='childPsyCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 12 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 생리통 (여햑생)을 앓았거나 병원진료를 받았습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='menstrual'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='menstrual'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 12-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(생리통 (여햑생)이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='menstrualCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='menstrualCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 13 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 기타 질환을 앓았거나 병원진료를 받은적이 있다면 기타 질환을 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">기타 질환 : </span>
                    <Input
                        id="diseaseEtc"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 13-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(기타 질환이 있는 경우) 질환의 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='diseaseEtcCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='diseaseEtcCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 14 .</span>
                    </Col>
                    <Col md="10">
                        <span>지난 1년 동안 수술하거나 입원한 적이 있습니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='surgeryAdmission'
                            value='y'
                        />
                        <Label htmlFor='y'>있음</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='surgeryAdmission'
                            value='n'
                        />
                        <Label htmlFor='y'>없음</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 14-1 .</span>
                    </Col>
                    <Col md="10">
                        <span>(수술하거나 입원한 적이 있는 경우) 현재 상태는 무엇입니까?</span>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between">
                    <div className='radio-group ml-5'>
                        <Input
                            id='y'
                            type='radio'
                            name='surgeryAdmissionCured'
                            value='y'
                        />
                        <Label htmlFor='y'>완치</Label>
                    </div>
                    <div className='radio-group'>
                        <Input
                            id='n'
                            type='radio'
                            name='surgeryAdmissionCuring'
                            value='n'
                        />
                        <Label htmlFor='y'>치료중</Label>              
                    </div>
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 15 .</span>
                    </Col>
                    <Col md="10">
                        <span>현재 장애가 있는 경우 병명, 장애등급 유무, 현재상태에 대하여 기재해 주세요 (운동, 언어, 청력, 시력 등)</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">병명 : </span>
                    <Input
                        id="curretDisease"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">장애등급 유무 : </span>
                    <Input
                        id="isDisabledGrade"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">현재 상태 : </span>
                    <Input
                        id="curretState"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 16 .</span>
                    </Col>
                    <Col md="10">
                        <span>자녀 건강과 관련하여 참고해야 할 가족 병력이 있는 경우 가족병력과 누구인지에 대하여 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">가족병력 : </span>
                    <Input
                        id="familyDiseaseReport"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">누구 : </span>
                    <Input
                        id="familyWho"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 17 .</span>
                    </Col>
                    <Col md="10">
                        <span>치료 목적으로 학생이 계속 복용하는 약이 있다면 약품명과 복용 목적을 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">복용 중인 약품명 : </span>
                    <Input
                        id="currentMedicineName"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">복용 목적 : </span>
                    <Input
                        id="medicinePurpose"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 18 .</span>
                    </Col>
                    <Col md="10">
                        <span>현재 치료 중인 질병이 있다면 질병명, 진료병원, 내용을 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">질병명 : </span>
                    <Input
                        id="inTreatmentDisease"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">진료병원 : </span>
                    <Input
                        id="inTreatmentHospital"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">내용 : </span>
                    <Input
                        id="inTreatmentDiseaseContent"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 19 .</span>
                    </Col>
                    <Col md="10">
                        <span>건강상의 이유로 학교에서 특별히 배려해야 할 점이 있다면 기재해 주세요 (선천성질환, 호흡기질환, 심장질환, 근골격계질환, 기타  등)</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <Input
                        id="considerationThing"
                        type="textarea"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 20 .</span>
                    </Col>
                    <Col md="10">
                        <span>응급상황 시 연락받을 1차 연락처를 기재해 주세요 (주로 학부모)</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">성명 : </span>
                    <Input
                        className="mr-2"
                        id="firstOneParentName"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                    <span className="pr-2">학생과의 관계 : </span>
                    <Input
                        id="firstOneParentRelation"
                        type="text"
                        style={{ width: '10%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">연락처 : </span>
                    <Input
                        id="firstOneParentContact"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-2">
                    <span className="pr-2">성명 : </span>
                    <Input
                        className="mr-2"
                        id="firstTwoParentName"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                    <span className="pr-2">학생과의 관계 : </span>
                    <Input
                        id="firstTowParentRelation"
                        type="text"
                        style={{ width: '10%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">연락처 : </span>
                    <Input
                        id="firstTwoParentContact"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 21 .</span>
                    </Col>
                    <Col md="10">
                        <span>응급상황 시 연락받을 학부모 권한 대행자 2차, 3차 연락처를 기재해 주세요 (주로 이웃, 친척 등)</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">성명 : </span>
                    <Input
                        className="mr-2"
                        id="secondOneCustodianName"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                    <span className="pr-2">학생과의 관계 : </span>
                    <Input
                        id="secondOneCustodianRelation"
                        type="text"
                        style={{ width: '10%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">연락처 : </span>
                    <Input
                        id="secondOneCustodianContact"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-2">
                    <span className="pr-2">성명 : </span>
                    <Input
                        className="mr-2"
                        id="secondTwoCustodianName"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                    <span className="pr-2">학생과의 관계 : </span>
                    <Input
                        id="secondTwoCustodianRelation"
                        type="text"
                        style={{ width: '10%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">연락처 : </span>
                    <Input
                        id="secondTwoCustodianContact"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    <Col md="2">
                        <span>Q 22 .</span>
                    </Col>
                    <Col md="10">
                        <span>유질환자의 경우, 학생이 주로 이용하는 병·의원을 기재해 주세요</span>
                    </Col>
                </Row>
                <Row className="d-flex no-gutters mt-1">
                    <span className="pr-2">병·의원명 : </span>
                    <Input
                        id="inTreatmentDisease"
                        type="text"
                        style={{ width: '30%', flexGrow: 1}}
                    />
                </Row>
                <Row className="d-flex no-gutters mt-4 font-weight-bold">
                    ▣ 학생 건강상태 확인 및 학교 내 응급환자 관리 동의서
                </Row>
                <div className="mt-2 p-2 pb-3" style={{ border: '1px dotted orange', borderRadius: 5 }}>
                    <Row className="d-flex no-gutters">
                        <Col md="1">
                            1 .
                        </Col>
                        <Col>
                            학생의 건강상태가 위와 같음을 확인합니다.
                        </Col>
                    </Row>
                    <Row className="d-flex no-gutters">
                        <Col md="1">
                            2 .
                        </Col>
                        <Col>
                            학생 응급상황 발생 시에 학부모(또는 권한대행자)의 위의 연락처로 연락이 안 될 경우, 학교 내 응급환자관리 절차에 따라 학교 인근 병원 또는 학생이 주로 이용하는 병원으로 후송하는데 동의합니다.
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-between">
                        <div className='radio-group ml-5'>
                            <Input
                                id='agree'
                                type='radio'
                                name='emergencyAdmission'
                                value='agree'
                            />
                            <Label htmlFor='agree'>동의</Label>
                        </div>
                        <div className='radio-group'>
                            <Input
                                id='disagree'
                                type='radio'
                                name='emergencyAdmission'
                                value='disagree'
                            />
                            <Label htmlFor='disagree'>비동의</Label>              
                        </div>
                    </Row>
                    <Row className="d-flex no-gutters">
                        <Col md="1">
                            3 .
                        </Col>
                        <Col>
                            학생이 아프거나 다쳤을 경우 제공되는 학교보건관리 서비스(비치방, 약품 투약 및 부상 처치)에 동의합니다.
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-between">
                        <div className='radio-group ml-5'>
                            <Input
                                id='agree'
                                type='radio'
                                name='healthService'
                                value='agree'
                            />
                            <Label htmlFor='agree'>동의</Label>
                        </div>
                        <div className='radio-group'>
                            <Input
                                id='disagree'
                                type='radio'
                                name='healthService'
                                value='disagree'
                            />
                            <Label htmlFor='disagree'>비동의</Label>              
                        </div>
                    </Row>
                    <Row className="d-flex no-gutters">
                        <Col md="1">
                            4 .
                        </Col>
                        <Col>
                            개인정보 수집·이용 목적: 학생건강상태조사, 응급이송(모유 및 이용기간: 당해연도) 위의 개인정보 수집·이용에 동의합니다.
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-between">
                        <div className='radio-group ml-5'>
                            <Input
                                id='agree'
                                type='radio'
                                name='usePrivacyInfo'
                                value='agree'
                            />
                            <Label htmlFor='agree'>동의</Label>
                        </div>
                        <div className='radio-group'>
                            <Input
                                id='disagree'
                                type='radio'
                                name='usePrivacyInfo'
                                value='disagree'
                            />
                            <Label htmlFor='disagree'>비동의</Label>              
                        </div>
                    </Row>
                </div>
                <Row className="d-flex align-items-center no-gutters mt-4">
                    <span className="pr-2">학부모 : </span>
                    <Input
                        className="mr-2"
                        id="parentName"
                        type="text"
                        style={{ width: '30%', height: 28, flexGrow: 1}}
                    />
                    <Button size="sm" onClick={toggleSignature}>서명</Button>
                </Row>
                {signature && (
                    <div className="mt-3">
                        <img src={signature} alt="Signature" style={{ width: '100%', height: 'auto' }} />
                    </div>
                )}
                {showSignature && (
                    <div className="signature-popup-container">
                        <div className="signature-popup">
                            <ReactSignatureCanvas
                                ref={(ref) => setSigCanvas(ref)}
                                penColor="black"
                                canvasProps={{ width: 300, height: 150, className: 'sigCanvas' }}
                            />
                            <div className="signature-buttons">
                                <Button color="secondary" onClick={clearSignature} className="mr-2">초기화</Button>
                                <Button color="primary" onClick={saveSignature}>저장</Button>
                                <Button color="danger" onClick={toggleSignature} className="ml-2">취소</Button>
                            </div>
                        </div>
                    </div>
                )}
                <Row className="d-flex justify-content-center align-items-center no-gutters mt-3">
                    <Button>최종제출</Button>
                </Row>
            </div>
        </div>
    )
};

export default SurveyPhoneView;