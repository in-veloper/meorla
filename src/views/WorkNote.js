import React, {useState, useRef, useCallback, useEffect} from "react";
import {Card, CardHeader, CardBody, Row, Col, Input, Button, Alert, Badge, UncontrolledAlert, Collapse, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form } from "reactstrap";
// import tagify from "@yaireo/tagify";
import Tags from "@yaireo/tagify/dist/react.tagify";
import '@yaireo/tagify/dist/tagify.css';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../assets/css/worknote.css';
import { GiBed } from "react-icons/gi";
import { BiMenu } from "react-icons/bi";
import { RiSearchLine } from "react-icons/ri";
import { IoMdRefresh } from "react-icons/io";
import { useUser } from "contexts/UserContext";
import Notiflix from "notiflix";
import axios from "axios";
import moment from "moment";

const baseTagifySettings = {
  blacklist: [],
  maxTags: 6,
  backspace: true,                  // true: 마지막 Tag 삭제, edit: 마지막 태그 Edit, false: 아무 동작 하지 않음
  placeholder: "증상 입력",
  editTags: 1,
  dropdown: {
    enabled: 0
  },
  callbacks: {}
};

function TagField({ label, name, initialValue = [], suggestions = [] }) {
  const handleChange = e => {
    // console.log(e.type, " ==> ", e.detail.tagify.value.map(item => item.value));
  };

  const settings = {
    ...baseTagifySettings,
    whitelist: suggestions,
    callbacks: {
      add: handleChange,
      remove: handleChange,
      blur: handleChange,
      edit: handleChange,
      invalid: handleChange,
      click: handleChange,
      focus: handleChange,
      "edit:updated": handleChange,
      "edit:start": handleChange
    }
  };

  // console.log("InitialValue", initialValue);

  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      {/* <label htmlFor={"field-" + name}>{label}</label> */}
      <Tags settings={settings} initialValue={initialValue} />
    </div>
  );
}


