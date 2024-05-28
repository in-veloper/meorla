import React from 'react';
import { Table } from 'reactstrap';

function HealthExaminationSurveyForm() {
  return (
    <div>
      <Table bordered responsive>
        <tbody>
          <tr>
            <td colSpan="7" className='text-center'>현재 건강문제로 인한 학교 내 활동에 지장 없음 (예, 아니오)</td>
          </tr>
          <tr>
            <td colSpan="4">지난 1년 동안 받은 감염병 예방접종은 다음 중 어느 것입니까?</td>
            <td colSpan="3">① 일본뇌염 ② Td/Tdap ③ 자궁경부 ④ 기타( , ,모름  ) ⑤ 없음</td>
          </tr>
          <tr>
            <td colSpan="2">질환</td>
            <td>있음</td>
            <td>없음</td>
            <td></td>
          </tr>
          <tr>
            <td>알레르기</td>
            <td>1</td>
            <td>예</td>
            <td>알레르기 멀티: 증상</td>
            <td>운동하면</td>
          </tr>
          <tr>
            <td>아토피피부염</td>
            <td>2</td>
            <td>예</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>천식</td>
            <td>3</td>
            <td>아니오</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>결핵</td>
            <td>4</td>
            <td>예</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>감염성 질환</td>
            <td>5</td>
            <td>아니오</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>암</td>
            <td>6</td>
            <td>아니오</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>당뇨병</td>
            <td>7</td>
            <td>예</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>치과질환</td>
            <td>8</td>
            <td>아니오</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>소아심장질환(유형 5)</td>
            <td>9</td>
            <td>예</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>상비약(응급상황)</td>
            <td>10</td>
            <td>예</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default HealthExaminationSurveyForm;