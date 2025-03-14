import React, {useState, useRef, useCallback, useEffect} from "react";
import {Card, CardHeader, CardBody, Row, Col, Input, Button, Alert, Badge, UncontrolledAlert, Collapse, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, CustomInput, Tooltip, CardFooter, Popover, PopoverBody, PopoverHeader, Label } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import TagField from "components/TagField/TagField";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { GiAlligatorClip, GiBed } from "react-icons/gi";
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
import { getSocket } from "components/Socket/socket";
import { SiMicrosoftexcel } from "react-icons/si";
import { TiPrinter } from "react-icons/ti";
import { IoMdSettings } from "react-icons/io";
import { IoInformationCircleOutline } from "react-icons/io5";
import DateTimeEditor from "components/Tools/DateTimeEditor";
import '../assets/css/worknote.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const MENU_ID_LEFT_GRID = 'students_context_menu';
const MENU_ID_RIGHT_GRID = 'delete_context_menu';
const MENU_ID_RENTAL_GRID = 'rental_context_menu';
const MENU_ID_RETURN_GRID = 'return_context_menu';

function WorkNote(args) {
  const { user, getUser } = useUser();                              // 사용자 정보
  const [isEntireWorkNoteOpen, setIsEntireWorkNoteOpen] = useState(false);
  const [searchStudentRowData, setSearchStudentRowData] = useState([]); // 검색 결과를 저장할 state
  const [rentalSearchStudentRowData, setRentalSearchStudentRowData] = useState([]);
  const [symptomRowData, setSymptomRowData] = useState([]);
  const [medicationRowData, setMedicationRowData] = useState([]);
  const [bodyPartsRowData, setBodyPartsRowData] = useState([]);
  const [treatmentMatterRowData, setTreatmentMatterRowData] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({ iGrade: "", iClass: "", iNumber: "", iName: "" });
  const [rentalSearchCriteria, setRentalSearchCriteria] = useState({ iGrade: "", iClass: "", iNumber: "", iName: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [symptomModal, setSymptomModal] = useState(false);
  const [medicationModal, setMedicationModal] = useState(false);
  const [bodyPartsModal, setBodyPartsModal] = useState(false);
  const [treatmentMatterModal, setTreatmentMatterModal] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [searchSymptomText, setSearchSymptomText] = useState("");
  const [filteredSymptom, setFilteredSymptom] = useState(symptomRowData);
  const [tagifySymptomSuggestion, setTagifySymptomSuggestion] = useState([]);
  const [tagifyMedicationSuggestion, setTagifyMedicationSuggestion] = useState([]);
  const [tagifyBodyPartsSuggestion, setTagifyBodyPartsSuggestion] = useState([]);
  const [tagifyTreatmentMatterSuggestion, setTagifyTreatmentMatterSuggestion] = useState([]);
  const [searchMedicationText, setSearchMedicationText] = useState("");
  const [filteredMedication, setFilteredMedication] = useState(medicationRowData);
  const [searchBodyPartsText, setSearchBodyPartsText] = useState("");
  const [filteredBodyParts, setFilteredBodyParts] = useState(bodyPartsRowData);
  const [searchTreatmentMatterText, setSearchTreatmentMatterText] = useState("");
  const [filteredTreatmentMatter, setFilteredTreatmentMatter] = useState(treatmentMatterRowData);
  const [masked, setMasked] = useState(false);
  const [alertHidden, setAlertHidden] = useState(false);
  const [onBedRestStartTime, setOnBedRestStartTime] = useState("");
  const [onBedRestEndTime, setOnBedRestEndTime] = useState("");
  const [bedBoxContent, setBedBoxContent] = useState(null);
  const [displayedOnBedStudents, setDisplayedOnBedStudents] = useState(null);
  const [temperatureValue, setTempuratureValue] = useState(0);
  const [bloodPressureValue, setBloodPressureValue] = useState(0);
  const [pulseValue, setpulseValue] = useState(0);
  const [oxygenSaturationValue, setOxygenSaturationValue] = useState(0);
  const [bloodSugarValue, setBloodSugarValue] = useState(0);
  const [nonSelectedHighlight, setNonSelectedHighlight] = useState(false);
  const [nonSelectedToUpdateHighlight, setNonSelectedToUpdateHighlight] = useState(false);
  const [visitRequestList, setVisitRequestList] = useState([]);
  const [visitRequestTooltipOpen, setVisitRequestTooltipOpen] = useState(false);
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchSname, setSearchSname] = useState("");
  const [selectedWorkNote, setSelectedWorkNote] = useState(null);
  const [isGridRowSelect, setIsGridRowSelect] = useState(false);
  const [contextStudentInfo, setContextStudentInfo] = useState("");
  const [onBedStudentListModal, setOnBedStudentListModal] = useState(false);
  const [onBedStudentListData, setOnBedStudentListData] = useState([]);
  const [personalStudentRowData, setPersonalStudentRowData] = useState([]);
  const [entireWorkNoteRowData, setEntireWorkNoteRowData] = useState([]);
  const [registProtectStudentModal, setRegistProtectStudentModal] = useState(false);
  const [protectSgrade, setProtectSgrade] = useState("");
  const [protectSclass, setProtectSclass] = useState("");
  const [protectSnumber, setProtectSnumber] = useState("");
  const [protectSgender, setProtectSgender] = useState("");
  const [protectSname, setProtectSname] = useState("");
  const [protectContent, setProtectContent] = useState("");
  const [manageProtectStudentModal, setManageProtectStudentModal] = useState(false);
  const [diabetesStudentsRowData, setDiabetesStudentsRowData] = useState([]);
  const [protectStudentsRowData, setProtectStudentsRowData] = useState([]);
  const [isPopUpProtectStudent, setIsPopUpProtectStudent] = useState(false);
  const [medicineBookmarkPopOverOpen, setMedicineBookmarkPopOverOpen] = useState(false);
  const [rentalProductRowData, setRentalProductRowData] = useState([]);
  const [rentalListRowData, setRentalListRowData] = useState([]);
  const [rentalProductPopOverOpen, setRentalProductPopOverOpen] = useState(false);
  const [registRentalProductModal, setRegistRentalProductModal] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [manageEmergencyModal, setManageEmergencytModal] = useState(false);
  const [selectedRentalProductRow, setSelectedRentalProductRow] = useState(null);
  const [isRentalGridRowSelect ,setIsRentalGridRowSelect] = useState(false);
  const [rentalProductModal, setRentalProductModal] = useState(false);
  const [selectedRentalStudent, setSelectedRentalStudent] = useState(null);
  const [rentalAmount, setRentalAmount] = useState(0);
  const [rentalPopOverOpen, setRentalPopOverOpen] = useState(false);
  const [selectedRentalRow, setSelectedRentalRow] = useState(null);
  const [isReturnGridRowSelect, setIsReturnGridRowSelect] = useState(false);

  const searchStudentGridRef = useRef();
  const rentalSearchStudentGridRef = useRef();
  const personalStudentGridRef = useRef();
  const registeredAllGridRef = useRef();
  const onBedStudentListGridRef = useRef();
  const symptomGridRef = useRef();
  const medicationGridRef = useRef();
  const bodyPartsGridRef = useRef();
  const treatmentMatterGridRef = useRef();
  const notificationAlert = useRef();
  const protectStudentGridRef = useRef();
  const rentalProductGridRef = useRef();
  const rentalListGridRef = useRef();

  const { show: showLeftMenu } = useContextMenu({
    id: MENU_ID_LEFT_GRID,
  });

  const { show: showRightMenu } = useContextMenu({
    id: MENU_ID_RIGHT_GRID
  });

  const { show: showRentalMenu } = useContextMenu({
    id: MENU_ID_RENTAL_GRID
  });

  const { show: showReturnMenu } = useContextMenu({
    id: MENU_ID_RETURN_GRID
  });

  // 최초 Grid Render Event
  const onGridReady = useCallback((params) => {
  }, []);

  const toggleSymptomModal = () => setSymptomModal(!symptomModal);
  const toggleMedicationModal = () => setMedicationModal(!medicationModal);
  const toggleBodyPartsModal = () => setBodyPartsModal(!bodyPartsModal);
  const toggleTreatmentMatterModal = () => setTreatmentMatterModal(!treatmentMatterModal);
  const toggleVisitRequestTooltip = () => setVisitRequestTooltipOpen(!visitRequestTooltipOpen);
  const toggleOnBedStudentListModal = () => setOnBedStudentListModal(!onBedStudentListModal);
  const toggleRegistProtectStudentModal = () => setRegistProtectStudentModal(!registProtectStudentModal);
  const toggleManageProtectStudentModal = () => setManageProtectStudentModal(!manageProtectStudentModal);
  const toggleMedicineBookmarkPopOver = () => setMedicineBookmarkPopOverOpen(!medicineBookmarkPopOverOpen);
  const toggleRentalProductPopOver = () => setRentalProductPopOverOpen(!rentalProductPopOverOpen);
  const toggleRegistRentalProductModal = () => setRegistRentalProductModal(!registRentalProductModal);
  const toggleManageEmergencyModal = () => setManageEmergencytModal(!manageEmergencyModal);
  const toggleRentalProductModal = () => setRentalProductModal(!rentalProductModal);
  const toggleRentalPopOver = () => setRentalPopOverOpen(!rentalPopOverOpen);

  const customCellRenderer = (params) => {
    const { value } = params;
    if(params.data.isProtected) {
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
    { field: "sGender", headerName: "성별", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }, cellRenderer: customCellRenderer }
  ]);

  const [personalStudentColumnDefs] = useState([
    { field: "visitDateTime", headerName: "방문일자", flex: 1.5, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "bodyParts", headerName: "인체 부위", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "medication", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치 및 교육사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "onBedTime", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" }}
  ]);

  const [entireWorkNoteColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 0.7, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 0.7, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 0.7, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "bodyParts", headerName: "인체 부위", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "medication", headerName: "투약사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치 및 교육사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "onBedTime", headerName: "침상안정", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "visitDateTime", headerName: "방문일자", flex: 2, cellStyle: { textAlign: "center" }, cellEditor: DateTimeEditor, editable: true }
  ]);

  const [onBedStudentListColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "bodyParts", headerName: "인체 부위", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "medication", headerName: "투약사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치 및 교육사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "onBedTime", headerName: "침상안정", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "createdAt", headerName: "등록일", flex: 2, cellStyle: { textAlign: "center" }}
  ]);

  const [diabetesStudentColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sGender", headerName: "성별", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }}
  ]);

  const [protectStudentColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sGender", headerName: "성별", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "protectContent", headerName: "보호내용", flex: 4, cellStyle: { textAlign: "center" }},
  ]);

  const [rentalProductColumnDefs] = useState([
    { field: "productName", headerName: "물품명", flex: 2, cellStyle: { textAlign: "left" }},
    { field: "productAmount", headerName: "재고", flex: 1, cellStyle: { textAlign: "center" }, 
      valueParser: (params) => {
        const value = parseInt(params.newValue, 10);
        return isNaN(value) ? 0 : value;
      }
    },
  ]);

  const [rentalListColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "productName", headerName: "물품명", flex: 3, cellStyle: { textAlign: "left" }},
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
    { field: "category", headerName: "분류", flex: 1,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [
          "근골격계", "피부피하계", "소화기계", "순환기계", "호흡기계", "이비인후과계", "안과계", "비뇨생식기계", "구강치아계", "정신신경계", "감염증", "기타"
        ]
      }
    },
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [medicationColumnDefs] = useState([
    { field: "medication", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [bodyPartsColumnDefs] = useState([
    { field: "bodyParts", headerName: "인체 부위", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [treatmentMatterColumnDefs] = useState([
    { field: "treatmentMatter", headerName: "처치사항", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  // 추가할 행 생성
  const createNewSymptomRowData = () => {
    const newData = {
      category: "",
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

  const createNewbodyPartsRowData = () => {
    const newData = {
      bodyParts: "",
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
    const api = symptomGridRef.current.api;                                   // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewSymptomRowData()];                              // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

  // Grid 행 추가 Function
  const appendMedicationRow = useCallback(() => {
    const api = medicationGridRef.current.api;                                // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewMedicationRowData()];                           // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

    // Grid 행 추가 Function
  const appendBodyPartsRow = useCallback(() => {
    const api = bodyPartsGridRef.current.api;                                 // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewbodyPartsRowData()];                            // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);
  
  // Grid 행 추가 Function
  const appendTreatmentMatterRow = useCallback(() => {
    const api = treatmentMatterGridRef.current.api;                           // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewTreatmentMatterRowData()];                      // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

  // Row에 데이터 변경 시 Ag-Grid 내장 Event
  const onSymptomRowDataUpdated = useCallback(() => {                         // 행이 추가되고 난 후 이벤트 (이 지점에서 추가된 행 확인 가능)
    const api = symptomGridRef.current.api;                                   // Ag-Grid api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 화면에 보여지는 행의 개수
    const lastRowIndex = displayedRowCount - 1;                               // Edit 속성 부여 위한 마지막 행 Index
    
    if(isRemoved || isRegistered) {                                           // 항목 삭제 버튼 클릭 시 || 초기 bookmark 데이터 불러왔을 시
      api.stopEditing(true);                                                  // Edit 모드 중지
      return;                                                                 // return
    }
    
    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'category' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);

  // Row에 데이터 변경 시 Ag-Grid 내장 Event
  const onMedicationRowDataUpdated = useCallback(() => {                      // 행이 추가되고 난 후 이벤트 (이 지점에서 추가된 행 확인 가능)
    const api = medicationGridRef.current.api;                                // Ag-Grid api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 화면에 보여지는 행의 개수
    const lastRowIndex = displayedRowCount - 1;                               // Edit 속성 부여 위한 마지막 행 Index
    
    if(isRemoved || isRegistered) {                                           // 항목 삭제 버튼 클릭 시 || 초기 bookmark 데이터 불러왔을 시
      api.stopEditing(true);                                                  // Edit 모드 중지
      return;                                                                 // return
    }
    
    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'medication' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);

  const onbodyPartsRowDataUpdated = useCallback(() => {
    const api = bodyPartsGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount();
    const lastRowIndex = displayedRowCount - 1;

    if(isRemoved || isRegistered) {
      api.stopEditing(true);
      return;
    }

    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'bodyParts' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
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

  const onRentalInputChange = (field, value) => {
    setRentalSearchCriteria((prevCriteria) => ({
      ...prevCriteria,
      [field]: value
    }));
  };

  // Grid 행 삭제 Function
  const removeSymptomRow = () => {                                            // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = symptomGridRef.current.api;                                   // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다<br/>삭제할 행을 선택해 주세요";
    
    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeMedicationRow = () => {                                         // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = medicationGridRef.current.api;                                // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다<br/>삭제할 행을 선택해 주세요";

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeBodyPartsRow = () => {                                          // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = bodyPartsGridRef.current.api;                                 // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다<br/>삭제할 행을 선택해 주세요";

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeTreatmentMatterRow = () => {                                    // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = treatmentMatterGridRef.current.api;                           // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다<br/>삭제할 행을 선택해 주세요";
    
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
    const warnMessage = "등록된 증상이 없습니다";

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
    const warnMessage = "등록된 투약사항이 없습니다";

    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 투약사항 없음 Notify
      NotiflixWarn(warnMessage);
      return;                                             // return
    }else{                                                // 등록된 투약사항이 있을 경우
      api.setRowData([]);                                 // 투약사항 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Grid 행 전체 삭제 Function
  const allBodyPartsRemoveRow = () => {
    const api = bodyPartsGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    const warnMessage = "등록된 인체 부위 사항이 없습니다";

    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 인체부위 없음 Notify
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
    const warnMessage = "등록된 처치사항이 없습니다";

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
        const response = await axios.get(`${BASE_URL}/api/studentsTable/getStudentInfoBySearch`, {
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

  const fetchRentalStudentData = async (criteria) => {
    try {
      const { iGrade, iClass, iNumber, iName } = criteria;
      
      if(user) {
        const response = await axios.get(`${BASE_URL}/api/studentsTable/getStudentInfoBySearch`, {
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

  useEffect(() => {
    onSearchStudent(searchCriteria);
  }, []);

  const onResetSearch = () => {
    const api = searchStudentGridRef.current.api;
    setSearchCriteria({ iGrade: "", iClass: "", iNumber: "", iName: "" });
    api.setRowData([]);
    setSelectedStudent('');
    setPersonalStudentRowData([]);
  };

  const onRentalResetSearch = () => {
    const api = rentalSearchStudentGridRef.current.api;
    setSearchCriteria({ iGrade: "", iClass: "", iNumber: "", iName: "" });
    api.setRowData([]);
    setSelectedStudent('');
    setPersonalStudentRowData([]);
  };

  const onSearchStudent = async (criteria) => {
    Block.dots('.search-student-grid');
    
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
    }finally{
      Block.remove('.search-student-grid');
    }
  };

  const onRentalSearchStudent = async (criteria) => {
    Block.dots('.rental-search-student-grid');
    
    try {
      const studentData = await fetchRentalStudentData(criteria);

      rentalSearchStudentGridRef.current.api.setRowData(studentData);
      setRentalSearchStudentRowData(studentData);

      if(masked) {
        const maskedStudentData = studentData.map(student => ({
          ...student,
          sName: Masking(student.sName)
        }));

        setRentalSearchStudentRowData(maskedStudentData);
      }
    } catch (error) {
      console.error("학생 조회 중 ERROR", error);
    }finally{
      Block.remove('.rental-search-student-grid');
    }
  };

  const handleKeyDown = (e, criteria) => {
    if(e.key === 'Enter') onSearchStudent(searchCriteria);
  };

  const handleRentalKeyDown = (e, criteria) => {
    if(e.key === 'Enter') onRentalSearchStudent(rentalSearchCriteria);
  };

  const onGridSelectionChanged = (event) => {
    const selectedRow = event.api.getSelectedRows()[0];
    
    if(user && user.isPopUpProtectStudent) {
      if(selectedRow && selectedRow.isProtected) {
        const infoMessage = selectedRow.sName + " 학생은 보호관리 대상 학생입니다<br/>보호내용 : " + selectedRow.protectContent;
        NotiflixInfo(infoMessage, false, '320px');
      }
    }    
    
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

  const handleBodyParts = () => {
    toggleBodyPartsModal();
    fetchBodyPartsData();
  };

  const handleTreatmentMatter = () => {
    toggleTreatmentMatterModal();
    fetchTreatmentMatterData();
  };

  const saveSymptom = async (e) => {
    e.preventDefault();

    const confirmTitle = "증상 설정";
    const confirmMessage = "작성하신 증상을 저장하시겠습니까?";
    const infoMessage = "증상 설정이 정상적으로 저장되었습니다";

    const validateFields = () => {
      const api = symptomGridRef.current.api;
      let allFieldFilled = true;

      api.forEachNode(function(rowNode) {
        const category = rowNode.data.category;
        const symptom = rowNode.data.symptom;

        if(!symptom || !category) {
          allFieldFilled = false;
          return;
        }
      });

      return allFieldFilled;
    };

    if(!validateFields()) {
      const warnMessage = "입력되지 않은 항목이 존재합니다";
      NotiflixWarn(warnMessage);
      return;
    }

    const yesCallback = async () => {
      const api = symptomGridRef.current.api;                     // Grid api 획득
      let symptomString = "";                                     // Parameter 전송 위한 증상 담을 배열
      
      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const category = rowNode.data.category;                   // 분류 획득
        const symptom = rowNode.data.symptom;                     // 증상 획득

        // 증상 명이 존재 && 분류 존재 && user 데이터 존재 -> Parameter로 전송할 증상 데이터 생성
        if(symptom.length !== 0 && category.length !== 0 && user) symptomString += symptom + ":" + category + "::";
      });

      if(symptomString.endsWith("::")) symptomString = symptomString.slice(0, -2);
      
      let response = null;                  // response 데이터 담을 변수
      if(symptomRowData.length > 0) {       // 등록된 증상이 있는 경우 - Update
        response = await axios.post(`${BASE_URL}/api/symptom/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          symptomString: symptomString
        });
      }else{                            // 등록된 증상이 없는 경우 - Insert
        response = await axios.post(`${BASE_URL}/api/symptom/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          symptomString: symptomString
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
    const infoMessage = "투약사항 설정이 정상적으로 저장되었습니다";

    const validateFields = () => {
      const api = medicationGridRef.current.api;
      let allFieldFilled = true;

      api.forEachNode(function(rowNode) {
        const medication = rowNode.data.medication;

        if(!medication) {
          allFieldFilled = false;
          return;
        }
      });

      return allFieldFilled;
    };

    if(!validateFields()) {
      const warnMessage = "입력되지 않은 항목이 존재합니다";
      NotiflixWarn(warnMessage);
      return;
    }

    const yesCallback = async () => {
      const api = medicationGridRef.current.api;                  // Grid api 획득
      let medicationString = "";                                  // Parameter 전송 위한 투약사항 담을 배열

      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const medication = rowNode.data.medication;               // 투약사항 획득

        // 투약사항 명이 존재 && 북마크 주소 존재 && user 데이터 존재 -> Parameter로 전송할 투약사항 데이터 생성
        if(medication.length !== 0 && user) medicationString += medication + "::";
        
      });
      if(medicationString.endsWith("::")) medicationString = medicationString.slice(0, -2);
      
      let response = null;                     // response 데이터 담을 변수
      if(medicationRowData.length > 0) {       // 등록된 투약사항이 있는 경우 - Update
        response = await axios.post(`${BASE_URL}/api/medication/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          medicationString: medicationString
        });
      }else{                                    // 등록된 투약사항이 없는 경우 - Insert
        response = await axios.post(`${BASE_URL}/api/medication/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          medicationString: medicationString
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

  const saveBodyParts = async (e) => {
    e.preventDefault();

    const confirmTitle = "인체 부위 설정";
    const confirmMessage = "작성하신 인체 부위를 저장하시겠습니까?";
    const infoMessage = "인체 부위 설정이 정상적으로 저장되었습니다";

    const validateFields = () => {
      const api = bodyPartsGridRef.current.api;
      let allFieldFilled = true;

      api.forEachNode(function(rowNode) {
        const bodyParts = rowNode.data.bodyParts;

        if(!bodyParts) {
          allFieldFilled = false;
          return;
        }
      });

      return allFieldFilled;
    };

    if(!validateFields()) {
      const warnMessage = "입력되지 않은 항목이 존재합니다";
      NotiflixWarn(warnMessage);
      return;
    }

    const yesCallback = async () => {
      const api = bodyPartsGridRef.current.api;                      // Grid api 획득
      let bodyPartsString = "";                                      // Parameter 전송 위한 인체부위 담을 배열
      
      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const bodyParts = rowNode.data.bodyParts;                     // 인체부위 획득

        // 인체부위가 존재  && user 데이터 존재 -> Parameter로 전송할 인체부위 데이터 생성
        if(bodyParts.length !== 0 && user) bodyPartsString += bodyParts + "::";
        
      });

      if(bodyPartsString.endsWith("::")) bodyPartsString = bodyPartsString.slice(0, -2);
      
      let response = null;                  // response 데이터 담을 변수
      if(bodyPartsRowData.length > 0) {       // 등록된 인체부위가 있는 경우 - Update
        response = await axios.post(`${BASE_URL}/api/bodyParts/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          bodyPartsString: bodyPartsString
        });
      }else{                            // 등록된 인체부위가 없는 경우 - Insert
        response = await axios.post(`${BASE_URL}/api/bodyParts/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          bodyPartsString: bodyPartsString
        });
      }
      
      if(response.data === "success") {   // Api 호출 성공한 경우
        fetchBodyPartsData();           
        // 인체부위 정상 저장 Notify
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
    const infoMessage = "처치사항 설정이 정상적으로 저장되었습니다";

    const validateFields = () => {
      const api = treatmentMatterGridRef.current.api;
      let allFieldFilled = true;

      api.forEachNode(function(rowNode) {
        const treatmentMatter = rowNode.data.treatmentMatter;

        if(!treatmentMatter) {
          allFieldFilled = false;
          return;
        }
      });

      return allFieldFilled;
    };

    if(!validateFields()) {
      const warnMessage = "입력되지 않은 항목이 존재합니다";
      NotiflixWarn(warnMessage);
      return;
    }

    const yesCallback = async () => {
      const api = treatmentMatterGridRef.current.api;                      // Grid api 획득
      let treatmentMatterString = "";                                      // Parameter 전송 위한 처치사항 담을 배열

      api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
        const treatmentMatter = rowNode.data.treatmentMatter;                     // 처치사항 획득
        // 처치사항이 존재  && user 데이터 존재 -> Parameter로 전송할 처치사항 데이터 생성
        if(treatmentMatter.length !== 0 && user) treatmentMatterString += treatmentMatter + "::";
        
      });
      if(treatmentMatterString.endsWith("::")) treatmentMatterString = treatmentMatterString.slice(0, -2);
      
      let response = null;                  // response 데이터 담을 변수
      if(treatmentMatterRowData.length > 0) {       // 등록된 처치사항이 있는 경우 - Update
        response = await axios.post(`${BASE_URL}/api/treatmentMatter/update`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          treatmentMatterString: treatmentMatterString
        });
      }else{                            // 등록된 처치사항이 없는 경우 - Insert
        response = await axios.post(`${BASE_URL}/api/treatmentMatter/insert`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          treatmentMatterString: treatmentMatterString
        });
      }
      
      if(response.data === "success") {   // Api 호출 성공한 경우
        fetchTreatmentMatterData();           
        // 처치사항 정상 저장 Notify
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
      if(user) {
        const response = await axios.get(`${BASE_URL}/api/symptom/getSymptom`, {
          params: {
            userId: user.userId,
            schoolCode: user.schoolCode
          }
        });
        
        if (response.data && response.data.symptom) {
          if(response.data.symptom === 'N') return;

          const symptomString = response.data.symptom.symptom;
          const symptomArray = symptomString.split('::').map(item => {
            const [symptom, category] = item.split(':');
            return { symptom, category };
          });
          
          setSymptomRowData(symptomArray);
          setFilteredSymptom(symptomArray);

          const tagifySymptomArray = symptomString.split('::').map(item => {
            return item.split(':')[0];
          });
          
          setTagifySymptomSuggestion(tagifySymptomArray);
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('증상 조회 중 ERROR', error);
    }
  }, [user]);

  const fetchBodyPartsData = useCallback(async() => {
    try {
      if(user) {
        const response = await axios.get(`${BASE_URL}/api/bodyParts/getBodyParts`, {
          params: {
            userId: user.userId,
            schoolCode: user.schoolCode
          }
        });

        if (response.data && response.data.bodyParts) {
          if(response.data.bodyParts === 'N') return;

          const bodyPartsString = response.data.bodyParts.bodyParts;
          const bodyPartsArray = bodyPartsString.split('::').map(item => {
            return { bodyParts: item };
          });
          
          setBodyPartsRowData(bodyPartsArray);
          setFilteredBodyParts(bodyPartsArray);

          const tagifyBodyPartsArray = bodyPartsString.split('::').map(item => {
            return item;
          });

          setTagifyBodyPartsSuggestion(tagifyBodyPartsArray);
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('인체부위 조회 중 ERROR', error);
    }
  }, [user]);

  const fetchTreatmentMatterData = useCallback(async() => {
    try {
      if(user) {
        const response = await axios.get(`${BASE_URL}/api/treatmentMatter/getTreatmentMatter`, {
          params: {
            userId: user.userId,
            schoolCode: user.schoolCode
          }
        });
        
        if (response.data && response.data.treatmentMatter) {
          if(response.data.treatmentMatter === 'N') return;

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
  }, [user]);

  useEffect(() => {
    fetchSymptomData();
  }, [fetchSymptomData]);

  useEffect(() => {
    fetchBodyPartsData();
  }, [fetchBodyPartsData]);

  useEffect(() => {
    fetchTreatmentMatterData();
  }, [fetchTreatmentMatterData]);

  const clearSelectedRowValues = () => {
    setSearchSymptomText({});
    setSearchMedicationText({});
    setSearchBodyPartsText({});
    setSearchTreatmentMatterText({});
  };

  // 증상 Grid의 Row 선택 Event
  const handleSymptomRowSelect = (selectedRow) => {
    if (selectedRow && selectedRow.length > 0) {
      clearSelectedRowValues();
      const selectedSymptom = selectedRow[0].symptom;
      const param = {type: "add", text: selectedSymptom, clearField: 'N'};
      setSearchSymptomText(param);
    }
  };

  // 증상 Grid의 Row 선택 Event
  const handleMedicationRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      clearSelectedRowValues();
      const selectedMedication = selectedRow[0].medication;   // 선택한 투약사항 Text 값
      const param = {type: "add", text: selectedMedication, clearField: 'N'};
      setSearchMedicationText(param);            // input에 선택한 투약사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  // 인체부위 Grid의 Row 선택 Event
  const handleBodyPartsRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      clearSelectedRowValues();
      const selectedBodyParts = selectedRow[0].bodyParts;   // 선택한 인체부위 Text 값
      const param = {type: "add", text: selectedBodyParts, clearField: 'N'};
      setSearchBodyPartsText(param);            // input에 선택한 인체부위 값 할당하기 위해 전역변수에 값 할당
    }
  };

  // 처치사항 Grid의 Row 선택 Event
  const handleTreatmentMatterRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      clearSelectedRowValues();
      const selectedTreatmentMatter = selectedRow[0].treatmentMatter;   // 선택한 처치사항 Text 값
      const param = {type: "add", text: selectedTreatmentMatter, clearField: 'N'};
      setSearchTreatmentMatterText(param);            // input에 선택한 처치사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  const setCurrentTime = () => {
    const currentTime = moment().format('HH:mm');
    // setCurrentTimeValue(currentTime);
    setOnBedRestStartTime(currentTime);
  };

  const fetchStockMedicineData = useCallback(async () => {
    if(user?.userId && user?.schoolCode) {
      const response = await axios.get(`${BASE_URL}/api/workNote/getStockMedication`, {
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
      const response = await axios.get(`${BASE_URL}/api/workNote/getEntireWorkNote`,{
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const resultData = response.data.map(item => {
          let visitDateTime = '';
          if (item.visitDateTime) {
              const date = new Date(item.visitDateTime);
              if (!isNaN(date.getTime())) {
                  visitDateTime = new Intl.DateTimeFormat('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                      hour12: true,
                      timeZone: 'Asia/Seoul'
                  }).format(date).replace(/\./g, '').replace(' 오전 ', ' 오전 ').replace(' 오후 ', ' 오후 ');
              }
          }
  
          return {
              ...item,
              visitDateTime,
              symptom: (item.symptom || "").replace(/::/g, ', '),
              medication: (item.medication || "").replace(/::/g, ', '),
              bodyParts: (item.bodyParts || "").replace(/::/g, ', '),
              treatmentMatter: (item.treatmentMatter || "").replace(/::/g, ', '),
              onBedTime: (!item.onBedStartTime && !item.onBedEndTime) ? "" : item.onBedStartTime + " ~ " + item.onBedEndTime
          };
        });

        setEntireWorkNoteRowData(resultData);
      }
    }
  }, [user]);

  const handleExitOnBed = useCallback(async (e, item) => {
    e.preventDefault();

    const socket = getSocket();
    const currentTime = moment().format('HH:mm');
    const askTitle = "침상안정 종료";
    const askMessage = item.sName + " 학생의 침상안정 종료 시간을 입력해주세요<br/>기본적으로 현재 시간이 입력되어 있습니다";
    const promptMessage = currentTime;
    const yesText = "침상안정 종료";
    const noText = "취소";

    const yesCallback = async (promptValue) => {
      const response = await axios.post(`${BASE_URL}/api/workNote/updateOnBedEndTime`, {
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
        const infoMessage = item.sName + " 학생의 침상안정이 종료 처리 되었습니다"
        NotiflixInfo(infoMessage, true, '320px');
        fetchEntireWorkNoteGrid();

        if(socket) socket.emit('sendBedStatus', { message: "endBed::" + item.sGrade + "," + item.sClass + "," + item.sNumber + "," + item.sName });
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
      if(bedCount === 0) {
        setBedBoxContent(
          <Row className="d-flex justify-content-center no-gutters w-100 pl-3 pr-3">
            <Col>
              <Card className="bed-card-stats" style={{ borderRadius: 15 }}>
                <CardBody>
                  <Row className="justify-content-center text-center text-muted font-weight-bold">
                    <span>설정된 침상 수가 없습니다<br/>사용자 정보 메뉴에서 침상 수를 설정해 주시기 바랍니다</span>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        );
      }else {
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
                <Col lg="3" md="6" sm="12" key={item.id}>
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
                <Col className="" lg="3" md="6" sm="12" key={i}>
                  <Card className="bed-card-stats" style={{ borderRadius: 15 }}>
                    <CardBody>
                      <Row>
                        <Col md="4" xs="5">
                          <GiBed className="bed-icons-not-use"/>
                          <div className="bed-number-badge">{displayOnBedStudentArray.length + i}</div>
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
              <Col lg="3" md="6" sm="12" key={i}>
                <Card className="bed-card-stats" style={{ borderRadius: 15 }}>
                  <CardBody>
                    <Row>
                      <Col md="4" xs="5">
                        <GiBed className="bed-icons-not-use" />
                        <div className="bed-number-badge">{i}</div>
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
      const response = await axios.get(`${BASE_URL}/api/workNote/getVisitRequest`, {
        params: {
          schoolCode: user.schoolCode,
          isRead: false
        }
      });

      if(response.data) setVisitRequestList(response.data);
      if(document.querySelector('.request-alert-box').querySelector('.notiflix-block')) Block.remove('.request-alert-box');
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
        const response = await axios.post(`${BASE_URL}/api/workNote/updateRequestReadStatus`, {
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
        const response = await axios.post(`${BASE_URL}/api/workNote/updateEntireRequestReadStatus`, {
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
      const response = await axios.get(`${BASE_URL}/api/user/getMaskedStatus`, {
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
        const response = await axios.post(`${BASE_URL}/api/user/updateMaskedStatus`, {
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
      const response = await axios.get(`${BASE_URL}/api/user/getAlertHiddenStatus`, {
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
        const response = await axios.post(`${BASE_URL}/api/user/updateAlertHiddenStatus`, {
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
    
    if(targetId.includes('TagField')) {
      const param = {clearTargetField: targetId};
      setSearchSymptomText(param);
      setSearchMedicationText(param);
      setSearchBodyPartsText(param);
      setSearchTreatmentMatterText(param);
    }else if(targetId === "onBedRest") {
      setOnBedRestStartTime("");
      setOnBedRestEndTime("");
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
    setSearchBodyPartsText({clearTargetField: "all"});
    setSearchTreatmentMatterText({clearTargetField: "all"});
    setPersonalStudentRowData([]);
    setSelectedStudent("");
    if(searchStudentGridRef) searchStudentGridRef.current.api.deselectAll()

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
    
    const socket = getSocket();

    let symptomString = "";
    let medicationString = "";
    let bodyPartsString = "";
    let treatmentMatterString = "";
    
    const tagFields = document.getElementsByTagName('tags');
    
    const symptomTagValues = tagFields[0].getElementsByTagName('tag');
    for(let i = 0; i < symptomTagValues.length; i++) {
      symptomString += symptomTagValues[i].textContent + "::";
    }
    symptomString = symptomString.slice(0, -2);

    const bodyPartsTagValues = tagFields[1].getElementsByTagName('tag');
    for(let i = 0; i < bodyPartsTagValues.length; i++) {
      bodyPartsString += bodyPartsTagValues[i].textContent + "::";
    }
    bodyPartsString = bodyPartsString.slice(0, -2);

    const medicationTagValues = tagFields[2].getElementsByTagName('tag');
    for(let i = 0; i < medicationTagValues.length; i++) {
      medicationString += medicationTagValues[i].textContent + "::";
    }
    medicationString = medicationString.slice(0, -2);

    const treatmentMatterTagValues = tagFields[3].getElementsByTagName('tag');
    for(let i = 0; i < treatmentMatterTagValues.length; i++) {
      treatmentMatterString += treatmentMatterTagValues[i].textContent + "::";
    }
    treatmentMatterString = treatmentMatterString.slice(0, -2);

    const onBedRestStartTime = document.getElementById('onBedRestStartTime').value;
    const onBedRestEndTime = document.getElementById('onBedRestEndTime').value;

    const confirmTitle = "보건일지 등록";
    const confirmMessage = "작성하신 보건일지를 등록하시겠습니까?";
    const infoMessage = "보건일지가 정상적으로 등록되었습니다";
    const warnMessage = "선택된 학생이 없습니다";
    
    if(selectedStudent) {
      const useBedCount = document.getElementsByClassName('bed-icons-use').length;
      if((onBedRestStartTime || onBedRestEndTime) && (user.bedCount === useBedCount)) {
        const warnMessage = "모든 침상이 사용중이므로 침상안정 등록을 할 수 없습니다";
        NotiflixWarn(warnMessage, '370px');
        
        setOnBedRestStartTime("");
        const onBedEndTime = document.getElementById('onBedRestEndTime');
        onBedEndTime.value = "";
        
        return;
      }

      if(onBedRestStartTime || onBedRestEndTime) {
        if(displayedOnBedStudents && Array.isArray(displayedOnBedStudents)) {
          const isDuplicatedOnBedStudent = displayedOnBedStudents.some(item =>
            item.sGrade === selectedStudent.sGrade &&
            item.sClass === selectedStudent.sClass &&
            item.sNumber === selectedStudent.sNumber &&
            item.sGender === selectedStudent.sGender &&
            item.sName === selectedStudent.sName
          );
          
          if(isDuplicatedOnBedStudent) {
            const warnMessage = selectedStudent.sName + " 학생은 이미 침상안정 중인 상태입니다";
            NotiflixWarn(warnMessage, '310px');
  
            return;
          }
        }
      }

      const yesCallback = async () => {
        const response = await axios.post(`${BASE_URL}/api/workNote/saveWorkNote`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          sGrade: selectedStudent.sGrade,
          sClass: selectedStudent.sClass,
          sNumber: selectedStudent.sNumber,
          sGender: selectedStudent.sGender,
          sName: selectedStudent.sName,
          symptom: symptomString,
          medication: medicationString,
          bodyParts: bodyPartsString,
          treatmentMatter: treatmentMatterString,
          onBedStartTime: onBedRestStartTime,
          onBedEndTime: onBedRestEndTime,
          temperature: temperatureValue,
          bloodPressure: bloodPressureValue,
          pulse: pulseValue,
          oxygenSaturation: oxygenSaturationValue,
          bloodSugar: bloodSugarValue
        });

        if(response.data === "success") {
          NotiflixInfo(infoMessage);

          fetchEntireWorkNoteGrid();
          fetchSelectedStudentData();
          setSearchSymptomText({clearTargetField: "all"});
          setSearchMedicationText({clearTargetField: "all"});
          setSearchBodyPartsText({clearTargetField: "all"});
          setSearchTreatmentMatterText({clearTargetField: "all"});
      
          setOnBedRestStartTime("");
          const onBedEndTime = document.getElementById('onBedRestEndTime');
          onBedEndTime.value = "";
          
          setTempuratureValue(0);
          setBloodPressureValue(0);
          setpulseValue(0);
          setOxygenSaturationValue(0);
          setBloodSugarValue(0);

          if(socket) socket.emit('sendBedStatus', { message: "registBed::" + selectedStudent.sGrade + "," + selectedStudent.sClass + "," + selectedStudent.sNumber + "," + selectedStudent.sName });
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
      const response = await axios.get(`${BASE_URL}/api/workNote/getSelectedStudentData`, {
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
        const resultData = response.data.map(item => {
          let visitDateTime = '';
          if (item.visitDateTime) {
              const date = new Date(item.visitDateTime);
              if (!isNaN(date.getTime())) {
                  visitDateTime = new Intl.DateTimeFormat('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                      hour12: true,
                      timeZone: 'Asia/Seoul'
                  }).format(date).replace(/\./g, '').replace(' 오전 ', ' 오전 ').replace(' 오후 ', ' 오후 ');
              }
          }
  
          return {
              ...item,
              visitDateTime,
              symptom: (item.symptom || "").replace(/::/g, ', '),
              medication: (item.medication || "").replace(/::/g, ', '),
              bodyParts: (item.bodyParts || "").replace(/::/g, ', '),
              treatmentMatter: (item.treatmentMatter || "").replace(/::/g, ', '),
              onBedTime: (!item.onBedStartTime && !item.onBedEndTime) ? "" : item.onBedStartTime + " ~ " + item.onBedEndTime
          };
        });

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

    if(!isEntireWorkNoteOpen) document.getElementsByClassName('content')[0].style.minHeight = 'calc(100vh + 450px)';
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
          const infoMessage = targetStudentName + " 학생의 침상안정이 종료되었습니다";
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

    if(e.target.id === 'bloodPressure') {
      setBloodPressureValue(newValue);
    }else if(!isNaN(newValue)) {
      if(e.target.id === "temperature") setTempuratureValue(newValue);
      else if(e.target.id === "pulse") setpulseValue(newValue);
      else if(e.target.id === "oxygenSaturation") setOxygenSaturationValue(newValue);
      else if(e.target.id === "bloodSugar") setBloodSugarValue(newValue);
    }
  };

  useEffect(() => {
    const socket = getSocket();
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
     
      return () => {
        socket.off('broadcastVisitRequest', handleBroadcastVisitRequest);
      };
    }
  }, []);

  const validateAndHighlight = () => {
    setNonSelectedHighlight(true);
    setTimeout(() => {
      setNonSelectedHighlight(false);
    }, 2000);
  };

  const validateAndHighlightToUpdate = () => {
    setNonSelectedToUpdateHighlight(true);
    setTimeout(() => {
      setNonSelectedToUpdateHighlight(false);
    }, 2000);
  };

  // Custom Interval 사용 -> 기존 interval 사용 시 안에서 갇혀버리는 closure 현상으로 message 반복 출력 현상 발생
  useInterval(() => {
    autoUpdateBedBox();
  }, 1000);

  const handleProtectClick = () => {
    if(contextStudentInfo) {
      const [sGrade, sClass, sNumber, sGender, sName] = contextStudentInfo.split(',');
      
      setProtectSgrade(sGrade);
      setProtectSclass(sClass);
      setProtectSnumber(sNumber);
      setProtectSgender(sGender);
      setProtectSname(sName);
    }

    toggleRegistProtectStudentModal();
  };

  const getRowStyle = (params) => {

  };

  function handleLeftGridContextMenu(event) {
    if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
      return;
    }else{
      const parentNode = event.target.parentNode;
      if(parentNode) {
        const selectedGrade = event.target.parentNode.childNodes[0]?.textContent || '';
        const selectedClass = event.target.parentNode.childNodes[1]?.textContent || '';
        const selectedNumber = event.target.parentNode.childNodes[2]?.textContent || '';
        const selectedGender = event.target.parentNode.childNodes[3]?.textContent || '';
        const selectedName = event.target.parentNode.childNodes[4]?.textContent || '';
        const selectedStudentInfo = selectedGrade + "," + selectedClass + "," + selectedNumber + "," + selectedGender + "," + selectedName;
  
        setContextStudentInfo(selectedStudentInfo);
  
        showLeftMenu({
          event,
          props: {
              key: 'value'
          }
        });
      }
    }
  };

  function handleRightGridContextMenu(event) {
    if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
      return;
    }else{
      const api = personalStudentGridRef.current.api;
      const rowIndex = event.target.parentNode.getAttribute('row-index');

      if (rowIndex !== null) {
        api.ensureIndexVisible(rowIndex);
        api.forEachNode((node) => {
          if (node.rowIndex == rowIndex) {
            node.setSelected(true, true);
          }
        });
        
        const selectedRow = api.getSelectedRows()[0];
        if (selectedRow) {
          setSelectedWorkNote(selectedRow);
          setIsGridRowSelect(true);
        }
  
        showRightMenu({
          event,
          props: {
            key: 'value'
          }
        });
      }
    }
  };

  function handleRentalGridContextMenu(event) {
    if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
      return;
    }else{
      const api = rentalProductGridRef.current.api;
      const rowIndex = event.target.parentNode.getAttribute('row-index');
  
      if (rowIndex !== null) {
        api.ensureIndexVisible(rowIndex);
        api.forEachNode((node) => {
          if (node.rowIndex == rowIndex) {
            node.setSelected(true, true);
          }
        });
        
        const selectedRow = api.getSelectedRows()[0];
        if (selectedRow) {
          setSelectedRentalProductRow(selectedRow);
          setIsRentalGridRowSelect(true);
        }
  
        showRentalMenu({
          event,
          props: {
            key: 'value'
          }
        });
      }
    }
  };

  function handleReturnGridContextMenu(event) {
    if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
      return;
    }else{
      const api = rentalListGridRef.current.api;
      const rowIndex = event.target.parentNode.getAttribute('row-index');
  
      if (rowIndex !== null) {
        api.ensureIndexVisible(rowIndex);
        api.forEachNode((node) => {
          if (node.rowIndex == rowIndex) {
            node.setSelected(true, true);
          }
        });
        
        const selectedRow = api.getSelectedRows()[0];
        if (selectedRow) {
          setSelectedRentalRow(selectedRow);
          setIsReturnGridRowSelect(true);
        }
  
        showReturnMenu({
          event,
          props: {
            key: 'value'
          }
        });
      }
    }
  };


  const handleEmergencyStudent = () => {
    toggleManageEmergencyModal();
  };

  const handleSearchKeyDown = (e) => {
    if(e.key === "Enter") searchEntireWorkNote();
  };

  const handleSearchOnBedKeyDown = (e) => {
    if(e.key === "Enter") searchOnBedStudentList();
  };

  const resetSearchEntireWorkNote = () => {
    setSelectedStudent("");
    setSearchStartDate("");
    setSearchEndDate("");
    setSearchSname("");
    fetchEntireWorkNoteGrid();
  };

  const searchEntireWorkNote = () => {
    if(searchSname || (searchStartDate && searchEndDate)) {
      const searchFilteredRowData = entireWorkNoteRowData.filter(item => {
        let meetsAllConditions = true;

        if(searchSname && !item.sName.includes(searchSname)) {
          meetsAllConditions = false;
        }

        if(searchStartDate && searchEndDate) {
          const createdAt = moment(item.createdAt, 'YYYY-MM-DD HH:mm:ss');
          const convertedSearchStartDate = moment(searchStartDate).startOf('day');
          const convertedSearchEndDate = moment(searchEndDate).endOf('day');

          if (!createdAt.isBetween(convertedSearchStartDate, convertedSearchEndDate, null, '[]')) {
            meetsAllConditions = false;
          }
        }

        return meetsAllConditions;
      });
      setEntireWorkNoteRowData(searchFilteredRowData);
    }
  };

  const updateWorkNote = () => {
    if(selectedWorkNote) {
      let symptomString = "";
      let medicationString = "";
      let bodyPartsString = "";
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

      const bodyPartsTagValues = tagFields[2].getElementsByTagName('tag');
      for(let i = 0; i < bodyPartsTagValues.length; i++) {
        bodyPartsString += bodyPartsTagValues[i].textContent + "::";
      }
      bodyPartsString = bodyPartsString.slice(0, -2);

      const treatmentMatterTagValues = tagFields[3].getElementsByTagName('tag');
      for(let i = 0; i < treatmentMatterTagValues.length; i++) {
        treatmentMatterString += treatmentMatterTagValues[i].textContent + "::";
      }
      treatmentMatterString = treatmentMatterString.slice(0, -2);

      const onBedRestStartTime = document.getElementById('onBedRestStartTime').value;
      const onBedRestEndTime = document.getElementById('onBedRestEndTime').value;

      const confirmTitle = "보건일지 수정";
      const confirmMessage = "작성하신 보건일지를 수정하시겠습니까?";
      const infoMessage = "보건일지가 정상적으로 수정되었습니다";

      const yesCallback = async () => {
        const response = await axios.post(`${BASE_URL}/api/workNote/updateWorkNote`, {
          rowId: selectedWorkNote.id,
          userId: user.userId,
          schoolCode: user.schoolCode,
          sGrade: selectedWorkNote.sGrade,
          sClass: selectedWorkNote.sClass,
          sNumber: selectedWorkNote.sNumber,
          sGender: selectedWorkNote.sGender,
          sName: selectedWorkNote.sName,
          symptom: symptomString,
          medication: medicationString,
          bodyParts: bodyPartsString,
          treatmentMatter: treatmentMatterString,
          onBedStartTime: onBedRestStartTime,
          onBedEndTime: onBedRestEndTime,
          temperature: temperatureValue,
          bloodPressure: bloodPressureValue,
          pulse: pulseValue,
          oxygenSaturation: oxygenSaturationValue,
          bloodSugar: bloodSugarValue
        });

        if(response.data === "success") {
          NotiflixInfo(infoMessage);

          fetchEntireWorkNoteGrid();
          fetchSelectedStudentData();
          setSearchSymptomText({clearTargetField: "all"});
          setSearchMedicationText({clearTargetField: "all"});
          setSearchBodyPartsText({clearTargetField: "all"});
          setSearchTreatmentMatterText({clearTargetField: "all"});
      
          setOnBedRestStartTime("");
          const onBedEndTime = document.getElementById('onBedRestEndTime');
          onBedEndTime.value = "";
          
          setTempuratureValue(0);
          setBloodPressureValue(0);
          setpulseValue(0);
          setOxygenSaturationValue(0);
          setBloodSugarValue(0);
        }
      };

      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
    }else{
      const warnMessage = "선택된 보건일지 내역이 없습니다<br/>수정할 보건일지 내역을 선택해 주세요";
      NotiflixWarn(warnMessage);
      validateAndHighlightToUpdate();
    }
  };

  const deleteWorkNote = async () => {
    if(selectedWorkNote) {
      const confirmTitle = "보건일지 삭제";
      const confirmMessage = "선택하신 보건일지 내역을 삭제하시겠습니까?";
      const infoMessage = "보건일지 내역이 정상적으로 삭제되었습니다";
      
      const yesCallback = async () => {
        const response = await axios.post(`${BASE_URL}/api/workNote/deleteWorkNote`, {
          rowId: selectedWorkNote.id,
          userId: user.userId,
          schoolCode: user.schoolCode,
          sGrade: selectedWorkNote.sGrade,
          sClass: selectedWorkNote.sClass,
          sNumber: selectedWorkNote.sNumber,
          sGender: selectedWorkNote.sGender,
          sName: selectedWorkNote.sName
        });

        if(response.data === "success") {
          NotiflixInfo(infoMessage, true, '325px');

          fetchEntireWorkNoteGrid();
          fetchSelectedStudentData();
          setSearchSymptomText({clearTargetField: "all"});
          setSearchMedicationText({clearTargetField: "all"});
          setSearchBodyPartsText({clearTargetField: "all"});
          setSearchTreatmentMatterText({clearTargetField: "all"});
      
          setOnBedRestStartTime("");
          setOnBedRestEndTime("");
          
          setTempuratureValue(0);
          setBloodPressureValue(0);
          setpulseValue(0);
          setOxygenSaturationValue(0);
          setBloodSugarValue(0);
        }
      };

      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
    }else{
      const warnMessage = "선택된 보건일지 내역이 없습니다<br/>삭제할 보건일지 내역을 선택해 주세요";
      NotiflixWarn(warnMessage);
      validateAndHighlightToUpdate();
    }
  };

  const personalStudentRowClicked = (event) => {
    const selectedRow = event.api.getSelectedRows()[0];
    if(selectedRow) {
      setSelectedWorkNote(selectedRow);
      setIsGridRowSelect(true);
      setSearchSymptomText({type: 'update', text: selectedRow.symptom, clearField: 'N'});
      setSearchMedicationText({type: 'update', text: selectedRow.medication, clearField: 'N'});
      setSearchBodyPartsText({type: 'update', text: selectedRow.bodyParts, clearField: 'N'});
      setSearchTreatmentMatterText({type: 'update', text: selectedRow.treatmentMatter, clearField: 'N'});
      setTempuratureValue(selectedRow.temperature);
      setBloodPressureValue(selectedRow.bloodPressure);
      setpulseValue(selectedRow.pulse);
      setOxygenSaturationValue(selectedRow.oxygenSaturation);
      setBloodSugarValue(selectedRow.bloodSugar);
      //!! 단 수정에서는 침상안정 내역이 상단 침상안정 현황에 뜨지 않도록 처리 필요
      setOnBedRestStartTime(selectedRow.onBedStartTime);
      setOnBedRestEndTime(selectedRow.onBedEndTime);
    }
  };

  const onEntireWorkNoteExportCSV = () => {
    const params = {
      fileName: '전체 보건일지 내역',
      // columnSeparator: ';',  // 열 구분 기호 설정 (기본값 : ',')
      // includeHeaders: true,  // 헤더 포함 여부 (기본값 : true)
      // allColumns: true,      // 모든 열 포함 여부 (기본값 : false, 현재 표시된 열만 포함)
      // onlySelected: true,    // 선택된 행만 내보내기 (기본값 : false)
      // processCellCallback: (params) => params.value.toUpperCase(),               // 셀 값 처리 콜백
      // processHeaderCallback: (params) => params.column.getColId().toUpperCase(), // 헤더 값 처리 콜백
    }
    registeredAllGridRef.current.api.exportDataAsCsv(params);
  };

  const onEntireWorkNotePrint = () => {

  };

  const handleOnBedStudentList = () => {
    toggleOnBedStudentListModal();
  };

  const fetchOnBedStudentListData = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/workNote/getOnBedStudentList`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const resultData = response.data.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          symptom: (item.symptom || "").replace(/::/g, ', '),
          medication: (item.medication || "").replace(/::/g, ', '),
          bodyParts: (item.bodyParts || "").replace(/::/g, ', '),
          treatmentMatter: (item.treatmentMatter || "").replace(/::/g, ', '),
          onBedTime: (!item.onBedStartTime && !item.onBedEndTime) ? "" :  item.onBedStartTime + " ~ " + item.onBedEndTime
        }));

        setOnBedStudentListData(resultData);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchOnBedStudentListData();
  }, [fetchOnBedStudentListData]);
 
  const onBedStudentListExportCSV = () => {
    const params = {
      fileName: '침상안정 사용 학생 내역',
      // columnSeparator: ';',  // 열 구분 기호 설정 (기본값 : ',')
      // includeHeaders: true,  // 헤더 포함 여부 (기본값 : true)
      // allColumns: true,      // 모든 열 포함 여부 (기본값 : false, 현재 표시된 열만 포함)
      // onlySelected: true,    // 선택된 행만 내보내기 (기본값 : false)
      // processCellCallback: (params) => params.value.toUpperCase(),               // 셀 값 처리 콜백
      // processHeaderCallback: (params) => params.column.getColId().toUpperCase(), // 헤더 값 처리 콜백
    }
    onBedStudentListGridRef.current.api.exportDataAsCsv(params);
  };

  const onBedStudentListPrint = () => {

  };

  const resetSearchOnBedStudentList = () => {
    setSearchStartDate("");
    setSearchEndDate("");
    setSearchSname("");
    fetchOnBedStudentListData();
  };

  const searchOnBedStudentList = () => {
    if(searchSname || (searchStartDate && searchEndDate)) {
      const searchFilteredRowData = entireWorkNoteRowData.filter(item => {
        let meetsAllConditions = true;

        if(searchSname && !item.sName.includes(searchSname)) {
          meetsAllConditions = false;
        }

        if(searchStartDate && searchEndDate) {
          const createdAt = moment(item.createdAt, 'YYYY-MM-DD HH:mm:ss');
          const convertedSearchStartDate = moment(searchStartDate).startOf('day');
          const convertedSearchEndDate = moment(searchEndDate).endOf('day');

          if (!createdAt.isBetween(convertedSearchStartDate, convertedSearchEndDate, null, '[]')) {
            meetsAllConditions = false;
          }
        }

        return meetsAllConditions;
      });
      setOnBedStudentListData(searchFilteredRowData);
    }
  };

  const saveProtectStudent = async () => {
    if(protectSgrade && protectSclass && protectSnumber && protectSgender && protectSname && protectContent) {
      const response = await axios.post(`${BASE_URL}/api/workNote/saveProtectStudent`, {
        userId: user.userId,
        schoolCode: user.schoolCode,
        sGrade: protectSgrade,
        sClass: protectSclass,
        sNumber: protectSnumber,
        sGender: protectSgender,
        sName: protectSname,
        isProtected: true,
        protectContent: protectContent
      });

      if(response.data === "success") {
        const infoMessage = "보호학생이 정상적으로 등록되었습니다";
        NotiflixInfo(infoMessage);
        toggleRegistProtectStudentModal();
        onSearchStudent(searchCriteria);
        // 필요: 학생 조회시 별표 표시 나타나도록 재조회 렌더링 필요
      }
    }else{
      const warnMessage = "보호내용을 작성해주세요";
      NotiflixWarn(warnMessage);
      return;
    }
  };

  const handleManageProtectStudent = () => {
    toggleManageProtectStudentModal();
  };

  const fetchProtectStudentData = useCallback(async () => {
    const response = await axios.get(`${BASE_URL}/api/workNote/getProtectStudents`, {
      params: {
        userId: user.userId,
        schoolCode: user.schoolCode
      }
    });

    if(response.data) setProtectStudentsRowData(response.data);    
  }, [user]);

  useEffect(() => {
    fetchProtectStudentData();
  }, [fetchProtectStudentData]);

  const handlePopUpProtectStudent = (e) => {
    e.preventDefault();

    const confirmTitle = "보호학생 팝업 알림 설정";
    const confirmMessage = isPopUpProtectStudent ? "보호학생 팝업 알림을 해제하도록 설정하시겠습니까?" : "보호학생 팝업 알림으로 설정하시겠습니까?";

    const yesCallback = async () => {
      if(user) {
        const response = await axios.post(`${BASE_URL}/api/user/updatePopUpProtectStudentStatus`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          isPopUpProtectStudent: !isPopUpProtectStudent
        });

        if(response.data === "success") {
          setIsPopUpProtectStudent(!isPopUpProtectStudent);
          fetchPopUpProtectStudentStatus();
          getUser();
        }
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '330px');
  };

  const fetchPopUpProtectStudentStatus = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/user/getPopUpProtectStudentStatus`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const popUpProtectStudentStatus = Boolean(response.data[0].isPopUpProtectStudent);
        setIsPopUpProtectStudent(popUpProtectStudentStatus);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchPopUpProtectStudentStatus();
  }, [fetchPopUpProtectStudentStatus]);

  const onEntireWorkNoteCellValueChanged = (params) => {
    const confirmTitle = "보건일지 수정";
    const confirmMessage = "변경사항이 확인되었습니다<br/>입력하신 사항과 같이 수정하시겠습니까?";

    const yesCallback = async () => {
      const response = await axios.post(`${BASE_URL}/api/workNote/updateVisitDateTime`, {
        visitDateTime: params.data.visitDateTime,
        rowId: params.data.id,
        userId: params.data.userId,
        schoolCode: params.data.schoolCode,
        sGrade: params.data.sGrade,
        sClass: params.data.sClass,
        sNumber: params.data.sNumber,
        sGender: params.data.sGender,
        sName: params.data.sName,
      });

      if(response.data === 'success') {
        const infoMessage = "보건일지가 정상적으로 수정되었습니다";
        NotiflixInfo(infoMessage);

        fetchEntireWorkNoteGrid();
      }
    };

    const noCallback = () => {
      return;
    };
  
    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
  };

  const handleManageRentalProduct = () => {
    toggleRegistRentalProductModal();
  };

  const fetchRentalProdectData = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/workNote/getRentalProducts`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        setRentalProductRowData(response.data);
        setOriginalData(response.data.map(row => ({ ...row })));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchRentalProdectData();
  }, [fetchRentalProdectData]);

  const onRentalProductRowDataUpdated = useCallback(() => {
    const api = rentalProductGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount();
    const lastRowIndex = displayedRowCount - 1;

    if(isRemoved || isRegistered) {
      api.stopEditing(true);
      return;
    }

    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'productName' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);
  
  const [addedRentalProductRow, setAddedRentalProductRow] = useState([]);

  const appendRentalProductRow = useCallback(() => {
    const api = rentalProductGridRef.current.api;                             // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewRentalProductRowData()];                        // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setAddedRentalProductRow(prevAddedRows => [...prevAddedRows, newItem]);
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

  const removeRentalProductRow = () => {                                      // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = rentalProductGridRef.current.api;                             // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득
    const warnMessage = "선택된 행이 없습니다<br/>삭제할 행을 선택해 주세요";
    
    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      NotiflixWarn(warnMessage);      
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  const allRentalProductRemoveRow = () => {
    const api = rentalProductGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에 출력된 행 수
    const warnMessage = "등록된 대여물품이 없습니다";

    if(displayedRowCount === 0) {                         
      NotiflixWarn(warnMessage);
      return;                                             
    }else{                                                
      api.setRowData([]);                                 
    }
  };

  const createNewRentalProductRowData = () => {
    const newData = {
      productName: "",
      productAmount: 0,
      editable: true
    }
    return newData;
  };

  const getDifference = (currentData, originalData) => {
    const added = [];
    const removed = [];
    const updated = [];

    const originalMap = new Map();
    originalData.forEach(row => originalMap.set(row.id, row));

    currentData.forEach(row => {
      const originalRow = originalMap.get(row.id);

      if (!originalRow) {
        added.push(row);
      } else {
        originalMap.delete(row.id);
        if (originalRow.productAmount !== row.productAmount || originalRow.productName !== row.productName) {
          updated.push(row);
        }
      }
    });
    removed.push(...originalMap.values());

    return { added, removed, updated };
  };

  const saveRentalProduct = async (e) => {
    e.preventDefault();

    const confirmTitle = "대여물품 설정";
    const confirmMessage = "작성하신 대여물품을 저장하시겠습니까?";
    const infoMessage = "대여물품 설정이 정상적으로 저장되었습니다";

    const validateFields = () => {
      const api = rentalProductGridRef.current.api;
      let allFieldFilled = true;

      api.forEachNode(function(rowNode) {
        const productName = rowNode.data.productName;
        const productAmount = rowNode.data.productAmount;

        if(!productName || !productAmount) {
          allFieldFilled = false;
          return;
        }
      });

      return allFieldFilled;
    };

    if(!validateFields()) {
      const warnMessage = "입력되지 않은 항목이 존재합니다";
      NotiflixWarn(warnMessage);
      return;
    }

    const yesCallback = async () => {
      const api = rentalProductGridRef.current.api;                      // Grid api 획득
      const rowData = [];
      let response = null;

      api.forEachNode(function (node) {
        rowData.push(node.data);
      });
      
      const { added, removed, updated } = getDifference(rowData, originalData);
      let responseSuccess = true;

      for (const rowNode of removed) {
        response = await axios.post(`${BASE_URL}/api/workNote/removeRentalProduct`, {
          rowId: rowNode.id,
          userId: user.userId,
          schoolCode: user.schoolCode,
          productName: rowNode.productName
        });

        if(response.data !== 'success') responseSuccess = false;
      }

      for (const rowNode of added) {
        response = await axios.post(`${BASE_URL}/api/workNote/insertRentalProduct`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          productName: rowNode.productName,
          productAmount: rowNode.productAmount
        });

        if(response.data !== 'success') responseSuccess = false;
      }

      for (const rowNode of updated) {
        response = await axios.post(`${BASE_URL}/api/workNote/updateRentalProduct`, {
          rowId: rowNode.id,
          userId: user.userId,
          schoolCode: user.schoolCode,
          productName: rowNode.productName,
          productAmount: rowNode.productAmount
        });

        if(response.data !== 'success') responseSuccess = false;
      }

      if(responseSuccess) {
        NotiflixInfo(infoMessage, true, '320px');
      }else{
        const warnMessage = "대여물품 등록에 실패하였습니다<br/>다시 시도해 주세요";
        NotiflixWarn(warnMessage);
        return;
      }

      fetchRentalProdectData();
    };

    const noCallback = () => {
       return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
  };

  const rentalProduct = () => {
    if(selectedRentalProductRow) {
      toggleRentalProductModal();
      onRentalSearchStudent(rentalSearchCriteria);
    }
  };

  const onRentalGridSelectionChanged = (event) => {
    const selectedRow = event.api.getSelectedRows()[0];
    setSelectedRentalStudent(selectedRow);
  };

  const saveRental = async () => {
    if(rentalAmount === 0) {
      const warnMessage = "물품 대여 수량을 입력하세요";
      NotiflixWarn(warnMessage);
      return;
    }else if(!selectedRentalStudent) {
      const warnMessage = "물품을 대여할 학생을 선택하세요";
      NotiflixWarn(warnMessage, '320px');
      return;
    }else{
      const response = await axios.post(`${BASE_URL}/api/workNote/saveRental`, {
        userId: user.userId,
        schoolCode: user.schoolCode,
        sGrade: selectedRentalStudent.sGrade,
        sClass: selectedRentalStudent.sClass,
        sNumber: selectedRentalStudent.sNumber,
        sName: selectedRentalStudent.sName,
        productId: selectedRentalProductRow.id,
        productName: selectedRentalProductRow.productName,
        productAmount: rentalAmount
      });

      if(response.data === 'success') {
        const infoMessage = "물품 대여가 정상적으로 처리되었습니다";
        NotiflixInfo(infoMessage, true, '320px');
        fetchRentalProdectData();
        fetchRentalData();
        toggleRentalProductModal();
      }
    }
  };

  const fetchRentalData = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/workNote/getRental`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        setRentalListRowData(response.data);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchRentalData();
  }, [fetchRentalData]);

  const returnProduct = async () => {
    if(selectedRentalRow) {
      const response = await axios.post(`${BASE_URL}/api/workNote/saveReturn`, {
        rowId: selectedRentalRow.id,
        userId: user.userId,
        schoolCode: user.schoolCode,
        productId: selectedRentalRow.productId,
        productAmount: selectedRentalRow.productAmount
      });

      if(response.data === 'success') {
        const infoMessage = "물품 반납이 정상적으로 처리되었습니다";
        NotiflixInfo(infoMessage, true, '320px');
        fetchRentalData();
        fetchRentalProdectData();
      }
    }
  };

  return (
    <>
      <div className="content" style={{ height: '84.1vh' }}>
        <NotificationAlert ref={notificationAlert} />
        <Row className="mb-1">
          <Col md="7">
            <Row>
              {bedBoxContent}
            </Row>
          </Col>
          <Col md="5">
            <Row style={{ marginTop: '-13px' }}>
              <div style={{ borderRight: '1.5px dashed lightgray', marginBottom: 10, marginTop: 10 }}></div>
              <Col md="5">
                <div style={{ border: '1.5px solid lightgray', borderRadius: 3 }}>
                  <Row className="d-flex align-items-center no-gutters" style={{ backgroundColor: '#F6F6F6' }}>
                    <Label className="m-0 pl-2 pt-1 font-weight-bold">
                      대여물품 목록
                      <IoInformationCircleOutline className="text-muted" id="rental-product-popover" style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }} />
                      <Popover flip target="rental-product-popover" isOpen={rentalProductPopOverOpen} toggle={toggleRentalProductPopOver} trigger="focus">
                        <PopoverHeader>
                          대여 물품 관리 안내
                        </PopoverHeader>
                        <PopoverBody>
                          우측 관리 버튼을 클릭하여 대여물품을 등록하시면 하단 목록에서 대여물품을 관리하실 수 있습니다. <span style={{ color: 'red' }}>물품 우클릭</span> 시 바로 대여를 희망하는 학생을 선택하여 물품 대여를 등록하실 수 있습니다
                        </PopoverBody>
                      </Popover>
                    </Label>
                    <Col className="d-flex justify-content-end pr-2">
                      <IoMdSettings onClick={handleManageRentalProduct} style={{ fontSize: 18, cursor: 'pointer', marginTop: 3 }} />
                    </Col>
                  </Row>
                  <div className="ag-theme-alpine pt-1" style={{ height: '6.7vh' }} onContextMenu={handleRentalGridContextMenu}>
                    <AgGridReact
                      rowHeight={24}
                      ref={rentalProductGridRef}
                      rowData={rentalProductRowData} 
                      columnDefs={rentalProductColumnDefs}
                      defaultColDef={notEditDefaultColDef}
                      suppressCellFocus={true}
                      headerHeight={0}                    
                      overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 대여물품이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                      rowSelection="single"
                    />
                  </div>
                </div>
              </Col>
              <Col className="pl-0">
                <div style={{ border: '1.5px solid lightgray', borderRadius: 3 }}>
                  <Row className="d-flex align-items-center no-gutters" style={{ backgroundColor: '#F6F6F6' }}>
                    <Label className="m-0 pl-2 pt-1 font-weight-bold">
                      대여 목록
                      <IoInformationCircleOutline className="text-muted" id="rental-popover" style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }} />
                      <Popover flip target="rental-popover" isOpen={rentalPopOverOpen} toggle={toggleRentalPopOver} trigger="focus">
                        <PopoverHeader>
                          물품 대여 이용 안내
                        </PopoverHeader>
                        <PopoverBody>
                          대여 목록에서 <span style={{ color: 'red' }}>우클릭</span> 후 반납 클릭 시 바로 해당 물품을 반납 처리하실 수 있습니다. 반납 처리 시 재고에 즉시 반영됩니다.
                        </PopoverBody>
                      </Popover>
                    </Label>
                  </Row>
                  <div className="ag-theme-alpine pt-1" style={{ height: '6.7vh' }} onContextMenu={handleReturnGridContextMenu}>
                    <AgGridReact
                      rowHeight={24}
                      ref={rentalListGridRef}
                      rowData={rentalListRowData} 
                      columnDefs={rentalListColumnDefs}
                      defaultColDef={notEditDefaultColDef}
                      suppressCellFocus={true}
                      headerHeight={0}                    
                      overlayNoRowsTemplate={ '<span style="color: #6c757d;">대여중인 물품이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                      rowSelection="single"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ flex: '1 1 auto'}}>
          <Col className="pr-2" md="4" style={{ height: '76vh', display: 'flex', flexDirection: 'column' }}>
            <Card className="studentInfo" style={{ flex: '1 1 auto', transition: 'box-shadow 0.5s ease', boxShadow: nonSelectedHighlight ? '0px 0px 12px 2px #fccf71' : 'none', border: '1px solid lightgrey' }}>
              <CardHeader className="text-center" style={{ fontSize: '17px' }}>
                <b>학생 조회</b>
              </CardHeader>
              <CardBody className="pb-1" style={{ display: 'flex', flexDirection: "column", height: '100%' }}>
                <Row className="pr-0">
                  <Col md="10" className="ml-1" style={{ marginRight: '-15px'}}>
                    <Row>
                      <Col md="3">
                        <Row className="align-items-center mr-0">
                          <Col md="8" className="text-left">
                            <label style={{ color: 'black' }}>학년</label>
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
                            <label style={{ color: 'black' }}>반</label>
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
                            <label style={{ color: 'black' }}>번호</label>
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
                            <label style={{ color: 'black' }}>이름</label>
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
                <Row className="pt-1">
                  <Col md="12">
                    <Alert className="d-flex justify-content-center align-items-center text-center text-muted mb-0" style={{ backgroundColor: '#f8f8f8', borderRadius: 10, height: 20 }}>
                      <FaInfoCircle className="mr-2" style={{ marginTop: '-2px', fontSize: 17}}/> 일부 항목이나 이름 중 부분 입력으로도 조회 가능합니다
                    </Alert>
                  </Col>
                </Row>
                <Row className="pt-3">
                  <Col className="text-right pr-3" md="12">
                    <CustomInput 
                       type="switch"
                       id="maskingName"
                       label={<span style={{ fontSize: 13}}>학생정보 숨김</span>}
                       checked={masked}
                       onChange={handleMasking}
                    />
                  </Col>
                </Row>
                <Row className="pt-1" style={{ flex: '1 1 auto', minHeight: 0 }}>
                  <Col md="12" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="search-student-grid" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                      <div className="ag-theme-alpine" style={{ flex: '1 1 auto', minHeight: 0 }} onContextMenu={handleLeftGridContextMenu}>
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
                        />
                      </div>
                    </div>
                    <div>
                      <Menu id={MENU_ID_LEFT_GRID} animation="fade">
                        <Item id="protectedsStdentd" onClick={handleProtectClick}>보호학생 등록</Item>
                        {/* <Item id="cut" onClick={handleItemClick}>Cut</Item>
                        <Separator />
                        <Item disabled>Disabled</Item>
                        <Separator />
                        <Submenu label="Foobar">
                          <Item id="reload" onClick={handleItemClick}>Reload</Item>
                          <Item id="something" onClick={handleItemClick}>Do something else</Item>
                        </Submenu> */}
                      </Menu>
                      <Menu id={MENU_ID_RIGHT_GRID} animation="fade">
                          <Item id="deleteWorkNote" onClick={deleteWorkNote}>보건일지 내역 삭제</Item>
                      </Menu>
                      <Menu id={MENU_ID_RENTAL_GRID} animation="fade">
                        <Item id="rentalProduct" onClick={rentalProduct}>물품 대여</Item>
                      </Menu>
                      <Menu id={MENU_ID_RETURN_GRID} animation="fade">
                        <Item id="returnProduct" onClick={returnProduct}>물품 반납</Item>
                      </Menu>
                    </div>
                  </Col>
                </Row>
                <Row className="pt-1">
                  <Col md="4">
                    <Button size="sm">학생관리</Button>
                  </Col>
                  <Col className="d-flex justify-content-end" md="8">
                    <Button size="sm" onClick={handleManageProtectStudent}>보호학생관리</Button>
                    <Button className="ml-1" size="sm" onClick={handleEmergencyStudent}>응급학생관리</Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <Card style={{ flex: '1 1 100px', border: '1px solid lightgrey' }}>
              <CardHeader style={{ fontSize: '17px' }}>
                <Row className="d-flex align-items-center">
                  <Col className="text-left pl-3" md="3">
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
                  <Col className="text-right pr-3" md="3" style={{ marginTop: -8 }}>
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
          <Col className="pl-2" md="8" style={{ height: '76vh', display: 'flex', flexDirection: 'column' }}>
            <Card className="workNoteForm" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', border: '1px solid lightgrey' }}>
              <CardHeader className="text-center" style={{ fontSize: '17px' }}>
                <Row className="d-flex align-item-center">
                  <Col className="d-flex">
                    <Button className="mt-0 mb-0" size="sm" style={{ fontSize: 13, whiteSpace: 'nowrap' }} onClick={handleOnBedStudentList}>침상안정 사용 학생 내역</Button>
                    <Button className="mt-0 mb-0 ml-1" size="sm" onClick={onBedStudentListExportCSV} style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                      <SiMicrosoftexcel className="mr-1" style={{ color: 'green', fontSize: 15 }}/>
                      엑셀 다운로드
                    </Button>
                    <Button className="mt-0 mb-0 ml-1" size="sm" onClick={onBedStudentListPrint} style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                      <TiPrinter className="mr-1" style={{ fontSize: 16, color: 'gray' }}/>
                      프린트
                    </Button>
                  </Col>
                  <Col>
                    <b style={{ position: 'absolute', marginLeft: '-35px' }}>보건 일지</b>
                  </Col>
                  <Col>
                    <b className="p-1 pl-2 pr-2" style={{ float: 'right', fontSize: '13px', backgroundColor: '#F1F3F5', borderRadius: '7px'}}>
                      {selectedStudent ? `${selectedStudent.sGrade} 학년 ${'\u00A0'} ${selectedStudent.sClass} 반 ${'\u00A0'} ${selectedStudent.sNumber}번 ${'\u00A0'} ${selectedStudent.sName}` :  '학생을 선택하세요'}
                    </b>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="pt-2 pb-1" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                <Row className="pt-2">
                  <Col md="12">
                    <div className="personal-worknote-grid" style={{ flex: '1 1 auto' }}>
                      <div className="ag-theme-alpine" style={{ height: '17vh', transition: 'box-shadow 0.5s ease', boxShadow: nonSelectedToUpdateHighlight ? '0px 0px 12px 2px #fccf71' : 'none' }} onContextMenu={handleRightGridContextMenu}>
                        <AgGridReact
                          rowHeight={30}
                          ref={personalStudentGridRef}
                          rowData={personalStudentRowData} 
                          columnDefs={personalStudentColumnDefs}
                          defaultColDef={notEditDefaultColDef}
                          overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                          rowSelection="single"
                          suppressCellFocus={true}
                          onRowClicked={personalStudentRowClicked}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="pt-1" style={{ flex: '1 1 auto'}}>
                  <Col md="5" className="pt-3 pr-2" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card style={{ border: '1px solid lightgrey', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                      <CardHeader className="card-work-note-header text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title">증상</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="symptomTagField" className="text-muted mr-2" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote}/>
                            <BiMenu className="text-muted" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleSymptom}/>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                        <TagField 
                          name="symptom" 
                          suggestions={tagifySymptomSuggestion} 
                          selectedRowValue={searchSymptomText} 
                          tagifyGridRef={symptomGridRef} 
                          category="symptomTagField" 
                          clearField="symptomTagField" 
                          onClearSelectedRowValue={clearSelectedRowValues}
                          isGridRowSelect={isGridRowSelect}
                        />
                        <div className="ag-theme-alpine" style={{ flex: '1 1 auto' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={symptomGridRef}
                            rowData={filteredSymptom} 
                            columnDefs={symptomColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleSymptomRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                            suppressCellFocus={true}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="3" className="pt-3 pl-0" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card style={{ border: '1px solid lightgrey', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                      <CardHeader className="card-work-note-header text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title" style={{ marginRight: '-10px' }}>인체 부위</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="bodyPartsTagField" className="text-muted mr-2" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />                            
                            <BiMenu className="text-muted" style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleBodyParts}/>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                        <TagField name="bodyParts" suggestions={tagifyBodyPartsSuggestion} selectedRowValue={searchBodyPartsText} tagifyGridRef={bodyPartsGridRef} category="bodyPartsTagField" clearField="bodyPartsTagField" />
                        <div className="ag-theme-alpine" style={{ flex: '1 1 auto' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={bodyPartsGridRef}
                            rowData={filteredBodyParts} 
                            columnDefs={bodyPartsColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleBodyPartsRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                            suppressCellFocus={true}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" className="pt-3 pl-0 pr-2" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card style={{ border: '1px solid lightgrey', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                      <CardHeader className="card-work-note-header text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title" style={{ marginRight: '-9px' }}>투약사항</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="medicationTagField" className="text-muted mr-2" style={{ marginTop: '-9px', cursor: 'pointer' }} onClick={handleClearWorkNote} />                            
                            <IoInformationCircleOutline className="text-muted font-weight-bold" id="medicine-bookmark-popover" style={{ marginTop: '-8px'}} />
                            <Popover flip target="medicine-bookmark-popover" isOpen={medicineBookmarkPopOverOpen} toggle={toggleMedicineBookmarkPopOver}>
                              <PopoverHeader>
                                투약사항 설정 안내
                              </PopoverHeader>
                              <PopoverBody>
                                투약사항 설정은 좌측 약품관리 기능 내에서 등록 후 사용해 주시기 바랍니다 <br/>
                                <a href="/meorla/manageMediFixt">약품관리 바로가기</a>
                              </PopoverBody>
                            </Popover>
                            {/* <BiMenu className="text-muted" style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleMedication}/> */}
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                        <TagField name="medication" suggestions={tagifyMedicationSuggestion} selectedRowValue={searchMedicationText} tagifyGridRef={medicationGridRef} category="medicationTagField" clearField="medicationTagField" />
                        <div className="ag-theme-alpine" style={{ flex: '1 1 auto' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={medicationGridRef}
                            rowData={filteredMedication} 
                            columnDefs={medicationColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleMedicationRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                            suppressCellFocus={true}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className="pt-1" style={{ marginTop: '-17px', marginBottom: '-15px', flex: '1 1 12vh' }}>
                  <Col md="5" className="pr-0" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card style={{ border: '1px solid lightgrey', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                      <CardHeader className="card-work-note-header text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title" style={{ marginRight: '-17px' }}>처치 및 교육사항</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh id="treatmentMatterTagField" className="text-muted mr-2" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />
                            <BiMenu className="text-muted" style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleTreatmentMatter}/>
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="p-0" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                        <TagField name="treatmentMatter" suggestions={tagifyTreatmentMatterSuggestion} selectedRowValue={searchTreatmentMatterText} tagifyGridRef={treatmentMatterGridRef} category="treatmentMatterTagField" clearField="treatmentMatterTagField" />
                        <div className="ag-theme-alpine" style={{ flex: '1 1 auto' }}>
                          <AgGridReact
                            rowHeight={30}
                            ref={treatmentMatterGridRef}
                            rowData={filteredTreatmentMatter} 
                            columnDefs={treatmentMatterColumnDefs}
                            headerHeight={0}
                            suppressHorizontalScroll={true}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                            onSelectionChanged={(event) => handleTreatmentMatterRowSelect(event.api.getSelectedRows())}
                            rowSelection="single"
                            suppressCellFocus={true}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="7" className="pl-2" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card className="pb-0" style={{ border: '1px solid lightgrey', flex: '1 1 auto' }}>
                      <CardHeader className="card-work-note-header text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title">활력징후</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh className="text-muted" id="vitalSign" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="pt-2 pb-2 align-content-center" style={{ flex: '1 1 auto' }}>
                        <Row>
                          <Col className="d-flex align-items-center justify-content-start">
                            <label style={{ color: 'black', fontSize: 13, width: '63px' }}>체온</label>
                            <Input
                              id="temperature"
                              type="text"
                              max={45}
                              min={30}
                              onChange={handleVitalSignChange}
                              value={temperatureValue}
                              style={{ width: '70px' }}
                            />
                            <label className="pl-2" style={{ color: 'black', fontSize: 13 }}>(°C)</label>
                          </Col>
                          <Col className="d-flex align-items-center justify-content-center" style={{ marginLeft: '12px' }}>
                            <label className="pr-2" style={{ color: 'black', fontSize: 13, width: '40px', marginRight: '-10px' }}>혈압</label>
                            <Input
                              id="bloodPressure"
                              type="text"
                              onChange={handleVitalSignChange}
                              value={bloodPressureValue}
                              style={{ width: '80px' }}
                            />
                            <label className="pl-2" style={{ color: 'black', fontSize: 13 }}>(mm/Hg)</label>
                          </Col>
                          <Col className="d-flex align-items-center justify-content-end">
                            <label className="pr-2" style={{ color: 'black', fontSize: 13 }}>맥박</label>
                            <Input
                              id="pulse"
                              type="number"
                              onChange={handleVitalSignChange}
                              value={pulseValue}
                              style={{ width: '70px' }}
                            />
                            <label className="pl-2" style={{ color: 'black', fontSize: 13 }}>(bpm)</label>
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col className="d-flex align-items-center justify-content-start">
                            <label className="pr-2" style={{ color: 'black', fontSize: 13 }}>산소포화도</label>
                            <Input
                              id="oxygenSaturation"
                              type="number"
                              onChange={handleVitalSignChange}
                              value={oxygenSaturationValue}
                              style={{ width: '70px' }}
                            />
                            <label className="pl-2" style={{ color: 'black', fontSize: 13 }}>(%)</label>
                          </Col>
                          <Col className="d-flex align-items-center justify-content-center">
                            <label className="pr-2" style={{ color: 'black', fontSize: 13 }}>혈당</label>
                            <Input
                              id="bloodSugar"
                              type="number"
                              onChange={handleVitalSignChange}
                              value={bloodSugarValue}
                              style={{ width: '80px' }}
                            />
                            <label className="pl-2" style={{ color: 'black', fontSize: 13 }}>(mg/dl)</label>
                          </Col>
                          <Col className="d-flex align-items-center justify-content-end">
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                    <Card className="pb-0" style={{ border: '1px solid lightgrey', marginTop: '-9px', flex: '1 1 auto' }}>
                      <CardHeader className="card-work-note-header text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <Row>
                          <Col className="text-right" md="7">
                            <b className="action-title">침상안정</b>
                          </Col>
                          <Col className="text-right" md="5">
                            <IoMdRefresh className="text-muted" id="onBedRest" style={{ marginTop: '-8px', cursor: 'pointer' }} onClick={handleClearWorkNote} />
                          </Col>
                        </Row>
                      </CardHeader>
                      <CardBody className="pb-1 pt-1 align-content-center" style={{ flex: '1 1 auto' }}>
                        <Row className="d-flex align-content-center justify-content-center">
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
                            onChange={(e) => setOnBedRestEndTime(e.target.value)}
                            value={onBedRestEndTime}
                          />
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter className="pt-2 pb-3">
                <Row className="d-flex justify-content-center">
                  <Col md="3">
                    <Button className="" onClick={toggleEntireWorkNoteGrid}>전체 보건일지</Button>
                  </Col>
                  <Col md="3" className="d-flex justify-content-center">
                  </Col>
                  <Col className="d-flex justify-content-end" md="6">
                    <Button className="mr-2"  onClick={handleClearAllWorkNote}>초기화</Button>
                    <Button className="mr-1" onClick={saveWorkNote}>등록</Button>
                    <Button className="mr-1" onClick={updateWorkNote}>수정</Button>
                    <Button className="mr-1" onClick={deleteWorkNote}>삭제</Button>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
        </Row>
        <Collapse isOpen={isEntireWorkNoteOpen} {...args}>
          <Card>
            <CardHeader>
              <Row className="d-flex align-items-center">
                <Col md="4">
                  <Button className="mr-1" size="sm" onClick={onEntireWorkNoteExportCSV}>
                    <SiMicrosoftexcel className="mr-1" style={{ color: 'green', fontSize: 15 }}/>
                    엑셀 다운로드
                  </Button>
                  <Button size="sm" onClick={onEntireWorkNotePrint}>
                    <TiPrinter className="mr-1" style={{ fontSize: 16, color: 'gray' }}/>
                    프린트
                  </Button>
                </Col>
                <Col className="d-flex align-items-center justify-content-end" md="8">
                  <label className="mr-1 pt-1">작성일</label>
                  <Input 
                    id="searchStartDate"
                    type="date"
                    style={{ width: '17%', height: 28 }}
                    value={searchStartDate}
                    onChange={(e) => setSearchStartDate(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  <span className="ml-1 mr-1">~</span>
                  <Input 
                    id="searchEndDate"
                    type="date"
                    style={{ width: '17%', height: 28 }}
                    value={searchEndDate}
                    onChange={(e) => setSearchEndDate(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  <label className="ml-3 mr-1 pt-1">이름</label>
                  <Input 
                    id="searchSname"
                    type="text"
                    style={{ width: '10%', height: 28 }}
                    value={searchSname}
                    onChange={(e) => setSearchSname(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                  <Button className="ml-3 mr-1" size="sm" onClick={resetSearchEntireWorkNote}>초기화</Button>
                  <Button size="sm" onClick={searchEntireWorkNote}>검색</Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="ag-theme-alpine" id="entireWorkNoteGrid" style={{ height: '47.5vh' }}>
                <AgGridReact
                  ref={registeredAllGridRef}
                  rowData={entireWorkNoteRowData}
                  columnDefs={entireWorkNoteColumnDefs} 
                  onCellValueChanged={onEntireWorkNoteCellValueChanged}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
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
                  overlayNoRowsTemplate={ '<span>등록된 증상이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
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
                  overlayNoRowsTemplate={ '<span>등록된 투약사항이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
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

       <Modal isOpen={bodyPartsModal} toggle={toggleBodyPartsModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleBodyPartsModal}><b>인체 부위 설정</b></ModalHeader>
          <ModalBody className="pb-0">
            <Form onSubmit={saveBodyParts}>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact
                  ref={bodyPartsGridRef}
                  rowData={filteredBodyParts}
                  columnDefs={bodyPartsColumnDefs}
                  stopEditingWhenCellsLoseFocus={true}
                  // singleClickEdit={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 인체 부위 사항이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  overlayLoadingTemplate={
                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                  }
                  onGridReady={onGridReady}
                  rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                  onRowDataUpdated={onbodyPartsRowDataUpdated}
                  onCellValueChanged={onCellValueChanged}
                />
              </div>
            </Form>
            <Row>
              <Col className="justify-content-start no-gutters">
                <Button className="btn-plus" size="sm" onClick={appendBodyPartsRow}>
                  추가
                </Button>
                <Button className="btn-minus" size="sm" onClick={removeBodyPartsRow}>
                  삭제
                </Button>
              </Col>
              <Col>
                <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allBodyPartsRemoveRow}>전체 삭제</Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button className="mr-1" color="secondary" onClick={saveBodyParts}>저장</Button>
            <Button color="secondary" onClick={toggleBodyPartsModal}>취소</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={treatmentMatterModal} toggle={toggleTreatmentMatterModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleTreatmentMatterModal}><b>처치사항 설정</b></ModalHeader>
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
                  overlayNoRowsTemplate={ '<span>등록된 처치사항이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
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

       <Modal isOpen={onBedStudentListModal} toggle={toggleOnBedStudentListModal} centered style={{ minWidth: '80%' }}>
          <ModalHeader toggle={toggleOnBedStudentListModal}><b>침상안정 사용 학생 내역</b></ModalHeader>
          <ModalBody>
            <Row className="d-flex align-items-center">
              <Col md="4">
                <Button className="mr-1" size="sm" onClick={onBedStudentListExportCSV}>
                  <SiMicrosoftexcel className="mr-1" style={{ color: 'green', fontSize: 15 }}/>
                  엑셀 다운로드
                </Button>
                <Button size="sm" onClick={onBedStudentListPrint}>
                  <TiPrinter className="mr-1" style={{ fontSize: 16, color: 'gray' }}/>
                  프린트
                </Button>
              </Col>
              <Col className="d-flex align-items-center justify-content-end" md="8">
                <label className="mr-1 pt-1">작성일</label>
                <Input 
                  id="searchStartDate"
                  type="date"
                  style={{ width: '17%', height: 28 }}
                  value={searchStartDate}
                  onChange={(e) => setSearchStartDate(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <span className="ml-1 mr-1">~</span>
                <Input 
                  id="searchEndDate"
                  type="date"
                  style={{ width: '17%', height: 28 }}
                  value={searchEndDate}
                  onChange={(e) => setSearchEndDate(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <label className="ml-3 mr-1 pt-1">이름</label>
                <Input 
                  id="searchSname"
                  type="text"
                  style={{ width: '10%', height: 28 }}
                  value={searchSname}
                  onChange={(e) => setSearchSname(e.target.value)}
                  onKeyDown={handleSearchOnBedKeyDown}
                />
                <Button className="ml-3 mr-1" size="sm" onClick={resetSearchOnBedStudentList}>초기화</Button>
                <Button size="sm" onClick={searchOnBedStudentList}>검색</Button>
              </Col>
            </Row>
            <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
              <AgGridReact
                ref={onBedStudentListGridRef}
                rowData={onBedStudentListData}
                columnDefs={onBedStudentListColumnDefs}
                defaultColDef={notEditDefaultColDef}
                overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                overlayLoadingTemplate={
                  '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                }
                rowSelection={'single'} 
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={toggleOnBedStudentListModal}>닫기</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={registProtectStudentModal} toggle={toggleRegistProtectStudentModal} centered style={{ width: '20%' }}>
          <ModalHeader toggle={toggleRegistProtectStudentModal}><b>보호학생 등록</b></ModalHeader>
          <ModalBody>
            <Row className="d-flex justify-content-center align-items-center no-gutters">
              <b className="p-1 pl-2 pr-2" style={{ float: 'right', fontSize: '13px', backgroundColor: '#F1F3F5', borderRadius: '7px'}}>
                {protectSgrade ? protectSgrade : ""} 학년 {protectSclass ? protectSclass : ""} 반 {protectSnumber ? protectSnumber : ""} 번 {protectSgender ? protectSgender : ""} {protectSname ? protectSname : ""}
              </b>
            </Row>
            <Row className="d-flex justify-content-center align-items-center no-gutters mt-3">
              <Input 
                className="p-2"
                type="textarea"
                placeholder="보호내용을 입력하세요"
                value={protectContent}
                onChange={(e) => setProtectContent(e.target.value)}
              />
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button onClick={saveProtectStudent}>등록</Button>
            <Button className="ml-1" onClick={toggleRegistProtectStudentModal}>취소</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={manageProtectStudentModal} toggle={toggleManageProtectStudentModal} centered style={{ minWidth: '40%' }}>
          <ModalHeader toggle={toggleManageProtectStudentModal}><b>보호학생 관리</b></ModalHeader>
          <ModalBody>
            <Card className="p-2" style={{ border: '1px solid lightgray'}}>
              <Row className="d-flex align-items-center no-gutters pl-2 pr-2">
                <Col md="10">
                  <span className="mr-2">보호학생은 개인정보로 인하여 </span>
                  <span className="mr-2" style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                  <span>으로 학생 이름 우측에 표시됩니다</span>
                </Col>
                <Col className="d-flex justify-content-end align-items-center mt-1" md="2">
                  <CustomInput 
                    type="switch"
                    id="isPopUpProtectStudent"
                    label={<span style={{ lineHeight: '24px' }}><b>팝업 표시 여부</b></span>}
                    checked={isPopUpProtectStudent}
                    onChange={handlePopUpProtectStudent}
                  />
                </Col>
              </Row>
            </Card>
            <Row className="mt-3">
              <Col md="12">
                <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                  <AgGridReact
                    ref={protectStudentGridRef}
                    rowData={protectStudentsRowData}
                    columnDefs={protectStudentColumnDefs}
                    defaultColDef={notEditDefaultColDef}
                    overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                    overlayLoadingTemplate={
                      '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                    }
                    rowSelection={'single'} 
                  />
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button onClick={toggleManageProtectStudentModal}>닫기</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={registRentalProductModal} toggle={toggleRegistRentalProductModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleRegistRentalProductModal}><b>대여물품 등록</b></ModalHeader>
          <ModalBody>
            <Form onSubmit={saveTreatmentMatter}>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact
                  ref={rentalProductGridRef}
                  rowData={rentalProductRowData}
                  columnDefs={rentalProductColumnDefs}
                  stopEditingWhenCellsLoseFocus={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 대여물품이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  onGridReady={onGridReady}
                  rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                  onRowDataUpdated={onRentalProductRowDataUpdated}
                  onCellValueChanged={onCellValueChanged}
                />
              </div>
            </Form>
            <Row>
              <Col className="justify-content-start no-gutters">
                <Button className="btn-plus" size="sm" onClick={appendRentalProductRow}>
                  추가
                </Button>
                <Button className="btn-minus" size="sm" onClick={removeRentalProductRow}>
                  삭제
                </Button>
              </Col>
              <Col>
                <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allRentalProductRemoveRow}>전체 삭제</Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button onClick={saveRentalProduct}>저장</Button>
            <Button className="ml-1" onClick={toggleRegistRentalProductModal}>취소</Button>
          </ModalFooter>
       </Modal>

       <Modal isOpen={rentalProductModal} toggle={toggleRentalProductModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleRentalProductModal}><b>물품 대여</b></ModalHeader>
          <ModalBody>
            <Row className="d-flex align-content-center no-gutters p-2 pt-3" style={{ border: '1px dashed lightgray', borderRadius: 5 }}>
              <Col md="2">
                <Label>대여 물품 : </Label>
              </Col>
              <Col md="3">
                <span>{selectedRentalProductRow ? selectedRentalProductRow.productName : ''}</span>
              </Col>
              <Col md="2">
                <Label>대여 수량 :</Label>
              </Col>
              <Col md="1">
                <Input 
                  type="number"
                  max={selectedRentalProductRow ? selectedRentalProductRow.productAmount : 0}
                  style={{ height: 27 }}
                  value={rentalAmount}
                  onChange={(e) => setRentalAmount(e.target.value)}
                />
              </Col>
              <Col className="d-flex justify-content-end" md="4">
                  <b className="p-1 pl-2 pr-2" style={{ backgroundColor: '#F1F3F5', borderRadius: 7, fontSize: 13, marginTop: -3 }}>{selectedRentalStudent ? selectedRentalStudent.sGrade + "학년 " + selectedRentalStudent.sClass + "반 " + selectedRentalStudent.sNumber + "번 " + selectedRentalStudent.sName : "학생을 선택하세요" }</b>
              </Col>
            </Row>
            <Row className="pr-0 mt-4">
              <Col md="10" className="ml-1" style={{ marginRight: '-15px'}}>
                <Row>
                  <Col md="3">
                    <Row className="align-items-center mr-0">
                      <Col md="8" className="text-left">
                        <label style={{ color: 'black' }}>학년</label>
                      </Col>
                      <Col md="4" className="p-0" style={{ marginLeft: '-12px' }}>
                        <Input
                          className="text-right"
                          style={{ width: '40px' }}
                          onChange={(e) => onRentalInputChange("iGrade", e.target.value)}
                          value={rentalSearchCriteria.iGrade}
                          onKeyDown={(e) => handleRentalKeyDown(e, "iGrade")}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="2">
                    <Row className="align-items-center">
                      <Col md="6" className="text-left" style={{ marginLeft: '-20px' }}>
                        <label style={{ color: 'black' }}>반</label>
                      </Col>
                      <Col md="6" className="p-0">
                        <Input
                          className="text-right"
                          style={{ width: '40px' }}
                          onChange={(e) => onRentalInputChange("iClass", e.target.value)}
                          value={rentalSearchCriteria.iClass}
                          onKeyDown={(e) => handleRentalKeyDown(e, "iClass")}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="3">
                    <Row className="align-items-center">
                      <Col md="7" className="text-left" style={{ marginLeft: '-20px' }}>
                        <label style={{ color: 'black' }}>번호</label>
                      </Col>
                      <Col md="5" className="p-0" style={{ marginLeft: '-13px'}}>
                        <Input
                          className="text-right"
                          style={{ width: '40px' }}
                          onChange={(e) => onRentalInputChange("iNumber", e.target.value)}
                          value={rentalSearchCriteria.iNumber}
                          onKeyDown={(e) => handleRentalKeyDown(e, "iNumber")}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="4">
                    <Row className="align-items-center pr-0">
                      <Col md="5" className="text-right" style={{ marginLeft: '-40px'}}>
                        <label style={{ color: 'black' }}>이름</label>
                      </Col>
                      <Col md="7" className="p-0" style={{ marginLeft: '-5px'}}>
                        <Input
                          className="text-right"
                          style={{ width: '80px' }}
                          onChange={(e) => onRentalInputChange("iName", e.target.value)}
                          value={rentalSearchCriteria.iName}
                          onKeyDown={(e) => handleRentalKeyDown(e, "iName")}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <Col md="2" style={{ marginLeft: '-25px' }}>
                <Row>
                  <Col md="6" style={{ marginTop: '-10px', marginLeft: '-7px', marginRight: '7px' }}>
                    <Button size="sm" style={{ height: '30px' }} onClick={onRentalResetSearch}><IoMdRefresh style={{ fontSize: '15px'}} /></Button>
                  </Col>
                  <Col md="6" style={{ marginTop: '-10px' }}>
                    <Button size="sm" style={{ height: '30px' }} onClick={() => onRentalSearchStudent(searchCriteria)}><RiSearchLine style={{ fontSize: '15px' }}/></Button>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="pt-1" style={{ flex: '1 1 auto', minHeight: 0 }}>
              <Col md="12" style={{ display: 'flex', flexDirection: 'column', height: '20vh' }}>
                <div className="rental-search-student-grid" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                  <div className="ag-theme-alpine" style={{ flex: '1 1 auto', minHeight: 0 }} onContextMenu={handleLeftGridContextMenu}>
                    <AgGridReact
                      rowHeight={30}
                      ref={rentalSearchStudentGridRef}
                      rowData={rentalSearchStudentRowData} 
                      columnDefs={searchStudentColumnDefs}
                      defaultColDef={notEditDefaultColDef}
                      paginationPageSize={4}
                      overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                      rowSelection="single"
                      suppressCellFocus={true}
                      onSelectionChanged={onRentalGridSelectionChanged}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button onClick={saveRental}>대여</Button>
            <Button className="ml-1" onClick={toggleRentalProductModal}>취소</Button>
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