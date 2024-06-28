import React from "react";
import { Row, Input, Col, Label } from "reactstrap";
import "../../assets/css/surveyPhoneView.css";

function SurveyPhoneView() {
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
                        <span>Q 11-1 .</span>
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
            </div>
        </div>
    )
};

export default SurveyPhoneView;