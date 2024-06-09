import React from 'react';
import { Container, Row, Col, Table, Input, Label, FormGroup, Form, Button } from 'reactstrap';
import moment from 'moment';
import { useUser } from "contexts/UserContext";
import '../../assets/css/emergencyManagementSurveyForm.css';

function EmergencyManagementServeyForm() {
    const { user } = useUser();

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
        <div>
            <Container className='pt-3 pb-3'>
                <Row>
                    <Col>
                        <span className='text-muted font-weight-bold' style={{ fontSize: 20 }}>▣ 응급상황 시 연락처</span>
                        <Table className='emergency-management-table mt-3'>
                            <tr className='font-weight-bold text-center' style={{ backgroundColor: '#edd9c8' }}>
                                <td colSpan="3" style={{ verticalAlign: 'middle', width: '13%' }}>구분</td>
                                <td colSpan="3" style={{ verticalAlign: 'middle', width: '16%' }}>성명<br/>(학생과의 관계)</td>
                                <td colSpan="3" style={{ verticalAlign: 'middle', width: '21%' }}>연락처</td>
                                <td colSpan="3" style={{ verticalAlign: 'middle', width: '13%' }}>구분</td>
                                <td colSpan="3" style={{ verticalAlign: 'middle', width: '16%' }}>성명<br/>(학생과의 관계)</td>
                                <td colSpan="3" style={{ verticalAlign: 'middle', width: '21%' }}>연락처</td>
                            </tr>
                            <tr>
                                <td className='font-weight-bold' colSpan="3" rowSpan="2" style={{ verticalAlign: 'middle' }}>1차 연락처 - 주로 학부모</td>
                                <td colSpan="3">
                                    <Input 
                                        type="text"
                                        name='firstOneParentName' 
                                    />
                                    <Row className='d-flex justify-content-center align-items-center no-gutters'>
                                        <span className='pr-1'>(</span>
                                        <Input 
                                            className='mt-1'
                                            type="text"
                                            name='firstOneParentRelation'
                                            style={{ width: 50 }}
                                        />
                                        <span className='pl-1'>)</span>
                                    </Row>
                                </td>
                                <td colSpan="3" style={{ verticalAlign: 'middle' }}>
                                    <Input 
                                        type="text" 
                                        name='firstOneParentContact'
                                    />
                                </td>
                                <td className='font-weight-bold' colSpan="3" rowSpan="2" style={{ verticalAlign: 'middle' }}>학부모 권한대행자 - 2차, 3차 연락처 (이웃, 친척 등)</td>
                                <td colSpan="3">
                                    <Input 
                                        type="text"
                                        name='secondOneCustodianName'
                                    />
                                    <Row className='d-flex justify-content-center align-items-center no-gutters'>
                                        <span className='pr-1'>(</span>
                                        <Input 
                                            className='mt-1'
                                            type="text"
                                            name='secondOneCustodianRelation'
                                            style={{ width: 50 }}
                                        />
                                        <span className='pl-1'>)</span>
                                    </Row>
                                </td>
                                <td colSpan="3" style={{ verticalAlign: 'middle' }}>
                                    <Input 
                                        type="text" 
                                        name='secondOneCustodianContact'
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="3">
                                    <Input 
                                        type="text" 
                                        name='firstTwoParentName'
                                    />
                                    <Row className='d-flex justify-content-center align-items-center no-gutters'>
                                        <span className='pr-1'>(</span>
                                        <Input 
                                            className='mt-1'
                                            type="text"
                                            name='firstTowParentRelation'
                                            style={{ width: 50 }}
                                        />
                                        <span className='pl-1'>)</span>
                                    </Row>
                                </td>
                                <td colSpan="3" style={{ verticalAlign: 'middle' }}>
                                    <Input 
                                        type="text" 
                                        name='firstTwoParentContact'
                                    />
                                </td>
                                <td colSpan="3">
                                    <Input 
                                        type="text" 
                                        name='secondTwoCustodianName'
                                    />
                                    <Row className='d-flex justify-content-center align-items-center no-gutters'>
                                        <span className='pr-1'>(</span>
                                        <Input 
                                            className='mt-1'
                                            type="text"
                                            name='secondTwoCustodianRelation'
                                            style={{ width: 50 }}
                                        />
                                        <span className='pl-1'>)</span>
                                    </Row>
                                </td>
                                <td colSpan="3" style={{ verticalAlign: 'middle' }}>
                                    <Input 
                                        type="text" 
                                        name='secondTwoCustodianContact'
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className='text-center font-weight-bold' colSpan="6">유질환자의 경우,<br/>학생이 주로 이용하는 병·의원</td>
                                <td colSpan="12" style={{ verticalAlign: 'middle' }}><Input type="text" /></td>
                            </tr>
                        </Table>
                        <Row className='pt-3 no-gutters'>
                            <span className='text-muted font-weight-bold' style={{ fontSize: 20 }}>▣ 학생 건강상태 확인 및 학교 내 응급환자 관리 동의서</span>
                            <Form className='mt-3 p-2' style={{ border: '1px solid #e3b798' }}>
                                <p>
                                    1. 학생의 건강상태가 위와 같음을 확인합니다.
                                </p>
                                <p>
                                    2. 학생 응급상황 발생 시에 학부모(또는 권한대행자)의 위의 연락처로 연락이 안 될 경우, 학교 내 응급환자관리 절차에 따라 학교<br/>&nbsp;&nbsp;&nbsp;&nbsp;인근 병원 또는 학생이 주로 이용하는 병원으로 후송하는데 동의합니다.
                                </p>
                                <div className='radio-group' style={{ marginLeft: 35 }}>
                                    <Input
                                        id='agree'
                                        type='radio'
                                        name='evacuation'
                                        value='agree'
                                        checked={true}
                                    />
                                    <Label htmlFor='y'>동의</Label>
                                </div>
                                <div className='radio-group'>
                                    <Input
                                        id='disagree'
                                        type='radio'
                                        name='evacuation'
                                        value='disagree'
                                        checked={false}
                                    />
                                    <Label htmlFor='y'>비동의</Label>              
                                </div>
                                <p className='pt-2'>
                                    3. 학생이 아프거나 다쳤을 경우 제공되는 학교보건관리 서비스(비치방, 약품 투약 및 부상 처치)에 동의합니다.
                                </p>
                                <div className='radio-group' style={{ marginLeft: 35 }}>
                                    <Input
                                        id='agree'
                                        type='radio'
                                        name='medicalService'
                                        value='agree'
                                        checked={true}
                                    />
                                    <Label htmlFor='y'>동의</Label>
                                </div>
                                <div className='radio-group'>
                                    <Input
                                        id='disagree'
                                        type='radio'
                                        name='medicalService'
                                        value='disagree'
                                        checked={false}
                                    />
                                    <Label htmlFor='y'>비동의</Label>              
                                </div>
                                <p className='pt-2'>
                                    4. 개인정보 수집·이용 목적: 학생건강상태조사, 응급이송(보유 및 이용기간: 당해연도) 위의 개인정보 수집·이용에 동의합니다.
                                </p>
                                <div className='radio-group' style={{ marginLeft: 35 }}>
                                    <Input
                                        id='agree'
                                        type='radio'
                                        name='privacy'
                                        value='agree'
                                        checked={true}
                                    />
                                    <Label htmlFor='y'>동의</Label>
                                </div>
                                <div className='radio-group'>
                                    <Input
                                        id='disagree'
                                        type='radio'
                                        name='privacy'
                                        value='disagree'
                                        checked={false}
                                    />
                                    <Label htmlFor='y'>비동의</Label>              
                                </div>
                                <Row className='d-flex align-items-center justify-content-center no-gutters'>
                                    <Label className='pr-2'>학부모 : </Label>
                                    <Input 
                                        type='text'
                                        name='singParentName'
                                        style={{ width: '20%', height: 30 }}
                                    />
                                    <Button className='ml-3' size='sm'>서명</Button>
                                </Row>
                                <Row className='d-flex align-items-center justify-content-center text-muted no-gutters mt-3' style={{ fontSize: 17 }}>
                                    {generateCurrentDate()}
                                </Row>
                                <Row className='d-flex align-items-center justify-content-center text-muted no-gutters mt-3 mb-3' style={{ fontSize: 17 }}>
                                    {generateSchoolName()}
                                </Row>
                            </Form>
                        </Row>
                    </Col>
                </Row>
                </Container>
        </div>
    );
};

export default EmergencyManagementServeyForm;