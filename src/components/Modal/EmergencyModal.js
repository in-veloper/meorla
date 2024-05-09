
import React, { useState , useRef, useCallback, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Input, Button, Label, FormGroup } from 'reactstrap';
import { AgGridReact } from 'ag-grid-react';
import { IoMdRefresh } from 'react-icons/io';
import { RiSearchLine } from 'react-icons/ri';
import Masking from "components/Tools/Masking";
// import ImageMapper from "react-image-mapper";
import ImageMapper from "react-img-mapper";
import { useUser } from "contexts/UserContext";
// import anatomyImage from "../../src/assets/img/anatomy_image.png";
import anatomyImage from '../../../src/assets/img/anatomy_image.png';
import anatomyImageFemale from '../../../src/assets/img/anatomy_image_female.png';
import axios from 'axios';
import NotiflixWarn from 'components/Notiflix/NotiflixWarn';
import NotiflixInfo from 'components/Notiflix/NotiflixInfo';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// import malgun from '../../assets/fonts/malgun.ttf.base64';
import NanumGothic from '../../assets/fonts/NanumGothic.ttf';
// import anatomyImageRightHand from "../../src/assets/img/anatomy_image_right_hand.png";
// import anatomyImageLeftHand from "../../src/assets/img/anatomy_image_left_hand.png";
// import anatomyImageRightFoot from "../../src/assets/img/anatomy_image_right_foot.png";
// import anatomyImageLeftFoot from "../../src/assets/img/anatomy_image_left_foot.png";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const EmergencyModal = ({ manageEmergencyModal, toggleManageEmergencyModal, searchStudentColumnDefs, notEditDefaultColDef, fetchSelectedStudentData, fetchStudentData }) => {
    const { user } = useUser();  
    const [searchStudentInEmergencyManagementRowData, setSearchStudentInEmergencyManagementRowData] = useState([]);
    const [selectedStudentInEmergencyManagement, setSelectedStudentInEmergencyManagement] = useState(null);
    const [searchCriteria, setSearchCriteria] = useState({ iGrade: "", iClass: "", iNumber: "", iName: "" });
    const [personalStudentInEmergencyManagementRowData, setPersonalStudentInEmergencyManagementRowDataRowData] = useState([]);
    const [masked, setMasked] = useState(false);
    const [firstDiscoveryTimeValue, setFirstDiscoveryTimeValue] = useState("");
    const [teacherConfirmTimeValue, setTeacherConfirmTimeValue] = useState("");
    const [occuringAreaValue, setOccuringAreaValue] = useState("");
    const [firstWitnessValue, setFirstWitnessValue] = useState("");
    const [vitalSignValue, setVitalSignValue] = useState("");
    const [mainSymptomValue, setMainSymptomValue] = useState("");
    const [accidentOverviewValue, setAccidentOverviewValue] = useState("");
    const [emergencyTreatmentDetailValue, setEmergencyTreatmentDetailValue] = useState("");
    const [transferTimeValue, setTransferTimeValue] = useState("");
    const [guardianContactValue, setGuardianContactValue] = useState("");
    const [transferHospitalValue, setTransferHospitalValue] = useState("");
    const [registDateValue, setRegistDateValue] = useState("");
    const [registerNameValue, setRegisterNameValue] = useState("");
    const [clickedPoints, setClickedPoints] = useState([]);
    const [clickCounter, setClickCounter] = useState(0);
    const [transferCheckedItems, setTransferCheckedItems] = useState({
        ambulance: false,
        generalVehicle: false,
        etcTransfer: false
    });
    const [etcTransferDetail, setEtcTransferDetail] = useState('');
    const [transpoterCheckedItems, setTranspoterCheckedItems] = useState({
        paramedic: false,
        schoolNurse: false,
        homeroomTeacher: false,
        parents: false,
        etcTranspoter: false
    });
    const [etcTranspoterDetail, setEtcTranspoterDetail] = useState('');
    const [entireManageEmergencyRowData, setEntireManageEmergencyRowData] = useState([]);
    const [genderInImageMapper, setGenderInImageMapper] = useState('M');
    const [selectedEmergencyStudent, setSelectedEmergencyStudent] = useState(null);

    const searchStudentInEmergencyManagementGridRef = useRef();
    const entireManageEmergencyGridRef = useRef();

    const [entireManageEmergencyColumnDefs] = useState([
        { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
        { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
        { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
        { field: "sName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" }},
        { field: "mainSymptom", headerName: "주증상", flex: 3, cellStyle: { textAlign: "left" }},
        { field: "transferHospital", headerName: "이송병원", flex: 1.5, cellStyle: { textAlign: "center" }},
        { field: "registDate", headerName: "작성일", flex: 1.5, cellStyle: { textAlign: "center" }},
      ]);

    const onInputChangeInEmergencyManagement = (field, value) => {
        setSearchCriteria((prevCriteria) => ({
          ...prevCriteria,
          [field]: value
        }));
    };
      
    const onGridSelectionChangedInEmergencyManagement = (event) => {
        const selectedRow = event.api.getSelectedRows()[0];
        setSelectedStudentInEmergencyManagement(selectedRow);
        
        if(selectedRow.sGender) selectedRow.sGender === "여" ? setGenderInImageMapper('F') : setGenderInImageMapper('M');

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
    
    const saveManageEmergency = async () => {
        const firstDiscoveryTime = document.getElementById('firstDiscoveryTime').value;
        const teacherConfirmTime = document.getElementById('teacherConfirmTime').value;
        const occuringArea = document.getElementById('occuringArea').value;
        const firstWitness = document.getElementById('firstWitness').value;
        const vitalSign = document.getElementById('emergencyVitalSign').value;
        const mainSymptom = document.getElementById('mainSymptom').value;
        const accidentOverview = document.getElementById('accidentOverview').value;
        const emergencyTreatmentDetail = document.getElementById('emergencyTreatmentDetail').value;
        const transferTime = document.getElementById('transferTime').value;
        const guardianContact = document.getElementById('guardianContact').value;
        const transferHospital = document.getElementById('transferHospital').value;
        const registDate = document.getElementById('registDate').value;
        const registerName = document.getElementById('registerName').value;
        const bodyChartPoints = clickedPoints;

        
        const selectedTranspoter = Object.entries(transpoterCheckedItems)
        .filter(([key, value]) => value)
        .map(([key]) => key)[0];
        
        if(transpoterCheckedItems.etcTranspoter) {
            selectedTranspoter.push('기타', etcTranspoterDetail);
        }

        const selectedTransfer = Object.entries(transferCheckedItems)
        .filter(([key, value]) => value)
        .map(([key]) => key)[0];

        if(transferCheckedItems.etcTransfer) {
            selectedTransfer.push('기타', etcTransferDetail);
        }

        if(user && selectedStudentInEmergencyManagement) {
            const sGrade = selectedStudentInEmergencyManagement.sGrade;
            const sClass = selectedStudentInEmergencyManagement.sClass;
            const sNumber = selectedStudentInEmergencyManagement.sNumber;
            const sGender = selectedStudentInEmergencyManagement.sGender;
            const sName = selectedStudentInEmergencyManagement.sName;
            
            const response = await axios.post(`http://${BASE_URL}:8000/manageEmergency/saveEmergencyManagement`, {
                userId: user.userId,
                schoolCode: user.schoolCode,
                sGrade: sGrade,
                sClass: sClass,
                sNumber: sNumber,
                sGender: sGender,
                sName: sName,
                firstDiscoveryTime: firstDiscoveryTime,
                teacherConfirmTime: teacherConfirmTime,
                occuringArea: occuringArea,
                firstWitness: firstWitness,
                vitalSign: vitalSign,
                mainSymptom: mainSymptom,
                accidentOverview: accidentOverview,
                emergencyTreatmentDetail: emergencyTreatmentDetail,
                transferTime: transferTime,
                guardianContact: guardianContact,
                transferHospital: transferHospital,
                registDate: registDate,
                registerName: registerName,
                bodyChartPoints: JSON.stringify(bodyChartPoints),
                transferVehicle: selectedTransfer,
                transpoter: selectedTranspoter
            });

            if(response.data === 'success') {
                const infoMessage = "응급 학생이 정상적으로 등록되었습니다";
                NotiflixInfo(infoMessage, true);
                fetchEntireManageEmergencyData();
            }
        }else{
            const warnMessage = "선택된 응급 대상 학생이 없습니다<br/>대상 학생을 선택해 주세요";
            NotiflixWarn(warnMessage);
            return;
        }
    };

    const handleTranspoterCheckboxChange = (e) => {
        const { id, checked } = e.target;
        setTranspoterCheckedItems({ ...transpoterCheckedItems, [id]: checked });
    };

    const handleEtcTranspoterDetailChange = (e) => {
        setEtcTranspoterDetail(e.target.value);
    };

    const handleTransferCheckboxChange = (e) => {
        const { id, checked } = e.target;
        setTransferCheckedItems({ ...transferCheckedItems, [id]: checked });
    };

    const handleEtcTransferDetailChange = (e) => {
        setEtcTransferDetail(e.target.value);
    };

    const resetManageEmergency = () => {
        setFirstDiscoveryTimeValue("");
        setTeacherConfirmTimeValue("");
        setOccuringAreaValue("");
        setFirstWitnessValue("");
        setVitalSignValue("");
        setMainSymptomValue("");
        setAccidentOverviewValue("");
        setEmergencyTreatmentDetailValue("");
        setTransferTimeValue("");
        setGuardianContactValue("");
        setTransferHospitalValue("");
        setRegistDateValue("");
        setRegisterNameValue("");

        setTransferCheckedItems({
            ambulance: false,
            generalVehicle: false,
            etcTransfer: false
        });
        setEtcTransferDetail("");
        
        setTranspoterCheckedItems({
            paramedic: false,
            schoolNurse: false,
            homeroomTeacher: false,
            parents: false,
            etcTranspoter: false
        });
        setEtcTranspoterDetail("");

        onResetSearchInEmergencyManagement();
        setSearchStudentInEmergencyManagementRowData([]);
        setClickedPoints([]);
    };

    const fetchEntireManageEmergencyData = useCallback( async () => {
        if(user) {
            const response = await axios.get(`http://${BASE_URL}:8000/manageEmergency/getManageEmergencyData`, {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });

            if(response.data) setEntireManageEmergencyRowData(response.data);                
        }
    }, [user]);

    useEffect(() => {
        fetchEntireManageEmergencyData();
    }, [fetchEntireManageEmergencyData]);

    const onSelectionChangedInEntireEmergencyGrid = (param) => {
        const selectedRow = param.api.getSelectedRows()[0];
        const { transferVehicle, transpoter, etcTransferDetail, etcTranspoterDetail } = selectedRow;

        if(selectedRow) selectedRow.sGender === "여" ? setGenderInImageMapper('F') : setGenderInImageMapper('M');

        setSelectedEmergencyStudent(selectedRow);
        setFirstDiscoveryTimeValue(selectedRow.firstDiscoveryTime);
        setTeacherConfirmTimeValue(selectedRow.teacherConfirmTime);
        setOccuringAreaValue(selectedRow.occuringArea);
        setFirstWitnessValue(selectedRow.firstWitness);
        setVitalSignValue(selectedRow.vitalSign);
        setMainSymptomValue(selectedRow.mainSymptom);
        setAccidentOverviewValue(selectedRow.accidentOverview);
        setEmergencyTreatmentDetailValue(selectedRow.emergencyTreatmentDetail);
        setTransferTimeValue(selectedRow.transferTime);
        setGuardianContactValue(selectedRow.guardianContact);
        setTransferHospitalValue(selectedRow.transferHospital);
        setRegistDateValue(selectedRow.registDate);
        setRegisterNameValue(selectedRow.registerName);

        setTransferCheckedItems({
            ambulance: transferVehicle === 'ambulance',
            generalVehicle: transferVehicle === 'generalVehicle',
            etcTransfer: transferVehicle === 'etcTransfer'
        });
        setEtcTransferDetail(etcTransferDetail);

        setTranspoterCheckedItems({
            paramedic: transpoter === 'paramedic',
            schoolNurse: transpoter === 'schoolNurse',
            homeroomTeacher: transpoter === 'homeroomTeacher',
            parents: transpoter === 'parents',
            etcTranspoter: transpoter === 'etcTranspoter'
        });
        setEtcTranspoterDetail(etcTranspoterDetail);

        if(selectedRow.bodyChartPoints) {
            const bodyChartPoints = JSON.parse(selectedRow.bodyChartPoints);
            setClickedPoints(bodyChartPoints);
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF("p", "mm", "a4");

        fetch(NanumGothic)
        .then(response => response.blob())
        .then(fontBlob => {
            const reader = new FileReader();
            reader.readAsDataURL(fontBlob);
            reader.onload = () => {
                const NanumGothicBase64 = reader.result.split(',')[1];
                const tableWidth = 150; // 표의 너비
                const pageWidth = doc.internal.pageSize.getWidth(); // 용지의 너비

                doc.addFileToVFS('NanumGothic.ttf', NanumGothicBase64);
                doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
                doc.setFont('NanumGothic');

                doc.autoTable({
                    startX: (pageWidth - tableWidth) / 2,
                    startY: 20,
                    tableWidth: tableWidth,
                    styles: { font: 'NanumGothic', fontStyle: 'bold', fontSize: 25, textColor: [255, 255, 255] },
                    margin: { left: (pageWidth - tableWidth) / 2, },
                    body: [
                        [
                            { content: '응급사고 및 이송 기록지', styles: { fillColor: [240, 114, 106], halign: 'center' } }
                        ]
                    ]
                });
                doc.setFontSize(12);
                doc.text(165, 45, user.schoolName);

                doc.autoTable({
                    startY: 50,
                    headStyles: { fillColor: [243, 159, 155], halign: 'center', fontStyle: 'bold', textColor: [0, 0, 0] },
                    theme: 'grid',
                    tableLineColor: [187, 67, 48],
                    lineWidth: 1.5,
                    styles: { font: 'NanumGothic', fontStyle: 'bold', fontSize: 12, textColor: [255, 255, 255] },
                    head: [['학년반', '학생명', '성별', '보호자 전화번호', '담임교사']],
                    body: [
                        [
                            { content: selectedEmergencyStudent.sGrade + "학년 " + selectedEmergencyStudent.sClass + "반", textColor: [0, 0, 0] }, // 폰트 색상 변경
                            { content: selectedEmergencyStudent.sName, textColor: [0, 0, 0] },
                            { content: selectedEmergencyStudent.sGender, textColor: [0, 0, 0] },
                            { content: selectedEmergencyStudent.guardianContact, textColor: [0, 0, 0] },
                            { content: "", textColor: [0, 0, 0] }
                        ]
                    ]
                });
                
                doc.save('document.pdf');
            }
        });
    };
    
    return (
        <>
            <Modal isOpen={manageEmergencyModal} toggle={toggleManageEmergencyModal} centered style={{ minWidth: '54%' }}>
                <ModalHeader toggle={toggleManageEmergencyModal}>
                    <b className="text-muted">응급학생관리</b>
                </ModalHeader>
                <ModalBody>
                    <Row className='d-flex align-items-center no-gutters text-muted pb-2'>
                        <label style={{ fontSize: 18, fontWeight: 'bold' }}>전체등록내역</label>
                    </Row>
                    <div className="ag-theme-alpine" style={{ height: '10.5vh' }}>
                        <AgGridReact
                            rowHeight={25}
                            headerHeight={30}
                            ref={entireManageEmergencyGridRef}
                            rowData={entireManageEmergencyRowData} 
                            columnDefs={entireManageEmergencyColumnDefs}
                            defaultColDef={notEditDefaultColDef}
                            paginationPageSize={4}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            rowSelection="single"
                            onSelectionChanged={onSelectionChangedInEntireEmergencyGrid}
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
                                        value={firstDiscoveryTimeValue}
                                        onChange={(e) => setFirstDiscoveryTimeValue(e.target.value)}
                                    />
                                </Col>
                                <Col className='d-flex justify-content-end mr-4'>
                                    <label className='text-center'>보건교사<br/>확인시간</label>
                                    <Input 
                                        id='teacherConfirmTime'
                                        className='ml-2'
                                        type='datetime-local'
                                        style={{ width: '75%' }}
                                        value={teacherConfirmTimeValue}
                                        onChange={(e) => setTeacherConfirmTimeValue(e.target.value)}
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
                                        value={occuringAreaValue}
                                        onChange={(e) => setOccuringAreaValue(e.target.value)}
                                    />
                                </Col>
                                <Col className='d-flex justify-content-start text-muted align-items-center' md="5">
                                    <label>최초 목격자</label>
                                    <Input
                                        id='firstWitness'
                                        className='ml-2'
                                        type='text'
                                        style={{ width: '57%' }}
                                        value={firstWitnessValue}
                                        onChange={(e) => setFirstWitnessValue(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row className='d-flex no-gutters align-items-center text-muted mt-2'>
                                <label className='text-center'>활력징후</label>
                                <Input
                                    id='emergencyVitalSign'
                                    className='ml-2'
                                    type='text'
                                    style={{ width: '86%' }}
                                    value={vitalSignValue}
                                    onChange={(e) => setVitalSignValue(e.target.value)}
                                />
                            </Row>
                            <Row className='d-flex no-gutters text-muted align-items-center mt-2'>
                                <label className='text-center' style={{ paddingLeft: 5 }}>주증상</label>
                                <Input
                                    id='mainSymptom'
                                    className='p-1'
                                    type='textarea'
                                    style={{ width: '86%', marginLeft: 14 }}
                                    value={mainSymptomValue}
                                    onChange={(e) => setMainSymptomValue(e.target.value)}
                                />
                            </Row>
                            <Row className='d-flex no-gutters text-muted align-items-center mt-2'>
                                <label className='text-center' style={{ paddingLeft: 12}}>사고<br/>개요</label>
                                <Input
                                    id='accidentOverview'
                                    className='p-1'
                                    type='textarea'
                                    style={{ width: '86%', marginLeft: 19 }}
                                    value={accidentOverviewValue}
                                    onChange={(e) => setAccidentOverviewValue(e.target.value)}
                                />
                            </Row>
                            <Row className='d-flex no-gutters text-muted align-items-center mt-2'>
                                <label className='text-center'>응급<br/>처리내용</label>
                                <Input
                                    id='emergencyTreatmentDetail'
                                    className='p-1'
                                    type='textarea'
                                    style={{ width: '86%', marginLeft: 8 }}
                                    value={emergencyTreatmentDetailValue}
                                    onChange={(e) => setEmergencyTreatmentDetailValue(e.target.value)}
                                />
                            </Row>
                        </Col>
                        <Col md="5" className="mt-2">
                            <div className="d-flex no-gutters" style={{ border: '1.5px solid lightgrey' }} onMouseEnter={handleImageMapperEnter}>
                                <ImageMapper 
                                    src={genderInImageMapper && genderInImageMapper === 'F' ? anatomyImageFemale : anatomyImage}
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
                                        value={transferTimeValue}
                                        onChange={(e) => setTransferTimeValue(e.target.value)}
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
                                        value={guardianContactValue}
                                        onChange={(e) => setGuardianContactValue(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row className="d-flex align-items-center no-gutters text-muted mt-2">
                                <label className='mr-2'>이송차량</label>
                                <FormGroup className='ml-4' inline>
                                    <Row className='d-flex align-items-center'>
                                        <Col xs="auto" md="3">
                                            <Input
                                                id='ambulance'
                                                type='checkbox'
                                                onChange={handleTransferCheckboxChange}
                                                checked={transferCheckedItems.ambulance}
                                            />
                                            <Label check>구급차</Label>
                                        </Col>
                                        <Col xs="auto" md="4">
                                            <Input
                                                id='generalVehicle'
                                                type='checkbox'
                                                onChange={handleTransferCheckboxChange}
                                                checked={transferCheckedItems.generalVehicle}
                                            />
                                            <Label check>일반차량</Label>
                                        </Col>
                                        <Col xs="auto" md="2" style={{ marginLeft: '-10px'}}>
                                            <Input
                                                id='etcTransfer'
                                                type='checkbox'
                                                onChange={handleTransferCheckboxChange}
                                                checked={transferCheckedItems.etcTransfer}
                                            />
                                            <Label check>기타</Label>
                                        </Col>
                                        <Col md="3" style={{ width: 168 }}>
                                            <Input
                                                id='etcTransferDetail'
                                                bsSize='sm'
                                                type='text'
                                                style={{ width: 109, marginLeft: '-30px', height: 30 }}
                                                onChange={handleEtcTransferDetailChange}
                                                value={etcTransferDetail}
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
                                                onChange={handleTranspoterCheckboxChange}
                                                checked={transpoterCheckedItems.paramedic}
                                            />
                                            <Label check>119 대원</Label>
                                        </Col>
                                        <Col xs="auto">
                                            <Input
                                                id='schoolNurse'
                                                type='checkbox'
                                                onChange={handleTranspoterCheckboxChange}
                                                checked={transpoterCheckedItems.schoolNurse}
                                            />
                                            <Label check>보건교사</Label>
                                        </Col>
                                        <Col xs="auto" style={{ marginRight: '-50px'}}>
                                            <Input
                                                id='homeroomTeacher'
                                                type='checkbox'
                                                onChange={handleTranspoterCheckboxChange}
                                                checked={transpoterCheckedItems.homeroomTeacher}
                                            />
                                            <Label check>담임</Label>
                                        </Col>
                                    </Row>
                                    <Row className='d-flex align-items-center'>
                                        <Col xs="auto" md="7">
                                            <Input
                                                id='parents'
                                                type='checkbox'
                                                onChange={handleTranspoterCheckboxChange}
                                                checked={transpoterCheckedItems.parents}
                                            />
                                            <Label check>학부모</Label>
                                        </Col>
                                        <Col className='d-flex align-items-center' xs="auto" md="5" style={{ width: '100%'}}>
                                            <Input
                                                id='etcTranspoter'
                                                type='checkbox'
                                                style={{ marginLeft: '-49px'}}
                                                onChange={handleTranspoterCheckboxChange}
                                                checked={transpoterCheckedItems.etcTranspoter}
                                            />
                                            <Label style={{ marginLeft: '-29px' }} check>기타</Label>
                                            <Input
                                                id='etcTranspoterDetail'
                                                bsSize='sm'
                                                type='text'
                                                style={{ width: '93%', marginLeft: 10, height: 30 }}
                                                onChange={handleEtcTranspoterDetailChange}
                                                value={etcTranspoterDetail}
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
                                    id='transferHospital'
                                    className='ml-2'
                                    type='text'
                                    style={{ width: '86%' }}
                                    value={transferHospitalValue}
                                    onChange={(e) => setTransferHospitalValue(e.target.value)}
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
                                value={registDateValue}
                                onChange={(e) => setRegistDateValue(e.target.value)}
                            />
                        </Col>
                        <Col className='d-flex align-items-center text-muted' md="2">
                            <label className='mr-2'>성명</label>
                            <Input
                                id='registerName'
                                type='text'
                                style={{ width: '70%' }}
                                value={registerNameValue}
                                onChange={(e) => setRegisterNameValue(e.target.value)}
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
                            <Button onClick={handleDownloadPDF}>PDF 다운로드</Button>
                        </Col>
                        <Col>

                        </Col>
                        <Col className='d-flex justify-content-end no-gutters'>
                            <Button className='mr-2' onClick={resetManageEmergency}>초기화</Button>
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