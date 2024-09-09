import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, ButtonGroup, Card, CardHeader, CardBody, CardFooter, CardTitle, FormGroup, Form, Input, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Label, InputGroup, InputGroupText, Popover, PopoverHeader, PopoverBody } from "reactstrap";
import { useUser } from "contexts/UserContext";
import ExcelJS from "exceljs";
import { read, utils } from "xlsx";
import emailjs from "emailjs-com";
import axios from "axios";
import Notiflix from "notiflix";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../assets/css/users.css';
import QRCode from "qrcode-generator";
import { useReactToPrint } from "react-to-print";
import NotiflixWarn from "components/Notiflix/NotiflixWarn";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm";
import { Block } from 'notiflix/build/notiflix-block-aio';
import { IoInformationCircleOutline } from "react-icons/io5";
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';
import moment from "moment";
import 'react-accessible-accordion/dist/fancy-example.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

function User() {
  const { user } = useUser();                                   // 사용자 정보
  const [currentUser, setCurrentUser] = useState(null);         // 받아온 사용자 정보
  const [schoolGrade, setSchoolGrade] = useState(null);         // 학년 정보
  const [gradeData, setGradeData] = useState(null);             // students Table에서 획득한 명렬표 데이터
  const [modalData, setModalData] = useState();                 // 모달에 표시할 데이터를 관리할 상태
  const [isModalOpen, setIsModalOpen] = useState(false);        // 명렬표 등록 상태에 따라 등록 또는 등록된 명렬표 데이터를 출력할 Modal Open 상태 값
  const [commonPasswordSettingModal, setCommonPasswordSettingModal] = useState(false);
  const [emailFormModal, setEmailFormModal] = useState(false);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState(null);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [emailContentValue, setEmailContentValue] = useState("");
  const [isRegisteredStudentsTable, setIsRegisteredStudentsTable] = useState(false);
  const [profileImageFileName, setProfileImageFileName] = useState("");
  const [backgroundImageFileName, setBackgroundImageFileName] = useState("");
  const [commonPassword, setCommonPassword] = useState("");
  const [bedCount, setBedCount] = useState(0);
  const [requestQRcodeModal, setRequestQRcodeModal] = useState(false);
  const [QRCodeImage, setQRCodeImage] = useState('');
  const [requestURLModal, setRequestURLModal] = useState(false);
  const [requestURLValue, setRequestURLValue] = useState("");
  const [passwordSettingModal, setPasswordSettingModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [transferStudentGrade, setTransferStudentGrade] = useState("");
  const [transferStudentClass, setTransferStudentClass] = useState("");
  const [transferStudentGender, setTransferStudentGender] = useState("");
  const [transferStudentName, setTransferStudentName] = useState("");
  const [isRegisteredTeachersTable, setIsRegisteredTeachersTable] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [isTeacherTableModalOpen, setIsTeacherTableModalOpen] = useState(false);
  const [addTeacherModal, setAddTeacherModal] = useState(false);
  const [addTeacherName, setAddTeacherName] = useState("");
  const [addTeacherGrade, setAddTeacherGrade] = useState("");
  const [addTeacherClass, setAddTeacherClass] = useState("");
  const [addTeacherContact, setAddTeacherContact] = useState("");
  const [addTeacherSubject, setAddTeacherSubject] = useState("");
  const [updateTeacherModal, setUpdateTeacherModal] = useState(false);
  const [updateTeacherName, setUpdateTeacherName] = useState("");
  const [updateTeacherGrade, setUpdateTeacherGrade] = useState("");
  const [updateTeacherClass, setUpdateTeacherClass] = useState("");
  const [updateTeacherContact, setUpdateTeacherContact] = useState("");
  const [updateTeacherSubject, setUpdateTeacherSubject] = useState("");
  const [selectedUpdateTeacher, setSelectedUpdateTeacher] = useState(null);
  const [studentTablePopOverOpen, setStudentTablePopOverOpen] = useState(false);
  const [teacherTablePopOverOpen, setTeacherTablePopOverOpen] = useState(false);
  const [migraionExistPlatformModal, setMigrationExistPlatformModal] = useState(false);
  const [synchronizeGradeDataModal, setSynchronizeGradeDataModal] = useState(false);
  const [initialPassword, setInitialPassword] = useState("");
  const [resetPasswordVerified, setResetPasswordVerified] = useState(false);
  const [isRegisteredKWN, setIsRegisteredKWN] = useState(false);
  const [isRegisteredCWN, setIsRegisteredCWN] = useState(false);
  const [isRegisteredSWN, setIsRegisteredSWN] = useState(false);
  const [migrationWorkNoteData, setMigrationWorkNoteData] = useState([]);
  const [migrationWorkNoteModalOpen, setMigrationWorkNoteModalOpen] = useState(false);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [alarmCount, setAlarmCount] = useState(0);

  const studentTableGridRef = useRef(null);     
  const teacherTableGridRef = useRef(null);                                // 등록한 명렬표 출력 Grid Reference
  const migrationWorkNoteGridRef = useRef(null);
  const emailForm = useRef();

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  const visitDateTimeFormatter = (params) => {
    if(!params.value) return '';
    const date = moment(params.value);
    const formattedDate = date.format('YYYY-MM-DD');
    const formattedTime = date.format('A h시 mm분').replace('AM', '오전').replace('PM', '오후');
    return `${formattedDate} ${formattedTime}`;
  };

  // 등록한 명렬표 출력 Grid Column 정의
  const [ntColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }}
  ]);

  const [ttColumnDefs] = useState([
    { field: "tName", headerName: "이름", flex: 1.5, cellStyle: { textAlign: "center" }},
    { field: "tGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "tClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "tSubject", headerName: "과목", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "tPhone", headerName: "연락처", flex: 2, cellStyle: { textAlign: "center" }}
  ]);

  const [migrationWorkNoteColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 0.7, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 0.7, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 0.7, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치 및 교육사항", flex: 2, cellStyle: { textAlign: "center" }},
    { field: "visitDateTime", headerName: "방문일자", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: visitDateTimeFormatter}
  ]);

  // 등록한 명렬표 중 학년 선택 시 명렬표 미리보기 Model Open Handle Event
  const toggleModal = () => { setIsModalOpen(!isModalOpen); };
  const toggleCommonPasswordSettingModal = () => setCommonPasswordSettingModal(!commonPasswordSettingModal); 
  const togglePasswordSettingModal = () => setPasswordSettingModal(!passwordSettingModal);
  const toggleTeacherTableModal = () => setIsTeacherTableModalOpen(!isTeacherTableModalOpen);
  const toggleEmailFormModal = () => setEmailFormModal(!emailFormModal); 
  const toggleAddTeacherModal = () => setAddTeacherModal(!addTeacherModal);
  const toggleUpdateTeacherModal = () => setUpdateTeacherModal(!updateTeacherModal);
  const toggleMigraionExistPlatformModal = () => setMigrationExistPlatformModal(!migraionExistPlatformModal);
  const toggleSynchronizeGradeDataModal = () => setSynchronizeGradeDataModal(!synchronizeGradeDataModal);
  const toggleStudentTablePopOver = () => { setStudentTablePopOverOpen(!studentTablePopOverOpen); };
  const toggleTeacherTablePopOver = () => { setTeacherTablePopOverOpen(!teacherTablePopOverOpen); };
  const toggleMigrationWorkNoteModal = () => { setMigrationWorkNoteModalOpen(!migrationWorkNoteModalOpen); };
  const toggleAddStudentModal = () => {
    setIsAddStudentModalOpen(!isAddStudentModalOpen);
    resetTransferStudent();
  };
  const toggleRequestQRcodeModal = () => {
    setRequestQRcodeModal(!requestQRcodeModal);
    if(!requestQRcodeModal) generateQRCode();
  };
  const toggleRequestURLModal = () => {
    setRequestURLModal(!requestURLModal);
    const requestURL = `${BASE_URL}/meorla/request/` + user.schoolCode;
    setRequestURLValue(requestURL);
  };

  const fetchUserData = useCallback(async () => {
    try {
      if(user) {
        setCurrentUser(user);                           // 전역 변수에 현재 사용자 정보 할당
        setSchoolGrade(user.schoolName);                // 소속 학교(초, 중, 고)별 학년 수만큼 Button 생성 위한 소속 학교명 전역변수 할당
        setCommonPassword(user.commonPassword);
        setBedCount(user.bedCount);
      }
    } catch(error) {
      console.log(error)
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if(currentUser) {                                         // 현재 사용자 정보 존재할 경우
      const fetchGradeData = async () => {                    // 명렬표 미리보기 표시 위한 학년별 등록 학생 정보 조회
        try {
          const response = await axios.get(`${BASE_URL}/api/studentsTable/getStudentInfo`, {
            params: {
              userId: user.userId,                            // 사용자 ID
              schoolCode: user.schoolCode                     // 소속 학교 코드
            }
          });

          setGradeData(response.data.studentData);            // 조회 결과(학년별 등록 학생 정보) 전역변수에 할당
        } catch (error) {
          console.log("명렬표 데이터 조회 중 ERROR", error);
        }
      };
      
      fetchGradeData();                                       // 명렬표 미리보기 조회 Function 호출
    }
  }, [currentUser, user, isRegisteredStudentsTable]);

  // useEffect(() => {
  //   if(currentUser) {
  //     const fetchTeacherData = async () => {
  //       try {
  //         const response = await axios.get(`${BASE_URL}/api/teachersTable/getTeacherInfo`, {
  //           params: {
  //             userId: user.userId,
  //             schoolCode: user.schoolCode
  //           }
  //         });

  //         if(response.data) {
  //           setTeacherData(response.data.teacherData);
  //         }
  //       } catch (error) {
  //         console.log("교직원 데이터 조회 중 ERROR", error);
  //       }
  //     };

  //     fetchTeacherData();
  //   }
  // }, [currentUser, user, isRegisteredTeachersTable]);

  const fetchTeacherData = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/teachersTable/getTeacherInfo`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        setTeacherData(response.data.teacherData);
        setIsRegisteredTeachersTable(response.data.teacherData.length > 0);
      }
    } catch (error) {
      console.log("교직원 데이터 조회 중 ERROR", error);
    }
  }, [currentUser, user, isRegisteredTeachersTable]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData])

  // 소속학교 기준 명렬표 학년별 등록 및 확인 Button 생성
  const generateNameTableButtons = () => {
    const buttonCount = schoolGrade && schoolGrade.includes("초등학교") ? 6 : 3;                                   // 초등학교: 6, 중,고등학교: 3 으로 Button 수 정의

    return Array.from({ length: buttonCount }, (_, index) => {                                                    // 생성할 Button 수만큼 순회
      const currentGrade = index + 1;                                                                             // 학년 수
      const hasDataForCurrentGrade = gradeData && gradeData.some((data) => Number(data.sGrade) === currentGrade); // students Table에서 학년 별 데이터 유무 조회 확인 (True/False)

      return (
        <Button
          key={currentGrade}                                                                                      // key 값으로 Button에 해당하는 학년
          className={hasDataForCurrentGrade ? "registered-name-table mr-1" : "btn-outline-default name-table-default"}                       // margin 없으면 Button이 다 붙어서 View가 이상 -> mr-1 설정
          onClick={onClickNameTable}                                                                      // 학년별 Button Click Event
          style={{ border: hasDataForCurrentGrade ? 'none' : '' }}
        >
          {currentGrade}                                                                    
        </Button>
      );
    });
  };

  // 학년별 Button Click Event
  const onClickNameTable = async (e) => {
    const targetGrade = e.target.innerText;   // 현재 선택한 학년
    fetchStudentInfoByGrade(targetGrade);
  };

  const fetchStudentInfoByGrade = async (targetGrade) => {
    try {
      // 선택한 학년에 따른 등록한 학생 정보 조회
      const response = await axios.get(`${BASE_URL}/api/studentsTable/getStudentInfoByGrade`, {
        params: {
          userId: user.userId,                            // 사용자 ID
          schoolCode: user.schoolCode,                    // 소속 학교 코드
          sGrade: targetGrade                             // 선택한 학년
        }
      });

      const studentData = response.data.studentData;      // 조회 결과 학생 데이터
      if(studentData.length > 0) {                        // 조회 결과 존재할 경우
        setModalData(studentData);                        // 등록된 명렬표 미리보기 데이터에 할당
        setIsModalOpen(true);                             // Modal Open
      }else{
        onStudentBulkRegist();                                   // 등록된 학생 정보 없을 경우 등록 Function 호출
      }
    } catch (error) {
      console.log("학년별 명렬표 데이터 조회 중 ERROR", error);
    }
  };
  
  // 명렬표 Upload 위해 템플릿(Excel 형식) 다운로드 Function
  const handleDownloadStudentTemplate = async () => {
    const workbook = new ExcelJS.Workbook();                        // workbook 생성
    const worksheet = workbook.addWorksheet("Sheet1");              // worksheet 생성

    const data = [["학년", "반", "번호", "성별", "이름"]];            // 위 worksheet에 입력할 데이터 (컬럼)

    worksheet.addRows(data);                                        // 생성한 Row 추가

    const headerRow = worksheet.getRow(1);                          // Header Row 획득
    headerRow.eachCell((cell) => {                                  // 템플릿 style 설정
      cell.fill = {
        type: "pattern",
        pattern: 'solid',
        fgColor: { argb: "C0C0C0"}
      };
      cell.border = {                                               // Cell Border 적용
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      
      cell.alignment = { horizontal: "center", vertical: "middle" };  // 중앙 정렬 적용
    });

    const buffer = await workbook.xlsx.writeBuffer();   // buffer 쓰기 처리 (파일로 쓰기)
    const blob = new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const fileName = "명렬표 템플릿.xlsx";                  // 다운로드할 파일 이름 설정

    const link = document.createElement("a");           // 다울로드할 수 있는 a 요소 획득
    link.href = window.URL.createObjectURL(blob);       // a 태그의 href 설정
    link.download = fileName;                           // 선택한 파일의 다운로드는 fileName으로 설정
    document.body.appendChild(link);                    // 위에서 생성한 link 추가
    link.click();                                       // link 강제 Click
    document.body.removeChild(link);                    // 필요없는 link 삭제 
  };

  const handleDownloadTeacherTemplate = async () => {
    const workbook = new ExcelJS.Workbook();                        // workbook 생성
    const worksheet = workbook.addWorksheet("Sheet1");              // worksheet 생성

    const data = [["이름", "학년", "반", "교과목", "연락처"]];            // 위 worksheet에 입력할 데이터 (컬럼)

    worksheet.addRows(data);                                        // 생성한 Row 추가

    const headerRow = worksheet.getRow(1);                          // Header Row 획득
    headerRow.eachCell((cell) => {                                  // 템플릿 style 설정
      cell.fill = {
        type: "pattern",
        pattern: 'solid',
        fgColor: { argb: "C0C0C0"}
      };
      cell.border = {                                               // Cell Border 적용
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      
      cell.alignment = { horizontal: "center", vertical: "middle" };  // 중앙 정렬 적용
    });

    worksheet.getColumn(5).numFmt = '@';                // 연락처 컬럼 텍스트 형식 지정

    const buffer = await workbook.xlsx.writeBuffer();   // buffer 쓰기 처리 (파일로 쓰기)
    const blob = new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const fileName = "교직원 템플릿.xlsx";                  // 다운로드할 파일 이름 설정

    const link = document.createElement("a");           // 다울로드할 수 있는 a 요소 획득
    link.href = window.URL.createObjectURL(blob);       // a 태그의 href 설정
    link.download = fileName;                           // 선택한 파일의 다운로드는 fileName으로 설정
    document.body.appendChild(link);                    // 위에서 생성한 link 추가
    link.click();                                       // link 강제 Click
    document.body.removeChild(link);                    // 필요없는 link 삭제 
  };
  
  // 명렬표 파일 Change Event ([필요] handleBulkRegist Function과 중복으로 존재할 필요 있는지 확인)
  const handleStudentFileChange = (event) => {
    const file = event.target.files[0];   // 파일 획득
    handleStudentBulkRegist(file);        // 명렬표 등록 Event 호출
  };

  // Default 파일 첨부 버튼 외 Custom 버튼으로 사용하기 위해 별도 태그 처리
  const onStudentBulkRegist = () => {
    const fileInput = document.createElement("input");        // 파일 Input 생성
    fileInput.type = "file";                                  // Input type 설정
    fileInput.accept = ".xlsx,.xls";                          // 첨부 가능 확장자 설정
    fileInput.addEventListener("change", handleStudentFileChange);   // change Event 속성 설정
    fileInput.click();                                        // 파일 첨부 강제 Click
  };

  // 명렬표 일괄등록 버튼 Click Event
  const handleStudentBulkRegist = (selectedFile) => {
    if(selectedFile) {  // 업로드할 파일 존재할 경우
      Notiflix.Confirm.show('명렬표 일괄 등록', '선택하신 파일로 명렬표를 등록하시겠습니까?', '예', '아니요', () => {
        const reader = new FileReader();        // File Reader 객체 획득
        reader.onload = (e) => {                // 학생 정보 DB Insert 시 async(비동기) 사용할 경우 onload에 사용하기 부적합 (Function으로 분리 호출)
          handleStudentExcelUpload(e);                 // 명렬표(Excel 파일) Upload Function 호출
        };
        reader.readAsArrayBuffer(selectedFile); // 파일 읽음
      },() => {
        return;                                 // return
      },{
        position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '330px'
      });
    }
  };

  const handleTeacherFileChange = (event) => {
    const file = event.target.files[0];   // 파일 획득
    handleTeacherBulkRegist(file);                   // 명렬표 등록 Event 호출
  };

  const onTeacherBulkRegist = () => {
    const fileInput = document.createElement("input");        // 파일 Input 생성
    fileInput.type = "file";                                  // Input type 설정
    fileInput.accept = ".xlsx,.xls";                          // 첨부 가능 확장자 설정
    fileInput.addEventListener("change", handleTeacherFileChange);   // change Event 속성 설정
    fileInput.click();                                        // 파일 첨부 강제 Click
  };

  const handleTeacherBulkRegist = (selectedFile) => {
    if(selectedFile) {  // 업로드할 파일 존재할 경우
      Notiflix.Confirm.show('교직원 일괄 등록', '선택하신 파일로 교직원 목록을 등록하시겠습니까?', '예', '아니요', () => {
        const reader = new FileReader();        // File Reader 객체 획득
        reader.onload = (e) => {                // 학생 정보 DB Insert 시 async(비동기) 사용할 경우 onload에 사용하기 부적합 (Function으로 분리 호출)
          handleTeacherExcelUpload(e);                 // 명렬표(Excel 파일) Upload Function 호출
        };
        reader.readAsArrayBuffer(selectedFile); // 파일 읽음
      },() => {
        return;                                 // return
      },{
        position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '330px'
      });
    }
  };

  // 명렬표 파일 선택 시 Upload & DB Insert API 호출
  const handleStudentExcelUpload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);                     // 파일 Data 획득
      const workbook = read(data, { type: "array" });                   // array type으로 workbook 획득
      const sheetName = workbook.SheetNames[0];                         // sheet명 획득
      const workSheet = workbook.Sheets[sheetName];                     // sheet명으로 필요 sheet 획득
      const sheetData = utils.sheet_to_json(workSheet, { header: 1 });  // sheet 내 데이터 획득 (header: 1 -> 첫쨰 줄을 header로 사용하겠다는 의미)

      const studentsArray = [];

      for(let i = 1; i < sheetData.length; i++) {                       // 명렬표 데이터 획득 위해 순회
        const studentData = sheetData[i];                               // 명렬표 Sheet 데이터 획득
        const sGrade = studentData[0];                                  // 학년 획득
        const sClass = studentData[1];                                  // 반 획득
        const sNumber = studentData[2];                                 // 번호 획득
        const sGender = studentData[3];                                 // 성별 획득
        const sName = studentData[4];                                   // 이름 획득

        studentsArray.push({
          userId: user.userId,
          schoolName: user.schoolName,
          schoolCode: user.schoolCode,
          sGrade,
          sClass,
          sNumber,
          sGender,
          sName
        });
      }

      const response = await axios.post(`${BASE_URL}/api/studentsTable/insert`, { studentsArray });

      if(response.data === "success") {
        const infoMessage = "명렬표 정보가 정상적으로 등록되었습니다";
        NotiflixInfo(infoMessage);

        setIsRegisteredStudentsTable(true);
      }
    }catch(error) {
      console.log("Excel 파일 읽기 중 ERROR", error);
    }
  };

  const handleTeacherExcelUpload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const workSheet = workbook.Sheets[sheetName];
    const sheetData = utils.sheet_to_json(workSheet, { header: 1 });

    const teachersArray = [];

    for(let i = 1; i < sheetData.length; i++) {
      const teacherData = sheetData[i];
      const teacherName = teacherData[0];
      const teacherGrade = teacherData[1];
      const teacherClass = teacherData[2];
      const teacherSubject = teacherData[3];
      const teacherPhone = teacherData[4];

      teachersArray.push({
        userId: user.userId,
        schoolName: user.schoolName,
        schoolCode: user.schoolCode,
        teacherName,
        teacherGrade,
        teacherClass,
        teacherSubject,
        teacherPhone
      });
    }

    const response = await axios.post(`${BASE_URL}/api/teachersTable/insert`, { teachersArray });

    if(response.data === 'success') {
      const infoMessage = "교직원 정보가 정상적으로 등록되었습니다";
      NotiflixInfo(infoMessage);

      setIsRegisteredTeachersTable(true);
    }
  };

  const handleCommonPasswordSettingModal = (e) => {
    e.preventDefault();
    fetchCommonPasswordData();
    toggleCommonPasswordSettingModal();
  };

  const handlePasswordSettingModal = (e) => {
    e.preventDefault();
    togglePasswordSettingModal();
    setShowVerification(false);
    setVerificationCode("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setInitialPassword("");
  };

  const saveCommonPassword = async (e) => {
    e.preventDefault();
    
    const updatedCommonPassword = document.getElementById('updatedCommonPassword').value;
    if(updatedCommonPassword.length === 0) {
      Notiflix.Notify.info('변경할 공통 비밀번호를 입력해 주세요', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '300px'
      });
    }else{
      const response = await axios.post(`${BASE_URL}/api/user/updateCommonPassword`, {
        userId: currentUser.userId,
        schoolCode: currentUser.schoolCode,
        updatedPassword: updatedCommonPassword
      });
      
      if(response.data === "success") {
        setCommonPassword(updatedCommonPassword);
        Notiflix.Notify.success('공통 비밀번호가 변경되었습니다.', {
          position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '300px'
        });

        toggleCommonPasswordSettingModal();
      }else{
        Notiflix.Notify.failure('공통 비밀번호 변경에 실패하였습니다.<br/>관리자에게 문의해주세요.', {
          position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '300px'
        });
      }
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const savePassword = async () => {
    if(newPassword !== confirmPassword) {
      const warnMessage = "새 비밀번호와 확인 비밀번호가 일치하지 않습니다";
      NotiflixWarn(warnMessage, '350px');
    } else if(!validatePassword(newPassword)) {
      const warnMessage = "비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다";
      NotiflixWarn(warnMessage);
      return;
    }else{
      const response = await axios.post(`${BASE_URL}/api/user/changePassword`, {
        userId: user.userId,
        schoolCode: user.schoolCode,
        oldPassword: currentPassword,
        newPassword: newPassword
      });

      if(response.data) {
        if(response.data === 'NMCP') {
          const warnMessage = "현재 비밀번호가 일치하지 않습니다";
          NotiflixWarn(warnMessage);
        }else if(response.data === 'NFU') {
          const warnMessage = "사용자를 찾을 수 없습니다";
          NotiflixWarn(warnMessage);
        } else if(response.data === 'success') {
          // api 처리하고 메시지 출력하는것부터 처리
          const infoMessage = "비밀번호가 정상적으로 변경되었습니다";
          NotiflixInfo(infoMessage);
          togglePasswordSettingModal();
        }
      }
    }
  };

  const handleRegistBackgroundImage = (e) => {
    Notiflix.Confirm.show('프로필 배경 이미지 등록', '선택하신 이미지를 프로필 배경 이미지로 등록하시겠습니까?', '예', '아니요', () => {
      const file = e.target.files[0];
      if(file) {
        let formData = new FormData();
        const config = {
          headers: { "Content-type": "multipart/form-data" }
        };

        formData.append("uploadPath", currentUser.userId + "/backgroundImage");
        formData.append("file", file);

        axios.post(`${BASE_URL}/upload/image`, formData, config).then((response) => {
          if(response.status === 200) {
            const fileName = response.data.filename;
            const callbackResponse = axios.post(`${BASE_URL}/api/upload/insert`, {
              userId: currentUser.userId,
              schoolCode: currentUser.schoolCode,
              category: "background",
              fileName: fileName
            });

            if(callbackResponse.data === "success") {
              fetchBackgroundImage(fileName);
            }
          }else{
            console.log("Background Image 등록 중 ERROR");
          }
        });
      }
    }, () => {
      return;
    },{
      position: 'center-center', showOnlyTheLastOne: true, plainText: false
    });
  };

  const handleRegistProfileIamge = (e) => {
    Notiflix.Confirm.show('프로필 이미지 등록', '선택하신 이미지를 프로필 이미지로 등록하시겠습니까?', '예', '아니요', () => {
      const file = e.target.files[0];
      if(file) {
        let formData = new FormData();
        const config = {
          headers: { "Content-type": "multipart/form-data" }
        };

        formData.append("uploadPath", currentUser.userId + "/profileImage");
        formData.append("file", file);

        axios.post(`${BASE_URL}/upload/image`, formData, config).then((response) => {
          if(response.status === 200) {
            const fileName = response.data.filename;
            const callbackResponse = axios.post(`${BASE_URL}/api/upload/insert`, {
              userId: currentUser.userId,
              schoolCode: currentUser.schoolCode,
              category: "profile",
              fileName: fileName
            });

            if(callbackResponse.data === "success") {
              fetchProfileImage(fileName);
            }
          }else{
            console.log("Profile Image 등록 중 ERROR");
          }
        });
      }
    }, () => {
      return;
    },{
      position: 'center-center', showOnlyTheLastOne: true, plainText: false
    });
  };

  useEffect(() => {
    if(currentUser) {
      const fetchUploadFileData = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/upload/getFileName`, {
            params: {
              userId: user.userId,
              schoolCode: user.schoolCode
            }
          });

          if(response.data.length > 0) {
            for(let i = 0; i < response.data.length; i++) {
              if(response.data[i].category === "profile") {
                const profileFileName = response.data[i].fileName;
                setProfileImageFileName(profileFileName);
              }else if(response.data[i].category === "background") {
                const backgroundFileName = response.data[i].fileName;
                setBackgroundImageFileName(backgroundFileName);
              }
            }
          }

        }catch (error) {
          console.log("Upload File 조회 중 ERROR", error);
        }
      };

      fetchUploadFileData();
    }
  }, [user?.userId, user?.schoolCode, currentUser]);

  const fetchProfileImage = useCallback(async (registeredProfileImageFileName) => {
    if(registeredProfileImageFileName) setProfileImageFileName(registeredProfileImageFileName);
    if(profileImageFileName && currentUser) {
      setSelectedProfileImage(`/uploads/${currentUser.userId}/profileImage/${profileImageFileName}`);
    }else{
      setSelectedProfileImage(null);
    }
  }, [profileImageFileName, currentUser]);

  const fetchBackgroundImage = useCallback(async (registeredBackgroundImageFileName) => {
    if(registeredBackgroundImageFileName) setBackgroundImageFileName(registeredBackgroundImageFileName);
    if(backgroundImageFileName && currentUser) {
      setSelectedBackgroundImage(`${process.env.PUBLIC_URL}/uploads/${currentUser.userId}/backgroundImage/${backgroundImageFileName}`);
    }else{
      setSelectedBackgroundImage(null);
    }
  }, [backgroundImageFileName, currentUser]);

  useEffect(() => {
    fetchProfileImage();
    fetchBackgroundImage();
  }, [fetchProfileImage, fetchBackgroundImage]);

  const handleEmailForm = (e) => {
    e.preventDefault();
    toggleEmailFormModal();
  };

  const sendEmailForm = (e) => {
    e.preventDefault();

    Notiflix.Confirm.show('관리자 문의 및 요청', '작성하신 메일을 전송하시겠습니까?', '예', '아니요', () => {
      emailjs.sendForm('MEDIWORKS', 'MEDIWORKS_EMAIL_FORM', emailForm.current, 'QHBZ4RAaEvf0ER6vx')
        .then(() => {
          console.log("emailJS 사용 - 문의 메일 전송 성공");
        }, (error) => {
          console.log("emailJS 사용 문의메일 전송 중 ERROR", error);
      });

      toggleEmailFormModal();
    }, () => {
      return;
    },{
      position: 'center-center', showOnlyTheLastOne: true, plainText: false
    });
  };

  const fetchCommonPasswordData = useCallback(async () => {
    if(user?.userId && user?.schoolCode) {
      const response = await axios.get(`${BASE_URL}/api/user/getCommonPassword`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const commonPassword = response.data[0].commonPassword;
        setCommonPassword(commonPassword);
      }
    }
  }, [user]);

  const updateUserInfo = async (e) => {
    e.preventDefault();
    
    const updateUserName = document.getElementById("userNameInfo").value;
    const updateUserEmail = document.getElementById("userEmailInfo").value;
    const updateBedCount = Number(document.getElementById("bedCountInfo").value);

    Notiflix.Confirm.show('사용자 정보 수정', '입력하신 내용과 같이 사용자 정보를 수정하시겠습니까?', '예', '아니요', async () => {
      if(user?.userId && user?.schoolCode) {
        const response = await axios.post(`${BASE_URL}/api/user/updateUserInfo`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          userName: updateUserName,
          userEmail: updateUserEmail,
          bedCount: updateBedCount
        });

        if(response.data === "success") {
          setCurrentUser(prevUserInfo => ({
            ...prevUserInfo,
            userName: updateUserName,
            userEmail: updateUserEmail,
            bedCount: updateBedCount
          }));

          Notiflix.Notify.info('사용자 정보가 정상적으로 수정되었습니다.', {
            position: 'center-center', showOnlyTheLastOne: true, plainText: false
          });
        }
      }
    }, () => {
      return;
    }, {
      position: 'center-center', showOnlyTheLastOne: true, plainText: false
    });
  };

  const generateQRCode = () => {
    const url = `${BASE_URL}/meorla/request/` + user.schoolCode;
    const typeNumber = 10;
    const errorCorrectionLevel = 'L';

    const qr = QRCode(typeNumber, errorCorrectionLevel);
    qr.addData(url);
    qr.make();

    const img = qr.createImgTag(3);
    setQRCodeImage(img);
  };

  const printComponentRef = useRef();

  const onPrintQRCode = (e) => {
    e.preventDefault();
    handlePrint();
  };

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: '보건실 방문요청 QR코드'
  });

  const clipboardRequestURL = () => {
    const URLText = document.getElementById("requestURL").value;
    // clipboard 기능은 보안상의 이유로 https에서만 지원 -> https로 전환 시 에러 사라질 가능성 높음 (현재는 로컬에서 에러 발생하지 않음)
    navigator.clipboard.writeText(URLText);
    Notiflix.Notify.success('보건실 사용 요청 URL이 클립보드에 복사되었습니다.', {
      position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '300px'
    });
  };

  const sendVerificationCode = async () => {
    Block.dots('.passwordSettingModal', '인증코드 메일 발송중');

    try {
      const response = await axios.post(`${BASE_URL}/api/send-password-reset-code`, { 
        email: currentUser.email 
      });
  
      if (response.data.success) {
        setEmailCode(response.data.verificationCode);
        setTimeLeft(180);
        setShowVerification(true);
        startTimer();

        Block.remove('.passwordSettingModal');
      } else {
        const warnMessage = "인증코드 전송에 실패했습니다<br/>다시 시도해 주세요";
        NotiflixWarn(warnMessage);
      }
    } catch (error) {
      console.log("비밀번호 초기화 인증코드 전송 중 ERROR", error);
    }finally{
      Block.remove('.passwordSettingModal');
    }
  };
  
  const startTimer = () => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  const handleVerifyCode = () => {
    if(verificationCode.length === 0) {
      const warnMessage = "인증코드를 입력해주세요";
      NotiflixWarn(warnMessage);
      return;
    }else{
      if(verificationCode === emailCode) {
        const infoMessage = "정상적으로 인증되었습니다";
        NotiflixInfo(infoMessage);
        setResetPasswordVerified(true);
      }else{
        const warnMessage = "인증코드가 일치하지 않습니다";
        NotiflixWarn(warnMessage);
        return;
      }
    }
  };

  const saveResetPassword = () => {
    if(initialPassword.length === 0) {
      const warnMessage = "초기화할 비밀번호를 입력해주세요";
      NotiflixWarn(warnMessage);
      return;
    }else if(!validatePassword(initialPassword)) {
      const warnMessage = "비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다";
      NotiflixWarn(warnMessage);
      return;
    }else{
      axios.post(`${BASE_URL}/api/reset-password`, { userId: user.userId, newPassword: initialPassword })
        .then((response) => {
          if (response.data === 'success') {
            const infoMessage = "비밀번호가 초기화 되었습니다";
            NotiflixInfo(infoMessage);
            togglePasswordSettingModal();
          } else {
            const warnMessage = "비밀번호 초기화에 실패하였습니다";
            NotiflixWarn(warnMessage);
          }
        })
        .catch((error) => {
          console.log("비밀번호 초기화 중 ERROR", error);
          const warnMessage = "비밀번호 초기화 중 문제가 발생하였습니다<br/>관리자에게 문의해 주세요";
          NotiflixWarn(warnMessage);
      });
    }
  };

  const resetPassword = async () => {
    const confirmTitle = "비밀번호 초기화";
    const confirmMessage = "가입하신 이메일로 인증 후 초기화 하실수 있습니다<br/>초기화 하시겠습니까?";

    const yesCallback = async () => {
      await sendVerificationCode();
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '330px');
  };

  const addStudent = () => {
    toggleAddStudentModal();
  };

  const deleteStudent = async () => {
    const selectedRow = studentTableGridRef.current.api.getSelectedRows()[0];

    if(selectedRow) {
      const response = await axios.post(`${BASE_URL}/api/studentsTable/deleteStudentInfo`, {
        rowId: selectedRow.id,
        userId: user.userId,
        schoolCode: user.schoolCode,
        sGrade: selectedRow.sGrade,
        sClass: selectedRow.sClass,
        sNumber: selectedRow.sNumber,
        sGender: selectedRow.sGender,
        sName: selectedRow.sName
      });

      if(response.data === 'success') {
        const infoMessage = "학생이 명렬표에서 정상적으로 삭제되었습니다";
        NotiflixInfo(infoMessage, true, '330px');
        // 명렬표 새로 fetch 받는 로직 필요
      }
    }else{
      const warnMessage = "선택된 행이 없습니다<br/>삭제할 행을 선택해주세요";
      NotiflixWarn(warnMessage);
      return;
    }
  };

  const saveTransferStudent = async () => {
    if(transferStudentGrade && transferStudentClass && transferStudentGender && transferStudentName) {
      const response = await axios.post(`${BASE_URL}/api/studentsTable/addTransferStudent`, {
        userId: user.userId,
        schoolName: user.schoolName,
        schoolCode: user.schoolCode,
        sGrade: transferStudentGrade,
        sClass: transferStudentClass,
        sGender: transferStudentGender,
        sName: transferStudentName
      });

      if(response.data === 'success') {
        const infoMessage = "전학학생이 정상적으로 등록되었습니다";
        NotiflixInfo(infoMessage);
        fetchStudentInfoByGrade(transferStudentGrade);
        toggleAddStudentModal();
        resetTransferStudent();
      }
    }else{
      const warnMessage = "모든 항목을 입력해주세요";
      NotiflixWarn(warnMessage);
      return;
    }
  };

  const resetTransferStudent = () => {
    setTransferStudentGrade("");
    setTransferStudentClass("");
    setTransferStudentGender("");
    setTransferStudentName("");
  };

  const handleTeacherTable = () => {
    if(teacherData.length > 0) {    // 교직원 정보 등록되어 있는 경우
      toggleTeacherTableModal();
    }else{                          // 교직원 정보 등록되어 있지 않은 경우
      onTeacherBulkRegist();
    }
  };

  const addTeacher = () => {
    toggleAddTeacherModal();
  };

  const updateTeacher = () => {
    const selectedRow = teacherTableGridRef.current.api.getSelectedRows()[0];
    
    if(selectedRow) {
      setSelectedUpdateTeacher(selectedRow);
      setUpdateTeacherName(selectedRow.tName);
      setUpdateTeacherGrade(selectedRow.tGrade);
      setUpdateTeacherClass(selectedRow.tClass);
      setUpdateTeacherSubject(selectedRow.tSubject);
      setUpdateTeacherContact(selectedRow.tPhone);
      toggleUpdateTeacherModal();
    }else{
      const warnMessage = "선택된 교직원이 없습니다<br/>수정할 교직원을 선택해 주세요";
      NotiflixWarn(warnMessage);
      return;
    }
  };

  const deleteTeacher = () => {
    const selectedRow = teacherTableGridRef.current.api.getSelectedRows()[0];

    if(selectedRow) {
      const confirmTitle = "교직원 삭제";
      const confirmMessage = selectedRow.tName + " 교직원을 삭제하시겠습니까?";
      
      const yesCallback = async () => {
        const response = await axios.post(`${BASE_URL}/api/teachersTable/deleteTeacher`, {
          rowId: selectedRow.id,
          userId: user.userId,
          schoolCode: user.schoolCode
        });

        if(response.data === 'success') {
          const infoMessage = "교직원이 정상적으로 삭제되었습니다";
          NotiflixInfo(infoMessage);
          fetchTeacherData();
        }
      };
      
      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '300px');
    }else{
      const warnMessage = "선택된 교직원이 없습니다<br/>삭제할 교직원을 선택해 주세요";
      NotiflixWarn(warnMessage);
      return;
    }
  };

  const saveTeacher = async () => {
    if(addTeacherName) {
      const response = await axios.post(`${BASE_URL}/api/teachersTable/addTeacher`, {
        userId: user.userId,
        schoolName: user.schoolName,
        schoolCode: user.schoolCode,
        tName: addTeacherName,
        tGrade: addTeacherGrade,
        tClass: addTeacherClass,
        tSubject: addTeacherSubject,
        tPhone:addTeacherContact
      });

      if(response.data === 'success') {
        const infoMessage = "교직원 정보가 정상적으로 등록되었습니다";
        NotiflixInfo(infoMessage);
        fetchTeacherData();
        resetAddTeacher();
      }
    }else{
      const warnMessage = "교직원 이름은 필수 입력 사항입니다";
      NotiflixWarn(warnMessage);
    }
  };

  const resetAddTeacher = () => {
    setAddTeacherName("");
    setAddTeacherGrade("");
    setAddTeacherClass("");
    setAddTeacherSubject("");
    setAddTeacherContact("");
  };

  const resetUpdateTeacher = () => {
    setUpdateTeacherName("");
    setUpdateTeacherGrade("");
    setUpdateTeacherClass("");
    setUpdateTeacherSubject("");
    setUpdateTeacherContact("");
  };

  const saveUpdateTeacher = async () => {
    if(selectedUpdateTeacher) {
      const response = await axios.post(`${BASE_URL}/api/teachersTable/updateTeacher`, {
        rowId: selectedUpdateTeacher.id,
        userId: user.userId,
        schoolCode: user.schoolCode,
        tName: updateTeacherName,
        tGrade: updateTeacherGrade,
        tClass: updateTeacherClass,
        tSubject: updateTeacherSubject,
        tPhone: updateTeacherContact
      });
  
      if(response.data === 'success') {
        const infoMessage = "교직원 정보가 정상적으로 수정되었습니다";
        NotiflixInfo(infoMessage);
        toggleUpdateTeacherModal();
        fetchTeacherData();
        resetUpdateTeacher();
      }
    }
  };

  // 데이터 연관성 때문에 학생관련하여 등록된 데이터가 존재할 시에는 일괄삭제 막음 처리 필요할 듯
  const onStudentBulkDelete = async () => {
    const confirmTitle = "명렬표 일괄 삭제";
    const confirmMessage = "등록한 명렬표를 일괄삭제 하시겠습니까?";

    const yesCallback = async () => {
      const response = await axios.post(`${BASE_URL}/api/studentsTable/deleteAllStudentTable`, {
        userId: user.userId,
        schoolCode: user.schoolCode
      });

      if(response.data === 'success') {
        const infoMessage = "학생 정보가 정상적으로 일괄삭제 되었습니다";
        NotiflixInfo(infoMessage, true, '320px');
        setIsRegisteredStudentsTable(false);
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
  };

  const onTeacherBulkDelete = async () => {
    const confirmTitle = "교직원 명단 일괄 삭제";
    const confirmMessage = "등록한 교직원 명단을 일괄삭제 하시겠습니까?";

    const yesCallback = async () => {
      const response = await axios.post(`${BASE_URL}/api/teachersTable/deleteAllTeachersTable`, {
        userId: user.userId,
        schoolCode: user.schoolCode
      });

      if(response.data === 'success') {
        const infoMessage = "교직원 정보가 정상적으로 일괄삭제 되었습니다";
        NotiflixInfo(infoMessage, true, '320px');
        setIsRegisteredTeachersTable(false);
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
  };

  const handleMigrationExistPlatform = () => {
    toggleMigraionExistPlatformModal();
  };

  const handleSynchronizeGradeData = () => {
    toggleSynchronizeGradeDataModal();
  };

  const handleMigrationKWN = () => {
    if(isRegisteredKWN) {
      toggleMigrationWorkNoteModal();
    }else{
      onKWNBulkRegist();
    }
  };

  const onKWNBulkRegist = () => {
    const fileInput = document.createElement("input");            // 파일 Input 생성
    fileInput.type = "file";                                      // Input type 설정
    fileInput.accept = ".xlsx,.xls";                              // 첨부 가능 확장자 설정
    fileInput.addEventListener("change", handleKWNFileChange);    // change Event 속성 설정
    fileInput.click();                                            // 파일 첨부 강제 Click
  };

  const handleKWNFileChange = (event) => {
    const file = event.target.files[0];   // 파일 획득
    handleKWNBulkRegist(file);        // 규OOO 보건일지 등록 Event 호출
  };

  const handleKWNBulkRegist = (selectedFile) => {
    if(selectedFile) {  // 업로드할 파일 존재할 경우
      Notiflix.Confirm.show('규OOO 보건일지 이관 등록', '선택하신 파일로 보건일지 이관을 진행하시겠습니까?', '예', '아니요', () => {
        const reader = new FileReader();        // File Reader 객체 획득
        reader.onload = (e) => {                // 보건일지 DB Insert 시 async(비동기) 사용할 경우 onload에 사용하기 부적합 (Function으로 분리 호출)
          handleKWNExcelUpload(e);              // 이관파일(Excel 파일) Upload Function 호출
        };
        reader.readAsArrayBuffer(selectedFile); // 파일 읽음
      },() => {
        return;                                 // return
      },{
        position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '330px'
      });
    }
  };

  const handleKWNExcelUpload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);                     // 파일 Data 획득
      const workbook = read(data, { type: "array" });                   // array type으로 workbook 획득
      const sheetName = workbook.SheetNames[0];                         // sheet명 획득
      const workSheet = workbook.Sheets[sheetName];                     // sheet명으로 필요 sheet 획득
      const sheetData = utils.sheet_to_json(workSheet, { header: 1 });  // sheet 내 데이터 획득 (header: 1 -> 첫쨰 줄을 header로 사용하겠다는 의미)
      
      const workNoteArray = [];

      for(let i = 7; i < 37; i++) {                                     // 보건일지 데이터 획득 위해 순회
        const workNoteData = sheetData[i];                              // 보건일지 Sheet 데이터 획득

        if(!workNoteData || workNoteData.length === 0) break;
        if(!workNoteData[3] || !workNoteData[10] || !workNoteData[6] || !workNoteData[12] || !workNoteData[15]) break;

        const sGrade = workNoteData[3].split('-')[0];                   // 학년 획득
        const sClass = workNoteData[3].split('-')[1];                   // 반 획득
        const sGender = workNoteData[10];                               // 성별 획득
        const sName = workNoteData[6];                                  // 이름 획득
        const symptom = workNoteData[12];                               // 병명 획득
        const treatmentMatter = workNoteData[15];                       // 처치사항 획득

        workNoteArray.push({
          userId: user.userId,
          schoolCode: user.schoolCode,
          sGrade,
          sClass,
          sGender,
          sName,
          symptom,
          treatmentMatter,
          platform: 'K'
        });
      }

      const response = await axios.post(`${BASE_URL}/api/migrationWorkNote/insertKWN`, { workNoteArray });

      if(response.data === "success") {
        const infoMessage = "규OOO 보건일지 데이터가 성공적으로 이관되었습니다";
        NotiflixInfo(infoMessage, true, '350px');
        fetchMigrationWorkNoteData();
        setIsRegisteredKWN(true);
      }
    }catch(error) {
      console.log("Excel 파일 읽기 중 ERROR", error);
      const warnMessage = "규OOO 보건일지 데이터 이관에 실패하였습니다";
      NotiflixWarn(warnMessage);
      return;
    }
  };

  const fetchMigrationWorkNoteData = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/migraionWorkNote/getWokeNote`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data && response.data.length > 0) {
        setMigrationWorkNoteData(response.data);
        const kRegistered = response.data.some(note => note.platform === 'K');
        const cRegistered = response.data.some(note => note.platform === 'C');
        const sRegistered = response.data.some(note => note.platform === 'S');

        setIsRegisteredKWN(kRegistered);
        setIsRegisteredCWN(cRegistered);
        setIsRegisteredSWN(sRegistered);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchMigrationWorkNoteData();
  }, [fetchMigrationWorkNoteData]);

  const handleMigrationCWN = () => {
    if(isRegisteredCWN) {
      toggleMigrationWorkNoteModal();
    }else{
      onCWNBulkRegist();
    }
  };

  const onCWNBulkRegist = () => {
    const fileInput = document.createElement("input");            // 파일 Input 생성
    fileInput.type = "file";                                      // Input type 설정
    fileInput.accept = ".xlsx,.xls";                              // 첨부 가능 확장자 설정
    fileInput.addEventListener("change", handleCWNFileChange);    // change Event 속성 설정
    fileInput.click();                                            // 파일 첨부 강제 Click
  };

  const handleCWNFileChange = (event) => {
    const file = event.target.files[0];   // 파일 획득
    handleCWNBulkRegist(file);            // 천OOO 보건일지 등록 Event 호출
  };

  const handleCWNBulkRegist = (selectedFile) => {
    if(selectedFile) {                          // 업로드할 파일 존재할 경우
      Notiflix.Confirm.show('천OOO 보건일지 이관 등록', '선택하신 파일로 보건일지 이관을 진행하시겠습니까?', '예', '아니요', () => {
        const reader = new FileReader();        // File Reader 객체 획득
        reader.onload = (e) => {                // 보건일지 DB Insert 시 async(비동기) 사용할 경우 onload에 사용하기 부적합 (Function으로 분리 호출)
          handleCWNExcelUpload(e);              // 이관파일(Excel 파일) Upload Function 호출
        };
        reader.readAsArrayBuffer(selectedFile); // 파일 읽음
      },() => {
        return;                                 // return
      },{
        position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '330px'
      });
    }
  };

  const handleCWNExcelUpload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);                     // 파일 Data 획득
      const workbook = read(data, { type: "array" });                   // array type으로 workbook 획득
      const sheetName = workbook.SheetNames[0];                         // sheet명 획득
      const workSheet = workbook.Sheets[sheetName];                     // sheet명으로 필요 sheet 획득
      const sheetData = utils.sheet_to_json(workSheet, { header: 1 });  // sheet 내 데이터 획득 (header: 1 -> 첫쨰 줄을 header로 사용하겠다는 의미)
      
      const workNoteArray = [];
      let currentDate = null;

      for (let i = 0; i < sheetData.length; i++) {
        const workNoteData = sheetData[i];

        if (!workNoteData || workNoteData.length === 0) continue;

        // 날짜 정보가 있는 줄 찾기
        if (typeof workNoteData[0] === 'string' && workNoteData[0].includes('년')) {
          currentDate = workNoteData[0].match(/\d{4}년 \d{2}월 \d{2}일/)[0].replace(/년 |월 /g, '-').replace('일', '').trim();
        } else if (currentDate && typeof workNoteData[0] === 'string' && workNoteData[0].match(/^\d+$/)) {
          // 보건일지 데이터 파싱
          if (!workNoteData[3] || !workNoteData[14] || !workNoteData[8] || !workNoteData[16] || !workNoteData[22] || !workNoteData[91]) continue;
          const sGrade = workNoteData[3].split('-')[0];        // 학년 획득
          const sClass = workNoteData[3].split('-')[1];        // 반 획득
          const sGender = workNoteData[14];                    // 성별 획득
          const sName = workNoteData[8];                       // 이름 획득
          const symptom = workNoteData[16];                    // 병명 획득
          const treatmentMatter = workNoteData[22];            // 처치사항 획득
          const visitTime = workNoteData[91];                  // 방문 시간 획득

          const visitDateTime = `${currentDate} ${visitTime}`; // 방문 날짜 및 시간 합치기

          workNoteArray.push({
            userId: user.userId,
            schoolCode: user.schoolCode,
            sGrade,
            sClass,
            sGender,
            sName,
            symptom,
            treatmentMatter,
            visitDateTime,
            platform: 'C' 
          });
        }
      }

      const response = await axios.post(`${BASE_URL}/api/migrationWorkNote/insertCWN`, { workNoteArray });

      if(response.data === "success") {
        const infoMessage = "천OOO 보건일지 데이터가 성공적으로 이관되었습니다";
        NotiflixInfo(infoMessage, true, '350px');
        fetchMigrationWorkNoteData();
        setIsRegisteredCWN(true);
      }
    }catch(error) {
      console.log("Excel 파일 읽기 중 ERROR", error);
      const warnMessage = "천OOO 보건일지 데이터 이관에 실패하였습니다";
      NotiflixWarn(warnMessage);
      return;
    }
  };

  const handleMigraionSWN = () => {
    if(isRegisteredSWN) {
      toggleMigrationWorkNoteModal();
    }else{
      onSWNBulkRegist();
    }
  };

  const onSWNBulkRegist = () => {
    const fileInput = document.createElement("input");            // 파일 Input 생성
    fileInput.type = "file";                                      // Input type 설정
    fileInput.accept = ".xlsx,.xls";                              // 첨부 가능 확장자 설정
    fileInput.addEventListener("change", handleSWNFileChange);    // change Event 속성 설정
    fileInput.click();                                            // 파일 첨부 강제 Click
  };

  const handleSWNFileChange = (event) => {
    const file = event.target.files[0];   // 파일 획득
    handleSWNBulkRegist(file);            // 스OOO 보건일지 등록 Event 호출
  };

  const handleSWNBulkRegist = (selectedFile) => {
    if(selectedFile) {                          // 업로드할 파일 존재할 경우
      Notiflix.Confirm.show('스OOO 보건일지 이관 등록', '선택하신 파일로 보건일지 이관을 진행하시겠습니까?', '예', '아니요', () => {
        const reader = new FileReader();        // File Reader 객체 획득
        reader.onload = (e) => {                // 보건일지 DB Insert 시 async(비동기) 사용할 경우 onload에 사용하기 부적합 (Function으로 분리 호출)
          handleSWNExcelUpload(e);              // 이관파일(Excel 파일) Upload Function 호출
        };
        reader.readAsArrayBuffer(selectedFile); // 파일 읽음
      },() => {
        return;                                 // return
      },{
        position: 'center-center', showOnlyTheLastOne: true, plainText: false, width: '330px'
      });
    }
  };

  const handleSWNExcelUpload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);                     // 파일 Data 획득
      const workbook = read(data, { type: "array" });                   // array type으로 workbook 획득
      const sheetName = workbook.SheetNames[0];                         // sheet명 획득
      const workSheet = workbook.Sheets[sheetName];                     // sheet명으로 필요 sheet 획득
      const sheetData = utils.sheet_to_json(workSheet, { header: 1 });  // sheet 내 데이터 획득 (header: 1 -> 첫쨰 줄을 header로 사용하겠다는 의미)
      
      const workNoteArray = [];
      let currentDate = null;

      // 각 줄을 순회하며 날짜 정보가 있는 줄을 찾고, 이후 데이터를 Parsing
      sheetData.forEach((row) => {
        if(row[1] && row[1].toString().match(/^\d{4}-\d{2}-\d{2}$/)) {
          currentDate = row[1];
        }else if(currentDate && row[1] && row[1].toString().match(/^\d+$/)) {
          const studentId = row[3].toString();
          const sGrade = studentId.charAt(0);
          const sClass = parseInt(studentId.slice(1, 3), 10).toString();
          const sNumber = parseInt(studentId.slice(3, 5), 10).toString();
          
          const visitDateTime = `${currentDate} ${row[40]}`;

          let treatmentMatter = '';
          if(row[21] && row[30]) treatmentMatter = `${row[21]} / ${row[30]}`;
          else if(row[21]) treatmentMatter = row[21];
          else if(row[30]) treatmentMatter = row[30];

          const entry = {
            userId: user.userId,
            schoolCode: user.schoolCode,
            sGrade: sGrade,
            sClass: sClass,
            sNumber: sNumber,
            sName: row[6],
            gender: row[10],
            symptom: row[12],
            treatmentMatter: treatmentMatter,
            visitDateTime: visitDateTime,
            platform: 'S'
          };
          workNoteArray.push(entry);
        }
      });

      const response = await axios.post(`${BASE_URL}/api/migrationWorkNote/insertSWN`, { workNoteArray });

      if(response.data === "success") {
        const infoMessage = "스OOO 보건일지 데이터가 성공적으로 이관되었습니다";
        NotiflixInfo(infoMessage, true, '350px');
        fetchMigrationWorkNoteData();
        setIsRegisteredSWN(true);
      }
    }catch(error) {
      console.log("Excel 파일 읽기 중 ERROR", error);
      const warnMessage = "스OOO 보건일지 데이터 이관에 실패하였습니다";
      NotiflixWarn(warnMessage, '320px');
      return;
    }
  };

  const fetchScheduleCount = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/user/getScheduleCount`, { 
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        setScheduleCount(response.data[0].totalScheduleCount);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchScheduleCount();
  }, [fetchScheduleCount]);

  const fetchAlarmCount = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/user/getAlarmCount`, { 
        params: {
          schoolCode: user.schoolCode,
          isRead: false
        }
      });

      if(response.data) {
        setAlarmCount(response.data[0].totalAlarmCount);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchAlarmCount();
  }, [fetchAlarmCount]);

  return (
    <>
      <div className="content" style={{ height: '84.8vh' }}>
        <Row>
          <Col md="3">
            <Card className="card-user" style={{ height: '523px', border: '1px solid lightgray' }}> {/* 높이 임의 설정 - 수정필요 (반응형) */}
              <div className="image">
                <input 
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleRegistBackgroundImage}
                />
                <img 
                  alt="..." 
                  src={selectedBackgroundImage ? selectedBackgroundImage : require("assets/img/damir-bosnjak.jpg")} 
                  onClick={(e) => {
                    e.preventDefault();
                    e.target.previousSibling.click();
                  }}
                  style={{ cursor: 'pointer', borderRadius: 5 }}
                />
              </div>
              <CardBody>
                <div className="author">
                  <input 
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleRegistProfileIamge}
                  />
                  <img
                    alt="..."
                    className="avatar border-gray"
                    src={selectedProfileImage ? selectedProfileImage : require("assets/img/non_profile.png")}
                    onClick={(e) => {
                      e.preventDefault();
                      e.target.previousSibling.click();
                    }}
                    style={{ cursor: 'pointer', border: 'none' }}
                  />
                  <h5 className="title">{currentUser ? currentUser.name : ''}</h5>
                  <p className="description">{currentUser ? currentUser.schoolName : ''}</p>
                </div>
                <p className="description text-center">
                  "I like the way you work it <br />
                  No diggity <br />I wanna bag it up"
                </p>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="button-container">
                  <Row>
                    <Col className="ml-auto" lg="3" md="6" xs="6">
                      <h5>
                        {alarmCount} <br />
                        <small>알림</small>
                      </h5>
                    </Col>
                    <Col className="ml-auto mr-auto" lg="4" md="6" xs="6">
                      <h5>
                        {scheduleCount} <br />
                        <small>등록 일정</small>
                      </h5>
                    </Col>
                    <Col className="mr-auto" lg="3">
                      <h5>
                        76 <br />
                        <small>잔여일</small>
                      </h5>
                    </Col>
                  </Row>
                </div>
              </CardFooter>
            </Card>
            <Card style={{ border: '1px solid lightgray' }}>
              <CardHeader>
                <CardTitle className="text-muted" tag="h6">관리자 문의</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="list-unstyled team-members">
                  <li>
                    <Row>
                      <Col md="2" xs="2">
                        <div className="avatar">
                          <img
                            alt="..."
                            className="img-circle img-no-padding img-responsive"
                            src={require("assets/img/faces/clem-onojeghuo-2.jpg")}
                          />
                        </div>
                      </Col>
                      <Col className="col-ms-7" xs="7">
                        관리자 <br />
                        <span className="text-success">
                          <small>online</small>
                        </span>
                      </Col>
                      <Col className="text-right" md="3" xs="3" style={{ marginTop: -6}}>
                        <Button
                          className="btn-round btn-icon"
                          color="success"
                          outline
                          size="sm"
                        >
                          <i className="fa fa-envelope" onClick={handleEmailForm} />
                        </Button>
                      </Col>
                    </Row>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </Col>
          <Col md="9">
            <Card className="card-user" style={{ border: '1px solid lightgray' }}>
              <CardHeader>
                <CardTitle className="text-muted" tag="h5"><b>사용자 정보</b></CardTitle>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col className="pr-1" md="5">
                      <FormGroup>
                        <label>소속학교</label>
                        <Input
                          defaultValue={currentUser ? currentUser.schoolName : ''}
                          disabled
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="3">
                      <FormGroup>
                        <label>이름</label>
                        <Input
                          id="userNameInfo"
                          defaultValue={currentUser ? currentUser.name : ''}
                          placeholder="Username"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="4">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Email
                        </label>
                        <Input 
                          id="userEmailInfo"
                          defaultValue={currentUser ? currentUser.email : ''}
                          placeholder="Email" 
                          type="email" 
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <FormGroup>
                        <label>이용중인 서비스</label>
                        <Input
                          defaultValue="Standard"
                          placeholder="City"
                          type="text"
                          disabled
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="4">
                      <FormGroup>
                        <label>서비스 사용기간</label>
                        <Input
                          defaultValue="2023.11.17 - 2024.11.16"
                          placeholder="Country"
                          type="text"
                          disabled
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="4">
                      <FormGroup>
                        <label>서비스 이용상태</label>
                        <Input 
                          defaultValue="사용중"
                          placeholder="ZIP Code" 
                          type="text" 
                          disabled
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>주소</label>
                        <Input
                          type="text"
                          defaultValue={user ? user.schoolAddress : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="3">
                      <FormGroup>
                        <label>학년 진급 자동 동기화</label>
                        <div style={{ marginTop: '-12px' }}>
                          <Button className="user-inner-button w-100" onClick={handleSynchronizeGradeData}>학년 진급 자동 동기화</Button>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <label>마이그레이션</label>
                        <div style={{ marginTop: '-12px' }}>
                          <Button className="user-inner-button w-100" onClick={handleMigrationExistPlatform}>기존 플랫폼 데이터 이관</Button>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <label>학교이동</label>
                        <div style={{ marginTop: '-12px' }}>
                          <ButtonGroup className="w-100">
                            <Button className="user-inner-button" style={{ whiteSpace: 'nowrap'}}>데이터 일괄 초기화</Button>
                            <Button className="user-inner-button" style={{ borderLeft: 'none', whiteSpace: 'nowrap' }}>데이터 선택 초기화</Button>
                          </ButtonGroup>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="2">
                      <FormGroup>
                        <label>보조교사</label>
                        <div style={{ marginTop: '-12px' }}>
                          <Button className="user-inner-button w-100">보조교사 권한관리</Button>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="" md="3">
                      <FormGroup>
                        <label>보건실 침상 수</label>
                        <Input
                          id="bedCountInfo"
                          value={bedCount ? bedCount : 0}
                          onChange={(e) => setBedCount(e.target.value)}
                          type="number"
                          min={0}
                          max={4}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="" md="6">
                      <FormGroup>
                        <label>보건실 방문요청 공유</label>
                        <div style={{ marginTop: '-12px' }}>
                          <ButtonGroup className="w-100">
                            <Button className="user-inner-button" style={{ whiteSpace: 'nowrap'}} onClick={toggleRequestURLModal}>URL</Button>
                            <Button className="user-inner-button" style={{ borderLeft: 'none', whiteSpace: 'nowrap' }} onClick={toggleRequestQRcodeModal}>QR코드</Button>
                          </ButtonGroup> 
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <label>알림톡 관리</label>
                        <div style={{ marginTop: '-12px' }}>
                          <Button className="user-inner-button w-100">알림톡 설정</Button>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="align-items-center" style={{ marginTop: '-7px' }}>
                    <Col md="4">
                      <FormGroup>
                        <label>
                          학생 명렬표
                          <IoInformationCircleOutline id="student-table-popover" style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }} />
                          <Popover flip target="student-table-popover" isOpen={studentTablePopOverOpen} toggle={toggleStudentTablePopOver} trigger="focus">
                            <PopoverHeader>
                              명렬표 등록 안내
                            </PopoverHeader>
                            <PopoverBody>
                              명령표는 반드시 우측 템플릿을 다운로드 받아 정해진 컬럼에 맞게 가지고 계신 명렬표 자료의 명단을 붙여넣어 일괄등록 해주시기 바랍니다
                            </PopoverBody>
                          </Popover>
                        </label>
                        <div style={{ marginTop: -12 }}>
                          <ButtonGroup className="" size="md">
                            {generateNameTableButtons()}
                          </ButtonGroup>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <Row className="justify-content-end no-gutters">
                        <ButtonGroup>
                          <Button className="user-inner-button" onClick={handleDownloadStudentTemplate} style={{ whiteSpace: 'nowrap'}}>템플릿 다운로드</Button>
                          <Button className="user-inner-button" onClick={onStudentBulkRegist} style={{ borderLeft: 'none', whiteSpace: 'nowrap' }}>일괄등록</Button>
                          <Button className="user-inner-button" onClick={onStudentBulkDelete} style={{ borderLeft: 'none', whiteSpace: 'nowrap' }}>일괄삭제</Button>
                        </ButtonGroup>
                      </Row>
                    </Col>
                    <Col md="2">
                      <FormGroup>
                        <label>
                          교직원 정보
                          <IoInformationCircleOutline id="teacher-table-popover" style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 5 }} />
                          <Popover flip target="teacher-table-popover" isOpen={teacherTablePopOverOpen} toggle={toggleTeacherTablePopOver} trigger="focus">
                            <PopoverHeader>
                              교직원 명단 등록 안내
                            </PopoverHeader>
                            <PopoverBody>
                              교직원 명단은 반드시 우측 템플릿을 다운로드 받아 정해진 컬럼에 맞게 가지고 계신 명단 자료를 붙여넣어 일괄등록 해주시기 바랍니다
                            </PopoverBody>
                          </Popover>
                        </label>
                        <div style={{ marginTop: '-12px'}}>
                        <span className=""></span>
                          <Button className={`${teacherData && teacherData.length > 0 ? 'registered-teacher-table' : 'btn-outline-default name-table-default'}`} onClick={handleTeacherTable}><b>교직원</b></Button>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <Row className="justify-content-end no-gutters">
                        <ButtonGroup>
                          <Button className="user-inner-button" onClick={handleDownloadTeacherTemplate} style={{ whiteSpace: 'nowrap' }}>템플릿 다운로드</Button>
                          <Button className="user-inner-button" onClick={onTeacherBulkRegist} style={{ borderLeft: 'none', whiteSpace: 'nowrap' }}>일괄등록</Button>
                          <Button className="user-inner-button" onClick={onTeacherBulkDelete} style={{ borderLeft: 'none', whiteSpace: 'nowrap' }}>일괄삭제</Button>
                        </ButtonGroup>
                      </Row>
                    </Col>
                  </Row>
                  
                  <Modal isOpen={isModalOpen} backdrop={true} toggle={toggleModal} centered={true} autoFocus={false}>
                    <ModalHeader className="text-muted" toggle={toggleModal} closebutton="true">명렬표 등록 정보</ModalHeader>
                    <ModalBody>
                      <div className="ag-theme-alpine" style={{ height: '25vh' }}>
                        <AgGridReact
                          ref={studentTableGridRef}
                          rowData={modalData} 
                          columnDefs={ntColumnDefs} 
                          rowSelection="single"
                        />
                      </div>
                    </ModalBody>
                    <ModalFooter className="pt-0 pb-0">
                      <Row className="d-flex align-items-center no-gutters w-100">
                        <Col className="d-flex justify-content-start">
                          <Button className="mr-1" onClick={addStudent}>전학학생 등록</Button>
                          {/* <Button onClick={deleteStudent}>삭제</Button> */}
                        </Col>
                          <Button color="secondary" onClick={toggleModal}>닫기</Button>
                      </Row>
                    </ModalFooter>
                  </Modal>

                  <Modal isOpen={isAddStudentModalOpen} backdrop={true} toggle={toggleAddStudentModal} centered style={{ width: '25%' }}>
                    <ModalHeader className="text-muted" toggle={toggleAddStudentModal} closebutton="true">전학학생 추가</ModalHeader>
                    <ModalBody>
                      <Row className="d-flex justify-content-center no-gutters mb-3">
                        <div className="w-100 text-center p-2" style={{ border: '1px dotted lightgray', borderRadius: 5 }}>
                          <span>등록된 전학학생은 해당 학년과 반의 가장 뒷 번호로 등록됩니다</span><br/>
                          <span>성별은 <b>남</b> 또는 <b>여</b> 로 입력하세요</span>
                        </div>
                      </Row>
                      <Row className="d-flex align-items-center justify-content-center no-gutters">
                        <label style={{ width: '8%' }}>학년</label>
                        <Input 
                          className="mr-3"
                          type="number"
                          min={1}
                          style={{ width: '12%' }}
                          value={transferStudentGrade}
                          onChange={(e) => setTransferStudentGrade(e.target.value)}
                        />
                        <label style={{ width: '5%' }}>반</label>
                        <Input 
                          className="mr-3"
                          type="number"
                          min={1}
                          style={{ width: '12%' }}
                          value={transferStudentClass}
                          onChange={(e) => setTransferStudentClass(e.target.value)}
                        />
                        <label style={{ width: '7%' }}>성별</label>
                        <Input 
                          className="mr-3"
                          type="text"
                          min={1}
                          style={{ width: '12%' }}
                          value={transferStudentGender}
                          onChange={(e) => setTransferStudentGender(e.target.value)}
                        />
                        <label style={{ width: '10%' }}>이름</label>
                        <Input 
                          type="text"
                          style={{ width: '18%' }}
                          value={transferStudentName}
                          onChange={(e) => setTransferStudentName(e.target.value)}
                        />
                      </Row>
                    </ModalBody>
                    <ModalFooter className="pt-0 pb-0">
                      <Row className="d-flex align-items-center no-gutters w-100">
                        <Col>
                          <Button onClick={resetTransferStudent}>초기화</Button>
                        </Col>
                        <Button className="mr-1" onClick={saveTransferStudent}>저장</Button>
                        <Button onClick={toggleAddStudentModal}>취소</Button>
                      </Row>
                    </ModalFooter>
                  </Modal>

                  <Modal isOpen={isTeacherTableModalOpen} backdrop={true} toggle={toggleTeacherTableModal} centered={true} autoFocus={false}>
                    <ModalHeader className="text-muted" toggle={toggleTeacherTableModal} closebutton="true">교직원 등록 정보</ModalHeader>
                    <ModalBody>
                      <div className="ag-theme-alpine" style={{ height: '25vh' }}>
                        <AgGridReact
                          ref={teacherTableGridRef}
                          rowData={teacherData} 
                          columnDefs={ttColumnDefs} 
                          rowSelection="single"
                        />
                      </div>
                    </ModalBody>
                    <ModalFooter className="pt-0 pb-0">
                      <Row className="d-flex align-items-center no-gutters w-100">
                        <Col className="d-flex justify-content-start">
                          <Button className="mr-1" onClick={addTeacher}>추가</Button>
                          <Button className="mr-1" onClick={updateTeacher}>수정</Button>
                          <Button onClick={deleteTeacher}>삭제</Button>
                        </Col>
                          <Button color="secondary" onClick={toggleTeacherTableModal}>닫기</Button>
                      </Row>
                    </ModalFooter>
                  </Modal>

                  <Modal isOpen={addTeacherModal} backdrop={true} toggle={toggleAddTeacherModal} centered={true} autoFocus={false} style={{ minWidth: '35%' }}>
                    <ModalHeader className="text-muted" toggle={toggleAddTeacherModal} closebutton="true">교직원 추가</ModalHeader>
                    <ModalBody>
                      <Row className="d-flex align-items-center no-gutters justify-content-center">
                        <label className="mr-1">이름</label>
                        <Input
                          className="mr-3"
                          type="text"
                          style={{ width: '100px' }}
                          value={addTeacherName}
                          onChange={(e) => setAddTeacherName(e.target.value)}
                        />
                        <label className="mr-1">학년</label>
                        <Input 
                          className="mr-3"
                          type="number"
                          style={{ width: '55px' }}
                          value={addTeacherGrade}
                          onChange={(e) => setAddTeacherGrade(e.target.value)}
                        />
                        <label className="mr-1">반</label>
                        <Input 
                          className="mr-3"
                          type="number"
                          style={{ width: '55px' }}
                          value={addTeacherClass}
                          onChange={(e) => setAddTeacherClass(e.target.value)}
                        />
                        <label className="mr-1">과목</label>
                        <Input 
                          className="mr-3"
                          type="number"
                          style={{ width: '50px' }}
                          value={addTeacherSubject}
                          onChange={(e) => setAddTeacherSubject(e.target.value)}
                        />
                        <label className="mr-1">연락처</label>
                        <Input 
                          type="text"
                          style={{ width: '130px' }}
                          value={addTeacherContact}
                          onChange={(e) => setAddTeacherContact(e.target.value)}
                        />
                      </Row>
                    </ModalBody>
                    <ModalFooter className="pt-0 pb-0">
                      <Row className="d-flex align-items-center no-gutters w-100">
                        <Col className="d-flex justify-content-start">
                          <Button onClick={resetAddTeacher}>초기화</Button>
                        </Col>
                        <Button className="mr-1" onClick={saveTeacher}>저장</Button>
                        <Button onClick={toggleAddTeacherModal}>취소</Button>
                      </Row>
                    </ModalFooter>
                  </Modal>

                  <Modal isOpen={updateTeacherModal} backdrop={true} toggle={toggleUpdateTeacherModal} centered={true} autoFocus={false} style={{ minWidth: '35%' }}>
                    <ModalHeader className="text-muted" toggle={toggleUpdateTeacherModal} closebutton="true">교직원 수정</ModalHeader>
                    <ModalBody>
                      <Row className="d-flex align-items-center no-gutters justify-content-center">
                        <label className="mr-1">이름</label>
                        <Input
                          className="mr-3"
                          type="text"
                          style={{ width: '100px' }}
                          value={updateTeacherName}
                          onChange={(e) => setUpdateTeacherName(e.target.value)}
                        />
                        <label className="mr-1">학년</label>
                        <Input 
                          className="mr-3"
                          type="number"
                          style={{ width: '55px' }}
                          value={updateTeacherGrade}
                          onChange={(e) => setUpdateTeacherGrade(e.target.value)}
                        />
                        <label className="mr-1">반</label>
                        <Input 
                          className="mr-3"
                          type="number"
                          style={{ width: '55px' }}
                          value={updateTeacherClass}
                          onChange={(e) => setUpdateTeacherClass(e.target.value)}
                        />
                        <label className="mr-1">과목</label>
                        <Input 
                          className="mr-3"
                          type="text"
                          style={{ width: '50px' }}
                          value={updateTeacherSubject}
                          onChange={(e) => setUpdateTeacherSubject(e.target.value)}
                        />
                        <label className="mr-1">연락처</label>
                        <Input 
                          type="text"
                          style={{ width: '130px' }}
                          value={updateTeacherContact}
                          onChange={(e) => setUpdateTeacherContact(e.target.value)}
                        />
                      </Row>
                    </ModalBody>
                    <ModalFooter className="pt-0 pb-0">
                      <Row className="d-flex align-items-center no-gutters w-100">
                        <Col className="d-flex justify-content-start">
                          <Button onClick={resetUpdateTeacher}>초기화</Button>
                        </Col>
                        <Button className="mr-1" onClick={saveUpdateTeacher}>저장</Button>
                        <Button onClick={toggleUpdateTeacherModal}>취소</Button>
                      </Row>
                    </ModalFooter>
                  </Modal>

                </Form>
              </CardBody>
              <CardFooter>
                <Row>
                    <div className="update ml-auto mr-auto">
                      <Button
                        className=""
                        color="secondary"
                        type="submit"
                        onClick={updateUserInfo}
                      >
                        사용자 정보 수정
                      </Button>
                      <Button
                        className="ml-2"
                        color="secondary"
                        type="submit"
                        onClick={handlePasswordSettingModal}
                      >
                        비밀번호 재설정
                      </Button>
                      <Button
                        className="ml-2"
                        color="secondary"
                        type="submit"
                        onClick={handleCommonPasswordSettingModal}
                      >
                        공통 비밀번호 설정
                      </Button>
                    </div>
                  </Row>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal isOpen={passwordSettingModal} toggle={togglePasswordSettingModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={togglePasswordSettingModal}><b className="text-muted">비밀번호 설정</b></ModalHeader>
          <ModalBody className="pb-0 passwordSettingModal">
            <Form className="mt-2 mb-3" onSubmit={savePassword}>
              <Row className="no-gutters" style={{ display: showVerification ? 'none' : '' }}>
                <Col md="4" className="text-center align-tiems-center">
                  <Label className="text-muted">현재 비밀번호</Label>
                </Col>
                <Col md="8">
                  <Input 
                    type="password"
                    value={currentPassword}
                    style={{ width: '90%' }}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    hidden={showVerification}
                  />
                </Col>
              </Row>
              <Row className="mt-2 no-gutters" style={{ display: showVerification ? 'none' : '' }}>
                <Col md="4" className="text-center align-tiems-center">
                  <Label className="text-muted">새 비밀번호</Label>
                </Col>
                <Col md="8">
                  <Input 
                    type="password"
                    value={newPassword}
                    style={{ width: '90%' }}
                    onChange={(e) => setNewPassword(e.target.value)}
                    hidden={showVerification}
                  />
                </Col>
              </Row>
              <Row className="mt-2 no-gutters" style={{ display: showVerification ? 'none' : '' }}>
                <Col md="4" className="text-center align-tiems-center">
                  <Label className="text-muted">비밀번호 확인</Label>
                </Col>
                <Col md="8">
                  <Input
                    type="password"
                    id="updatedCommonPassword"
                    style={{ width: '90%' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Col>
              </Row>
              {showVerification && (
                <div>
                  <Row className="d-flex align-items-center mt-2 no-gutters">
                    <Col md="4" className="text-center align-tiems-center">
                      <Label className="text-muted">비밀번호 초기화</Label>
                    </Col>
                    <Col md="8">
                      <Row className="d-flex align-items-center">
                        <Col md="4">
                          <Input 
                            type="text"
                            placeholder="인증코드"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            style={{ width: '100%', marginRight: '10px' }}
                          />
                        </Col>
                        <Col md="2">
                          <span>{Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}</span>
                        </Col>
                        <Col md="6">
                          <Button size="sm" onClick={handleVerifyCode}>인증 코드 확인</Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row className="mt-3 no-gutters">
                    <Col md="4" className="text-center align-items-center">
                      <Label className="text-muted">새 비밀번호</Label>
                    </Col>
                    <Col md="8">
                      <Input 
                        type="password"
                        value={initialPassword}
                        style={{ width: '88%' }}
                        onChange={(e) => setInitialPassword(e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </Form>
          </ModalBody>
          <ModalFooter>
            <Col className="mt-0 mb-0">
              <Button onClick={resetPassword}>비밀번호 초기화</Button>
            </Col>
            {!showVerification ? (
              <Button className="mr-1" onClick={savePassword}>저장</Button>
            ) : (
              <Button className="mr-1" onClick={saveResetPassword}>저장</Button>
            )}
            <Button onClick={togglePasswordSettingModal}>취소</Button>
          </ModalFooter>
      </Modal>

      <Modal isOpen={commonPasswordSettingModal} toggle={toggleCommonPasswordSettingModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleCommonPasswordSettingModal}><b className="text-muted">공통 비밀번호 설정</b></ModalHeader>
          <ModalBody className="pb-0">
            <Form className="mt-2 mb-3" onSubmit={saveCommonPassword}>
              <Row className="no-gutters">
                <Col md="4" className="text-center align-tiems-center">
                  <Label className="text-muted">현재 공통 비밀번호</Label>
                </Col>
                <Col md="8">
                  <Input 
                    readOnly
                    defaultValue={commonPassword ? commonPassword : ''}
                    style={{ width: '90%' }}
                  />
                </Col>
              </Row>
              <Row className="mt-3 no-gutters">
                <Col md="4" className="text-center align-tiems-center">
                  <Label className="text-muted">변경 공통 비밀번호</Label>
                </Col>
                <Col md="8">
                  <Input
                    id="updatedCommonPassword"
                    style={{ width: '90%' }}
                  />
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button className="mr-1" color="secondary" onClick={saveCommonPassword}>저장</Button>
            <Button color="secondary" onClick={toggleCommonPasswordSettingModal}>취소</Button>
          </ModalFooter>
      </Modal>

      <Modal isOpen={emailFormModal} toggle={toggleEmailFormModal} centered style={{ minWidth: '20%' }}>
        <ModalHeader toggle={toggleEmailFormModal}><b className="text-muted">관리자 문의 및 요청</b></ModalHeader>
        <ModalBody className="pb-0">
          <form ref={emailForm} className="mt-2 mb-3" onSubmit={sendEmailForm}>
            <Row className="no-gutters">
              <Input 
                name="email_subject"
                defaultValue={currentUser ? currentUser.name + "[" + currentUser.schoolName + "] :: 문의 및 요청" : ''}
                hidden
              />
              <Col md="3" className="text-center align-tiems-center">
                <Label className="text-muted">FROM</Label>
              </Col>
              <Col md="9">
                <Input 
                  type="email"
                  name="sender_email"
                  defaultValue={currentUser ? currentUser.email : ''}
                  style={{ width: '90%' }}
                  required
                  readOnly
                />
              </Col>
            </Row>
            <Row className="mt-3 no-gutters">
              <Col md="3" className="text-center align-tiems-center">
                <Label className="text-muted">TO</Label>
              </Col>
              <Col md="9">
                <Input 
                  type="text"
                  value="관리자"
                  style={{ width: '90%' }}
                  readOnly
                />
              </Col>
            </Row>
            <Row className="mt-3 no-gutters">
              <Col md="3" className="text-center align-tiems-center">
                <Label className="text-muted">내용</Label>
              </Col>
              <Col md="9">
                <Input 
                  type="textarea"
                  name="email_content"
                  defaultValue={emailContentValue}
                  onChange={(e) => setEmailContentValue(e.target.value)}
                  style={{ width: '90%', minHeight: 150, maxHeight: 150, paddingLeft: 13, paddingRight: 13 }}
                />
              </Col>
            </Row>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button className="mr-1" color="secondary" onClick={sendEmailForm}>보내기</Button>
          <Button color="secondary" onClick={toggleEmailFormModal}>취소</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={requestURLModal} toggle={toggleRequestURLModal} centered style={{ minWidth: '15%' }}>
        <ModalHeader><b className="text-muted">보건실 방문요청 URL</b></ModalHeader>
        <ModalBody>
          <Row className="d-flex align-items-center justify-content-center no-gutters">
            <InputGroup>
              <Input
                id="requestURL"
                defaultValue={requestURLValue}
                onChange={(e) => setRequestURLValue(e.target.value)}
              />
              <InputGroupText onClick={clipboardRequestURL}>
                클립보드 복사
              </InputGroupText>
            </InputGroup>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button color="secondary" onClick={toggleRequestURLModal}>취소</Button>
          </Row>
        </ModalFooter>
      </Modal>

      <Modal isOpen={requestQRcodeModal} toggle={toggleRequestQRcodeModal} centered style={{ minWidth: '30%' }}>
        <ModalHeader><b className="text-muted">보건실 방문요청 QR코드</b></ModalHeader>
        <ModalBody>
          <div ref={printComponentRef}>
            <Row className="d-flex justify-content-center qrcode-title">
              <h3 className="text-muted">보건실 방문요청 접속 QR코드</h3>
            </Row>
            <Row className="d-flex justify-content-center align-items-center mt-2 qrcode-image">
              <div id="qrcode" dangerouslySetInnerHTML={{ __html: QRCodeImage }}></div>
            </Row>
            <Row className="d-flex justify-content-center mt-5 qrcode-footer">
              <p className="text-muted" style={{ fontSize: 15 }}>위 QR코드를 모바일로 인식 시 보건실 방문요청 페이지로 접속하실 수 있습니다</p>
            </Row>
          </div>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button className="mr-2" onClick={onPrintQRCode}>프린트</Button>
            <Button color="secondary" onClick={toggleRequestQRcodeModal}>취소</Button>
          </Row>
        </ModalFooter>
      </Modal>

      <Modal isOpen={migraionExistPlatformModal} toggle={toggleMigraionExistPlatformModal} centered style={{ minWidth: '15%' }}>
        <ModalHeader><b className="text-muted">기존 사용 플랫폼 데이터 이관</b></ModalHeader>
        <ModalBody>
          <Row className="d-flex align-items-center no-gutters w-100">
            <Accordion allowZeroExpanded style={{ width: '100%'}}>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    규OOO 데이터 이관 안내
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  엑셀파일로 저장 시 저장하고자 하는 <strong style={{ color: '#F56954' }}>인원 선택사항을 30명으로 선택</strong> 후 저장하셔야 합니다.<br/>
                  이관하고자 하는 이전 프로그램과 미올라 플랫폼의 구조가 정확히 일치하지 않기 때문에 
                  이관 후 내용이 매끄럽지 못하더라도 양해 부탁드립니다.
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    천OOO 데이터 이관 안내
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  엑셀파일로 출력 시 출력 옵션 선택사항 중 <strong style={{ color: '#F56954' }}>시간표시 옵션을 체크</strong> 후 엑셀파일로 저장하여야 합니다.<br/>
                  이관하고자 하는 이전 프로그램과 미올라 플랫폼의 구조가 정확히 일치하지 않기 때문에 
                  이관 후 내용이 매끄럽지 못하더라도 양해 부탁드립니다.
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    스OOO 데이터 이관 안내
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  이관하고자 하는 이전 프로그램과 미올라 플랫폼의 구조가 정확히 일치하지 않기 때문에 
                  이관 후 내용이 매끄럽지 못하더라도 양해 부탁드립니다.
                </AccordionItemPanel>
              </AccordionItem>
            </Accordion>
          </Row>
          <Row className="d-flex align-items-center justify-content-center no-gutters mt-3">
            <ButtonGroup className="w-100">
              <Button className={`user-inner-button ${isRegisteredKWN ? 'registered-migration-button' : ''}`} style={{ whiteSpace: 'nowrap', border: '1px solid #DDDDDD' }} onClick={handleMigrationKWN}>규OOO</Button>
              <Button className={`user-inner-button ${isRegisteredCWN ? 'registered-migration-button' : ''}`} style={{ borderLeft: 'none', whiteSpace: 'nowrap', border: '1px solid #DDDDDD' }} onClick={handleMigrationCWN}>천OOO</Button>
              <Button className={`user-inner-button ${isRegisteredSWN ? 'registered-migration-button' : ''}`} style={{ borderLeft: 'none', whiteSpace: 'nowrap', border: '1px solid #DDDDDD' }} onClick={handleMigraionSWN}>스OOO</Button>
            </ButtonGroup>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button color="secondary" onClick={toggleMigraionExistPlatformModal}>취소</Button>
          </Row>
        </ModalFooter>
      </Modal>

      <Modal isOpen={synchronizeGradeDataModal} toggle={toggleSynchronizeGradeDataModal} centered style={{ minWidth: '43%' }}>
        <ModalHeader><b className="text-muted">학년 진급 자동 데이터 동기화</b></ModalHeader>
        <ModalBody>
          <Row className="d-flex align-items-center justify-content-center no-gutters">
            <Col md="5">
              <ButtonGroup className="" size="md">
                {generateNameTableButtons()}
              </ButtonGroup>
            </Col>
            <Col md="7">
              <Row className="justify-content-end no-gutters">
                <ButtonGroup>
                  <Button className="user-inner-button" onClick={handleDownloadStudentTemplate} style={{ whiteSpace: 'nowrap', border: '1px solid #DDDDDD' }}>템플릿 다운로드</Button>
                  <Button className="user-inner-button" onClick={onStudentBulkRegist} style={{ borderLeft: 'none', whiteSpace: 'nowrap', border: '1px solid #DDDDDD' }}>일괄등록</Button>
                  <Button className="user-inner-button" onClick={onStudentBulkDelete} style={{ borderLeft: 'none', whiteSpace: 'nowrap', border: '1px solid #DDDDDD' }}>일괄삭제</Button>
                </ButtonGroup>
              </Row>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button color="secondary" onClick={toggleSynchronizeGradeDataModal}>취소</Button>
          </Row>
        </ModalFooter>
      </Modal>

      <Modal isOpen={migrationWorkNoteModalOpen} backdrop={true} toggle={toggleMigrationWorkNoteModal} centered={true} autoFocus={false} style={{ minWidth: '80%' }}>
        <ModalHeader className="text-muted" toggle={toggleMigrationWorkNoteModal} closebutton="true">이관 보건일지 등록 내역</ModalHeader>
        <ModalBody>
          <div className="ag-theme-alpine" style={{ height: '50vh' }}>
            <AgGridReact
              ref={migrationWorkNoteGridRef}
              rowData={migrationWorkNoteData} 
              columnDefs={migrationWorkNoteColumnDefs} 
              rowSelection="single"
              defaultColDef={defaultColDef}
            />
          </div>
        </ModalBody>
        <ModalFooter className="pt-0 pb-0">
          <Button color="secondary" onClick={toggleMigrationWorkNoteModal}>닫기</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default User;

/**
 * 로그아웃 시 401 에러 안뜨도록 처리
 * 
 * 프로필, 배경 이미지 클릭 시 모달 -> 이미지 등록할건지 제거할건지 선택 -> 제거 시 기존 이미지 DB에서 지우고 public 내 파일도 삭제 -> 추가 시 기존 로직 수행
 * 프로필, 배경 이미지 저장 시 자동 새로고침 처리 필요
 * 
 * 비밀번호 재설정 -> 비밀번호 재설정 모달 -> 비밀번호 변경할건지 초기화할건지 선택 -> 비밀번호 변경 시 변경 로직 수행 -> 초기화 시 공통 패턴 만들어 초기화 수행
 * 
 * 전학 학생 등 학생 추가 필요 시 학년별 명렬표 버튼 클릭 하면 추가 버튼 등 만들어주고 끝 번호로 학생 등록 로직 추가 
 * 
 * 학년 올라간 후 명렬표 재 등록 시 기존 명렬표와 대조하여 매칭 시키는 기능 필요 - 학년이 올라가도 기존 정보 연동 필요 (명렬표 재등록 시 리셋되는 문제 해결)
 * 
 * 가입할 때 개인 ID로 가입하게 되면 다른 교사가 올 시 문제 발생 + 개인이 만들어놨던 ID로 사용해야하는 문제? - 학교코드로 ID를 통일시키는 방향 고려
 */