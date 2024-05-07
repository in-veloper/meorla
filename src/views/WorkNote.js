import React, {useState, useRef, useCallback, useEffect} from "react";
import {Card, CardHeader, CardBody, Row, Col, Input, Button, Alert, Badge, UncontrolledAlert, Collapse, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, CustomInput, Tooltip } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import TagField from "components/TagField/TagField";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { GiBed } from "react-icons/gi";
import { BiMenu } from "react-icons/bi";
import { RiSearchLine } from "react-icons/ri";
import { IoMdRefresh } from "react-icons/io";
import { FaInfoCircle } from "react-icons/fa";
import { useUser } from "contexts/UserContext";
import Masking from "components/Tools/Masking";
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import NotiflixWarn from "components/Notiflix/NotiflixWarn";
import NotiflixPrompt from "components/Notiflix/NotiflixPrompt";
import NotificationAlert from "react-notification-alert";
import { Block } from 'notiflix/build/notiflix-block-aio';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import EmergencyModal from "components/Modal/EmergencyModal";
import axios from "axios";
import moment from "moment";
import io from "socket.io-client";
import '../assets/css/worknote.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const MENU_ID = 'students_context_menu';

function WorkNote(args) {
  const { user } = useUser();                              // 사용자 정보
  const [isEntireWorkNoteOpen, setIsEntireWorkNoteOpen] = useState(false);
  const [searchStudentRowData, setSearchStudentRowData] = useState([]); // 검색 결과를 저장할 state
  const [symptomRowData, setSymptomRowData] = useState([]);
  const [medicationRowData, setMedicationRowData] = useState([]);
  const [actionMatterRowData, setActionMatterRowData] = useState([]);
  const [treatmentMatterRowData, setTreatmentMatterRowData] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({ iGrade: "", iClass: "", iNumber: "", iName: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [symptomModal, setSymptomModal] = useState(false);
  const [medicationModal, setMedicationModal] = useState(false);
  const [actionMatterModal, setActionMatterModal] = useState(false);
  const [treatmentMatterModal, setTreatmentMatterModal] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [searchSymptomText, setSearchSymptomText] = useState("");
  const [filteredSymptom, setFilteredSymptom] = useState(symptomRowData);
  const [tagifySymptomSuggestion, setTagifySymptomSuggestion] = useState([]);
  const [tagifyMedicationSuggestion, setTagifyMedicationSuggestion] = useState([]);
  const [tagifyActionMatterSuggestion, setTagifyActionMatterSuggestion] = useState([]);
  const [tagifyTreatmentMatterSuggestion, setTagifyTreatmentMatterSuggestion] = useState([]);
  const [searchMedicationText, setSearchMedicationText] = useState("");
  const [filteredMedication, setFilteredMedication] = useState(medicationRowData);
  const [searchActionMatterText, setSearchActionMatterText] = useState("");
  const [filteredActionMatter, setFilteredActionMatter] = useState(actionMatterRowData);
  const [searchTreatmentMatterText, setSearchTreatmentMatterText] = useState("");
  const [filteredTreatmentMatter, setFilteredTreatmentMatter] = useState(treatmentMatterRowData);
  const [masked, setMasked] = useState(false);
  const [alertHidden, setAlertHidden] = useState(false);
  const [onBedRestStartTime, setOnBedRestStartTime] = useState("");
  const [bedBoxContent, setBedBoxContent] = useState(null);
  const [displayedOnBedStudents, setDisplayedOnBedStudents] = useState(null);
  const [temperatureValue, setTempuratureValue] = useState(0);
  const [bloodPressureValue, setBloodPressureValue] = useState(0);
  const [pulseValue, setpulseValue] = useState(0);
  const [oxygenSaturationValue, setOxygenSaturationValue] = useState(0);
  const [bloodSugarValue, setBloodSugarValue] = useState(0);
  const [nonSelectedHighlight, setNonSelectedHighlight] = useState(false);
  const [visitRequestList, setVisitRequestList] = useState([]);
  const [visitRequestTooltipOpen, setVisitRequestTooltipOpen] = useState(false);

  const searchStudentGridRef = useRef();
  const personalStudentGridRef = useRef();
  const registeredAllGridRef = useRef();
  const symptomGridRef = useRef();
  const medicationGridRef = useRef();
  const actionMatterGridRef = useRef();
  const treatmentMatterGridRef = useRef();
  const notificationAlert = useRef();

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  // 최초 Grid Render Event
  const onGridReady = useCallback((params) => {
  }, []);

  const toggleSymptomModal = () => setSymptomModal(!symptomModal);
  const toggleMedicationModal = () => setMedicationModal(!medicationModal);
  const toggleActionMatterModal = () => setActionMatterModal(!actionMatterModal);
  const toggleTreatmentMatterModal = () => setTreatmentMatterModal(!treatmentMatterModal);
  const toggleVisitRequestTooltip = () => setVisitRequestTooltipOpen(!visitRequestTooltipOpen);

  const customCellRenderer = (params) => {
    const { value } = params;

    if(params.data.isDiabetes) {
      return (
        <span style={{ marginLeft: 10 }}>
          {value}&nbsp;
          <span style={{ color: 'red' }}>*</span>
        </span>
      )
    }else{
      return value;
    }
  };

  const [searchStudentColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }, cellRenderer: customCellRenderer }
  ]);

  const [personalStudentRowData, setPersonalStudentRowData] = useState([]);

  const [personalStudentColumnDefs] = useState([
    { field: "createdAt", headerName: "등록일", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "medication", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "actionMatter", headerName: "조치 및 교육사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "onBedTime", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "note", headerName: "비고", flex: 1, cellStyle: { textAlign: "center" } }
  ]);

  const [entireWorkNoteRowData, setEntireWorkNoteRowData] = useState([]);

  const [entireWorkNoteColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "medication", headerName: "투약사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "actionMatter", headerName: "조치 및 교육사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "onBedTime", headerName: "침상안정", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "createdAt", headerName: "등록일", flex: 2, cellStyle: { textAlign: "center" }}
  ]);

  // 기본 컬럼 속성 정의 (공통 부분)
  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    editable: true
  };

  const notEditDefaultColDef = {
    sortable: true,
    resizable: true,
    filter: true
  };

  const [symptomColumnDefs] = useState([
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [medicationColumnDefs] = useState([
    { field: "medication", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [actionMatterColumnDefs] = useState([
    { field: "actionMatter", headerName: "조치 및 교육사항", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [treatmentMatterColumnDefs] = useState([
    { field: "treatmentMatter", headerName: "처치사항", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  // 추가할 행 생성
  const createNewSymptomRowData = () => {
    const newData = {
      symptom: "",
      editable: true
    }
    return newData;
  };

  // 추가할 행 생성
  const createNewMedicationRowData = () => {
    const newData = {
      medication: "",
      editable: true
    }
    return newData;
  };

  const createNewActionMatterRowData = () => {
    const newData = {
      actionMatter: "",
      editable: true
    }
    return newData;
  };

  const createNewTreatmentMatterRowData = () => {
    const newData = {
      treatmentMatter: "",
      editable: true
    }
    return newData;
  };


  // Grid 행 추가 Function
  const appendSymptomRow = useCallback(() => {
    const api = symptomGridRef.current.api;                                          // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewSymptomRowData()];                                     // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

  // Grid 행 추가 Function
  const appendMedicationRow = useCallback(() => {
    const api = medicationGridRef.current.api;                                          // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewMedicationRowData()];                                     // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

    // Grid 행 추가 Function
  const appendActionMatterRow = useCallback(() => {
    const api = actionMatterGridRef.current.api;                                          // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewActionMatterRowData()];                                     // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);
  
  // Grid 행 추가 Function
  const appendTreatmentMatterRow = useCallback(() => {
    const api = treatmentMatterGridRef.current.api;                                          // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewTreatmentMatterRowData()];                                     // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

  // Row에 데이터 변경 시 Ag-Grid 내장 Event
  const onSymptomRowDataUpdated = useCallback(() => {                                // 행이 추가되고 난 후 이벤트 (이 지점에서 추가된 행 확인 가능)
    const api = symptomGridRef.current.api;                                          // Ag-Grid api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 화면에 보여지는 행의 개수
    const lastRowIndex = displayedRowCount - 1;                               // Edit 속성 부여 위한 마지막 행 Index
    
    if(isRemoved || isRegistered) {                                           // 항목 삭제 버튼 클릭 시 || 초기 bookmark 데이터 불러왔을 시
      api.stopEditing(true);                                                  // Edit 모드 중지
      return;                                                                 // return
    }
    
    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'symptom' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);

  // Row에 데이터 변경 시 Ag-Grid 내장 Event
  const onMedicationRowDataUpdated = useCallback(() => {                                // 행이 추가되고 난 후 이벤트 (이 지점에서 추가된 행 확인 가능)
    const api = medicationGridRef.current.api;                                          // Ag-Grid api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 화면에 보여지는 행의 개수
    const lastRowIndex = displayedRowCount - 1;                               // Edit 속성 부여 위한 마지막 행 Index
    
    if(isRemoved || isRegistered) {                                           // 항목 삭제 버튼 클릭 시 || 초기 bookmark 데이터 불러왔을 시
      api.stopEditing(true);                                                  // Edit 모드 중지
      return;                                                                 // return
    }
    
    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'medication' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);

  const onActionMatterRowDataUpdated = useCallback(() => {
    const api = actionMatterGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount();
    const lastRowIndex = displayedRowCount - 1;

    if(isRemoved || isRegistered) {
      api.stopEditing(true);
      return;
    }

    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'actionMatter' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);

  const onTreatmentMatterRowDataUpdated = useCallback(() => {
    const api = treatmentMatterGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount();
    const lastRowIndex = displayedRowCount - 1;

    if(isRemoved || isRegistered) {
      api.stopEditing(true);
      return;
    }

    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'treatmentMatter' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);

  const onInputChange = (field, value) => {
    setSearchCriteria((prevCriteria) => ({
      ...prevCriteria,
      [field]: value
    }));
  };

  // Grid 행 삭제 Function
  const removeSymptomRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = symptomGridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.";
    
    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeMedicationRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = medicationGridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.";

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeActionMatterRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = actionMatterGridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.";

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeTreatmentMatterRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = treatmentMatterGridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.";
    
    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);      
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 전체 삭제 Function
  const allSymptomRemoveRow = () => {
    const api = symptomGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    const warnMessage = "등록된 증상이 없습니다.";

    if(displayedRowCount === 0) {                         // 현재 등록된 증상이 없을 경우
      // 등록된 증상 없음 Notify
      NotiflixWarn(warnMessage);
      return;                                             // return
    }else{                                                // 등록된 증상이 있을 경우
      api.setRowData([]);                                 // 증상 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Grid 행 전체 삭제 Function
  const allMedicationRemoveRow = () => {
    const api = medicationGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    const warnMessage = "등록된 투약사항이 없습니다.";

    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 투약사항 없음 Notify
      NotiflixWarn(warnMessage);
      return;                                             // return
    }else{                                                // 등록된 투약사항이 있을 경우
      api.setRowData([]);                                 // 투약사항 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Grid 행 전체 삭제 Function
  const allActionMatterRemoveRow = () => {
    const api = actionMatterGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    const warnMessage = "등록된 조치 및 교육사항이 없습니다.";

    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 투약사항 없음 Notify
      NotiflixWarn(warnMessage);
      return;                                             // return
    }else{                                                // 등록된 투약사항이 있을 경우
      api.setRowData([]);                                 // 투약사항 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Grid 행 전체 삭제 Function
  const allTreatmentMatterRemoveRow = () => {
    const api = treatmentMatterGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    const warnMessage = "등록된 처치사항이 없습니다.";

    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 투약사항 없음 Notify
      NotiflixWarn(warnMessage);
      return;                                             // return
    }else{                                                // 등록된 투약사항이 있을 경우
      api.setRowData([]);                                 // 투약사항 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  const fetchStudentData = async (criteria) => {
    try {
      const { iGrade, iClass, iNumber, iName } = criteria;
      
      if(user) {
        const response = await axios.get(`http://${BASE_URL}:8000/studentsTable/getStudentInfoBySearch`, {
          params: {
            userId: user.userId,
            schoolCode: user.schoolCode,
            sGrade:  iGrade,
            sClass: iClass,
            sNumber: iNumber,
            sName: iName
          }
        });

        return response.data.studentData;
      }
    } catch (error) {
      console.error("학생 정보 조회 중 ERROR", error);
      return [];
    }
  };

  const onResetSearch = () => {
    const api = searchStudentGridRef.current.api;
    setSearchCriteria({ iGrade: "", iClass: "", iNumber: "", iName: "" });
    api.setRowData([]);
    setSelectedStudent('');
    setPersonalStudentRowData([]);
  };

  const onSearchStudent = async (criteria) => {
    try {
      const studentData = await fetchStudentData(criteria);

      searchStudentGridRef.current.api.setRowData(studentData);
      setSearchStudentRowData(studentData);

      if(masked) {
        const maskedStudentData = studentData.map(student => ({
          ...student,
          sName: Masking(student.sName)
        }));

        setSearchStudentRowData(maskedStudentData);
      }
    } catch (error) {
      console.error("학생 조회 중 ERROR", error);
    }
  };

  const handleKeyDown = (e, criteria) => {
    if(e.key === 'Enter') onSearchStudent(searchCriteria);
  };

  const onGridSelectionChanged = (event) => {
    const selectedRow = event.api.getSelectedRows()[0];
    setSelectedStudent(selectedRow);

    fetchSelectedStudentData();
  };

  const onCellValueChanged = (event) => {
    // const updatedRowData = event.api.getRowNode(event.rowIndex).data;
    // setModifiedData((prevData) => [...prevData, updatedRowData]);
  };

  // Cell Edit 모드 진입 시 Event
  const onCellEditingStarted = (event) => {
    
  };

  // Cell Edit 모드 종료 시 Event
  const onCellEditingStopped = (event) => {
    
  };

  const handleSymptom = () => {
    toggleSymptomModal();
    fetchSymptomData();
  };

  const handleMedication = () => {
    toggleMedicationModal();
    fetchStockMedicineData();
  };

  const handleActionMatter = () => {
    toggleActionMatterModal();
    fetchActionMatterData();
  };

  const handleTreatmentMatter = () => {
    toggleTreatmentMatterModal();
    fetchTreatmentMatterData();
  };

  const saveSymptom = async (e) => {
    e.preventDefault();

    const confirmTitle = "증상 설정";
    const confirmMessage = "작성하신 증상을 저장하시겠습니까?";
    const infoMessage = "증상 설정이 정상적으로 저장되었습니다.";

    const yesCallback = async () => {
      const api = symptomGridRef.current.api;                      // Grid api 획득
      let symptomString = "";                                      // Parameter 전송 위한 증상 담을 배열

      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const symptom = rowNode.data.symptom;                     // 증상 획득

        // 증상 명이 존재 && 북마크 주소 존재 && user 데이터 존재 -> Parameter로 전송할 증상 데이터 생성
        if(symptom.length !== 0 && user) symptomString += symptom + "::";
        
      });
      symptomString = symptomString.slice(0, -2);
      
      let response = null;                  // response 데이터 담을 변수
      if(symptomRowData.length > 0) {       // 등록된 증상이 있는 경우 - Update
        response = await axios.post(`http://${BASE_URL}:8000/symptom/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          symptom: symptomString
        });
      }else{                            // 등록된 증상이 없는 경우 - Insert
        response = await axios.post(`http://${BASE_URL}:8000/symptom/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          symptom: symptomString
        });
      }
      
      if(response.data === "success") {   // Api 호출 성공한 경우
        fetchSymptomData();              // Dropdown에도 공통 적용되기 위해 북마크 데이터 재조회
        // 증상 정상 저장 Notify
        NotiflixInfo(infoMessage);
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
  };

  const saveMedication = async (e) => {
    e.preventDefault();

    const confirmTitle = "투약사항 설정";
    const confirmMessage = "작성하신 투약사항를 저장하시겠습니까?";
    const infoMessage = "투약사항 설정이 정상적으로 저장되었습니다.";

    const yesCallback = async () => {
      const api = medicationGridRef.current.api;                  // Grid api 획득
      let medicationString = "";                                  // Parameter 전송 위한 투약사항 담을 배열

      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const medication = rowNode.data.medication;               // 투약사항 획득

        // 투약사항 명이 존재 && 북마크 주소 존재 && user 데이터 존재 -> Parameter로 전송할 투약사항 데이터 생성
        if(medication.length !== 0 && user) medicationString += medication + "::";
        
      });
      medicationString = medicationString.slice(0, -2);
      
      let response = null;                     // response 데이터 담을 변수
      if(medicationRowData.length > 0) {       // 등록된 투약사항이 있는 경우 - Update
        response = await axios.post(`http://${BASE_URL}:8000/medication/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          medication: medicationString
        });
      }else{                                    // 등록된 투약사항이 없는 경우 - Insert
        response = await axios.post(`http://${BASE_URL}:8000/medication/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          medication: medicationString
        });
      }
      
      if(response.data === "success") {   // Api 호출 성공한 경우
        fetchStockMedicineData();              // Dropdown에도 공통 적용되기 위해 투약사항 데이터 재조회
        // 투약사항 정상 저장 Notify
        NotiflixInfo(infoMessage);
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
  };

  const saveActionMatter = async (e) => {
    e.preventDefault();

    const confirmTitle = "조치 및 교육사항 설정";
    const confirmMessage = "작성하신 조치 및 교육사항을 저장하시겠습니까?";
    const infoMessage = "조치 및 교육사항 설정이 정상적으로 저장되었습니다.";

    const yesCallback = async () => {
      const api = actionMatterGridRef.current.api;                      // Grid api 획득
      let actionMatterString = "";                                      // Parameter 전송 위한 조치사항 담을 배열

      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const actionMatter = rowNode.data.actionMatter;                     // 조치사항 획득

        // 조치사항이 존재  && user 데이터 존재 -> Parameter로 전송할 조치사항 데이터 생성
        if(actionMatter.length !== 0 && user) actionMatterString += actionMatter + "::";
        
      });
      actionMatterString = actionMatterString.slice(0, -2);
      
      let response = null;                  // response 데이터 담을 변수
      if(actionMatterRowData.length > 0) {       // 등록된 조치사항이 있는 경우 - Update
        response = await axios.post(`http://${BASE_URL}:8000/actionMatter/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          actionMatter: actionMatterString
        });
      }else{                            // 등록된 증상이 없는 경우 - Insert
        response = await axios.post(`http://${BASE_URL}:8000/actionMatter/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          actionMatter: actionMatterString
        });
      }
      
      if(response.data === "success") {   // Api 호출 성공한 경우
        fetchActionMatterData();           
        // 조치사항 정상 저장 Notify
        NotiflixInfo(infoMessage);
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
  };

  const saveTreatmentMatter = async (e) => {
    e.preventDefault();

    const confirmTitle = "처치사항 설정";
    const confirmMessage = "작성하신 처치사항을 저장하시겠습니까?";
    const infoMessage = "처치사항 설정이 정상적으로 저장되었습니다.";

    const yesCallback = async () => {
      const api = treatmentMatterGridRef.current.api;                      // Grid api 획득
      let treatmentMatterString = "";                                      // Parameter 전송 위한 조치사항 담을 배열

      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const treatmentMatter = rowNode.data.treatmentMatter;                     // 조치사항 획득

        // 조치사항이 존재  && user 데이터 존재 -> Parameter로 전송할 조치사항 데이터 생성
        if(treatmentMatter.length !== 0 && user) treatmentMatterString += treatmentMatter + "::";
        
      });
      treatmentMatterString = treatmentMatterString.slice(0, -2);
      
      let response = null;                  // response 데이터 담을 변수
      if(treatmentMatterRowData.length > 0) {       // 등록된 조치사항이 있는 경우 - Update
        response = await axios.post(`http://${BASE_URL}:8000/treatmentMatter/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          treatmentMatter: treatmentMatterString
        });
      }else{                            // 등록된 증상이 없는 경우 - Insert
        response = await axios.post(`http://${BASE_URL}:8000/treatmentMatter/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          treatmentMatter: treatmentMatterString
        });
      }
      
      if(response.data === "success") {   // Api 호출 성공한 경우
        fetchTreatmentMatterData();           
        // 조치사항 정상 저장 Notify
        NotiflixInfo(infoMessage);
      }
    };

    const noCallback = () => {
       return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
  };

  // 증상 데이터 획득 부분 Function 분리
  const fetchSymptomData = useCallback(async() => {
    try {
      if(user?.userId && user?.schoolCode) {
        const response = await axios.post(`http://${BASE_URL}:8000/symptom/getSymptom`, {
          userId: user.userId,
          schoolCode: user.schoolCode
        });
        
        if (response.data) {
          const symptomString = response.data.symptom.symptom;
          const symptomArray = symptomString.split('::').map(item => {
            return { symptom: item };
          });
          
          setSymptomRowData(symptomArray);
          setFilteredSymptom(symptomArray);

          const tagifySymptomArray = symptomString.split('::').map(item => {
            return item;
          });
          
          setTagifySymptomSuggestion(tagifySymptomArray);
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('증상 조회 중 ERROR', error);
    }
  }, [user?.userId, user?.schoolCode]);

  const fetchActionMatterData = useCallback(async() => {
    try {
      if(user?.userId && user?.schoolCode) {
        const response = await axios.post(`http://${BASE_URL}:8000/actionMatter/getActionMatter`, {
          userId: user.userId,
          schoolCode: user.schoolCode
        });
        
        if (response.data) {
          const actionMatterString = response.data.actionMatter.actionMatter;
          const actionMatterArray = actionMatterString.split('::').map(item => {
            return { actionMatter: item };
          });

          setActionMatterRowData(actionMatterArray);
          setFilteredActionMatter(actionMatterArray);

          const tagifyActionMatterArray = actionMatterString.split('::').map(item => {
            return item;
          });

          setTagifyActionMatterSuggestion(tagifyActionMatterArray);
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('조치 및 교육사항 조회 중 ERROR', error);
    }
  }, [user?.userId, user?.schoolCode]);

  const fetchTreatmentMatterData = useCallback(async() => {
    try {
      if(user?.userId && user?.schoolCode) {
        const response = await axios.post(`http://${BASE_URL}:8000/treatmentMatter/getTreatmentMatter`, {
          userId: user.userId,
          schoolCode: user.schoolCode
        });
        
        if (response.data) {
          const treatmentMatterString = response.data.treatmentMatter.treatmentMatter;
          const treatmentMatterArray = treatmentMatterString.split('::').map(item => {
            return { treatmentMatter: item };
          });

          setTreatmentMatterRowData(treatmentMatterArray);
          setFilteredTreatmentMatter(treatmentMatterArray);

          const tagifyTreatmentArray = treatmentMatterString.split('::').map(item => {
            return item;
          });

          setTagifyTreatmentMatterSuggestion(tagifyTreatmentArray);
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('처치사항 조회 중 ERROR', error);
    }
  }, [user?.userId, user?.schoolCode]);

  useEffect(() => {
    fetchSymptomData();
  }, [fetchSymptomData]);

  useEffect(() => {
    fetchActionMatterData();
  }, [fetchActionMatterData]);

  useEffect(() => {
    fetchTreatmentMatterData();
  }, [fetchTreatmentMatterData]);

  // 증상 Grid의 Row 선택 Event
  const handleSymptomRowSelect = (selectedRow) => {
    if (selectedRow && selectedRow.length > 0) {
      const selectedSymptom = selectedRow[0].symptom;
      const param = {type: "add", text: selectedSymptom, clearField: 'N'};
      setSearchSymptomText(param);
    }
  };

  // 증상 Grid의 Row 선택 Event
  const handleMedicationRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      const selectedMedication = selectedRow[0].medication;   // 선택한 투약사항 Text 값
      const param = {type: "add", text: selectedMedication, clearField: 'N'};
      setSearchMedicationText(param);            // input에 선택한 투약사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  // 조치사항 Grid의 Row 선택 Event
  const handleActionMatterRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      const selectedActionMatter = selectedRow[0].actionMatter;   // 선택한 조치사항 Text 값
      const param = {type: "add", text: selectedActionMatter, clearField: 'N'};
      setSearchActionMatterText(param);            // input에 선택한 조치사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  // 조치사항 Grid의 Row 선택 Event
  const handleTreatmentMatterRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      const selectedTreatmentMatter = selectedRow[0].treatmentMatter;   // 선택한 조치사항 Text 값
      const param = {type: "add", text: selectedTreatmentMatter, clearField: 'N'};
      setSearchTreatmentMatterText(param);            // input에 선택한 조치사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  const setCurrentTime = () => {
    const currentTime = moment().format('HH:mm');
    // setCurrentTimeValue(currentTime);
    setOnBedRestStartTime(currentTime);
  };

  const fetchStockMedicineData = useCallback(async () => {
    if(user?.userId && user?.schoolCode) {
      const response = await axios.get(`http://${BASE_URL}:8000/workNote/getStockMedication`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        setMedicationRowData(response.data);
        setFilteredMedication(response.data);
        
        const tagifyMedicationArray = response.data.map(item => {
          return item.medication;
        });

        setTagifyMedicationSuggestion(tagifyMedicationArray);
      }
    }
  }, [user?.userId, user?.schoolCode]);

  useEffect(() => {
    fetchStockMedicineData();
  }, [fetchStockMedicineData]);

  const fetchEntireWorkNoteGrid = useCallback(async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:8000/workNote/getEntireWorkNote`,{
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const resultData = response.data.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          symptom: item.symptom.replace(/::/g, ', '),
          medication: item.medication.replace(/::/g, ', '),
          actionMatter: item.actionMatter.replace(/::/g, ', '),
          treatmentMatter: item.treatmentMatter.replace(/::/g, ', '),
          onBedTime: (!item.onBedStartTime && !item.onBedEndTime) ? "" :  item.onBedStartTime + " ~ " + item.onBedEndTime
        }));

        setEntireWorkNoteRowData(resultData);
      }
    }
  }, [user]);

  const handleExitOnBed = useCallback(async (e, item) => {
    e.preventDefault();

    const serverUrl = `http://localhost:8000`;
    const socket = io(serverUrl);

    const currentTime = moment().format('HH:mm');
    const askTitle = "침상안정 종료";
    const askMessage = item.sName + " 학생의 침상안정 종료 시간을 입력해주세요.<br/>기본적으로 현재 시간이 입력되어 있습니다.";
    const promptMessage = currentTime;
    const yesText = "침상안정 종료";
    const noText = "취소";

    const yesCallback = async (promptValue) => {
      const response = await axios.post(`http://${BASE_URL}:8000/workNote/updateOnBedEndTime`, {
        onBedEndTime: promptValue,
        userId: user.userId,
        schoolCode: user.schoolCode,
        rowId: item.id,
        targetStudentGrade: item.sGrade,
        targetStudentClass: item.sClass,
        targetStudentNumber: item.sNumber,
        targetStudentGender: item.sGender,
        targetStudentName: item.sName
      });

      if(response.data === "success") {
        const infoMessage = item.sName + "학생의 침상안정이 종료 처리 되었습니다."
        NotiflixInfo(infoMessage);
        fetchEntireWorkNoteGrid();

        socket.emit('sendBedStatus', { message: "endBed::" + item.sGrade + "," + item.sClass + "," + item.sNumber + "," + item.sName });
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixPrompt(askTitle, askMessage, promptMessage, yesText, noText, yesCallback, noCallback, '350px');
  }, [user, fetchEntireWorkNoteGrid]);

  const generateOnBedBox = useCallback(() => {

    if(user) {
      const bedCount = user.bedCount;

      if(entireWorkNoteRowData.length > 0) {
        const currentDay = moment();
        const currentTime = moment().format('HH:mm');
        let displayResultBox = [];
        let remainingBox = [];
        let displayOnBedStudentArray = [];

        entireWorkNoteRowData.forEach(item => {
          const isSameDay = currentDay.isSame(moment(item.updatedAt), 'day');
          const isBetweenTime = moment(currentTime, 'HH:mm').isBetween(moment(item.onBedStartTime, 'HH:mm'), moment(item.onBedEndTime, 'HH:mm'));
          const isSameOrAfter = moment(currentTime, 'HH:mm').isSameOrAfter(moment(item.onBedStartTime, 'HH:mm'));
          const isBefore = item.onBedEndTime ? moment(currentTime, 'HH:mm').isBefore(moment(item.onBedEndTime, 'HH:mm')) : true;

          if(isSameDay && (isBetweenTime || isSameOrAfter) && isBefore) {
            displayOnBedStudentArray.push(item);
          }
        });

        if(displayOnBedStudentArray.length > 0) {
          displayResultBox = displayOnBedStudentArray.map(item => (
              <Col lg="2" md="6" sm="6" key={item.id}>
                <Card className="card-stats" style={{ borderRadius: 15 }} targetitem={item} onMouseOver={handleMouseOverOnBedCard} onMouseOut={handleMouseOutOnBedCard}>
                  <CardBody>
                    <Row>
                      <Col md="4" xs="5">
                        <GiBed className="bed-icons-use"/>
                      </Col>
                      <Col md="8" xs="7">
                        <p className="text-muted text-center" style={{ fontSize: '15px', fontWeight: 'bold' }} >
                          <span>{item.sName}</span>
                          <br/>
                          {!item.onBedEndTime ? 
                              <span style={{ fontSize: '12px' }}>{item.onBedStartTime} 부터 사용</span>
                            :
                              <span style={{ fontSize: '12px' }}>{item.onBedStartTime} ~ {item.onBedEndTime}</span>
                          }
                        </p>
                      </Col>
                    </Row>
                    <Button className="btn-round exit-use-bed" hidden onClick={(e) => handleExitOnBed(e, item)}>사용 종료</Button>
                  </CardBody>
                </Card>
              </Col>
          ));
        }

        if(displayOnBedStudentArray.length < bedCount) {
          remainingBox = Array.from({ length: (bedCount - displayOnBedStudentArray.length) }, (_, index) => {
            const i = index + 1;
            return (
              <Col className="" lg="2" md="6" sm="6" key={i}>
                <Card className="bed-card-stats" style={{ borderRadius: 15 }}>
                  <CardBody>
                    <Row>
                      <Col md="4" xs="5">
                        <GiBed className="bed-icons-not-use"/>
                      </Col>
                      <Col className="d-flex justify-content-center align-items-center" md="8" xs="7">
                        <p className="text-muted text-center" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            );
          });
        }

        setDisplayedOnBedStudents(displayOnBedStudentArray);
        setBedBoxContent([...displayResultBox, ...remainingBox]);
      }else{
        const defaultBedBox = Array.from({ length: bedCount }, (_, index) => {
          const i = index + 1;
  
          return (
            <Col lg="2" md="6" sm="6" key={i}>
              <Card className="bed-card-stats" style={{ borderRadius: 15 }}>
                <CardBody>
                  <Row>
                    <Col md="4" xs="5">
                      <GiBed className="bed-icons-not-use"/>
                    </Col>
                    <Col className="d-flex justify-content-center align-items-center" md="8" xs="7">
                      <p className="text-muted text-center pt-1" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          );
        });

        setBedBoxContent(defaultBedBox);
      }
    }
  }, [user, entireWorkNoteRowData, handleExitOnBed]);

  useEffect(() => {
    generateOnBedBox();
  }, [generateOnBedBox]);

  const handleMouseOverOnBedCard = (e) => {
    e.currentTarget.childNodes[0].lastChild.hidden = false;
    e.currentTarget.childNodes[0].childNodes[0].style.filter = 'blur(1.5px)';
    e.currentTarget.childNodes[0].lastChild.classList.add('exit-use-bed');
  };

  const handleMouseOutOnBedCard = (e) => {
    e.currentTarget.childNodes[0].lastChild.hidden = true;
    e.currentTarget.childNodes[0].childNodes[0].style.filter = 'none';
    e.currentTarget.childNodes[0].lastChild.classList.remove('exit-use-bed');
  };

  const fetchVisitRequest = useCallback(async () => {
    Block.dots('.request-alert-box');

    if(user) {
      const response = await axios.get(`http://${BASE_URL}:8000/workNote/getVisitRequest`, {
        params: {
          schoolCode: user.schoolCode,
          isRead: false
        }
      });

      if(response.data) setVisitRequestList(response.data);
      if(document.querySelector('.notiflix-block')) Block.remove('.request-alert-box');
    }
  }, [user]);

  useEffect(() => {
   fetchVisitRequest(); 
  }, [fetchVisitRequest]);

  const notifyVisitRequest = () => {
    if(visitRequestList.length > 0) {
      return visitRequestList.map((request, index) => (
        <UncontrolledAlert key={request.id} color="warning" toggle={(e) => handleVisitRequestClose(e, request.id)}>
          <div id="visitRequestInfo">
            <span style={{ maxWidth: '100%' }}>
              <b>알림 &nbsp; </b>
              [{request.requestTime}] {alertHidden ? "*" : request.sGrade}학년 {alertHidden ? "*" : request.sClass}반 {alertHidden ? "*" : request.sNumber}번 {alertHidden ? Masking(request.sName) : request.sName} 방문 요청 - {request.teacherClassification === 'hr' ? "담임교사" : "교과목교사"} {request.teacherName}
            </span>
            <Tooltip
              placement="auto"
              isOpen={visitRequestTooltipOpen}
              autohide={true}
              target="visitRequestInfo"
              toggle={toggleVisitRequestTooltip}
            >
              {request.requestTime ? (
                <div className="text-left">
                  <b>요청시간</b> : {request.requestTime.split(":")[0]}시 {request.requestTime.split(":")[1]}분<br/>
                  <b>방문학생</b> : {request.sGrade}학년 {request.sClass}반 {request.sNumber}번 {request.sName}<br/>
                  <b>요청교사</b> : {request.teacherClassification === 'hr' ? "담임교사" : "교과목교사"} {request.teacherName}<br/>
                  <b>요청내용</b> : {request.requestContent}
                </div>
              ) : null}
            </Tooltip>
          </div>
        </UncontrolledAlert>
      ));
    }else{
      return <div className="d-flex justify-content-center align-items-center text-center" style={{ height: '100%'}}>
               <span className="text-muted">보건실 방문 요청 내역이 없습니다</span>
             </div>
    }
  };

  const handleVisitRequestClose = async (e, id) => {
    e.stopPropagation();
    
    const selectedRequest = visitRequestList.find(request => request.id === id);
    const confirmTitle = "보건실 방문 요청 확인";
    const confirmMessage = selectedRequest.sName + " 학생의 방문 요청 알림을 목록에서 삭제하시겠습니까?";

    const yesCallback = async () => {
      if(selectedRequest) {
        const response = await axios.post(`http://${BASE_URL}:8000/workNote/updateRequestReadStatus`, {
          id: selectedRequest.id,  
          schoolCode: selectedRequest.schoolCode,
          isRead: true
        });

        if(response.data === "success") {
          fetchVisitRequest();
        }
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '377px');
  };

  const handleEntireVisitRequestClose = async () => {
    const confirmTitle = "보건실 방문 요청 전체 확인";
    const confirmMessage = "보건실 방문 요청 알림을 모두 삭제하시겠습니까?";

    if(visitRequestList.length > 0) {
      const yesCallback = async () => {
        const requestIds = visitRequestList.map(request => request.id);
        const response = await axios.post(`http://${BASE_URL}:8000/workNote/updateEntireRequestReadStatus`, {
          requestIds: requestIds,
          isRead: true
        });

        if(response.data === "success") {
          fetchVisitRequest();
        }
      };

      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
    }else{
      const infoMessage = "삭제할 보건실 방문 요청 내역이 없습니다";
      NotiflixInfo(infoMessage, true, '320px');
    }
  };

  const fetchMaskedStatus = useCallback(async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:8000/user/getMaskedStatus`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const maskedStatus = Boolean(response.data[0].masked);
        setMasked(maskedStatus);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchMaskedStatus();
  }, [fetchMaskedStatus]);

  const handleMasking = async (e) => {
    e.preventDefault();

    const confirmTitle = "학생 이름 마스킹 설정";
    const confirmMessage = masked ? "학생 이름 마스킹을 해제하도록 설정하시겠습니까?" : "학생 이름을 마스킹하도록 설정하시겠습니까?";

    const yesCallback = async () => {
      if(user) {
        const response = await axios.post(`http://${BASE_URL}:8000/user/updateMaskedStatus`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          masked: !masked
        });
    
        if(response.data === "success") {
          setMasked(!masked);
          onResetSearch();
          setPersonalStudentRowData([]);
        }
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '330px');
  };

  const fetchAlertHiddenStatus = useCallback(async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:8000/user/getAlertHiddenStatus`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const alertHiddenStatus = Boolean(response.data[0].alertHidden);
        setAlertHidden(alertHiddenStatus);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchAlertHiddenStatus();
  }, [fetchAlertHiddenStatus]);

  const handleHideAlert = async (e) => {
    e.preventDefault();

    const confirmTitle = "방문요청 알람 내용 숨김 설정";
    const confirmMessage = alertHidden ? "방문요청 알람 내용 숨김을 해제하도록 설정하시겠습니까?" : "방문요청 알람 내용 숨김으로 설정하시겠습니까?";

    const yesCallback = async () => {
      if(user) {
        const response = await axios.post(`http://${BASE_URL}:8000/user/updateAlertHiddenStatus`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          alertHidden: !alertHidden
        });
    
        if(response.data === "success") {
          setAlertHidden(!alertHidden);
        }
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '330px');
  };

  const handleClearWorkNote = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const targetId = e.currentTarget.id;
    setPersonalStudentRowData([]);
    
    if(targetId.includes('TagField')) {
      const param = {clearTargetField: targetId};
      setSearchSymptomText(param);
      setSearchMedicationText(param);
      setSearchActionMatterText(param);
      setSearchTreatmentMatterText(param);
    }else if(targetId === "onBedRest") {
      setOnBedRestStartTime("");
      const onBedEndTime = document.getElementById('onBedRestEndTime');
      onBedEndTime.value = "";
    }else if(targetId === "vitalSign") {
      setTempuratureValue(0);
      setBloodPressureValue(0);
      setpulseValue(0);
      setOxygenSaturationValue(0);
      setBloodSugarValue(0);
    }
  };

  const handleClearAllWorkNote = () => {
    setSearchSymptomText({clearTargetField: "all"});
    setSearchMedicationText({clearTargetField: "all"});
    setSearchActionMatterText({clearTargetField: "all"});
    setSearchTreatmentMatterText({clearTargetField: "all"});
    setPersonalStudentRowData([]);

    setOnBedRestStartTime("");
    const onBedEndTime = document.getElementById('onBedRestEndTime');
    onBedEndTime.value = "";
    
    setTempuratureValue(0);
    setBloodPressureValue(0);
    setpulseValue(0);
    setOxygenSaturationValue(0);
    setBloodSugarValue(0);
  };

  const saveWorkNote = (e) => {
    e.preventDefault();
    
    const serverUrl = `http://localhost:8000`;
    const socket = io(serverUrl);

    let symptomString = "";
    let medicationString = "";
    let actionMatterString = "";
    let treatmentMatterString = "";
    
    const tagFields = document.getElementsByTagName('tags');
    
    const symptomTagValues = tagFields[0].getElementsByTagName('tag');
    for(let i = 0; i < symptomTagValues.length; i++) {
      symptomString += symptomTagValues[i].textContent + "::";
    }
    symptomString = symptomString.slice(0, -2);

    const medicationTagValues = tagFields[1].getElementsByTagName('tag');
    for(let i = 0; i < medicationTagValues.length; i++) {
      medicationString += medicationTagValues[i].textContent + "::";
    }
    medicationString = medicationString.slice(0, -2);

    const actionMatterTagValues = tagFields[2].getElementsByTagName('tag');
    for(let i = 0; i < actionMatterTagValues.length; i++) {
      actionMatterString += actionMatterTagValues[i].textContent + "::";
    }
    actionMatterString = actionMatterString.slice(0, -2);

    const treatmentMatterTagValues = tagFields[3].getElementsByTagName('tag');
    for(let i = 0; i < treatmentMatterTagValues.length; i++) {
      treatmentMatterString += treatmentMatterTagValues[i].textContent + "::";
    }
    treatmentMatterString = treatmentMatterString.slice(0, -2);

    const onBedRestStartTime = document.getElementById('onBedRestStartTime').value;
    const onBedRestEndTime = document.getElementById('onBedRestEndTime').value;
    // const notes = document.getElementById('notes').value;
    // 활력징후 처리 필요 (비고 제거)

    const confirmTitle = "보건일지 등록";
    const confirmMessage = "작성하신 보건일지를 등록하시겠습니까?";
    const infoMessage = "보건일지가 정상적으로 등록되었습니다.";
    const warnMessage = "선택된 학생이 없습니다.";
    
    if(selectedStudent) {
      const useBedCount = document.getElementsByClassName('bed-icons-use').length;
      if((onBedRestStartTime || onBedRestEndTime) && (user.bedCount === useBedCount)) {
        const warnMessage = "모든 침상이 사용중이므로 침상안정 등록을 할 수 없습니다.";
        NotiflixWarn(warnMessage, '370px');
        
        setOnBedRestStartTime("");
        const onBedEndTime = document.getElementById('onBedRestEndTime');
        onBedEndTime.value = "";
        
        return;
      }

      if(onBedRestStartTime || onBedRestEndTime) {
        const isDuplicatedOnBedStudent = displayedOnBedStudents.some(item =>
          item.sGrade === selectedStudent.sGrade &&
          item.sClass === selectedStudent.sClass &&
          item.sNumber === selectedStudent.sNumber &&
          item.sGender === selectedStudent.sGender &&
          item.sName === selectedStudent.sName
        );
        
        if(isDuplicatedOnBedStudent) {
          const warnMessage = selectedStudent.sName + " 학생은 이미 침상안정 중인 상태입니다.";
          NotiflixWarn(warnMessage, '310px');

          return;
        }
      }

      const yesCallback = async () => {
        const response = await axios.post(`http://${BASE_URL}:8000/workNote/saveWorkNote`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          sGrade: selectedStudent.sGrade,
          sClass: selectedStudent.sClass,
          sNumber: selectedStudent.sNumber,
          sGender: selectedStudent.sGender,
          sName: selectedStudent.sName,
          symptom: symptomString,
          medication: medicationString,
          actionMatter: actionMatterString,
          treatmentMatter: treatmentMatterString,
          onBedStartTime: onBedRestStartTime,
          onBedEndTime: onBedRestEndTime,
          temperature: temperatureValue,
          bloodPressure: bloodPressureValue,
          pulse: pulseValue,
          oxygenSaturation: oxygenSaturationValue,
          bloodSugar: bloodSugarValue
          // note: notes
          // 활력징후 처리 필요 (비고 제거)
        });

        if(response.data === "success") {
          NotiflixInfo(infoMessage);
          onResetSearch();
          handleClearAllWorkNote();
          fetchEntireWorkNoteGrid();

          socket.emit('sendBedStatus', { message: "registBed::" + selectedStudent.sGrade + "," + selectedStudent.sClass + "," + selectedStudent.sNumber + "," + selectedStudent.sName });
        }
      };

      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
    }else{
      NotiflixWarn(warnMessage);
      validateAndHighlight();
    }
  };

  const fetchSelectedStudentData = useCallback(async () => {
    if(user && selectedStudent) {
      const response = await axios.get(`http://${BASE_URL}:8000/workNote/getSelectedStudentData`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode,
          sGrade: selectedStudent.sGrade,
          sClass: selectedStudent.sClass,
          sNumber: selectedStudent.sNumber,
          sGender: selectedStudent.sGender,
          sName: selectedStudent.sName
        }
      });
      
      if(response.data) {
        const resultData = response.data.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          symptom: item.symptom.replace(/::/g, ', '),
          medication: item.medication.replace(/::/g, ', '),
          actionMatter: item.actionMatter.replace(/::/g, ', '),
          treatmentMatter: item.treatmentMatter.replace(/::/g, ', '),
          onBedTime: (!item.onBedStartTime && !item.onBedEndTime) ? "" :  item.onBedStartTime + " ~ " + item.onBedEndTime
        }));

        setPersonalStudentRowData(resultData);
      }
    }
  }, [user, selectedStudent]);

  useEffect(() => {
    fetchSelectedStudentData();
  }, [fetchSelectedStudentData]);

  const toggleEntireWorkNoteGrid = () => {
    fetchEntireWorkNoteGrid();
    setIsEntireWorkNoteOpen(!isEntireWorkNoteOpen);

    if(!isEntireWorkNoteOpen) document.getElementsByClassName('content')[0].style.minHeight = 'calc(100vh + 410px)';
    else document.getElementsByClassName('content')[0].style.minHeight = 'calc(100vh - 163px)';
  };

  useEffect(() => {
    fetchEntireWorkNoteGrid();
  }, [fetchEntireWorkNoteGrid]);

  const autoUpdateBedBox = () => {
    if(displayedOnBedStudents) {
      const currentDay = moment();
      const currentTime = moment().format('HH:mm');

      const filteredData = displayedOnBedStudents.filter(item => {
        const isSameDay = moment(item.updatedAt).isSame(currentDay, 'day');
        const isBefore = moment(item.onBedEndTime, 'HH:mm').isBefore(moment(currentTime, 'HH:mm'));

        return isSameDay && isBefore;
      });

      if(filteredData && filteredData.length > 0) {
        fetchEntireWorkNoteGrid();
        generateOnBedBox();

        filteredData.forEach(item => { 
          const targetStudentName = item.sName; 
          const infoMessage = targetStudentName + " 학생의 침상안정이 종료되었습니다.";
          const isAutoHide = false;
          
          NotiflixInfo(infoMessage, isAutoHide, '310px');
        });
      }
    }
  };

  function useInterval(callback, delay) {
    const savedCallback = useRef(); // closure 역할을 하는 useRef -> render를 해도 초기화 되지 않음
  
    // callback가 변경될 때 useEffect가 감지하여 최신 상태를 저장
    useEffect(() => {
      savedCallback.current = callback; 
    }, [callback]);
  
    // interval 및 clear setting
    useEffect(() => {
      function tick() {
        savedCallback.current(); 
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id); // 실행 즉시 clear -> 메모리 차지하지 않음
      }
    }, [delay]);
  };

  const handleVitalSignChange = (e) => {
    const newValue = e.target.value;

    if(!isNaN(newValue)) {
      if(e.target.id === "temperature") setTempuratureValue(newValue);
      else if(e.target.id === "bloodPressure") setBloodPressureValue(newValue);
      else if(e.target.id === "pulse") setpulseValue(newValue);
      else if(e.target.id === "oxygenSaturation") setOxygenSaturationValue(newValue);
      else if(e.target.id === "bloodSugar") setBloodSugarValue(newValue);
    }
  };

  useEffect(() => {
    const serverUrl = `http://${BASE_URL}:8000`;
    const socket = io(serverUrl);

    const connectedSockets = new Set();

    if(!connectedSockets.has(socket.id)) {
      connectedSockets.add(socket.id);

      const handleBroadcastVisitRequest = (data) => {
        const bcMessage = data.message;
        const requestMessage = bcMessage.split('::')[0];
        const studentInfo = bcMessage.split('::')[1];
        const targetGrade = studentInfo.split(',')[0];
        const targetClass = studentInfo.split(',')[1];
        const targetNumber = studentInfo.split(',')[2];
        const targetName = studentInfo.split(',')[3];
        
        if(requestMessage === "visitRequest") {
          const notificationMessage = targetGrade + "학년 " + targetClass + "반 " + targetNumber + "번 " + targetName + " 학생이 보건실 방문 요청을 하였습니다";
          const options = {
            place: 'tc',
            message: (
              <div>
                <div>
                  {notificationMessage}
                </div>
              </div>
            ),
            type: 'info',
            icon: 'nc-icon nc-bell-55',
            autoDismiss: 7
          };

          notificationAlert.current.notificationAlert(options);
          fetchVisitRequest();
        }
      };

      socket.on('broadcastVisitRequest', handleBroadcastVisitRequest);
        
      socket.on('disconnect', (reason) => {
        console.log("소켓 연결 해제:", reason);
        connectedSockets.delete(socket.id);
      });

      socket.on('connect_error', (error) => {
          console.error("소켓 연결 오류:", error);
      });
    }

    return () => {
      socket.off('broadcastVisitRequest');
    };
  }, []);

  const validateAndHighlight = () => {
    setNonSelectedHighlight(true);
    setTimeout(() => {
      setNonSelectedHighlight(false);
    }, 2000);
  };

  // Custom Interval 사용 -> 기존 interval 사용 시 안에서 갇혀버리는 closure 현상으로 message 반복 출력 현상 발생
  useInterval(() => {
    autoUpdateBedBox();
  }, 1000);

  const handleItemClick = async ({ id, event, props }) => {
    if(id === "registDiagetes" && contextStudentInfo && user) {
      const targetGrade = contextStudentInfo.split(",")[0];
      const targetClass = contextStudentInfo.split(",")[1];
      const targetNumber = contextStudentInfo.split(",")[2];
      const targetName = contextStudentInfo.split(",")[3];
      
      const confirmTitle = "당뇨질환학생 등록";
      const confirmMessage = targetGrade + "학년 " + targetClass + "반 " + targetNumber + "번 " + targetName + " 학생을<br/>당뇨질환 학생으로 등록하시겠습니까?";
      
      const yesCallback = async () => {
        const response = await axios.post(`http://${BASE_URL}:8000/workNote/updateDiabetesStudent`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          targetGrade: targetGrade,
          targetClass: targetClass,
          targetNumber: targetNumber,
          targetName: targetName,
          isDiabetes: true
        });
  
        if(response.data === "success") {
          const infoMessage = "정상적으로 등록되었습니다";
          NotiflixInfo(infoMessage);
        }
      };

      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback)

    }
  };

  const getRowStyle = (params) => {

  };

  const [contextStudentInfo, setContextStudentInfo] = useState("");

  function handleContextMenu(event){
    if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
      return;
    }else{
      const selectedGrade = event.target.parentNode.childNodes[0].textContent;
      const selectedClass = event.target.parentNode.childNodes[1].textContent;
      const selectedNumber = event.target.parentNode.childNodes[2].textContent;
      const selectedName = event.target.parentNode.childNodes[3].textContent;
      const selectedStudentInfo = selectedGrade + "," + selectedClass + "," + selectedNumber + "," + selectedName;

      setContextStudentInfo(selectedStudentInfo);

      show({
        event,
        props: {
            key: 'value'
        }
      })
    }
  };

  const [manageEmergencyModal, setManageEmergencytModal] = useState(false);
  const toggleManageEmergencyModal = () => setManageEmergencytModal(!manageEmergencyModal);

  const handleEmergencyStudent = () => {
    toggleManageEmergencyModal();
  };


  return (
    <>
      <div className="content" style={{ height: '84.8vh' }}>
        <NotificationAlert ref={notificationAlert} />
        <Row className="pl-3 pr-3" style={{ marginBottom: '-5px'}}>
          <Table bordered className="stats-table text-center text-muted">
            <thead>
              <tr>
                <th>감염병</th>
                <th>구강치아계</th>
                <th>근골격계</th>
                <th>비뇨생식기계</th>
                <th>소화기계</th>
                <th>순환기계</th>
                <th>안과계</th>
                <th>이비인후과계</th>
                <th>정신신경계</th>
                <th>호흡기계</th>
                <th>기타</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2</td>
                <td>3</td>
                <td>3</td>
                <td>23</td>
                <td>12</td>
                <td>3</td>
                <td>5</td>
                <td>7</td>
                <td>5</td>
                <td>10</td>
                <td>17</td>
              </tr>
            </tbody>
          </Table>
        </Row>
        <Row style={{ marginBottom: '-6px' }}>
          {bedBoxContent}
        </Row>
        <Row>
          <Col className="pr-2" md="4">
            <Card className="studentInfo" style={{ minHeight: '420px', transition: 'box-shadow 0.5s ease', boxShadow: nonSelectedHighlight ? '0px 0px 12px 2px #fccf71' : 'none', border: '1px solid lightgrey' }}>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b>학생 조회</b>
              </CardHeader>
              <CardBody className="pb-1">
                <Row className="pr-0">
                  <Col md="10" className="ml-1" style={{ marginRight: '-15px'}}>
                    <Row>
                      <Col md="3">
                        <Row className="align-items-center mr-0">
                          <Col md="8" className="text-left">
                            <label>학년</label>
                          </Col>
                          <Col md="4" className="p-0" style={{ marginLeft: '-12px' }}>
                            <Input
                              className="text-right"
                              style={{ width: '40px' }}
                              onChange={(e) => onInputChange("iGrade", e.target.value)}
                              value={searchCriteria.iGrade}
                              onKeyDown={(e) => handleKeyDown(e, "iGrade")}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md="2">
                        <Row className="align-items-center">
                          <Col md="6" className="text-left" style={{ marginLeft: '-20px' }}>
                            <label>반</label>
                          </Col>
                          <Col md="6" className="p-0">
                            <Input
                              className="text-right"
                              style={{ width: '40px' }}
                              onChange={(e) => onInputChange("iClass", e.target.value)}
                              value={searchCriteria.iClass}
                              onKeyDown={(e) => handleKeyDown(e, "iClass")}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md="3">
                        <Row className="align-items-center">
                          <Col md="7" className="text-left" style={{ marginLeft: '-20px' }}>
                            <label>번호</label>
                          </Col>
                          <Col md="5" className="p-0" style={{ marginLeft: '-13px'}}>
                            <Input
                              className="text-right"
                              style={{ width: '40px' }}
                              onChange={(e) => onInputChange("iNumber", e.target.value)}
                              value={searchCriteria.iNumber}
                              onKeyDown={(e) => handleKeyDown(e, "iNumber")}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md="4">
                        <Row className="align-items-center pr-0">
                          <Col md="5" className="text-right" style={{ marginLeft: '-40px'}}>
                            <label>이름</label>
                          </Col>
                          <Col md="7" className="p-0" style={{ marginLeft: '-5px'}}>
                            <Input
                              className="text-right"
                              style={{ width: '80px' }}
                              onChange={(e) => onInputChange("iName", e.target.value)}
                              value={searchCriteria.iName}
                              onKeyDown={(e) => handleKeyDown(e, "iName")}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                  <Col md="2" style={{ marginLeft: '-25px' }}>
                    <Row>
                      <Col md="6" style={{ marginTop: '-10px', marginLeft: '-7px', marginRight: '7px' }}>
                        <Button size="sm" style={{ height: '30px' }} onClick={onResetSearch}><IoMdRefresh style={{ fontSize: '15px'}} /></Button>
                      </Col>
                      <Col md="6" style={{ marginTop: '-10px' }}>
                        <Button size="sm" style={{ height: '30px' }} onClick={() => onSearchStudent(searchCriteria)}><RiSearchLine style={{ fontSize: '15px' }}/></Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Alert className="d-flex justify-content-center align-items-center text-center text-muted mb-0" style={{ backgroundColor: '#f8f8f8', borderRadius: 10, height: 20 }}>
                      <FaInfoCircle className="mr-2" style={{ marginTop: '-2px', fontSize: 17}}/> 일부 항목 입력으로도 조회 가능합니다
                    </Alert>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col className="text-right pr-4" md="12">
                    <CustomInput 
                       type="switch"
                       id="maskingName"
                       label={<span style={{ fontSize: 13}}>학생정보 숨김</span>}
                       checked={masked}
                       onChange={handleMasking}
                    />
                  </Col>
                </Row>
                <Row className="pt-1">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '19.7vh' }} onContextMenu={handleContextMenu}>
                      <AgGridReact
                        rowHeight={30}
                        ref={searchStudentGridRef}
                        rowData={searchStudentRowData} 
                        columnDefs={searchStudentColumnDefs}
                        defaultColDef={notEditDefaultColDef}
                        paginationPageSize={4}
                        overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                        rowSelection="single"
                        onSelectionChanged={onGridSelectionChanged}
                        suppressCellFocus={true}
                        overlayLoadingTemplate={
                          '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                        }
                      />
                    </div>
                    <div>
                      <Menu id={MENU_ID} animation="fade">
                        <Item id="registDiagetes" onClick={handleItemClick}>당뇨질환학생 등록</Item>
                        <Item id="protectedsStdentd" onClick={handleItemClick}>보호학생 등록</Item>
                        {/* <Item id="cut" onClick={handleItemClick}>Cut</Item>
                        <Separator />
                        <Item disabled>Disabled</Item>
                        <Separator />
                        <Submenu label="Foobar">
                          <Item id="reload" onClick={handleItemClick}>Reload</Item>
                          <Item id="something" onClick={handleItemClick}>Do something else</Item>
                        </Submenu> */}
                      </Menu>
                    </div>
                  </Col>
                </Row>
                <Row className="pt-1">
                  <Col md="4">
                    <Button size="sm">학생관리</Button>
                  </Col>
                  <Col className="d-flex justify-content-end" md="8">
                    <Button size="sm">당뇨질환학생관리</Button>
                    <Button className="ml-1" size="sm">보호학생관리</Button>
                    <Button className="ml-1" size="sm" onClick={handleEmergencyStudent}>응급학생관리</Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <Card style={{ height: '252px', border: '1px solid lightgrey' }}>
              <CardHeader className="text-muted" style={{ fontSize: '17px' }}>
                <Row className="d-flex align-items-center">
                  <Col className="text-left pl-4" md="3">
                    <CustomInput 
                       type="switch"
                       id="hidePrivacyInfo"
                       label={<span style={{ fontSize: 13 }}><b>내용 숨김</b></span>}
                       checked={alertHidden}
                       onChange={handleHideAlert}
                    />
                  </Col>
                  <Col className="text-center" md="6">
                    <b>보건실 방문 요청 내역</b>
                  </Col>
                  <Col className="text-right pr-4" md="3" style={{ marginTop: -8 }}>
                    <b style={{ fontSize: '13px', color: '#9A9A9A' }} onClick={handleEntireVisitRequestClose}>전체읽음</b>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="request-alert-box" style={{ height: '100%', overflowY: 'auto' }}>
                  {notifyVisitRequest()}
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col className="pl-2" md="8">
            <Card className="workNoteForm" style={{ border: '1px solid lightgrey' }}>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b style={{ position: 'absolute', marginLeft: '-35px' }}>보건 일지</b>
                <b className="p-1 pl-2 pr-2" style={{ float: 'right', fontSize: '13px', backgroundColor: '#F1F3F5', borderRadius: '7px'}}>
                  {selectedStudent ? `${selectedStudent.sGrade} 학년 ${'\u00A0'} ${selectedStudent.sClass} 반 ${'\u00A0'} ${selectedStudent.sNumber}번 ${'\u00A0'} ${selectedStudent.sName}` :  '학생을 선택하세요'}
                </b>
              </CardHeader>
              <CardBody className="pt-2 pb-1">
                <Row className="pt-1">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '13.8vh' }}>
                      <AgGridReact
                        rowHeight={30}
                        ref={personalStudentGridRef}
                        rowData={personalStudentRowData} 
                        columnDefs={personalStudentColumnDefs}
                        defaultColDef={notEditDefaultColDef}
                        overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="3" className="pt-3 pr-2">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title" style={{ marginRight: '-5px' }}>증상</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="symptomTagField" className="mr-2" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote}/>
                            <BiMenu style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleSymptom}/>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0">
                        <TagField name="symptom" suggestions={tagifySymptomSuggestion} selectedRowValue={searchSymptomText} tagifyGridRef={symptomGridRef} category="symptomTagField"/>
                        <div className="ag-theme-alpine" style={{ height: '9.1vh' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={symptomGridRef}
                            rowData={filteredSymptom} 
                            columnDefs={symptomColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleSymptomRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" className="pt-3 pl-0 pr-2">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title" style={{ marginRight: '-9px' }}>투약사항</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="medicationTagField" className="mr-2" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />                            
                            <BiMenu style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleMedication}/>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0">
                        <TagField name="medication" suggestions={tagifyMedicationSuggestion} selectedRowValue={searchMedicationText} tagifyGridRef={medicationGridRef} category="medicationTagField" />
                        <div className="ag-theme-alpine" style={{ height: '9.1vh' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={medicationGridRef}
                            rowData={filteredMedication} 
                            columnDefs={medicationColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleMedicationRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="5" className="pt-3 pl-0">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title" style={{ marginRight: '-17px' }}>조치 및 교육사항</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="actionMatterTagField" className="mr-2" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />                            
                            <BiMenu style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleActionMatter}/>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0">
                        <TagField name="actionMatter" suggestions={tagifyActionMatterSuggestion} selectedRowValue={searchActionMatterText} tagifyGridRef={actionMatterGridRef} category="actionMatterTagField" />
                        <div className="ag-theme-alpine" style={{ height: '9.1vh' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={actionMatterGridRef}
                            rowData={filteredActionMatter} 
                            columnDefs={actionMatterColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleActionMatterRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row style={{ marginTop: '-13px', marginBottom: '-15px' }}>
                  <Col md="6" className="pr-0">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title" style={{ marginRight: 5}}>처치사항</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="treatmentMatterTagField" className="mr-2" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />
                            <BiMenu style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleTreatmentMatter}/>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0">
                        <TagField name="treatmentMatter" suggestions={tagifyTreatmentMatterSuggestion} selectedRowValue={searchTreatmentMatterText} tagifyGridRef={treatmentMatterGridRef} category="treatmentMatterTagField" />
                        <div className="ag-theme-alpine" style={{ height: '9.1vh' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={treatmentMatterGridRef}
                            rowData={filteredTreatmentMatter} 
                            columnDefs={treatmentMatterColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleTreatmentMatterRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6" className="pl-2">
                    <Card className="pb-0" style={{ border: '1px solid lightgrey' }}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title">활력징후</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="vitalSign" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="pt-3 pb-3" style={{ marginTop: '-5px'}}>
                        <Row className="d-flex justify-content-center">
                          <Col md="2">
                            <Row className="align-items-center">
                              <label>체온</label>
                              <Input
                                className="ml-2"
                                id="temperature"
                                type="number"
                                max={45}
                                min={30}
                                onChange={handleVitalSignChange}
                                value={temperatureValue}
                                style={{ width: '45px' }}
                              />
                            </Row>
                          </Col>
                          <Col md="2" className="ml-1">
                            <Row className="align-items-center">
                              <label>혈압</label>
                              <Input
                                className="ml-2"
                                id="bloodPressure"
                                type="number"
                                onChange={handleVitalSignChange}
                                value={bloodPressureValue}
                                style={{ width: '50px' }}
                              />
                            </Row>
                          </Col>
                          <Col md="2" className="ml-2">
                            <Row className="align-items-center">
                              <label>맥박</label>
                              <Input
                                className="ml-2"
                                id="pulse"
                                type="number"
                                onChange={handleVitalSignChange}
                                value={pulseValue}
                                style={{ width: '45px' }}
                              />
                            </Row>
                          </Col>
                          <Col md="3" className="ml-1">
                            <Row className="align-items-center">
                              <label>산소포화도</label>
                              <Input
                                className="ml-2"
                                id="oxygenSaturation"
                                type="number"
                                onChange={handleVitalSignChange}
                                value={oxygenSaturationValue}
                                style={{ width: '45px' }}
                              />
                            </Row>
                          </Col>
                          <Col md="2" className="ml-1">
                            <Row className="align-items-center">
                              <label>혈당</label>
                              <Input
                                className="ml-2"
                                id="bloodSugar"
                                type="number"
                                onChange={handleVitalSignChange}
                                value={bloodSugarValue}
                                style={{ width: '45px' }}
                              />
                            </Row>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                    <Card className="pb-0" style={{ border: '1px solid lightgrey', marginTop: '-9px' }}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title">침상안정</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="onBedRest" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="pt-3 pb-3" style={{ marginTop: '-3px' }}>
                        <Row className="mt-1">
                          <h6><Badge color="secondary" className="ml-2" style={{ height: '25px', lineHeight: '19px', marginTop: '2px', fontSize: 13 }}>시작시간</Badge></h6>
                          <Input
                            id="onBedRestStartTime"
                            className="ml-2"
                            type="time"
                            style={{ width: '130px', height: '30px' }}
                            onChange={(e) => setOnBedRestStartTime(e.target.value)}
                            value={onBedRestStartTime}
                          />
                          <Button size="sm" className="ml-1 m-0" style={{ height: '30px' }} onClick={setCurrentTime}>현재시간</Button>
                          <h6><Badge color="secondary" className="ml-4" style={{ height: '25px', lineHeight: '19px', marginTop: '2px', fontSize: 13 }}>종료시간</Badge></h6>
                          <Input
                            id="onBedRestEndTime"
                            className="ml-2"
                            type="time"
                            style={{ width: '130px', height: '30px' }}
                          />
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className="d-flex justify-content-center">
                  <Col md="4">
                    <Button className="" onClick={toggleEntireWorkNoteGrid}>전체 보건일지</Button>
                  </Col>
                  <Col md="4" className="d-flex justify-content-center">
                    <Button className="mr-1" onClick={saveWorkNote}>등록</Button>
                    <Button onClick={handleClearAllWorkNote}>초기화</Button>
                  </Col>
                  <Col className="d-flex justify-content-end" md="4">
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
        </Row>
        <Collapse isOpen={isEntireWorkNoteOpen} {...args}>
          <Card>
            <CardHeader>

            </CardHeader>
            <CardBody>
              <div className="ag-theme-alpine" style={{ height: '50vh' }}>
                <AgGridReact
                  ref={registeredAllGridRef}
                  rowData={entireWorkNoteRowData}
                  columnDefs={entireWorkNoteColumnDefs} 
                  overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                />
              </div>
            </CardBody>
          </Card>
        </Collapse>
      </div>

      <Modal isOpen={symptomModal} toggle={toggleSymptomModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleSymptomModal}><b className="text-muted">증상 설정</b></ModalHeader>
          <ModalBody className="pb-0">
            <Form onSubmit={saveSymptom}>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact
                  ref={symptomGridRef}
                  rowData={filteredSymptom}
                  columnDefs={symptomColumnDefs}
                  stopEditingWhenCellsLoseFocus={true}
                  // singleClickEdit={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 증상이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  overlayLoadingTemplate={
                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                  }
                  onGridReady={onGridReady}
                  rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                  onCellEditingStarted={onCellEditingStarted}
                  onCellEditingStopped={onCellEditingStopped}
                  onRowDataUpdated={onSymptomRowDataUpdated}
                  onCellValueChanged={onCellValueChanged}
                />
              </div>
            </Form>
            <Row>
              <Col className="justify-content-start no-gutters">
                <Button className="btn-plus" size="sm" onClick={appendSymptomRow}>
                  추가
                </Button>
                <Button className="btn-minus" size="sm" onClick={removeSymptomRow}>
                  삭제
                </Button>
              </Col>
              <Col>
                <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allSymptomRemoveRow}>전체 삭제</Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button className="mr-1" color="secondary" onClick={saveSymptom}>저장</Button>
            <Button color="secondary" onClick={toggleSymptomModal}>취소</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={medicationModal} toggle={toggleMedicationModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleMedicationModal}><b className="text-muted">투약사항 설정</b></ModalHeader>
          <ModalBody className="pb-0">
            <Form onSubmit={saveMedication}>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact
                  ref={medicationGridRef}
                  rowData={filteredMedication}
                  columnDefs={medicationColumnDefs}
                  stopEditingWhenCellsLoseFocus={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 투약사항이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  overlayLoadingTemplate={
                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                  }
                  onGridReady={onGridReady}
                  rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                  onCellEditingStarted={onCellEditingStarted}
                  onCellEditingStopped={onCellEditingStopped}
                  onRowDataUpdated={onMedicationRowDataUpdated}
                  onCellValueChanged={onCellValueChanged}
                />
              </div>
            </Form>
            <Row>
              <Col className="justify-content-start no-gutters">
                <Button className="btn-plus" size="sm" onClick={appendMedicationRow}>
                  추가
                </Button>
                <Button className="btn-minus" size="sm" onClick={removeMedicationRow}>
                  삭제
                </Button>
              </Col>
              <Col>
                <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allMedicationRemoveRow}>전체 삭제</Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button className="mr-1" color="secondary" onClick={saveMedication}>저장</Button>
            <Button color="secondary" onClick={toggleMedicationModal}>취소</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={actionMatterModal} toggle={toggleActionMatterModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleActionMatterModal}><b className="text-muted">조치 및 교육사항 설정</b></ModalHeader>
          <ModalBody className="pb-0">
            <Form onSubmit={saveActionMatter}>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact
                  ref={actionMatterGridRef}
                  rowData={filteredActionMatter}
                  columnDefs={actionMatterColumnDefs}
                  stopEditingWhenCellsLoseFocus={true}
                  // singleClickEdit={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 조치 및 교육사항이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  overlayLoadingTemplate={
                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                  }
                  onGridReady={onGridReady}
                  rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                  onRowDataUpdated={onActionMatterRowDataUpdated}
                  onCellValueChanged={onCellValueChanged}
                />
              </div>
            </Form>
            <Row>
              <Col className="justify-content-start no-gutters">
                <Button className="btn-plus" size="sm" onClick={appendActionMatterRow}>
                  추가
                </Button>
                <Button className="btn-minus" size="sm" onClick={removeActionMatterRow}>
                  삭제
                </Button>
              </Col>
              <Col>
                <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allActionMatterRemoveRow}>전체 삭제</Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button className="mr-1" color="secondary" onClick={saveActionMatter}>저장</Button>
            <Button color="secondary" onClick={toggleActionMatterModal}>취소</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={treatmentMatterModal} toggle={toggleTreatmentMatterModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleTreatmentMatterModal}><b className="text-muted">처치사항 설정</b></ModalHeader>
          <ModalBody className="pb-0">
            <Form onSubmit={saveTreatmentMatter}>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact
                  ref={treatmentMatterGridRef}
                  rowData={filteredTreatmentMatter}
                  columnDefs={treatmentMatterColumnDefs}
                  stopEditingWhenCellsLoseFocus={true}
                  // singleClickEdit={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 처치사항이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  overlayLoadingTemplate={
                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                  }
                  onGridReady={onGridReady}
                  rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                  onRowDataUpdated={onTreatmentMatterRowDataUpdated}
                  onCellValueChanged={onCellValueChanged}
                />
              </div>
            </Form>
            <Row>
              <Col className="justify-content-start no-gutters">
                <Button className="btn-plus" size="sm" onClick={appendTreatmentMatterRow}>
                  추가
                </Button>
                <Button className="btn-minus" size="sm" onClick={removeTreatmentMatterRow}>
                  삭제
                </Button>
              </Col>
              <Col>
                <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allTreatmentMatterRemoveRow}>전체 삭제</Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button className="mr-1" color="secondary" onClick={saveTreatmentMatter}>저장</Button>
            <Button color="secondary" onClick={toggleTreatmentMatterModal}>취소</Button>
          </ModalFooter>
       </Modal>

      <EmergencyModal 
        manageEmergencyModal={manageEmergencyModal}
        toggleManageEmergencyModal={toggleManageEmergencyModal}
        searchStudentColumnDefs={searchStudentColumnDefs}
        notEditDefaultColDef={notEditDefaultColDef}
        fetchSelectedStudentData={fetchSelectedStudentData}
        fetchStudentData={fetchStudentData}
      />
    </>
  );
}

export default WorkNote;

/**
 * 증상, 투약사항 등은 모두 2개 이상 입력하는 가정
 * 두개 이상 입력될 시 구분은 모두 (,) 쉼표로 구분되어야 함
 * 
 * 각 입력 항목 초기화 버튼 클릭 시 동작되나 같은 항목을 초기화 하고 다시 선택 후 초기화 시 동작 하지 않는 현상 처리 필요
 * 
 * blur 처리시 자연스럽게 blur되도록 하는 효과 표시 필요
 */