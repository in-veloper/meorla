
import React, { useState , useRef, useCallback, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Input, Button, Label, FormGroup } from 'reactstrap';
import { AgGridReact } from 'ag-grid-react';
import { IoMdRefresh } from 'react-icons/io';
import { RiSearchLine } from 'react-icons/ri';
import Masking from "components/Tools/Masking";
import ImageMapper from "react-img-mapper";
import { useUser } from "contexts/UserContext";
import anatomyImage from '../../../src/assets/img/anatomy_image.png';
import anatomyImageFemale from '../../../src/assets/img/anatomy_image_female.png';
import axios from 'axios';
import NotiflixWarn from 'components/Notiflix/NotiflixWarn';
import NotiflixInfo from 'components/Notiflix/NotiflixInfo';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as htmlToImage from 'html-to-image';
import NanumGothic from '../../assets/fonts/NanumGothic.ttf';
import NanumGothicBold from '../../assets/fonts/NanumGothicBold.ttf';
import { Block } from 'notiflix/build/notiflix-block-aio';
import { useContextMenu, Menu, Item } from 'react-contexify';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const MENU_ID_GRID = 'grid_context_menu';

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
    const [homeroomTeacherNameValue, setHomeroomTeacherNameValue] = useState("");
    const [clickedPoints, setClickedPoints] = useState([]);
    const [clickCounter, setClickCounter] = useState(0);
    const [transferCheckedItems, setTransferCheckedItems] = useState({
        ambulance: false,
        generalVehicle: false,
        etcTransfer: false
    });
    const [etcTransferDetail, setEtcTransferDetail] = useState("");
    const [transpoterCheckedItems, setTranspoterCheckedItems] = useState({
        paramedic: false,
        schoolNurse: false,
        homeroomTeacher: false,
        parents: false,
        etcTranspoter: false
    });
    const [etcTranspoterDetail, setEtcTranspoterDetail] = useState("");
    const [entireManageEmergencyRowData, setEntireManageEmergencyRowData] = useState([]);
    const [genderInImageMapper, setGenderInImageMapper] = useState('M');
    const [selectedEmergencyStudent, setSelectedEmergencyStudent] = useState(null);
    const [entireSelectedRow, setEntireSelectedRow] = useState(null);
    const [searchStartDate, setSearchStartDate] = useState("");
    const [searchEndDate, setSearchEndDate] = useState("");
    const [searchSname, setSearchSname] = useState("");
    const [selectedEmergencyRow, setSelectedEmergencyRow] = useState(null);

    const searchStudentInEmergencyManagementGridRef = useRef(null);
    const entireManageEmergencyGridRef = useRef(null);
    const imageMapperRef = useRef(null);

    const { show } = useContextMenu({
        id: MENU_ID_GRID
    });

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
        setClickedPoints([]);

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
            
            if(searchStudentInEmergencyManagementGridRef.current) {
                searchStudentInEmergencyManagementGridRef.current.api.setRowData(studentData);
                setSearchStudentInEmergencyManagementRowData(studentData);
            }
    
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

    useEffect(() => {
        onSearchStudentInEmergencyManagement(searchCriteria);
    }, [manageEmergencyModal]);
    
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

    };

    const handleImageMapperMove = (e) => {

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
        const homeroomTeacherName = document.getElementById('homeroomTeacherName').value;
        const registDate = document.getElementById('registDate').value;
        const registerName = document.getElementById('registerName').value;
        const bodyChartPoints = clickedPoints;

        
        let selectedTranspoter = Object.entries(transpoterCheckedItems)
        .filter(([key, value]) => value)
        .map(([key]) => key)[0];
        
        if(transpoterCheckedItems.etcTranspoter) selectedTranspoter = selectedTranspoter + "::" + etcTranspoterDetail;

        let selectedTransfer = Object.entries(transferCheckedItems)
        .filter(([key, value]) => value)
        .map(([key]) => key)[0];

        if(transferCheckedItems.etcTransfer) selectedTransfer = selectedTransfer + "::" + etcTransferDetail;
        
        if(user && selectedStudentInEmergencyManagement) {
            const sGrade = selectedStudentInEmergencyManagement.sGrade;
            const sClass = selectedStudentInEmergencyManagement.sClass;
            const sNumber = selectedStudentInEmergencyManagement.sNumber;
            const sGender = selectedStudentInEmergencyManagement.sGender;
            const sName = selectedStudentInEmergencyManagement.sName;
            
            const response = await axios.post(`${BASE_URL}/api/manageEmergency/saveEmergencyManagement`, {
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
                homeroomTeacherName: homeroomTeacherName,
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

    const updateManageEmergency = async () => {
        if(entireSelectedRow) {
            const rowId = entireSelectedRow.id;
            const sGrade = entireSelectedRow.sGrade;
            const sClass = entireSelectedRow.sClass;
            const sNumber = entireSelectedRow.sNumber;
            const sGender = entireSelectedRow.sGender;
            const sName = entireSelectedRow.sName;
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
            const homeroomTeacherName = document.getElementById('homeroomTeacherName').value;
            const registDate = document.getElementById('registDate').value;
            const registerName = document.getElementById('registerName').value;
            const bodyChartPoints = clickedPoints;

            let selectedTranspoter = Object.entries(transpoterCheckedItems)
            .filter(([key, value]) => value)
            .map(([key]) => key)[0];
            
            if(transpoterCheckedItems.etcTranspoter) selectedTranspoter = selectedTranspoter + "::" + etcTranspoterDetail;

            let selectedTransfer = Object.entries(transferCheckedItems)
            .filter(([key, value]) => value)
            .map(([key]) => key)[0];

            if(transferCheckedItems.etcTransfer) selectedTransfer = selectedTransfer + "::" + etcTransferDetail;

            const response = await axios.post(`${BASE_URL}/api/manageEmergency/updateEmergencyManagement`, {
                userId: user.userId,
                schoolCode: user.schoolCode,
                rowId: rowId,
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
                homeroomTeacherName: homeroomTeacherName,
                registDate: registDate,
                registerName: registerName,
                bodyChartPoints: JSON.stringify(bodyChartPoints),
                transferVehicle: selectedTransfer,
                transpoter: selectedTranspoter
            });

            if(response.data === "success") {
                const infoMessage = "응급학생관리 내역이 정상적으로 수정되었습니다";
                NotiflixInfo(infoMessage, true);
                fetchEntireManageEmergencyData();
            }
        }else{
            const warnMessage = "선택된 응급학생 내역이 없습니다<br/>수정할 내역을 선택해 주세요";
            NotiflixWarn(warnMessage);
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

    const resetManageEmergency = useCallback(() => {
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
        setHomeroomTeacherNameValue("");
        setRegistDateValue("");
        setRegisterNameValue("");
        setGenderInImageMapper("M");

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

        if(entireManageEmergencyGridRef) entireManageEmergencyGridRef.current.api.deselectAll();
        onResetSearchInEmergencyManagement();
        setSearchStudentInEmergencyManagementRowData([]);
        setClickedPoints([]);
    }, [manageEmergencyModal]);

    useEffect(() => {
        if(searchStudentInEmergencyManagementGridRef.current) {
            resetManageEmergency();
        }
    }, [resetManageEmergency]);

    const fetchEntireManageEmergencyData = useCallback( async () => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/manageEmergency/getManageEmergencyData`, {
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
        setEntireSelectedRow(selectedRow);

        if(selectedRow) selectedRow.sGender === "여" ? setGenderInImageMapper('F') : setGenderInImageMapper('M');

        if(selectedRow) {
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
            setHomeroomTeacherNameValue(selectedRow.homeroomTeacherName);
            setRegistDateValue(selectedRow.registDate);
            setRegisterNameValue(selectedRow.registerName);

            if(selectedRow.transferVehicle.includes("etcTransferVehicle")) {
                setEtcTransferDetail(selectedRow.transferVehicle.split("::")[1]);
                setTransferCheckedItems({ 
                    ambulance: false,
                    generalVehicle: false,
                    etcTransfer: true 
                });
            }else{
                setTransferCheckedItems({
                    ambulance: selectedRow.transferVehicle === 'ambulance',
                    generalVehicle: selectedRow.transferVehicle === 'generalVehicle',
                    etcTransfer: false
                });
            }
    
            if(selectedRow.transpoter.includes("etcTranspoter")) {
                setEtcTranspoterDetail(selectedRow.transpoter.split("::")[1]);
                setTranspoterCheckedItems({ 
                    paramedic: false,
                    schoolNurse: false,
                    homeroomTeacher: false,
                    parents: false,
                    etcTranspoter: true
                });
            }else{
                setTranspoterCheckedItems({
                    paramedic: selectedRow.transpoter === 'paramedic',
                    schoolNurse: selectedRow.transpoter === 'schoolNurse',
                    homeroomTeacher: selectedRow.transpoter === 'homeroomTeacher',
                    parents: selectedRow.transpoter === 'parents',
                    etcTranspoter: false
                });
            }

            if(selectedRow.bodyChartPoints) {
                const bodyChartPoints = JSON.parse(selectedRow.bodyChartPoints);
                setClickedPoints(bodyChartPoints);
            }
        }

    };

    const handleDownloadEntirePDF = async () => {
        Block.dots('.modal-content', "PDF 파일 생성을 위해 해부도 이미지 처리중");

        if(entireManageEmergencyRowData.length > 0) {
            const doc = new jsPDF("p", "mm", "a4");
            const tableWidth = 150; // 표의 너비
            const pageWidth = doc.internal.pageSize.getWidth(); // 용지의 너비

            const fetchFont = async (url) => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                });
            };

            const NanumGothicBase64 = await fetchFont(NanumGothic);
            const NanumGothicBoldBase64 = await fetchFont(NanumGothicBold);

            doc.addFileToVFS('NanumGothic.ttf', NanumGothicBase64);
            doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
            doc.setFont('NanumGothic');

            doc.addFileToVFS('NanumGothicBold.ttf', NanumGothicBoldBase64);
            doc.addFont('NanumGothicBold.ttf', 'NanumGothicBold', 'bold');

            const createPDFPage = async (entry, index) => {
                if(index > 0) doc.addPage();
                doc.setPage(index + 1);

                doc.autoTable({
                    startX: (pageWidth - tableWidth) / 2,
                    startY: 20,
                    tableWidth: tableWidth,
                    styles: { font: 'NanumGothicBold', fontStyle: 'bold', fontSize: 25, textColor: [255, 255, 255] },
                    margin: { left: (pageWidth - tableWidth) / 2, },
                    body: [
                        [
                            { content: '응급사고 및 이송 기록지', styles: { fillColor: [240, 114, 106], halign: 'center' } }
                        ]
                    ]
                });

                doc.setFont('NanumGothic');

                doc.setFontSize(12);
                doc.text(165, 47, user.schoolName);

                doc.autoTable({
                    startY: 50,
                    headStyles: { font: 'NanumGothicBold', lineColor: [187, 67, 48], lineWidth: 0.3, fillColor: [243, 159, 155], halign: 'center', fontStyle: 'bold', textColor: [0, 0, 0] },
                    bodyStyles: { lineColor: [187, 67, 48], lineWidth: 0.3 },
                    theme: 'grid',
                    tableLineColor: [187, 67, 48],
                    tableLineWidth: 0.4,
                    styles: { font: 'NanumGothic', fontStyle: 'bold', fontSize: 12, textColor: [255, 255, 255] },
                    head: [
                        [
                            { content: '학년반', colSpan: 2 },
                            { content: '학생명' },
                            { content: '성별' },
                            { content: '보호자 전화번호', styles: { cellWidth: 45 } },
                            { content: '담임교사', styles: { cellWidth: 25 } },
                        ]
                    ],
                    body: [
                        [
                            { content: entry.sGrade + "학년 " + entry.sClass + "반", styles: { textColor: [0, 0, 0], halign: 'center' }, colSpan: 2 },
                            { content: entry.sName, styles: { textColor: [0, 0, 0], halign: 'center' } },
                            { content: entry.sGender, styles: { textColor: [0, 0, 0], halign: 'center' } },
                            { content: entry.guardianContact ? entry.guardianContact : "", styles: { textColor: [0, 0, 0], halign: 'center' } },
                            { content: entry.homeroomTeacherName ? entry.homeroomTeacherName : "", styles: { textColor: [0, 0, 0], halign: 'center' } }
                        ],
                        [
                            { content: "주증상", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], minCellHeight: 20, valign: 'middle' }, colSpan: 2 },
                            { content: entry.mainSymptom ? entry.mainSymptom : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 },
                            { rowSpan: 5, colSpan: 2 }
                        ],
                        [
                            { content: "발\r생\r장\r소\r&\r시\r간", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', valign: 'middle', fillColor: [251, 225, 206], cellWidth: 10 }, rowSpan: 4 },
                            { content: "발생\r장소", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                            { content: entry.occuringArea ? entry.occuringArea : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 },
                        ],
                        [
                            { content: "최초\r목격자", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                            { content: entry.firstWitness ? entry.firstWitness : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 }
                        ],
                        [
                            { content: "최초\r발견\r시간", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                            { content: entry.firstDiscoveryTime ? convertDateTimeValue("dt", entry.firstDiscoveryTime) : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 }
                        ],
                        [
                            { content: "보건\r교사\r확인\r시간", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                            { content: entry.teacherConfirmTime ? convertDateTimeValue("dt", entry.teacherConfirmTime) : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 }
                        ],
                        [ 
                            { content: "활력징후", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle', minCellHeight: 12 }, colSpan: 2 },
                            { content: entry.vitalSign ? entry.vitalSign : "", styles: { textColor: [0, 0, 0] }, colSpan: 5 }
                        ],
                        [
                            { content: "사고 개요", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle', minCellHeight: 20 }, colSpan: 2 },
                            { content: entry.accidentOverview ? entry.accidentOverview : "", styles: { textColor: [0, 0, 0] }, colSpan: 5 }
                        ],
                        [
                            { content: "응급처치\r내용", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle', minCellHeight: 20 }, colSpan: 2 },
                            { content: entry.emergencyTreatmentDetail ? entry.emergencyTreatmentDetail : "", styles: { textColor: [0, 0, 0] }, colSpan: 5 }
                        ],
                        [
                            { content: "이송시간 및\r이송방법", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle' }, rowSpan: 4, colSpan: 2 },
                            { content: "이송시간", styles: { textColor: [0, 0, 0], halign: 'center', cellWidth: 25 } },
                            { content: entry.transferTime ? convertDateTimeValue("t", entry.transferTime) : "", styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                        ],
                        [
                            { content: "이송차량", styles: { textColor: [0, 0, 0], halign: 'center' } },
                            { content: (entry.transferVehicle === "ambulance" ? "\u25A0" : "\u25A1") + "구급차     " + (entry.transferVehicle === "generalVehicle" ? "\u25A0" : "\u25A1") + "일반차량     " + (entry.transferVehicle.split("::")[0] === "etcTransfer" ? "\u25A0" : "\u25A1") + "기타(" + (entry.transferVehicle.split("::")[0] === "etcTransfer" ? entry.transferVehicle.split("::")[1] : "     ") + ")",  styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                        ],
                        [
                            { content: "이송자", styles: { textColor: [0, 0, 0], halign: 'center', valign: 'middle' } },
                            { content: (entry.transpoter === "paramedic" ? "\u25A0" : "\u25A1") + "119 대원          " + (entry.transpoter === "schoolNurse" ? "\u25A0" : "\u25A1") + "보건교사          " + (entry.transpoter === "homeroomTeacher" ? "\u25A0" : "\u25A1") + "담임          " + (entry.transpoter === "parents" ? "\u25A0" : "\u25A1") + "학부모\r" + (entry.transpoter.split("::")[0] === "etcTranspoter" ? "\u25A0" : "\u25A1") + "기타(" + (entry.transpoter.split("::")[0] === "etcTranspoter" ? entry.transpoter.split("::")[1] : "     ") + ")",  styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                        ],
                        [
                            { content: "이송병원", styles: { textColor: [0, 0, 0], halign: 'center' } },
                            { content: entry.transferHospital ? entry.transferHospital : "", styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                        ],
                        [
                            { content: "작성일 및\r작성자", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', valign: 'middle', fillColor: [251, 225, 206] }, colSpan: 2 },
                            { content: convertDateTimeValue("d", entry.registDate) + "\r\r성명 :            " + entry.registerName + "       (인)", styles: { textColor: [0, 0, 0], halign: 'center' }, colSpan: 5 }
                        ]
                    ]
                });

                doc.text(15, 270, "* 안전사고 발생 시 환자 상태, 사고 현황, 응급처치 내용 및 이송 상황에 대하여 육하원칙에 의거 기록\r   (사건 개요는 담임교사 또는 사고 당시 교과담당 교사가 작성)");

                const imageMapperDiv = document.getElementById("imageMapperContainer");
                const dataUrl = await htmlToImage.toPng(imageMapperDiv);
                const img = new Image();
                img.src = dataUrl;
                await new Promise((resolve) => {
                    img.onload = function () {
                        doc.addImage(img, 'PNG', 126, 67, 69.9, 87.5);
                        resolve();
                    };
                });
            };

            for(let i = 0; i < entireManageEmergencyRowData.length; i++) {
                entireManageEmergencyGridRef.current.api.deselectAll();
                entireManageEmergencyGridRef.current.api.getRowNode(i).setSelected(true)

                await new Promise((resolve) => setTimeout(resolve, 500));

                await createPDFPage(entireManageEmergencyRowData[i], i);
            }

            doc.save('응급사고 및 이송 기록지_전체');
        }else{
            const warnMessage = "다운로드할 응급일지 내역이 존재하지 않습니다";
            NotiflixWarn(warnMessage, '320px');
            return;
        }

        if(document.querySelector('.notiflix-block')) Block.remove('.modal-content');
        resetManageEmergency();
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF("p", "mm", "a4");

        if(selectedEmergencyStudent) {
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

                    fetch(NanumGothicBold)
                    .then(response => response.blob())
                    .then(boldFontBlob => {
                        const boldReader = new FileReader();
                        boldReader.readAsDataURL(boldFontBlob);
                        boldReader.onload = () => {
                            const NanumGothicBoldBase64 = boldReader.result.split(',')[1];
                            doc.addFileToVFS('NanumGothicBold.ttf', NanumGothicBoldBase64);
                            doc.addFont('NanumGothicBold.ttf', 'NanumGothicBold', 'bold');

                            doc.autoTable({
                                startX: (pageWidth - tableWidth) / 2,
                                startY: 20,
                                tableWidth: tableWidth,
                                styles: { font: 'NanumGothicBold', fontStyle: 'bold', fontSize: 25, textColor: [255, 255, 255] },
                                margin: { left: (pageWidth - tableWidth) / 2, },
                                body: [
                                    [
                                        { content: '응급사고 및 이송 기록지', styles: { fillColor: [240, 114, 106], halign: 'center' } }
                                    ]
                                ]
                            });

                            doc.setFont('NanumGothic');

                            doc.setFontSize(12);
                            doc.text(165, 47, user.schoolName);

                            doc.autoTable({
                                startY: 50,
                                headStyles: { font: 'NanumGothicBold', lineColor: [187, 67, 48], lineWidth: 0.3, fillColor: [243, 159, 155], halign: 'center', fontStyle: 'bold', textColor: [0, 0, 0] },
                                bodyStyles: { lineColor: [187, 67, 48], lineWidth: 0.3 },
                                theme: 'grid',
                                tableLineColor: [187, 67, 48],
                                tableLineWidth: 0.4,
                                styles: { font: 'NanumGothic', fontStyle: 'bold', fontSize: 12, textColor: [255, 255, 255] },
                                head: [
                                    [
                                        { content: '학년반', colSpan: 2 },
                                        { content: '학생명' },
                                        { content: '성별' },
                                        { content: '보호자 전화번호', styles: { cellWidth: 45 } },
                                        { content: '담임교사', styles: { cellWidth: 25 } },
                                    ]
                                ],
                                body: [
                                    [
                                        { content: selectedEmergencyStudent.sGrade + "학년 " + selectedEmergencyStudent.sClass + "반", styles: { textColor: [0, 0, 0], halign: 'center' }, colSpan: 2 }, // 폰트 색상 변경
                                        { content: selectedEmergencyStudent.sName, styles: { textColor: [0, 0, 0], halign: 'center' } },
                                        { content: selectedEmergencyStudent.sGender, styles: { textColor: [0, 0, 0], halign: 'center' } },
                                        { content: selectedEmergencyStudent.guardianContact ? selectedEmergencyStudent.guardianContact : "", styles: { textColor: [0, 0, 0], halign: 'center' } },
                                        { content: selectedEmergencyStudent.homeroomTeacherName, styles: { textColor: [0, 0, 0], halign: 'center' } }
                                    ],
                                    [
                                        { content: "주증상", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], minCellHeight: 20, valign: 'middle' }, colSpan: 2 },
                                        { content: selectedEmergencyStudent.mainSymptom ? selectedEmergencyStudent.mainSymptom : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 },
                                        { rowSpan: 5, colSpan: 2 }
                                    ],
                                    [
                                        { content: "발\r생\r장\r소\r&\r시\r간", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', valign: 'middle', fillColor: [251, 225, 206], cellWidth: 10 }, rowSpan: 4 },
                                        { content: "발생\r장소", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                                        { content: selectedEmergencyStudent.occuringArea ? selectedEmergencyStudent.occuringArea : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 },
                                    ],
                                    [
                                        { content: "최초\r목격자", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                                        { content: selectedEmergencyStudent.firstWitness ? selectedEmergencyStudent.firstWitness : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 }
                                    ],
                                    [
                                        { content: "최초\r발견\r시간", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                                        { content: selectedEmergencyStudent.firstDiscoveryTime ? convertDateTimeValue("dt", selectedEmergencyStudent.firstDiscoveryTime) : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 }
                                    ],
                                    [
                                        { content: "보건\r교사\r확인\r시간", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], cellWidth: 17 } },
                                        { content: selectedEmergencyStudent.teacherConfirmTime ? convertDateTimeValue("dt", selectedEmergencyStudent.teacherConfirmTime) : "", styles: { textColor: [0, 0, 0] }, colSpan: 2 }
                                    ],
                                    [ 
                                        { content: "활력징후", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle', minCellHeight: 12 }, colSpan: 2 },
                                        { content: selectedEmergencyStudent.vitalSign ? selectedEmergencyStudent.vitalSign : "", styles: { textColor: [0, 0, 0] }, colSpan: 5 }
                                    ],
                                    [
                                        { content: "사고 개요", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle', minCellHeight: 20 }, colSpan: 2 },
                                        { content: selectedEmergencyStudent.accidentOverview ? selectedEmergencyStudent.accidentOverview : "", styles: { textColor: [0, 0, 0] }, colSpan: 5 }
                                    ],
                                    [
                                        { content: "응급처치\r내용", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle', minCellHeight: 20 }, colSpan: 2 },
                                        { content: selectedEmergencyStudent.emergencyTreatmentDetail ? selectedEmergencyStudent.emergencyTreatmentDetail : "", styles: { textColor: [0, 0, 0] }, colSpan: 5 }
                                    ],
                                    [
                                        { content: "이송시간 및\r이송방법", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', fillColor: [251, 225, 206], valign: 'middle' }, rowSpan: 4, colSpan: 2 },
                                        { content: "이송시간", styles: { textColor: [0, 0, 0], halign: 'center', cellWidth: 25 } },
                                        { content: selectedEmergencyStudent.transferTime ? convertDateTimeValue("t", selectedEmergencyStudent.transferTime) : "", styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                                    ],
                                    [
                                        { content: "이송차량", styles: { textColor: [0, 0, 0], halign: 'center' } },
                                        { content: (selectedEmergencyStudent.transferVehicle === "ambulance" ? "\u25A0" : "\u25A1") + "구급차     " + (selectedEmergencyStudent.transferVehicle === "generalVehicle" ? "\u25A0" : "\u25A1") + "일반차량     " + (selectedEmergencyStudent.transferVehicle.split("::")[0] === "etcTransfer" ? "\u25A0" : "\u25A1") + "기타(" + (selectedEmergencyStudent.transferVehicle.split("::")[0] === "etcTransfer" ? selectedEmergencyStudent.transferVehicle.split("::")[1] : "     ") + ")",  styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                                    ],
                                    [
                                        { content: "이송자", styles: { textColor: [0, 0, 0], halign: 'center', valign: 'middle' } },
                                        { content: (selectedEmergencyStudent.transpoter === "paramedic" ? "\u25A0" : "\u25A1") + "119 대원          " + (selectedEmergencyStudent.transpoter === "schoolNurse" ? "\u25A0" : "\u25A1") + "보건교사          " + (selectedEmergencyStudent.transpoter === "homeroomTeacher" ? "\u25A0" : "\u25A1") + "담임          " + (selectedEmergencyStudent.transpoter === "parents" ? "\u25A0" : "\u25A1") + "학부모\r" + (selectedEmergencyStudent.transpoter.split("::")[0] === "etcTranspoter" ? "\u25A0" : "\u25A1") + "기타(" + (selectedEmergencyStudent.transpoter.split("::")[0] === "etcTranspoter" ? selectedEmergencyStudent.transpoter.split("::")[1] : "     ") + ")",  styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                                    ],
                                    [
                                        { content: "이송병원", styles: { textColor: [0, 0, 0], halign: 'center' } },
                                        { content: selectedEmergencyStudent.transferHospital ? selectedEmergencyStudent.transferHospital : "", styles: { textColor: [0, 0, 0] }, colSpan: 4 }
                                    ],
                                    [
                                        { content: "작성일 및\r작성자", styles: { font: 'NanumGothicBold', textColor: [0, 0, 0], halign: 'center', valign: 'middle', fillColor: [251, 225, 206] }, colSpan: 2 },
                                        { content: convertDateTimeValue("d", selectedEmergencyStudent.registDate) + "\r\r성명 :            " + selectedEmergencyStudent.registerName + "       (인)", styles: { textColor: [0, 0, 0], halign: 'center' }, colSpan: 5 }
                                    ]
                                ]
                            });

                            doc.text(15, 270, "* 안전사고 발생 시 환자 상태, 사고 현황, 응급처치 내용 및 이송 상황에 대하여 육하원칙에 의거 기록\r   (사건 개요는 담임교사 또는 사고 당시 교과담당 교사가 작성)");
                            
                            const imageMapperDiv = document.getElementById("imageMapperContainer");
                            htmlToImage.toPng(imageMapperDiv)
                            .then((dataUrl) => {
                                const base64Img = dataUrl.split(',')[1];
                                const img = new Image();
                                img.src = 'data:image/png;base64,' + base64Img;
                                img.onload = function() {
                                    doc.addImage(img, 'PNG', 126, 67, 69.9, 87.5);
                                    doc.save('응급사고 및 이송 기록지_' + selectedEmergencyStudent.sName +  '.pdf');
                                }
                            });
                        };
                    });
                };
            });
        }else{
            const warnMessage = "선택된 응급일지 내역이 없습니다";
            NotiflixWarn(warnMessage);
            return;
        }
    };

    const convertDateTimeValue = (category, dateTime) => {
        if(category === "dt") {
            let dateValue = dateTime.split("T")[0];
            let timeValue = dateTime.split("T")[1];
            const returnDateValue = dateValue.split("-")[0] + "년 " + parseInt(dateValue.split("-")[1]).toString() + "월 " + parseInt(dateValue.split("-")[2]).toString() + "일   ";
            const returnTimeValue = (timeValue.split(":")[0] === "00" ? "00" : parseInt(timeValue.split(":")[0]).toString()) + "시 " + (timeValue.split(":")[1] === "00" ? "00" : parseInt(timeValue.split(":")[1]).toString()) + "분";

            return returnDateValue + returnTimeValue;
        }else if(category === "d") {
            let dateValue = dateTime.split("T")[0];
            const returnDateValue = dateValue.split("-")[0] + "년 " + parseInt(dateValue.split("-")[1]).toString() + "월 " + parseInt(dateValue.split("-")[2]).toString() + "일   ";

            return returnDateValue;
        }else if(category === "t") {
            const returnTimeValue = (dateTime.split(":")[0] === "00" ? "00" : parseInt(dateTime.split(":")[0]).toString()) + "시 " + (dateTime.split(":")[1] === "00" ? "00" : parseInt(dateTime.split(":")[1]).toString()) + "분";

            return returnTimeValue;
        }
    };
    
    // 이미 찍힌 Point 재클릭 시 Event
    const onClickSpot = (e) => {
        const x = e.center[0];
        const y = e.center[1];

        const filteredPoints = clickedPoints.filter(point => point.x !== x || point.y !== y);

        setClickedPoints(filteredPoints);
    };

    const resetSearchEmergency = () => {
        setSearchStartDate("");
        setSearchEndDate("");
        setSearchSname("");
        fetchEntireManageEmergencyData();
    };

    const searchEntireEmergency = () => {
        if (searchSname || (searchStartDate && searchEndDate)) {
            const searchFilteredRowData = entireManageEmergencyRowData.filter(item => {
                let meetsAllConditions = true;
    
                // 이름 조건 확인
                if (searchSname && !item.sName.includes(searchSname)) {
                    meetsAllConditions = false;
                }
    
                // 날짜 조건 확인
                if (searchStartDate && searchEndDate) {
                    const registDate = new Date(item.registDate);
                    const convertedSearchStartDate = new Date(searchStartDate);
                    const convertedSearchEndDate = new Date(searchEndDate);
    
                    // registDate가 searchStartDate와 searchEndDate 사이에 있는지 확인
                    if (!(registDate >= convertedSearchStartDate && registDate <= convertedSearchEndDate)) {
                        meetsAllConditions = false;
                    }
                }
    
                return meetsAllConditions;
            });
    
            setEntireManageEmergencyRowData(searchFilteredRowData);
        }
    };

    const handleSearchKeyDown = (e) => {
        if(e.key === "Enter") searchEntireEmergency();
    };

    const deleteManageEmergency = async () => {
        if(entireSelectedRow) {
            const response = await axios.post(`${BASE_URL}/api/manageEmergency/deleteEmergencyManagement`, {
                rowId: entireSelectedRow.id,
                userId: user.userId,
                schoolCode: user.schoolCode,
                sGrade: entireSelectedRow.sGrade,
                sClass: entireSelectedRow.sClass,
                sNumber: entireSelectedRow.sNumber
            });

            if(response.data === 'success') {
                const infoMessage = "응급학생 내역이 정상적으로 삭제되었습니다";
                NotiflixInfo(infoMessage, true, '320px');
                fetchEntireManageEmergencyData();
                resetManageEmergency();
            }
        }else{
            const warnMessage = "선택된 응급학생 내역이 없습니다<br/>삭제할 내역을 선택해 주세요";
            NotiflixWarn(warnMessage);
            return;
        }
    };

    function handleGridContextMenu(event) {
        if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
            return;
        }else{
            const api = entireManageEmergencyGridRef.current.api;
            const rowIndex = event.target.parentNode.getAttribute('row-index');
        
            if(rowIndex !== null) {
                api.ensureIndexVisible(rowIndex);
                api.forEachNode((node) => {
                    if(node.rowIndex == rowIndex) node.setSelected(true, true);
                });
        
                const selectedRow = api.getSelectedRows()[0];
                if(selectedRow) setSelectedEmergencyRow(selectedRow);
        
                show({
                    event,
                    props: {
                        key: 'value'
                    }
                });
            }   
        }
    };

    return (
        <>
            <Modal isOpen={manageEmergencyModal} toggle={toggleManageEmergencyModal} centered style={{ minWidth: '65%', height: '70vh' }}>
                <ModalHeader toggle={toggleManageEmergencyModal}>
                    <b className="text-muted">응급학생관리</b>
                </ModalHeader>
                <ModalBody>
                    <Row className='d-flex align-items-center no-gutters text-muted pb-0'>
                        <Col md="2">
                            <label style={{ fontSize: 18, fontWeight: 'bold' }}>전체등록내역</label>
                        </Col>
                        <Col className='d-flex align-items-center justify-content-end'>
                            <label className='mr-1 pt-1'>작성일</label>
                            <Input
                                id='searchStartDate'
                                type='date'
                                style={{ width: '17%', height: 28 }}
                                value={searchStartDate}
                                onChange={(e) => setSearchStartDate(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <span className='ml-1 mr-1'>~</span>
                            <Input
                                id='searchEndDate'
                                type='date'
                                style={{ width: '17%', height: 28 }}
                                value={searchEndDate}
                                onChange={(e) => setSearchEndDate(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <label className='ml-3 mr-1 pt-1'>이름</label>
                            <Input 
                                id='searchSname'
                                type='text'
                                style={{ width: '10%', height: 28 }}
                                value={searchSname}
                                onChange={(e) => setSearchSname(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <Button className='ml-3 mr-1' size='sm' onClick={resetSearchEmergency}>초기화</Button>
                            <Button size='sm' onClick={searchEntireEmergency}>검색</Button>
                        </Col>
                    </Row>
                    <div className='entire-emergency-grid'>
                        <div className="ag-theme-alpine" style={{ height: '10.5vh' }} onContextMenu={handleGridContextMenu}>
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
                    </div>
                    <div>
                        <Menu id={MENU_ID_GRID} animation="fade">
                            <Item id="deleteEmergencyManage" onClick={deleteManageEmergency}>응급학생 내역 삭제</Item>
                        </Menu>
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
                                        style={{ width: '61.5%' }}
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
                                    style={{ width: '87.5%' }}
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
                                    style={{ width: '87.5%', marginLeft: 14 }}
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
                                    style={{ width: '87.5%', marginLeft: 19 }}
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
                                    style={{ width: '87.5%', marginLeft: 8 }}
                                    value={emergencyTreatmentDetailValue}
                                    onChange={(e) => setEmergencyTreatmentDetailValue(e.target.value)}
                                />
                            </Row>
                        </Col>
                        <Col md="5" className="mt-2">
                            <div id='imageMapperContainer' className="d-flex no-gutters" style={{ border: '1.5px solid lightgrey' }} ref={imageMapperRef} onMouseEnter={handleImageMapperEnter}>
                                <ImageMapper 
                                    src={genderInImageMapper && genderInImageMapper === 'F' ? anatomyImageFemale : anatomyImage}
                                    width={500}
                                    imgWidth={500}
                                    height={300}
                                    imgHeight={300}
                                    map={{
                                        name: 'anatomy-map',
                                        areas: generateAreas()
                                    }}
                                    onClick={onClickSpot}
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
                                        className='ml-2 mr-2'
                                        type='tel'
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
                                                checked={transferCheckedItems.etcTransfer || false}
                                            />
                                            <Label check>기타</Label>
                                        </Col>
                                        <Col md="3" style={{ width: 168 }}>
                                            <Input
                                                id='etcTransferDetail'
                                                bsSize='sm'
                                                type='text'
                                                style={{ width: '95px', marginLeft: '-30px', height: 30 }}
                                                onChange={handleEtcTransferDetailChange}
                                                value={etcTransferDetail || ""}
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
                                                checked={transpoterCheckedItems.etcTranspoter || false}
                                            />
                                            <Label style={{ marginLeft: '-29px' }} check>기타</Label>
                                            <Input
                                                id='etcTranspoterDetail'
                                                type='text'
                                                style={{ width: '95%', marginLeft: 8, height: 30 }}
                                                onChange={handleEtcTranspoterDetailChange}
                                                value={etcTranspoterDetail || ""}
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
                                    value={transferHospitalValue || ""}
                                    onChange={(e) => setTransferHospitalValue(e.target.value)}
                                />
                            </Row>
                        </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col className='d-flex align-items-center justify-content-start text-muted' md="6">
                            <label className='mr-2'>담임교사</label>
                            <Input 
                                id='homeroomTeacherName'
                                type='text'
                                style={{ width: '25%' }}
                                value={homeroomTeacherNameValue || ""}
                                onChange={(e) => setHomeroomTeacherNameValue(e.target.value)}
                            />
                            <Button style={{ margin: 0, height: 31, paddingTop: 6, marginLeft: 20}}>교직원 조회</Button>
                        </Col>
                        <Col className='d-flex align-items-center justify-content-end text-muted' md="6">
                            <label className='mr-3'>작성일</label>
                            <Input
                                id='registDate'
                                type='date'
                                style={{ width: '30%' }}
                                value={registDateValue}
                                onChange={(e) => setRegistDateValue(e.target.value)}
                            />
                            <label className='ml-5 mr-3'>성명</label>
                            <Input
                                className='mr-2'
                                id='registerName'
                                type='text'
                                style={{ width: '25%' }}
                                value={registerNameValue}
                                onChange={(e) => setRegisterNameValue(e.target.value)}
                            />
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="p-0" >
                    <Row className="w-100">
                        <Col className="d-flex justify-content-start no-gutters">
                            <Button className='mr-1' onClick={handleDownloadEntirePDF}>전체 PDF 다운로드</Button>
                            <Button onClick={handleDownloadPDF}>선택 PDF 다운로드</Button>
                        </Col>
                        <Col className='d-flex justify-content-end no-gutters'>
                            <Button className='mr-2' onClick={resetManageEmergency}>초기화</Button>
                            <Button className="ml-1" onClick={saveManageEmergency}>등록</Button>
                            <Button className="ml-1" onClick={updateManageEmergency}>수정</Button>
                            <Button className="ml-1" onClick={deleteManageEmergency}>삭제</Button>
                            <Button className="ml-1" onClick={toggleManageEmergencyModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>
        </>
    )
};

export default EmergencyModal;

/**
 * TO DO :
 * 교직원 조회 버튼 기능 구현 
 * 수정 기능 구현
 */