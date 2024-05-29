import React from 'react';
import { Table, Row, Input } from 'reactstrap';

function HealthExaminationSurveyForm() {
  return (
    <div>
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
      <Row className="d-flex justify-content-center no-gutters pl-3 pr-3 pt-2">
        <Table bordered responsive>
          <tbody>
            <tr>
              <td colSpan="7" className='text-center'>현재 건강문제로 인한 학교 내 활동에 지장 없음 (예, 아니오)</td>
            </tr>
            <tr>
              <td colSpan="4">지난 1년 동안 받은 감염병 예방접종은 다음 중 어느 것입니까?</td>
              <td colSpan="3">①&nbsp;&nbsp;일본뇌염&nbsp;&nbsp;&nbsp;&nbsp;②&nbsp;&nbsp;Td/Tdap&nbsp;&nbsp;&nbsp;&nbsp;③&nbsp;&nbsp;자궁경부<br/> ④ 기타(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;,모름  )&nbsp;&nbsp;⑤&nbsp;&nbsp;없음</td>
            </tr>
            <tr>
              <td colSpan="2" rowSpan="2">질환</td>
              <td rowSpan="2">있음</td>
              <td rowSpan="2">없음</td>
              <td colSpan="2">질환있는 경우</td>
              <td rowSpan="2">질병명, 내용 등</td>
            </tr>
            <tr>
              <td>완치</td>
              <td>치료중</td>
            </tr>
            <tr>
              <td rowSpan="13">지난<br/>1년 동안<br/>질병을<br/>앓았거나<br/>병원진료를<br/>받았습니까<br/>?</td>
            </tr>
            <tr>
              <td>1. 알레르기</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td rowSpan="3">알레르기 물질:<br/>증상:<br/>완화방법:</td>
            </tr>
            <tr>
              <td>2. 아토피피부염</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>3. 천식</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>4. 결핵</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>5. 경련성 질환</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>6. 암</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>7. 당뇨병</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>8. 치과진료</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>9. 소아정신과질환(우울 등)</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>10. 생리통(여학생)</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>기타 질환 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>수술, 입원한 경우</td>
              <td>①</td>
              <td>②</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colSpan="4">현재 장애 유무(운동, 언어, 청력, 시력 등)</td>
              <td colSpan="3">병명:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;장애등급 유무:<br/>현재 상태:</td>
            </tr>
            <tr>
              <td colSpan="4">자녀 건강과 관련하여 참고해야 할 가족 병력이 있습니까?</td>
              <td colSpan="3">가족 병력:            누구:</td>
            </tr>
            <tr>
              <td colSpan="4">치료 목적으로 학생이 계속 복용하는 약이 있습니까?</td>
              <td colSpan="3">복용 중인 약품명:<br/>복용 목적:</td>
            </tr>
            <tr>
              <td colSpan="4">현재 치료 중인 질병</td>
              <td colSpan="3">질병명:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;진료병원:<br/>내용:</td>
            </tr>
            <tr>
              <td colSpan="4">건강상의 이유로 학교에서 특별히 배려해야 할 점이<br/>있습니까?(선천성질환, 호흡기질환, 심장질환, 근골<br/>격계질환, 기타 등) </td>
              <td colSpan="3"></td>
            </tr>
          </tbody>
        </Table>
      </Row>
    </div>
  );
}

export default HealthExaminationSurveyForm;