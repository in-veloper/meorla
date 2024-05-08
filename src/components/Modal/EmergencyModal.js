
import React, { useState , useRef} from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Input, Button, Label, FormGroup } from 'reactstrap';
import { AgGridReact } from 'ag-grid-react';
import { IoMdRefresh } from 'react-icons/io';
import { RiSearchLine } from 'react-icons/ri';
import Masking from "components/Tools/Masking";
import ImageMapper from "react-image-mapper";
// import anatomyImage from "../../src/assets/img/anatomy_image.png";
import anatomyImage from '../../../src/assets/img/anatomy_image.png';
import anatomyImageFemale from '../../../src/assets/img/anatomy_image_female.png';
// import anatomyImageRightHand from "../../src/assets/img/anatomy_image_right_hand.png";
// import anatomyImageLeftHand from "../../src/assets/img/anatomy_image_left_hand.png";
// import anatomyImageRightFoot from "../../src/assets/img/anatomy_image_right_foot.png";
// import anatomyImageLeftFoot from "../../src/assets/img/anatomy_image_left_foot.png";

const EmergencyModal = ({ manageEmergencyModal, toggleManageEmergencyModal, searchStudentColumnDefs, notEditDefaultColDef, fetchSelectedStudentData, fetchStudentData }) => {
    const [searchStudentInEmergencyManagementRowData, setSearchStudentInEmergencyManagementRowData] = useState([]);
    const [selectedStudentInEmergencyManagement, setSelectedStudentInEmergencyManagement] = useState(null);
    const [searchCriteria, setSearchCriteria] = useState({ iGrade: "", iClass: "", iNumber: "", iName: "" });
    const [personalStudentInEmergencyManagementRowData, setPersonalStudentInEmergencyManagementRowDataRowData] = useState([]);
    const [masked, setMasked] = useState(false);
    const [clickedPoints, setClickedPoints] = useState([]);
    const [clickCounter, setClickCounter] = useState(0);

    const searchStudentInEmergencyManagementGridRef = useRef();

    const onInputChangeInEmergencyManagement = (field, value) => {
        setSearchCriteria((prevCriteria) => ({
          ...prevCriteria,
          [field]: value
        }));
    };
      
    const onGridSelectionChangedInEmergencyManagement = (event) => {
        const selectedRow = event.api.getSelectedRows()[0];
        setSelectedStudentInEmergencyManagement(selectedRow);

        fetchSelectedStudentData();
    };

    const handleKeyDownInEmergencyManagement = (e, criteria) => {
        if(e.key === 'Enter') onSearchStudentInEmergencyManagement(searchCriteria);
    };

    const onSearchStudentInEmergencyManagement = async (criteria) => {
        try {
            const studentData = await fetchStudentData(criteria);
    
            searchStudentInEmergencyManagementGridRef.current.api.setRowData(studentData);
            setSearchStudentInEmergencyManagementRowData(studentData);
    
            if(masked) {
                const maskedStudentData = studentData.map(student => ({
                    ...student,
                    sName: Masking(student.sName)
                }));

                setSearchStudentInEmergencyManagementRowData(maskedStudentData);
            }
        } catch (error) {
          console.error("학생 조회 중 ERROR", error);
        }
    };
    
    const onResetSearchInEmergencyManagement = () => {
        const api = searchStudentInEmergencyManagementGridRef.current.api;
        setSearchCriteria({ iGrade: "", iClass: "", iNumber: "", iName: "" });
        api.setRowData([]);
        setSelectedStudentInEmergencyManagement('');
        setPersonalStudentInEmergencyManagementRowDataRowData([]);
    };

    const handleImageMapperClick = (e) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        
        // 새로운 클릭한 지점을 배열에 추가
        setClickedPoints([...clickedPoints, { x, y }]);
        setClickCounter(clickCounter + 1);
    };

    const handleImageMapperEnter = (e) => {
        // console.log(e.nativeEvent.offsetX);
        // console.log(e.nativeEvent.offsetY);
    };

    const handleImageMapperMove = (e) => {
        // console.log(e.nativeEvent.offsetX);
        // console.log(e.nativeEvent.offsetY);
    };
    
    const generateAreas = () => {
        return clickedPoints.map((point, index) => ({
          name: `point_${index}`,
          shape: 'circle',
          coords: [point.x, point.y, 5], // 동그라미의 반지름
          preFillColor: 'rgba(255, 0, 0, 0.5)'
        }));
    };
    
    const saveManageEmergency = () => {
        debugger
    };

    return (
        <>
            <Modal isOpen={manageEmergencyModal} toggle={toggleManageEmergencyModal} centered style={{ minWidth: '54%' }}>
                <ModalHeader toggle={toggleManageEmergencyModal}>
                    <b className="text-muted">응급학생관리</b>
                </ModalHeader>
                <ModalBody>
                <div className="ag-theme-alpine" style={{ height: '10.5vh' }}>
                    <AgGridReact
                        rowHeight={25}
                        headerHeight={30}
                        ref={searchStudentInEmergencyManagementGridRef}
                        rowData={searchStudentInEmergencyManagementRowData} 
                        columnDefs={searchStudentColumnDefs}
                        defaultColDef={notEditDefaultColDef}
                        paginationPageSize={4}
                        overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                        rowSelection="single"
                        onSelectionChanged={onGridSelectionChangedInEmergencyManagement}
                        suppressCellFocus={true}
                    />
                </div>
                <hr/>
                <Row className="d-flex no-gutters">
                    <Col md="7">
                        <Row className="d-flex align-items-center no-gutters">
                            <Col md="9">
                                <Row className="d-flex text-muted justify-content-between align-items-center no-gutters mr-3">
                                    <label className="pr-1 pt-1">학년</label>
                                    <Input
                                        className="text-right"
                                        style={{ width: '40px', height: '27px' }}
                                        onChange={(e) => onInputChangeInEmergencyManagement("iGrade", e.target.value)}
                                        value={searchCriteria.iGrade}
                                        onKeyDown={(e) => handleKeyDownInEmergencyManagement(e, "iGrade")}
                                    />
                                    <label className="pr-1 pl-2 pt-1">반</label>
                                    <Input
                                        className="text-right"
                                        style={{ width: '40px', height: '27px' }}
                                        onChange={(e) => onInputChangeInEmergencyManagement("iClass", e.target.value)}
                                        value={searchCriteria.iClass}
                                        onKeyDown={(e) => handleKeyDownInEmergencyManagement(e, "iClass")}
                                    />
                                    <label className="pr-1 pl-2 pt-1">번호</label>
                                    <Input
                                        className="text-right"
                                        style={{ width: '40px', height: '27px' }}
                                        onChange={(e) => onInputChangeInEmergencyManagement("iNumber", e.target.value)}
                                        value={searchCriteria.iNumber}
                                        onKeyDown={(e) => handleKeyDownInEmergencyManagement(e, "iNumber")}
                                    />
                                    <label className="pr-1 pl-2 pt-1">이름</label>
                                    <Input
                                        className="text-right"
                                        style={{ width: '80px', height: '27px' }}
                                        onChange={(e) => onInputChangeInEmergencyManagement("iName", e.target.value)}
                                        value={searchCriteria.iName}
                                        onKeyDown={(e) => handleKeyDownInEmergencyManagement(e, "iName")}
                                    />
                                </Row>
                            </Col>
                            <Col md="3">
                                <Row className="d-flex align-items-center justify-content-end no-gutters ml-3 mr-4">
                                    <Button size="sm" style={{ height: 27 }} onClick={onResetSearchInEmergencyManagement}><IoMdRefresh style={{ fontSize: '15px'}} /></Button>
                                    <Button size="sm" style={{ height: 27 }} onClick={() => onSearchStudentInEmergencyManagement(searchCriteria)}><RiSearchLine style={{ fontSize: '15px' }}/></Button>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="pt-1 pr-4 d-flex no-gutters">
                            <Col md="12">
                            <div className="ag-theme-alpine" style={{ height: '10.5vh' }}>
                                <AgGridReact
                                    rowHeight={25}
                                    headerHeight={30}
                                    ref={searchStudentInEmergencyManagementGridRef}
                                    rowData={searchStudentInEmergencyManagementRowData} 
                                    columnDefs={searchStudentColumnDefs}
                                    defaultColDef={notEditDefaultColDef}
                                    paginationPageSize={4}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                    rowSelection="single"
                                    onSelectionChanged={onGridSelectionChangedInEmergencyManagement}
                                    suppressCellFocus={true}
                                />
                            </div>
                            </Col>
                        </Row>
                        <Row className='d-flex no-gutters align-items-center text-muted mt-3'>
                            <Col className='d-flex'>
                                <label className='text-center'>최초<br/>발견시간</label>
                                <Input 
                                    id='firstDiscoveryTime'
                                    className='ml-2'
                                    type='datetime-local'
                                    style={{ width: '75%' }}
                                />
                            </Col>
                            <Col className='d-flex justify-content-end mr-4'>
                                <label className='text-center'>보건교사<br/>확인시간</label>
                                <Input 
                                    id='teacherConfirmTime'
                                    className='ml-2'
                                    type='datetime-local'
                                    style={{ width: '75%' }}
                                />
                            </Col>
                        </Row>
                        <Row className='mt-2'>
                            <Col md="7" className='d-flex align-items-center text-muted pr-0'>
                                <label className='text-center'>발생장소</label>
                                <Input 
                                    id='occuringArea'
                                    className='ml-2'
                                    type='text'
                                    style={{ width: '75%' }}
                                />
                            </Col>
                            <Col className='d-flex justify-content-start text-muted align-items-center' md="5">
                                <label>최초 목격자</label>
                                <Input
                                    id='firstWitness'
                                    className='ml-2'
                                    type='text'
                                    style={{ width: '57%' }}
                                />
                            </Col>
                        </Row>
                        <Row className='d-flex no-gutters align-items-center text-muted mt-2'>
                            <label className='text-center'>활력징후</label>
                            <Input
                                id='vitalSign'
                                className='ml-2'
                                type='text'
                                style={{ width: '86%' }}
                            />
                        </Row>
                        <Row className='d-flex no-gutters text-muted align-items-center mt-2'>
                            <label className='text-center' style={{ paddingLeft: 5 }}>주증상</label>
                            <Input
                                id='mainSymptom'
                                className='p-1'
                                type='textarea'
                                style={{ width: '86%', marginLeft: 14 }}
                            />
                        </Row>
                        <Row className='d-flex no-gutters text-muted align-items-center mt-2'>
                            <label className='text-center' style={{ paddingLeft: 12}}>사고<br/>개요</label>
                            <Input
                                id='accidentOverview'
                                className='p-1'
                                type='textarea'
                                style={{ width: '86%', marginLeft: 19 }}
                            />
                        </Row>
                        <Row className='d-flex no-gutters text-muted align-items-center mt-2'>
                            <label className='text-center'>응급<br/>처리내용</label>
                            <Input
                                id='emergencyTreatmentDetail'
                                className='p-1'
                                type='textarea'
                                style={{ width: '86%', marginLeft: 8 }}
                            />
                        </Row>
                    </Col>
                    <Col md="5" className="mt-2">
                        <div className="d-flex no-gutters" style={{ border: '1.5px solid lightgrey' }} onMouseEnter={handleImageMapperEnter}>
                            <ImageMapper 
                                key={clickCounter}
                                src={selectedStudentInEmergencyManagement && selectedStudentInEmergencyManagement.sGender === '여' ? anatomyImageFemale : anatomyImage}
                                width={500}
                                height={300}
                                map={{
                                    name: 'anatomy-map',
                                    areas: generateAreas()
                                }}
                                onImageMouseMove={handleImageMapperMove}
                                onImageClick={handleImageMapperClick}
                            />
                        </div>
                        <Row className="d-flex align-items-center no-gutters text-muted mt-3">
                            <Col md="6" className='d-flex align-items-center'>
                                <label>이송시간</label>
                                <Input
                                    id='transferTime'
                                    className='ml-2'
                                    type="time"
                                    style={{ width: '60%' }}
                                />
                            </Col>
                            <Col md="6" className='d-flex align-items-center justify-content-end'>
                                <label>보호자연락처</label>
                                <Input
                                    id='guardianContact'
                                    className='ml-2'
                                    type='tel'
                                    placeholder='010-0000-0000'
                                    pattern='[0-9]{2,3}-[0-9]{3,4}-[0-9]{3,4}'
                                    maxLength={13}
                                    style={{ width: '60%' }}    
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex align-items-center no-gutters text-muted mt-2">
                            <label className='mr-2'>이송차량</label>
                            <FormGroup className='ml-4' inline>
                                <Row className='d-flex align-items-center'>
                                    <Col xs="auto">
                                        <Input
                                            id='ambulance'
                                            type='checkbox'
                                        />
                                        <Label check>구급차</Label>
                                    </Col>
                                    <Col xs="auto">
                                        <Input
                                            id='generalVehicle'
                                            type='checkbox'
                                        />
                                        <Label check>일반차량</Label>
                                    </Col>
                                    <Col xs="auto">
                                        <Input
                                            id='etcTransfer'
                                            type='checkbox'
                                        />
                                        <Label check>기타</Label>
                                    </Col>
                                    <Col style={{ width: 168 }}>
                                        <Input
                                            id='etcTransferDetail'
                                            size='sm'
                                            type='text'
                                            style={{ width: '73%', marginLeft: '-20px', height: 30 }}
                                        />
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Row>
                        <Row className="d-flex align-items-center no-gutters text-muted mt-2">
                            <label style={{ marginRight: 28 }}>이송자</label>
                            <FormGroup className='ml-3' inline>
                                <Row className='d-flex align-items-center justify-content-between'>
                                    <Col xs="auto">
                                        <Input
                                            id='paramedic'
                                            type='checkbox'
                                        />
                                        <Label check>119 대원</Label>
                                    </Col>
                                    <Col xs="auto">
                                        <Input
                                            id='schoolNurse'
                                            type='checkbox'
                                        />
                                        <Label check>보건교사</Label>
                                    </Col>
                                    <Col xs="auto">
                                        <Input
                                            id='homeroomTeacher'
                                            type='checkbox'
                                        />
                                        <Label check>담임</Label>
                                    </Col>
                                </Row>
                                <Row className='d-flex align-items-center'>
                                    <Col xs="auto" md="6">
                                        <Input
                                            id='parents'
                                            type='checkbox'
                                        />
                                        <Label check>학부모</Label>
                                    </Col>
                                    <Col className='d-flex align-items-center' xs="auto" md="6">
                                        <Input
                                            id='etcTranspoter'
                                            type='checkbox'
                                            style={{ marginLeft: '-48px'}}
                                        />
                                        <Label style={{ marginLeft: '-28px' }} check>기타</Label>
                                        <Input
                                            id='etcTranspoterDetail'
                                            size='sm'
                                            type='text'
                                            style={{ width: '95%', marginLeft: 10, height: 30 }}
                                        />
                                    </Col>
                                    <Col xs="auto" md="3">
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Row>
                        <Row className='d-flex no-gutters text-muted align-items-center mt-2'>
                            <label>이송병원</label>
                            <Input
                                id='trasferHospital'
                                className='ml-2'
                                type='text'
                                style={{ width: '86%' }}
                            />
                        </Row>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col md="3"></Col>
                    <Col className='d-flex align-items-center text-muted' md="3">
                        <label className='mr-3'>작성일</label>
                        <Input
                            id='registDate'
                            type='date'
                            style={{ width: '60%' }}
                        />
                    </Col>
                    <Col className='d-flex align-items-center text-muted' md="2">
                        <label className='mr-2'>성명</label>
                        <Input
                            id='registerName'
                            type='text'
                            style={{ width: '70%' }}
                        />
                    </Col>
                    <Col className='d-flex align-items-center text-muted' md="1">
                        <div className='mr-2'>
                            <span>(인)</span>
                        </div>
                        {/* <Button size='sm' className='ml-5'>전자서명</Button>
                        <Button size='sm' className='ml-1'>전자직인</Button> */}
                    </Col>
                    <Col md='3'></Col>
                </Row>
                </ModalBody>
                <ModalFooter className="p-0" >
                    <Row className="w-100">
                        <Col className="d-flex justify-content-start no-gutters">
                            <Button>전체등록내역</Button>
                        </Col>
                        <Col>

                        </Col>
                        <Col className='d-flex justify-content-end no-gutters'>
                            <Button className='mr-2'>초기화</Button>
                            <Button className="ml-1" onClick={saveManageEmergency}>등록</Button>
                            <Button className="ml-1" onClick={toggleManageEmergencyModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>
        </>
    )
};

export default EmergencyModal;