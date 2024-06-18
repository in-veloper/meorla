import React from "react";
import { Card, Row } from "reactstrap";

function RCE() {
    return (
        <Card className="p-3 w-100">
            <Row className="d-flex justify-content-center no-gutters font-weight-bold" style={{ fontSize: 17}}>
                이메일무단수집거부
            </Row>
            <Row className="d-flex no-gutters mt-3">
                본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며,
                이를 위반시 정보통신망법에 의해 형사처벌됨을 유념하시기 바랍니다
            </Row>
        </Card>
    );
};

export default RCE;