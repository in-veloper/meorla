import { Button, Card, CardBody, Col, Label, Row } from "reactstrap";
import React, { useState, useEffect, useRef } from "react";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import axios from 'axios';

function Examination() {
    const [hospitalData, setHospitalData] = useState(null);
    const [hospitalName, setHospitalName] = useState("");
    const [hospitalList, setHospitalList] = useState("");
    const [dynamicOptions, setDynamicOptions] = useState([]);

    const typeaheadRef = useRef(null);

    useEffect(() => {
        if(hospitalName && hospitalList.length > 0) {
            try {
                const searchOptions = hospitalList.map((hospital) => ({
                    name: hospital.dutyName,
                    address: hospital.dutyAddr,
                    category: hospital.dutyDivNam
                }));

                setDynamicOptions(searchOptions);
            } catch(error) {
                console.log("병원명 검색 중 ERROR", error);
            }
        }else{
            setDynamicOptions([]);
        }
    }, [hospitalName, hospitalList])

    const searchHospital = async (input) => {
        const searchKeyword = input.trim();
        setHospitalName(searchKeyword);

        const endPoint = 'http://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncListInfoInqire';
        const serviceKey = 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==';

        if(searchKeyword) {
            try {
                const response = await axios.get(endPoint, { 
                    params: {
                        ServiceKey: serviceKey,
                        pageNo: 1,
                        numOfRows: 10,
                        QN: searchKeyword
                    }
                }); 
                
                if(response.data.response) {
                    const items = response.data.response.body.items.item;
                    if(items) setHospitalList(items);
                }
            } catch(error) {
                console.log("병원명 검색 중 ERROR", error);
            }
        }else{
            setHospitalList([]);
        }
    }

    const handleHospitalSelect = (selectedHospital) => {
        if(selectedHospital.length > 0) {
            setHospitalName(selectedHospital[0].dutyName);
            setDynamicOptions([...dynamicOptions, selectedHospital[0]]);
        }
        setHospitalList([]);
    }

    const renderMenuItemChildren = (option, props, index) => {
        return (
            <span><b>{option.name}</b> [{option.category}] &nbsp;::&nbsp; {option.address}</span>
        );
    }

    const handleReset = () => {
        typeaheadRef.current.clear();
    }

    return(
        <>
            <div className="content" style={{ height: '84.8vh' }}>
                <Card style={{ width: '100%', height: '7vh' }}>
                    <CardBody className="d-flex align-items-center pt-2">
                        <Row className="align-items-center w-100">
                            <Col md="1" className="text-center">
                                <Label className="text-muted">병·의원명</Label>
                            </Col>
                            <Col md="7">
                                <div style={{ width: '100%' }}>
                                    <Typeahead
                                        ref={typeaheadRef}
                                        id="basic-typeahead-single"
                                        labelKey="name"
                                        onChange={handleHospitalSelect}
                                        options={dynamicOptions}
                                        placeholder="병·의원명을 입력하세요"
                                        onInputChange={(input) => {
                                            searchHospital(input);
                                        }}
                                        emptyLabel="검색 결과가 없습니다."
                                        renderMenuItemChildren={renderMenuItemChildren}
                                        style={{height: '38px'}}
                                    />
                                </div>
                            </Col>
                            <Col md="1" className="pl-0">
                                <Button onClick={handleReset}>초기화</Button>
                            </Col>
                            <Col md="3" className="d-flex justify-content-end ml-auto pr-0">
                                <Button className="">템플릿 다운로드</Button>
                                <Button className="ml-2">건강검진 결과 업로드</Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

export default Examination;