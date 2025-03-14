import React from 'react';
import { Table, Row, Input, Label, Col, Form, Button, Container } from 'reactstrap';
import moment from 'moment';
import { useUser } from "contexts/UserContext";
import '../../assets/css/healthExaminationSurveyForm.css';

function HealthExaminationSurveyForm() {
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
      <Row className="d-flex no-gutters justify-content-center font-weight-bold text-muted pt-3" style={{ fontSize: 20 }}>
          학생 건강실태조사 및 학교 내 응급환자 관리 안내
      </Row>
      <Row className="d-flex justify-content-center no-gutters text-muted pt-3 pl-3">
          <span className='pr-2'>아래 사항을 작성하시고 서명하신 후</span>
          <Input 
              type="number"
              min={1}
              max={12}
              style={{ width: 50, height: 30, marginRight: 5 }}
          />
          <span className='pr-2'>월</span>
          <Input 
              type="number"
              min={1}
              max={31}
              style={{ width: 50, height: 30, marginRight: 5 }}
          />
          <span>일 (&nbsp;</span>
          <Input 
              type="text"
              style={{ width: 50, height: 30 }}
          />
          <span>&nbsp;요일)까지 담임선생님께 보내주시기 바랍니다.</span><br/>
      </Row>
      <Row className="d-flex justify-content-center no-gutters text-muted pl-3 pt-2">
          <span style={{ marginLeft: '-145px'}}>* 직접 방문이나 전화 상담도 가능합니다. ( 보건실 전화: </span>
          <Input
              className="ml-2"
              type="text"
              style={{ width: 150, height: 30, marginRight: 5 }}
          />
          <span>)</span>
      </Row>
      <Row className="d-flex justify-content-center no-gutters text-muted font-weight-bold pl-3 pt-2">
          <span>▣ 건강상태 파악을 위한 기초 조사</span>
          <Input 
            type="number"
            style={{ width: 35, height: 30, marginLeft: 10, marginRight: 5 }}
          />
          <span className='pr-2'>학년</span>
          <Input 
              type="number"
              style={{ width: 35, height: 30, marginLeft: 10, marginRight: 5 }}
          />
          <span className='pr-2'>반</span>
          <Input 
              type="number"
              style={{ width: 35, height: 30, marginLeft: 10, marginRight: 5 }}
          />
          <span>번 이름 (</span>
          <Input 
              type="text"
              style={{ width: 100, height: 30, marginLeft: 5, marginRight: 5 }}
          />
          <span>)</span>
      </Row>
      <Row className="d-flex justify-content-center no-gutters pl-3 pr-3 pt-2">
        <Table className='health-examination-table' >
          <tbody>
            <tr>
              <td colSpan="7" className='text-center'><span className='font-weight-bold'>현재 건강문제로 인한 학교 내 활동에 지장 없음</span> 
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
              </td>
            </tr>
            <tr>
              <td className='text-center font-weight-bold' colSpan="4">지난 1년 동안 받은 감염병 예방접종은 다음 중 어느 것입니까?</td>
              <td colSpan="3" className='pl-5'>
                <div className='radio-group-2'>
                  <Input
                    id='japaneseVirus'
                    type='radio'
                    name='vaccine'
                    value='japaneseVirus'
                  />
                  <Label htmlFor='japaneseVirus'>일본뇌염</Label>
                </div> 
                <div className='radio-group-2'>
                  <Input
                    id='tdTdap'
                    type='radio'
                    name='vaccine'
                    value='tdTdap'
                  />
                  <Label htmlFor='tdTdap'>Td/Tdap</Label>
                </div>
                <div className='radio-group-2'>
                  <Input
                    id='cervix'
                    type='radio'
                    name='vaccine'
                    value='cervix'
                  />
                  <Label htmlFor='cervix'>자궁경부</Label>
                </div>
                <br/>
                <div className='radio-group-2'>
                  <Input
                    id='vaccineEtc'
                    type='radio'
                    name='vaccine'
                    value='vaccineEtc'
                  />
                  <Label htmlFor='vaccineEtc'>기타</Label>
                </div>
                <div className='radio-group-2'>
                  <Input
                    id='vaccineNone'
                    type='radio'
                    name='vaccine'
                    value='vaccineNone'
                  />
                  <Label htmlFor='vaccineNone'>없음</Label>
                </div>
              </td>
            </tr>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <td className='text-center font-weight-bold' colSpan="2" rowSpan="2">질환</td>
              <td className='text-center font-weight-bold' rowSpan="2">있음</td>
              <td className='text-center font-weight-bold' rowSpan="2">없음</td>
              <td className='text-center font-weight-bold' colSpan="2">질환있는 경우</td>
              <td className='text-center font-weight-bold' rowSpan="2">질병명, 내용 등</td>
            </tr>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <td className='text-center font-weight-bold'>완치</td>
              <td className='text-center font-weight-bold'>치료중</td>
            </tr>
            <tr>
              <td className='text-center font-weight-bold' rowSpan="13">지난<br/>1년 동안<br/>질병을<br/>앓았거나<br/>병원진료를<br/>받았습니까<br/>?</td>
            </tr>
            <tr>
              <td className='font-weight-bold'>1. 알레르기</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='allergy'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='allergy'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td rowSpan="3">
                <Row className='no-gutters'>
                  <Col className='d-flex justify-content-start' md="4">
                    <span>알레르기 물질 : </span>
                  </Col>
                  <Col className='d-flex justify-content-end' md="8">
                    <Input
                      type='text'
                      name='allegyMaterial'
                      style={{ width: '60%', flexGrow: 1 }}
                    />
                  </Col>
                </Row>
                <Row className='no-gutters pt-1'>
                  <Col className='d-flex justify-content-start' md="3">
                    <span>증상 : </span>
                  </Col>
                  <Col className='d-flex justify-content-end' md="9">
                    <Input
                      type='text'
                      name='allegySymptom'
                      style={{ width: '60%', flexGrow: 1 }}
                    />
                  </Col>
                </Row>
                <Row className='no-gutters pt-1'>
                  <Col className='d-flex justify-content-start' md="3">
                    <span>완화방법 : </span>
                  </Col>
                  <Col className='d-flex justify-content-end' md="9">
                    <Input
                      type='text'
                      name='allegyEaseMethod'
                      style={{ width: '60%', flexGrow: 1 }}
                    />
                  </Col>
                </Row>
              </td>
            </tr>
            <tr>
              <td className='font-weight-bold'>2. 아토피피부염</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='atopy'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='atopy'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>3. 천식</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='asthma'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='asthma'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>4. 결핵</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='Tuberculosis'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='Tuberculosis'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>5. 경련성 질환</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='convulsion'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='convulsion'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>6. 암</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='cancer'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='cancer'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>7. 당뇨병</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='diabetes'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='diabetes'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>8. 치과진료</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='dentist'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='dentist'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>9. 소아정신과질환<br/>&nbsp;&nbsp;&nbsp;(우울 등)</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='childPsy'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='childPsy'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>10. 생리통(여학생)</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='menstrual'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='menstrual'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>기타 질환 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='diseaseEtc'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='diseaseEtc'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='font-weight-bold'>수술, 입원한 경우</td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='y'
                  type='radio'
                  name='surgeryAdmission'
                  value='y'
                />
              </td>
              <td className='text-center' style={{ paddingBottom: 33, paddingLeft: 30 }}>
                <Input
                  id='n'
                  type='radio'
                  name='surgeryAdmission'
                  value='n'
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td className='text-center font-weight-bold' colSpan="4">현재 장애 유무(운동, 언어, 청력, 시력 등)</td>
              <td colSpan="3">
                <Row className='no-gutters'>
                  <Col className='d-flex' md="7">
                    <span className='pr-2'>병명 : </span>
                    <Input
                      type='text'
                      name='curretDisease'
                      style={{ width: '80%', height: 30 }}
                    />
                  </Col>
                  <Col className='d-flex justify-content-end pl-2' md="5">
                    <span className='pr-2'>장애등급 유무 : </span>
                    <Input 
                      type='text'
                      name='isDisabledGrade'
                      style={{ width: 10, height: 30, flexGrow: 1 }}
                    />
                  </Col>
                </Row>
                <Row className='no-gutters pt-2'>
                  <span className='pr-2'>현재 상태 : </span>
                  <Input 
                    type='text'
                    name='curretState'
                    style={{ width: '60%', height: 30, flexGrow: 1 }}
                  />
                </Row>
              </td>
            </tr>
            <tr>
              <td className='text-center font-weight-bold' colSpan="4">자녀 건강과 관련하여 참고해야 할 가족 병력이 있습니까?</td>
              <td colSpan="3">
                <Row className='no-gutters'>
                  <Col className='d-flex' md="7">
                    <span className='pr-2'>가족병력 : </span>
                    <Input 
                      type='text'
                      name='familyDiseaseReport'
                      style={{ width: '70%' }}
                    />
                  </Col>
                  <Col className='d-flex justify-content-end pl-2'>
                    <span className='pr-2'>누구 : </span>
                    <Input 
                      type='text'
                      name='familyWho'
                      style={{ width: 10, flexGrow: 1 }}
                    />
                  </Col>
                </Row>
              </td>
            </tr>
            <tr>
              <td className='text-center font-weight-bold' colSpan="4">치료 목적으로 학생이 계속 복용하는 약이 있습니까?</td>
              <td colSpan="3">
                <Row className='no-gutters'>
                  <span className='pr-2'>복용 중인 약품명 : </span>
                  <Input 
                    type='text'
                    name='currentMedicineName'
                    style={{ width: '60%', flexGrow: 1 }}
                  />
                </Row>
                <Row className='no-gutters pt-2'>
                  <span className='pr-2'>복용 목적 : </span>
                  <Input 
                    type='text'
                    name='medicinePurpose'
                    style={{ width: '60%', flexGrow: 1 }}
                  />
                </Row>
              </td>
            </tr>
            <tr>
              <td className='text-center font-weight-bold' colSpan="4">현재 치료 중인 질병</td>
              <td colSpan="3">
                <Row className='no-gutters'>
                  <Col className='d-flex' md="6">
                    <span className='pr-2'>질병명 : </span>
                    <Input 
                      type='text'
                      name='inTreatmentDisease'
                      style={{ width: '70%' }}
                    />
                  </Col>
                  <Col className='d-flex justify-content-end pl-2' md="6">
                    <span className='pr-2'>진료병원 : </span>
                    <Input
                      type='text'
                      name='inTreatmentHospital'
                      style={{ width: '60%', flexGrow: 1 }}
                    />
                  </Col>
                </Row>
                <Row className='no-gutters pt-2'>
                  <span className='pr-2'>내용 : </span>
                  <Input 
                    type='text'
                    name='inTreatmentDiseaseContent'
                    style={{ width: '60%', flexGrow: 1 }}
                  />
                </Row>
              </td>
            </tr>
            <tr>
              <td className='text-center font-weight-bold' colSpan="4">건강상의 이유로 학교에서 특별히 배려해야 할 점이 있습니까?<br/>(선천성질환, 호흡기질환, 심장질환, 근골격계질환, 기타 등) </td>
              <td colSpan="3">
                <Row className='no-gutters'>
                  <Input 
                    type='textarea'
                    name='considerationThing'
                    style={{ width: '100%' }}
                  />
                </Row>
              </td>
            </tr>
          </tbody>
        </Table>
      </Row>
      <Container className='pt-3 pb-3'>

        <Row>
          <Col>
              <span className='text-muted font-weight-bold' style={{ fontSize: 20 }}>▣ 응급상황 시 연락처</span>
              <Table className='emergency-management-table mt-3'>
                  <tr className='font-weight-bold text-center' style={{ backgroundColor: '#f8f9fa' }}>
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
                  <Form className='mt-3 p-2 w-100' style={{ border: '1px solid gray' }}>
                      <p>
                          1. 학생의 건강상태가 위와 같음을 확인합니다.
                      </p>
                      <p>
                          2. 학생 응급상황 발생 시에 학부모(또는 권한대행자)의 위의 연락처로 연락이 안 될 경우, 학교 내 응급환자관리 절차에 따라 학교 인근 병원 또는 학생이 주로 이용하는 병원으로 후송하는데 동의합니다.
                      </p>
                      <div className='radio-group' style={{ marginLeft: 35 }}>
                          <Input
                              id='agree'
                              type='radio'
                              name='evacuation'
                              value='agree'
                          />
                          <Label htmlFor='y'>동의</Label>
                      </div>
                      <div className='radio-group'>
                          <Input
                              id='disagree'
                              type='radio'
                              name='evacuation'
                              value='disagree'
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
                          />
                          <Label htmlFor='y'>동의</Label>
                      </div>
                      <div className='radio-group'>
                          <Input
                              id='disagree'
                              type='radio'
                              name='medicalService'
                              value='disagree'
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
                          />
                          <Label htmlFor='y'>동의</Label>
                      </div>
                      <div className='radio-group'>
                          <Input
                              id='disagree'
                              type='radio'
                              name='privacy'
                              value='disagree'
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

export default HealthExaminationSurveyForm;