function WorkNote(args) {

  const suggestions = [
    "apple",
    "banana",
    "cucumber",
    "dewberries",
    "elderberry",
    "farkleberry",
    "grapes",
    "hackberry",
    "imbe",
    "jambolan",
    "kiwi",
    "lime",
    "mango",
    "nectarine",
    "orange",
    "papaya",
    "quince",
    "raspberries",
    "strawberries",
    "tangerine",
    "ugni",
    "voavanga",
    "watermelon",
    "xigua",
    "yangmei",
    "zucchini"
  ];

  const { user } = useUser();                              // 사용자 정보
  const [isOpen, setIsOpen] = useState(false);
  const [searchStudentRowData, setRowData] = useState([]); // 검색 결과를 저장할 state
  const [symptomRowData, setSymptomRowData] = useState([]);
  const [medicationRowData, setMedicationRowData] = useState([]);
  const [actionMatterRowData, setActionMatterRowData] = useState([]);
  const [treatmentMatterRowData, setTreatmentMatterRowData] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({ iGrade: "", iClass: "", iNumber: "", iName: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  // const [modal, setModal] = useState(false);
  const [symptomModal, setSymptomModal] = useState(false);
  const [medicationModal, setMedicationModal] = useState(false);
  const [actionMatterModal, setActionMatterModal] = useState(false);
  const [treatmentMatterModal, setTreatmentMatterModal] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [setModifiedData] = useState([]);
  const [currentTimeValue, setCurrentTimeValue] = useState('');


  const [searchSymptomText, setSearchSymptomText] = useState("");
  const [filteredSymptom, setFilteredSymptom] = useState(symptomRowData);
  const [tagifySymptomSuggestion, setTagifySymptomSuggestion] = useState([]);
  const [searchMedicationText, setSearchMedicationText] = useState("");
  const [filteredMedication, setFilteredMedication] = useState(medicationRowData);
  const [searchActionMatterText, setSearchActionMatterText] = useState("");
  const [filteredActionMatter, setFilteredActionMatter] = useState(actionMatterRowData);
  const [searchTreatmentMatterText, setSearchTreatmentMatterText] = useState("");
  const [filteredTreatmentMatter, setFilteredTreatmentMatter] = useState(treatmentMatterRowData);

  const searchStudentGridRef = useRef();
  const personalStudentGridRef = useRef();
  const registeredAllGridRef = useRef();
  const symptomGridRef = useRef();
  const medicationGridRef = useRef();
  const actionMatterGridRef = useRef();
  const treatmentMatterGridRef = useRef();

  const symptomInputRef = useRef();

  // 최초 Grid Render Event
  const onGridReady = useCallback((params) => {
  }, []);

  const toggle = () => setIsOpen(!isOpen);
  const toggleSymptomModal = () => setSymptomModal(!symptomModal);
  const toggleMedicationModal = () => setMedicationModal(!medicationModal);
  const toggleActionMatterModal = () => setActionMatterModal(!actionMatterModal);
  const toggleTreatmentMatterModal = () => setTreatmentMatterModal(!treatmentMatterModal);

  const [searchStudentColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }}
  ]);

  const [personalStudentRowData] = useState([
    { registDate: "2023-07-20", symptom: "감기", treatmentMatter: "", dosageMatter: "판콜 1정", actionMatter: "조퇴 권고", onBed: "" },
    { registDate: "2023-05-20", symptom: "타박상", treatmentMatter: "연고 도포", dosageMatter: "파스", actionMatter: "", onBed: "" },
    { registDate: "2023-07-20", symptom: "복통", treatmentMatter: "", dosageMatter: "베나치오 1병", actionMatter: "조퇴 권고", onBed: "15:00 - 16:00" }
  ]);

  const [personalStudentColumnDefs] = useState([
    { field: "registDate", headerName: "등록일", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "dosageMatter", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "actionMatter", headerName: "조치사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "onBed", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "etc", headerName: "비고", flex: 1, cellStyle: { textAlign: "center" } }
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
  }

  const [symptomColumnDefs] = useState([
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [medicationColumnDefs] = useState([
    { field: "medication", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "left" } }
  ]);

  const [actionMatterColumnDefs] = useState([
    { field: "actionMatter", headerName: "조치사항", flex: 1, cellStyle: { textAlign: "left" } }
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

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      Notiflix.Notify.warning('선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });
      
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeMedicationRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = medicationGridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      Notiflix.Notify.warning('선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });
      
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeActionMatterRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = actionMatterGridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      Notiflix.Notify.warning('선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });
      
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 삭제 Function
  const removeTreatmentMatterRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = treatmentMatterGridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      Notiflix.Notify.warning('선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });
      
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 전체 삭제 Function
  const allSymptomRemoveRow = () => {
    const api = symptomGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    
    if(displayedRowCount === 0) {                         // 현재 등록된 증상이 없을 경우
      // 등록된 증상 없음 Notify
      Notiflix.Notify.warning('등록된 증상이 없습니다.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });

      return;                                             // return
    }else{                                                // 등록된 증상이 있을 경우
      api.setRowData([]);                                 // 증상 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Grid 행 전체 삭제 Function
  const allMedicationRemoveRow = () => {
    const api = medicationGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    
    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 투약사항 없음 Notify
      Notiflix.Notify.warning('등록된 투약사항이 없습니다.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });

      return;                                             // return
    }else{                                                // 등록된 투약사항이 있을 경우
      api.setRowData([]);                                 // 투약사항 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Grid 행 전체 삭제 Function
  const allActionMatterRemoveRow = () => {
    const api = actionMatterGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    
    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 투약사항 없음 Notify
      Notiflix.Notify.warning('등록된 조치사항이 없습니다.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });

      return;                                             // return
    }else{                                                // 등록된 투약사항이 있을 경우
      api.setRowData([]);                                 // 투약사항 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Grid 행 전체 삭제 Function
  const allTreatmentMatterRemoveRow = () => {
    const api = treatmentMatterGridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    
    if(displayedRowCount === 0) {                         // 현재 등록된 투약사항이 없을 경우
      // 등록된 투약사항 없음 Notify
      Notiflix.Notify.warning('등록된 처치사항이 없습니다.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });

      return;                                             // return
    }else{                                                // 등록된 투약사항이 있을 경우
      api.setRowData([]);                                 // 투약사항 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  const fetchStudentData = async (criteria) => {
    try {
      const { iGrade, iClass, iNumber, iName } = criteria;
      
      if(user) {
        const response = await axios.get(`http://localhost:8000/studentsTable/getStudentInfoBySearch`, {
          params: {
            userId: user.userId,
            schoolCode: user.schoolCode,
            sGrade:  iGrade,
            sClass: iClass,
            sNumber:  iNumber,
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
  };

  const onSearchStudent = async (criteria) => {
    try {
      const studentData = await fetchStudentData(criteria);

      if (Array.isArray(studentData) && searchStudentGridRef.current) searchStudentGridRef.current.api.setRowData(studentData); // Update the grid
      setRowData(studentData); 
    } catch (error) {
      console.error("학생 조회 중 ERROR", error);
    }
  };

  const onGridSelectionChanged = (event) => {
    const selectedRow = event.api.getSelectedRows()[0];
    setSelectedStudent(selectedRow);
  }

  const onCellValueChanged = (event) => {
    const updatedRowData = event.api.getRowNode(event.rowIndex).data;
    setModifiedData((prevData) => [...prevData, updatedRowData]);
  }

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

  const saveSymptom = async (event) => {
    try {
      Notiflix.Confirm.show(                                           // Confirm 창 Show
        '증상 설정',                                                     // Confirm 창 Title
        '작성하신 증상를 저장하시겠습니까?',                                   // Confirm 창 내용
        '예',                                                          // Confirm 창 버튼
        '아니요',                                                       // Confirm 창 버튼
        async () => {                                                 // Confirm 창에서 '예' 선택한 경우
          event.preventDefault();                                     // 기본 Event 방지
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
            response = await axios.post('http://localhost:8000/symptom/update', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              symptom: symptomString
            });
          }else{                            // 등록된 증상이 없는 경우 - Insert
            response = await axios.post('http://localhost:8000/symptom/insert', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              symptom: symptomString
            });
          }
          
          if(response.data === "success") {   // Api 호출 성공한 경우
            fetchSymptomData();              // Dropdown에도 공통 적용되기 위해 북마크 데이터 재조회
            // 증상 정상 저장 Notify
            Notiflix.Notify.info('증상 설정이 정상적으로 저장되었습니다.', {
              position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
          }
        },() => {                                                         // Confirm 창에서 '아니요' 선택한 경우
          return;                                                         // return
        },{                                                               // Confirm 창 Option 설정
          position: 'center-center', showOnlyTheLastOne: true, plainText: false
        }
      )
    } catch(error) {
      console.error('증상 저장 중 ERROR', error);
    }
  };

  const saveMedication = async (event) => {
    try {
      Notiflix.Confirm.show(                                           // Confirm 창 Show
        '투약사항 설정',                                                  // Confirm 창 Title
        '작성하신 투약사항를 저장하시겠습니까?',                                // Confirm 창 내용
        '예',                                                          // Confirm 창 버튼
        '아니요',                                                       // Confirm 창 버튼
        async () => {                                                 // Confirm 창에서 '예' 선택한 경우
          event.preventDefault();                                     // 기본 Event 방지
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
            response = await axios.post('http://localhost:8000/medication/update', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              medication: medicationString
            });
          }else{                                    // 등록된 투약사항이 없는 경우 - Insert
            response = await axios.post('http://localhost:8000/medication/insert', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              medication: medicationString
            });
          }
          
          if(response.data === "success") {   // Api 호출 성공한 경우
            fetchStockMedicineData();              // Dropdown에도 공통 적용되기 위해 투약사항 데이터 재조회
            // 투약사항 정상 저장 Notify
            Notiflix.Notify.info('투약사항 설정이 정상적으로 저장되었습니다.', {
              position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
          }
        },() => {                                                         // Confirm 창에서 '아니요' 선택한 경우
          return;                                                         // return
        },{                                                               // Confirm 창 Option 설정
          position: 'center-center', showOnlyTheLastOne: true, plainText: false
        }
      )
    } catch(error) {
      console.error('투약사항 저장 중 ERROR', error);
    }
  };

  const saveActionMatter = async (event) => {
    try {
      Notiflix.Confirm.show(                                           // Confirm 창 Show
        '조치사항 설정',                                                     // Confirm 창 Title
        '작성하신 조치사항을 저장하시겠습니까?',                                   // Confirm 창 내용
        '예',                                                          // Confirm 창 버튼
        '아니요',                                                       // Confirm 창 버튼
        async () => {                                                 // Confirm 창에서 '예' 선택한 경우
          event.preventDefault();                                     // 기본 Event 방지
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
            response = await axios.post('http://localhost:8000/actionMatter/update', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              actionMatter: actionMatterString
            });
          }else{                            // 등록된 증상이 없는 경우 - Insert
            response = await axios.post('http://localhost:8000/actionMatter/insert', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              actionMatter: actionMatterString
            });
          }
          
          if(response.data === "success") {   // Api 호출 성공한 경우
            fetchActionMatterData();           
            // 조치사항 정상 저장 Notify
            Notiflix.Notify.info('조치사항 설정이 정상적으로 저장되었습니다.', {
              position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
          }
        },() => {                                                         // Confirm 창에서 '아니요' 선택한 경우
          return;                                                         // return
        },{                                                               // Confirm 창 Option 설정
          position: 'center-center', showOnlyTheLastOne: true, plainText: false
        }
      )
    } catch(error) {
      console.error('조치사항 저장 중 ERROR', error);
    }
  };

  const saveTreatmentMatter = async (event) => {
    try {
      Notiflix.Confirm.show(                                           // Confirm 창 Show
        '처치사항 설정',                                                     // Confirm 창 Title
        '작성하신 처치사항을 저장하시겠습니까?',                                   // Confirm 창 내용
        '예',                                                          // Confirm 창 버튼
        '아니요',                                                       // Confirm 창 버튼
        async () => {                                                 // Confirm 창에서 '예' 선택한 경우
          event.preventDefault();                                     // 기본 Event 방지
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
            response = await axios.post('http://localhost:8000/treatmentMatter/update', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              treatmentMatter: treatmentMatterString
            });
          }else{                            // 등록된 증상이 없는 경우 - Insert
            response = await axios.post('http://localhost:8000/treatmentMatter/insert', {
              userId: user.userId,
              schoolCode: user.schoolCode,
              treatmentMatter: treatmentMatterString
            });
          }
          
          if(response.data === "success") {   // Api 호출 성공한 경우
            fetchTreatmentMatterData();           
            // 조치사항 정상 저장 Notify
            Notiflix.Notify.info('처치사항 설정이 정상적으로 저장되었습니다.', {
              position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
          }
        },() => {                                                         // Confirm 창에서 '아니요' 선택한 경우
          return;                                                         // return
        },{                                                               // Confirm 창 Option 설정
          position: 'center-center', showOnlyTheLastOne: true, plainText: false
        }
      )
    } catch(error) {
      console.error('처치사항 저장 중 ERROR', error);
    }
  };

  // 증상 데이터 획득 부분 Function 분리
  const fetchSymptomData = useCallback(async() => {
    try {
      if(user?.userId && user?.schoolCode) {
        const response = await axios.post('http://localhost:8000/symptom/getSymptom', {
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

  useEffect(() => {
    fetchSymptomData();
  }, [fetchSymptomData]);

  const fetchActionMatterData = useCallback(async() => {
    try {
      if(user?.userId && user?.schoolCode) {
        const response = await axios.post('http://localhost:8000/actionMatter/getActionMatter', {
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
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('조치사항 조회 중 ERROR', error);
    }
  }, [user?.userId, user?.schoolCode]);

  const fetchTreatmentMatterData = useCallback(async() => {
    try {
      if(user?.userId && user?.schoolCode) {
        const response = await axios.post('http://localhost:8000/treatmentMatter/getTreatmentMatter', {
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

  // 증상 input 입력란에 Text 입력 시 처리 Event
  const handleSearchSymptom = (text) => {
    setSearchSymptomText(text);                                                             // 입력한 문자 useState로 전역 변수에 할당
    
    const filteredData = symptomRowData.filter(symptom => symptom.symptom.includes(text));  // 입력한 문자를 포함하는 Grid의 Row를 Filtering
    setFilteredSymptom(filteredData);
  };

  // 증상 Grid의 Row 선택 Event
  const handleSymptomRowSelect = (selectedRow) => {
    if (selectedRow && selectedRow.length > 0 && searchSymptomText !== null) {
      const selectedSymptom = selectedRow[0].symptom;
      setSearchSymptomText(selectedSymptom);
    }
  };

  // 투약사항 input 입력란에 Text 입력 시 처리 Event
  const handleSearchMedication = (text) => {
    setSearchMedicationText(text);                                                                      // 입력한 문자 useState로 전역 변수에 할당
    
    const filteredData = medicationRowData.filter(medication => medication.medication.includes(text));  // 입력한 문자를 포함하는 Grid의 Row를 Filtering
    setFilteredMedication(filteredData);
  };

  // 증상 Grid의 Row 선택 Event
  const handleMedicationRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      const selectedMedication = selectedRow[0].medication;   // 선택한 투약사항 Text 값
      setSearchMedicationText(selectedMedication);            // input에 선택한 투약사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  // 조치사항 input 입력란에 Text 입력 시 처리 Event
  const handleSearchActionMatter = (text) => {
    setSearchActionMatterText(text);                                                                      // 입력한 문자 useState로 전역 변수에 할당
    
    const filteredData = actionMatterRowData.filter(actionMatter => actionMatter.actionMatter.includes(text));  // 입력한 문자를 포함하는 Grid의 Row를 Filtering
    setFilteredActionMatter(filteredData);
  };

  // 조치사항 input 입력란에 Text 입력 시 처리 Event
  const handleSearchTreatmentMatter = (text) => {
    setSearchTreatmentMatterText(text);                                                                      // 입력한 문자 useState로 전역 변수에 할당
    
    const filteredData = treatmentMatterRowData.filter(treatmentMatter => treatmentMatter.treatmentMatter.includes(text));  // 입력한 문자를 포함하는 Grid의 Row를 Filtering
    setFilteredTreatmentMatter(filteredData);
  };
  
  // 조치사항 Grid의 Row 선택 Event
  const handleActionMatterRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      const selectedActionMatter = selectedRow[0].actionMatter;   // 선택한 조치사항 Text 값
      setSearchActionMatterText(selectedActionMatter);            // input에 선택한 조치사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  // 조치사항 Grid의 Row 선택 Event
  const handleTreatmentMatterRowSelect = (selectedRow) => {
    if(selectedRow && selectedRow.length > 0) {               // Grid에서 선택한 Row가 있는 경우
      const selectedTreatmentMatter = selectedRow[0].treatmentMatter;   // 선택한 조치사항 Text 값
      setSearchTreatmentMatterText(selectedTreatmentMatter);            // input에 선택한 조치사항 값 할당하기 위해 전역변수에 값 할당
    }
  };

  const setCurrentTime = () => {
    const currentTime = moment().format('HH:mm');
    setCurrentTimeValue(currentTime);
  };

  const fetchStockMedicineData = useCallback(async () => {
    if(user?.userId && user?.schoolCode) {
      const response = await axios.get("http://localhost:8000/workNote/getStockMedication", {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        setMedicationRowData(response.data);
        setFilteredMedication(response.data);
      }
    }
  }, [user?.userId, user?.schoolCode]);

  useEffect(() => {
    fetchStockMedicineData();
  }, [fetchStockMedicineData]);

  // useEffect(() => {
  //   const tagifyInstance = tagify(symptomInputRef.current, {
  //     enforceWhitelist: true,
  //     whitelist: [],
  //     dropdown: {
  //       enabled: 0,
  //       maxItems: 5
  //     },
  //     callbacks: {
  //       add: onTagAdded,
  //       remove: onTagRemoved
  //     }
  //   });

  //   return () => {
  //     tagifyInstance.destroy();
  //   };
  // }, []);

  // const onTagAdded = (e) => {
  //   console.log("Tag Added", e.detail.data.value);
  // };

  // const onTagRemoved = (e) => {
  //   console.log("Tag Removed", e.detail.data.value);
  // }

  const generateOnBedBox = () => {
    if(user?.userId && user?.schoolCode) {
      const bedCount = user.bedCount;

      return Array.from({ length: bedCount }, (_, index) => {
        const ind = index + 1;

        return (
          <Col lg="2" md="6" sm="6" key={ind}>
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        );
      });
    }
  };

  return (
    <>
      <div className="content">
        <Row className="pl-3 pr-3">
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
        <Row>
          {generateOnBedBox()}
          {/* <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center" style={{ fontSize: '15px', fontWeight: 'bold' }} >
                      <span>정영인</span>
                      <br/>
                      <span style={{ fontSize: '12px' }}>11:00 부터 사용</span>
                    </p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col> */}
        </Row>
        <Row>
          <Col className="pr-2" md="4">
            <Card style={{ minHeight: '420px'}}>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b>학생 조회</b>
              </CardHeader>
              <CardBody>
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
                    <Alert className="text-center text-muted" style={{ backgroundColor: '#f8f8f8' }}>
                      <i className="nc-icon nc-bulb-63" /> 일부 항목 입력으로도 조회 가능합니다
                    </Alert>
                  </Col>
                </Row>
                <Row className="pt-1">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '21.7vh' }}>
                      <AgGridReact
                        ref={searchStudentGridRef}
                        rowData={searchStudentRowData} 
                        columnDefs={searchStudentColumnDefs}
                        defaultColDef={notEditDefaultColDef}
                        paginationPageSize={4}
                        overlayNoRowsTemplate={ '<span>일치하는 검색결과가 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                        rowSelection="single"
                        onSelectionChanged={onGridSelectionChanged}
                        suppressCellFocus={true}
                        overlayLoadingTemplate={
                          '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                        }
                      />
                    </div>
                  </Col>
                </Row>
                {/* <Row className="pt-2">
                  <Col md="12" className="d-flex justify-content-center"> */}
                    {/* <Button className="mr-1">초기화</Button> */}
                    {/* <Button onClick={onChoiceStudent}>선택</Button> */}
                  {/* </Col>
                </Row> */}
              </CardBody>
            </Card>
            <Card style={{ height: '264px', overflowY: 'auto' }}>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b>보건실 방문 요청 알람</b>
              </CardHeader>
              <CardBody>
                <UncontrolledAlert color="warning" fade={false}>
                  <span>
                    <b>알림 &nbsp; </b>
                    [13:20] 2학년 3반 정영인 방문 요청</span>
                </UncontrolledAlert>
                <UncontrolledAlert color="warning" fade={false}>
                  <span>
                    <b>알림 &nbsp; </b>
                    [15:33] 3학년 1반 김은지 방문 요청</span>
                </UncontrolledAlert>
                <UncontrolledAlert color="warning" fade={false}>
                  <span>
                    <b>알림 &nbsp; </b>
                    [11:10] 1학년 2반 홍길동 방문 요청</span>
                </UncontrolledAlert>
              </CardBody>
            </Card>
          </Col>
          <Col className="pl-2" md="8">
            <Card>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b style={{ position: 'absolute', marginLeft: '-35px' }}>보건 일지</b>
                <b className="p-1 pl-2 pr-2" style={{ float: 'right', fontSize: '13px', backgroundColor: '#F1F3F5', borderRadius: '7px'}}>
                  {selectedStudent ? `${selectedStudent.sGrade} 학년 ${'\u00A0'} ${selectedStudent.sClass} 반 ${'\u00A0'} ${selectedStudent.sNumber}번 ${'\u00A0'} ${selectedStudent.sName}` :  '학생을 선택하세요'}
                </b>
              </CardHeader>
              <CardBody>
                <Row className="pt-1">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '13.9vh' }}>
                      <AgGridReact
                        ref={personalStudentGridRef}
                        rowData={personalStudentRowData} 
                        columnDefs={personalStudentColumnDefs}
                        defaultColDef={notEditDefaultColDef}
                        overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="3" className="pt-3 pr-2">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title" style={{ marginRight: '-15px' }}>증상</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleSymptom}/>
                      </CardHeader>
                      <CardBody className="p-0">
                        {/* <div> */}
                          <TagField name="symptom" initialValue={["foo", "brazil"]} suggestions={tagifySymptomSuggestion} />
                        {/* </div> */}
                        {/* <Input
                          ref={symptomInputRef}
                          className=""
                          placeholder="직접 입력"
                          style={{ borderWidth: 2 }}
                          value={searchSymptomText}
                          onChange={(e) => handleSearchSymptom(e.target.value)}
                        /> */}
                        <div className="ag-theme-alpine" style={{ height: '12.5vh' }}>
                          <AgGridReact
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
                        <b className="action-title" style={{ marginRight: '-15px' }}>투약사항</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleMedication}/>
                      </CardHeader>
                      <CardBody className="p-0">
                        <Input
                          placeholder="직접 입력"
                          style={{ borderWidth: 2 }}
                          value={searchMedicationText}
                          onChange={(e) => handleSearchMedication(e.target.value)}
                        />
                        <div className="ag-theme-alpine" style={{ height: '12.5vh' }}>
                          <AgGridReact
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
                        <b className="action-title" style={{ marginRight: '-15px' }}>조치사항</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleActionMatter}/>
                      </CardHeader>
                      <CardBody className="p-0">
                        <Input
                          className=""
                          placeholder="직접 입력"
                          style={{ borderWidth: 2 }}
                          value={searchActionMatterText}
                          onChange={(e) => handleSearchActionMatter(e.target.value)}
                        />
                        <div className="ag-theme-alpine" style={{ height: '12.5vh' }}>
                          <AgGridReact
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
                <Row style={{ marginTop: '-13px' }}>
                  <Col md="6" className="pr-0">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title" style={{ marginRight: '-15px' }}>처치사항</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px', cursor: 'pointer' }} onClick={handleTreatmentMatter}/>
                      </CardHeader>
                      <CardBody className="p-0">
                        <Input
                          className=""
                          placeholder="직접 입력"
                          style={{ borderWidth: 2 }}
                          value={searchTreatmentMatterText}
                          onChange={(e) => handleSearchTreatmentMatter(e.target.value)}
                        />
                        <div className="ag-theme-alpine" style={{ height: '12.5vh' }}>
                          <AgGridReact
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
                        <b className="action-title">침상안정</b>
                      </CardHeader>
                      <CardBody className="pt-3 pb-3" style={{ marginTop: '-5px' }}>
                        <Row>
                          <h6><Badge color="secondary" className="ml-2 mt-1" style={{ height: '100%', fontSize: 13 }}>시작시간</Badge></h6>
                          <Input
                            id="onBedRestStartTime"
                            className="ml-2"
                            type="time"
                            style={{ width: '130px', height: '30px' }}
                            onChange={(e) => setCurrentTimeValue(e.target.value)}
                            value={currentTimeValue}
                          />
                          <Button size="sm" className="ml-1 m-0" style={{ height: '30px' }} onClick={setCurrentTime}>현재시간</Button>
                          <h6><Badge color="secondary" className="ml-2 mt-1" style={{ height: '100%', fontSize: 13 }}>종료시간</Badge></h6>
                          <Input
                            id="onBedRestEndTime"
                            className="ml-2"
                            type="time"
                            style={{ width: '130px', height: '30px' }}
                          />
                        </Row>
                      </CardBody>
                    </Card>
                    <Card className="pb-0" style={{ border: '1px solid lightgrey', marginTop: '-8px' }}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title">비고</b>
                      </CardHeader>
                      <CardBody className="pt-3 pb-3" style={{ marginTop: '-5px'}}>
                        <Row className="d-flex justify-content-center">
                          <Input
                          style={{ width: '90%' }}
                          />
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className="d-flex justify-content-center">
                  <Col md="5">
                    <Button className="" onClick={toggle}>전체 보건일지</Button>
                  </Col>
                  <Col md="7" className="d-flex justify-content-left">
                    <Button className="mr-1">등록</Button>
                    <Button>초기화</Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
        </Row>
        <Collapse isOpen={isOpen} {...args}>
          <div className="ag-theme-alpine" style={{ height: '50vh' }}>
            <AgGridReact
              ref={registeredAllGridRef}
              // rowData={rowData} 
              // columnDefs={columnDefs} 
              overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
            />
          </div>
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
              <Col className="justify-content-left no-gutters">
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
              <Col className="justify-content-left no-gutters">
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
          <ModalHeader toggle={toggleActionMatterModal}><b className="text-muted">조치사항 설정</b></ModalHeader>
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
                  overlayNoRowsTemplate={ '<span>등록된 조치사항이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
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
              <Col className="justify-content-left no-gutters">
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
              <Col className="justify-content-left no-gutters">
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
    </>
  );
}

export default WorkNote;

/**
 * 증상, 투약사항 등은 모두 2개 이상 입력하는 가정
 * 두개 이상 입력될 시 구분은 모두 (,) 쉼표로 구분되어야 함
 */