import React from 'react';
import { Table } from 'reactstrap';

function HealthExaminationSurveyForm() {
  return (
    <div>
      <Table bordered responsive>
        <thead>
          <tr>
            <th colSpan="5" className="text-center">현재 건강문제로 인한 학교 내 활동에 지장 없음 (예, 아니오)</th>
          </tr>
          <tr>
            <th>질병</th>
            <th>예방접종 번호</th>
            <th>예방접종 필요 유무</th>
            <th>접종시기 및 간격</th>
            <th>접종 물질, 내용 등</th>
          </tr>
        </thead>
        <tbody>
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