import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, Modal, ModalHeader, ModalBody, Row, Col, ModalFooter, Button, Form, Badge, Tooltip, CustomInput } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import axios from "axios";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../assets/css/navbar.css';
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm";
import NotiflixWarn from "components/Notiflix/NotiflixWarn";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import { PiFaceMask } from "react-icons/pi";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from 'react-router-dom';
import routes from "routes.js";
import { getSocket } from "components/Socket/socket";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Header(props) {
  const sidebarToggle = React.useRef();

  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [color, setColor] = React.useState("transparent");
  const [modal, setModal] = useState(false);
  const [bookmarkDropdownOpen, setBookmarkDropdownOpen] = React.useState(false);
  const [pmDropdownOpen, setPmDropdownOpen] = React.useState(false);
  const [dropdownBookmarkItems, setDropdownBookmarkItems] = useState([]);
  const [userInfoDropdownOpen, setUserInfoDropdownOpen] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const [workStatusDropdownOpen, setWorkStatusDropdownOpen] = React.useState(false);
  const [rowData, setRowData] = useState([{ bookmarkName: "", bookmarkAddress: "" }]);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEmptyBookmarkData, setIsEmptyBookmarkData] = useState(false);  
  const [workStatus, setWorkStatus] = useState("");
  const [stationInfo, setStationInfo] = useState([]);
  const [targetSido, setTargetSido] = useState("");
  const [pmDataTime, setPmDataTime] = useState("");
  const [pm10Value, setPm10Value] = useState(0);
  const [pm25Value, setPm25Value] = useState(0);
  const [pm10Text, setPm10Text] = useState(null);
  const [pm25Text, setPm25Text] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [pmStationTooltipOpen, setPmStationTooltipOpen] = useState(false);
  const [notifyPmChecked, setNotifyPmChecked] = useState(false);
  const [selectedStation, setSelectedStation] = useState("");

  const gridRef = useRef();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [columnDefs] = useState([
    { field: "bookmarkName", headerName: "북마크명", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "bookmarkAddress", headerName: "북마크 주소", flex: 2, cellStyle: { textAlign: "center" } }
  ]);

  // 최초 Grid Render Event
  const onGridReady = useCallback(() => {
    
  }, []);

  const toggle = () => {
    if (isOpen) {
      setColor("transparent");
    } else {
      setColor("dark");
    }
    setIsOpen(!isOpen);
  };

  const dropdownToggle = (e) => {
    setDropdownOpen(!dropdownOpen);
  };

  const pmDropdownToggle = (e) => {
    setPmDropdownOpen(!pmDropdownOpen);
  };
  
  // 북마크 설정 - Toggle 
  const bookmarkDropdownToggle = (e) => {
    setBookmarkDropdownOpen(!bookmarkDropdownOpen);
  };

  const userInfoDropdownToggle = (e) => {
    setUserInfoDropdownOpen(!userInfoDropdownOpen);
  };

  const workStatusDropdownToggle = (e) => {
    setWorkStatusDropdownOpen(!workStatusDropdownOpen);
  };

  const toggleModal = () => setModal(!modal);

  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const togglePmStationTooltip = () => setPmStationTooltipOpen(!pmStationTooltipOpen);

  const getBrand = () => {
    let brandName = "Default Brand";
    routes.map((prop, key) => {
      if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
        brandName = prop.name;
      }
      return null;
    });
    return brandName;
  };
  
  const openSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    sidebarToggle.current.classList.toggle("toggled");
  };

  const updateColor = () => {
    if (window.innerWidth < 993 && isOpen) {
      setColor("dark");
    } else {
      setColor("transparent");
    }
  };
  
  React.useEffect(() => {
    window.addEventListener("resize", updateColor.bind(this));
  });
  
  React.useEffect(() => {
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      sidebarToggle.current.classList.toggle("toggled");
    }
  }, [location]);

  // 북마크 데이터 획득 부분 Function 분리 (저장 후 Dropdown 적용할 경우 호출)
  const fetchBookmarkData = useCallback(async () => {
    try {
      if(user?.userId && user?.email) {
        const response = await axios.get(`${BASE_URL}/api/bookmark/getBookmark`, {
          params: {
            userId: user.userId,
            userEmail: user.email
          }
        });
        
        if(response.data === 0) setIsEmptyBookmarkData(true);

        if (response.data) {
          const bookmarkString = response.data.bookmark.bookmark;
          const bookmarkArray = bookmarkString.split(',').map(item => {
            const [bookmarkName, bookmarkAddress] = item.split('::');
            return { bookmarkName, bookmarkAddress };
          });

          setRowData(bookmarkArray);
          setIsRegistered(true);

          // 북마크 데이터를 드랍다운 아이템으로 설정
          const items = bookmarkArray.map((item, index) => (
            <DropdownItem key={index} tag="a" onClick={() => goToBookmarkPage(item.bookmarkAddress)}>
              {item.bookmarkName}
            </DropdownItem>
          ));

          setDropdownBookmarkItems(items);
        }
      }
    } catch (error) {
      console.error('북마크 가져오기 중 ERROR', error);
    }
  }, [user?.userId, user?.email]);

  useEffect(() => {
    fetchBookmarkData();  // 북마크 데이터를 불러오기
  }, [fetchBookmarkData]);

  useEffect(() => {
    if(user?.name) setUserName(user.name);
  }, [user]);

  // 북마크 설정 클릭 시 Modal Open
  const handleBookmark = async () => {
    toggleModal();
  };

  const fetchWorkStatusData = useCallback(async () => {
    if(user?.userId && user?.schoolCode) {
      const response = await axios.get(`${BASE_URL}/api/user/getWorkStatus`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });
      
      if(response.data) {
        const workStatus = response.data[0].workStatus;
        setWorkStatus(workStatus);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchWorkStatusData();
  }, [fetchWorkStatusData]);

  const handleWorkStatus = async (e) => {
    const socket = getSocket();
    
    const selectedWorkStatus = e.target.id;

    if(user?.userId && user?.schoolCode) {
      const response = await axios.post(`${BASE_URL}/api/user/updateWorkStatus`, {
        userId: user.userId,
        schoolCode: user.schoolCode,
        workStatus: selectedWorkStatus
      });

      if(response.data === 'success') {
        fetchWorkStatusData();
        
        if(socket) socket.emit('sendWorkStatus', { message: selectedWorkStatus });
      }
    }
  };

  useEffect(() => {
    const handleSchoolAddress = () => {
      if(user) {
        const schoolSido = user.schoolAddress.split(' ')[0];
        let targetSido = "";
        
        if(schoolSido.includes("광역시")) targetSido = schoolSido.split("광역시")[0];
        else if(schoolSido.includes("특별시")) targetSido = schoolSido.split("특별시")[0];
        else if(schoolSido.includes("특별자치시")) targetSido = schoolSido.split("특별자치시")[0];
        else if(schoolSido.includes("특별자치도")) targetSido = schoolSido.split("특별자치도")[0];
        else if(schoolSido === "강원도") targetSido = "강원";
        else if(schoolSido === "경기도") targetSido = "경기";
        else if(schoolSido === "충청북도") targetSido = "충북";
        else if(schoolSido === "충청남도") targetSido = "충남";
        else if(schoolSido === "경상북도") targetSido = "경북";
        else if(schoolSido === "경상남도") targetSido = "경남";
        else if(schoolSido === "전라북도") targetSido = "전북";
        else if(schoolSido === "전라남도") targetSido = "전남";
  
        setTargetSido(targetSido);
      }
    };
    handleSchoolAddress();
  }, [user])

  // 기본 컬럼 속성 정의 (공통 부분)
  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    editable: true
  };

  // 추가할 행 생성
  const createNewRowData = () => {
    const newData = {
      bookmarkName: "",
      bookmarkAddress: "",
      editable: true
    }
    return newData;
  };

  // Grid 행 추가 Function
  const appendRow = useCallback(() => {
    const api = gridRef.current.api;                                          // api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
    const newItem = [createNewRowData()];                                     // 추가할 행 데이터 획득

    api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
    api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
    setIsRemoved(false);                                                      // 삭제 상태 state - false 
    setIsRegistered(false);                                                   // Modal Open isRegistered state - false
  }, []);

  // Row에 데이터 변경 시 Ag-Grid 내장 Event
  const onRowDataUpdated = useCallback(() => {                                // 행이 추가되고 난 후 이벤트 (이 지점에서 추가된 행 확인 가능)
    const api = gridRef.current.api;                                          // Ag-Grid api 획득
    const displayedRowCount = api.getDisplayedRowCount();                     // 현재 화면에 보여지는 행의 개수
    const lastRowIndex = displayedRowCount - 1;                               // Edit 속성 부여 위한 마지막 행 Index
    
    if(isRemoved || isRegistered) {                                           // 항목 삭제 버튼 클릭 시 || 초기 bookmark 데이터 불러왔을 시
      api.stopEditing(true);                                                  // Edit 모드 중지
      return;                                                                 // return
    }
    
    if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'bookmarkName' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
  }, [isRemoved, isRegistered]);

  // Grid 행 삭제 Function
  const removeRow = () => {                                                   // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
    const api = gridRef.current.api;                                          // api 획득
    const selectedRow = api.getSelectedRows();                                // 현재 선택된 행 획득

    if(selectedRow.length === 0) {                                            // 선택한 행이 없을 시
      const warnMessage = "선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.";
      NotiflixWarn(warnMessage);
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 전체 삭제 Function
  const allRemoveRow = () => {
    const api = gridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
    
    if(displayedRowCount === 0) {                         // 현재 등록된 북마크가 없을 경우
      // 등록된 북마크 없음 Notify
      const warnMessage = "등록된 북마크가 없습니다.";
      NotiflixWarn(warnMessage);
      return;                                             // return
    }else{                                                // 등록된 북마크가 있을 경우
      api.setRowData([]);                                 // 북마크 행 전체 삭제 (빈 배열 삽입으로 초기화)
    }
  };

  // Cell Edit 모드 진입 시 Event
  const onCellEditingStarted = (event) => {
    // debugger
  };

  // Cell Edit 모드 종료 시 Event
  const onCellEditingStopped = (event) => {
    // debugger
  };

  // Grid에서 변경된 내역만 잡을 수 있는지 보고 잡을 수 있으면 변경 안됐을 때는 저장 안되게 Alert
  const saveBookmark = async (event) => {
    try {
      const confirmTitle = "북마크 설정";
      const confirmMessage = "작성하신 북마크를 저장하시겠습니까?";
      const infoMessage = "북마크 설정이 정상적으로 저장되었습니다.";

      const yesCallback = async () => {
        const api = gridRef.current.api;                            // Grid api 획득
        // const displayedRowCount = api.getDisplayedRowCount();       // 현재 Grid에 출련된 행 수
        const paramArray = [];                                      // Parameter 전송 위한 북마크 담을 배열

        api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
          const bookmarkName = rowNode.data.bookmarkName;           // 북마크명 획득
          const bookmarkAddress = rowNode.data.bookmarkAddress;     // 북마크 주소 획득

          // 북마크 명이 존재 && 북마크 주소 존재 && user 데이터 존재 -> Parameter로 전송할 북마크 데이터 생성
          if(bookmarkName.length !== 0 && bookmarkAddress.length !== 0 && user) {
            const paramObject = {bookmarkName: bookmarkName, bookmarkAddress: bookmarkAddress};
            paramArray.push(paramObject);
          }
        });

        // Api 호출 시 Parameter로 전송할 수 있도록 Converting
        const bookmarkArray = paramArray.map(item => ({
          bookmarkName: item.bookmarkName,
          bookmarkAddress: item.bookmarkAddress
        }));
        
        let response = null;              // response 데이터 담을 변수
        if(!isEmptyBookmarkData) {       // 등록된 북마크가 있는 경우 - Update
          response = await axios.post(`${BASE_URL}/api/bookmark/update`, {
            userId: user.userId,
            userEmail: user.email,
            schoolCode: user.schoolCode,
            bookmarkArray: bookmarkArray
          });
        }else{                            // 등록된 북마크가 없는 경우 - Insert
          response = await axios.post(`${BASE_URL}/api/bookmark/insert`, {
            userId: user.userId,
            userEmail: user.email,
            userName: user.name,
            schoolName: user.schoolName,
            schoolCode: user.schoolCode,
            bookmarkArray: bookmarkArray
          });
        }

        if(response.data === "success") {   // Api 호출 성공한 경우
          toggleModal();
          fetchBookmarkData();              // Dropdown에도 공통 적용되기 위해 북마크 데이터 재조회
          // 북마크 정상 저장 Notify
          NotiflixInfo(infoMessage);
        }
      };

      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
    } catch(error) {
      console.error('북마크 저장 중 ERROR', error);
    }
  };

  // 설정한 북마크 URL로 새창 Open Function
  const goToBookmarkPage = (bookmarkAddress) => {
    let address = '';
    if(bookmarkAddress) {                                                             // 북마크 주소 값 존재할 경우
      // 브라우저 창을 따로 열어야 할 경우 및 외부 Link(URL)로 연결해야 할 경우 -> 앞에 Localhost 및 Port 번호가 붙는다면 변수에 담아 https를 포함한 전체 주소를 입력하면 해결
      if(!bookmarkAddress.startsWith('http')) address = 'https://' + bookmarkAddress; // http로 시작하지 않는다면 https:// 를 prefix로 설정
    }

    window.open(address);                                                             // 해당 북마크 주소로 새창 Open
  };

  const handleSelectStation = async (e) => {
    const selectedStation = e.target.text;

    if(user && selectedStation) {
      const response = await axios.post(`${BASE_URL}/api/user/updatePmStation`, {
        userId: user.userId,
        schoolCode: user.schoolCode,
        pmStation: selectedStation
      });

      if(response.data === 'success') {
        setSelectedStation(selectedStation);
      }
    }
  };

  const fetchAirConditionData = useCallback(async () => {
    // Block.dots('.scrollable-dropdown-items');

    if(user && user.pmStation) {
      try {
        const url = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty";
        const response = await axios.get(url, {
          params: {
            serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
            returnType: 'json',
            numOfRows: 1,
            pageNo: 1,
            stationName: user.pmStation,
            dataTerm: 'DAILY',
            ver: '1.0'            
          }
        });

        if(response.data.response) {
          const responseData = response.data.response.body.items[0];
          const pm10Text = classifyPmGrade("pm10", responseData.pm10Value);
          const pm25Text = classifyPmGrade("pm25", responseData.pm25Value);
          
          setPmDataTime(responseData.dataTime);
          setPm10Value(responseData.pm10Value);
          setPm25Value(responseData.pm25Value);
          setPm10Text(pm10Text);
          setPm25Text(pm25Text);
          setSelectedStation(user.pmStation);

          // if(document.querySelector('.notiflix-block')) Block.remove('.scrollable-dropdown-items');
        }
      } catch (error) {
        console.log("선택한 미세먼지 측정소 기준 조회 중 ERROR", error);
        // if(document.querySelector('.notiflix-block')) Block.remove('.scrollable-dropdown-items');
      }
    }
  }, [user]);

  useEffect(() => {
    fetchAirConditionData();
  }, [fetchAirConditionData]);

  const fetchPmStationInfo = useCallback(async () => {
    if(targetSido && stationInfo.length === 0) {
      try {
        const url = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty';
        const response = await axios.get(url, {
          params: {
            serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
            returnType: 'json',
            numOfRows: 100,
            pageNo: 1,
            sidoName: targetSido,
            ver: '1.0'
          }
        });
        
        if (response.data.response) {
          const responseData = response.data.response.body.items;
          const updatedStationInfo = responseData.map((item, index) => (
            <DropdownItem key={index} tag="a" onClick={handleSelectStation}>
              {item.stationName}
            </DropdownItem>
          ));
    
          setStationInfo(updatedStationInfo);
        }
      } catch (error) {
        console.log("미세먼지 정보 조회 중 ERROR", error);
      }
    }
  }, [targetSido, stationInfo]);

  const classifyPmGrade = (pmCategory, pmValue) => {
    let returnGrade = "";
    if(pmCategory === "pm10") {
      if(pmValue >= 0 && pmValue <= 30) returnGrade = <Badge color="primary">좋음</Badge>;
      else if(pmValue >= 31 && pmValue <= 80) returnGrade = <Badge color="success">보통</Badge>;
      else if(pmValue >= 81 && pmValue <= 150) returnGrade = <Badge color="warning">나쁨</Badge>;
      else if(pmValue >= 151) returnGrade = <Badge color="danger">매우나쁨</Badge>;
      else if(pmValue === "-") returnGrade = <Badge color="secondary">&nbsp;&nbsp;-&nbsp;&nbsp;</Badge>;
    }else if(pmCategory === "pm25") {
      if(pmValue >= 0 && pmValue <= 15) returnGrade = <Badge color="primary">좋음</Badge>;
      else if(pmValue >= 16 && pmValue <= 35) returnGrade = <Badge color="success">보통</Badge>;
      else if(pmValue >= 36 && pmValue <= 75) returnGrade = <Badge color="warning">나쁨</Badge>;
      else if(pmValue >= 76) returnGrade = <Badge color="danger">매우나쁨</Badge>;
      else if(pmValue === "-") returnGrade = <Badge color="secondary">&nbsp;&nbsp;-&nbsp;&nbsp;</Badge>;
    }

    return returnGrade;
  };

  const fetchNotifyPmStatus = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/user/getNotifyPmInfo`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        const notifyPmInfoStatus = Boolean(response.data[0].notifyPm);
        setNotifyPmChecked(notifyPmInfoStatus);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchNotifyPmStatus();
  }, [fetchNotifyPmStatus]);

  const handleNotifyPmInfo = async (e) => {
    e.preventDefault();
    
    const confirmTitle = "미세먼지 경보 알림 설정";
    const confirmMessage = (user ? user.notifyPm : false) ? "미세먼지 경보 알림을 해제하시겠습니까?" : "미세먼지 경보 알림으로 설정하시겠습니까?";

    const yesCallback = async () => {
      if(user) {
        const response = await axios.post(`${BASE_URL}/api/user/updateNotifyPmInfo`, {
          userId: user.userId,
          schoolCode: user.schoolCode,
          notifyPm: !notifyPmChecked
        });

        if(response.data === "success") {
          setNotifyPmChecked(!notifyPmChecked);
        }
      }
    };

    const noCallback = () => {
      return;
    };

    NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '330px');
  };

  useEffect(() => {
    if(targetSido) fetchPmStationInfo();
  }, [targetSido, fetchPmStationInfo]);


  const [pmAlarmData, setPmAlarmData] = useState([]);

  const fetchPmAlarmData = useCallback(async () => {
    try {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      
      if(currentHour >= 8 && currentHour < 16 && currentMinute >= 30) {
        const currentYear = currentDate.getFullYear();
        const url = 'http://apis.data.go.kr/B552584/UlfptcaAlarmInqireSvc/getUlfptcaAlarmInfo';
        const response = await axios.get(url, {
          params: {
            serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
            returnType: 'json',
            numOfRows: 100,
            pageNo: 1,
            year: currentYear
          }
        });
    
        if(response.data.response) {
          setPmAlarmData(response.data.response.body.items);
          const toSendPmAlarm = extractToSendAlarm();
          // 테스트 필요 (경보 || 주의보 발생 시에만 테스트할 수는 없음)



        }
      }
    } catch (error) {
      console.log("미세먼지 경보 정보 조회 중 ERROR", error);
    }
  }, []);

  const extractToSendAlarm = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    
    const pastAlarms = pmAlarmData.filter(alarm => {
      const issueDateParts = alarm.issueDate.split('-');
      const issueYear = parseInt(issueDateParts[0]);
      const issueMonth = parseInt(issueDateParts[1]);
      const issueDay = parseInt(issueDateParts[2]);
      
      // 현재 시간 이전에 발행된 알림 필터링
      if (alarm.districtName !== targetSido) return false;
      if (currentYear > issueYear) return true;
      if (currentMonth > issueMonth) return true;
      if (currentDay > issueDay) return true;
      if (currentHour > parseInt(alarm.issueTime.slice(0, 2))) return true;
      if (currentHour === parseInt(alarm.issueTime.slice(0, 2)) && 
          currentMinute >= parseInt(alarm.issueTime.slice(3, 5))) return true;
          
      return false;
    });
    
    return pastAlarms;
  };

  useEffect(() => {
    fetchPmAlarmData();
  }, [fetchPmAlarmData]);

  useEffect(() => {
    fetchPmAlarmData();
    const intervalId = setInterval(fetchPmAlarmData, 60 * 60 * 1000); // 1시간 간격으로 호출
    return () => {
      clearInterval(intervalId);  // component가 unmount될 때 interval 해제
    };
  }, [fetchPmAlarmData]);

  useEffect(() => {
    fetchAirConditionData();
    const intervalId = setInterval(fetchAirConditionData, 60 * 60 * 1000); // 1시간 간격으로 호출
    return () => {
      clearInterval(intervalId);  // component가 unmount될 때 interval 해제
    };
  }, [fetchAirConditionData]);

  const onLogout = () => {
    const userId = user ? user.userId : null;
    if(userId) logout(userId);
  };
  
  return (
    <Navbar
      color={
        location.pathname.indexOf("full-screen-maps") !== -1 ? "dark" : color
      }
      expand="lg"
      className={
        location.pathname.indexOf("full-screen-maps") !== -1
          ? "navbar-absolute fixed-top"
          : "navbar-absolute fixed-top " +
            (color === "transparent" ? "navbar-transparent " : "")
      }
    >
      <Container fluid>
        <div className="navbar-wrapper">
          <div className="navbar-toggle">
            <button
              type="button"
              ref={sidebarToggle}
              className="navbar-toggler"
              onClick={() => openSidebar()}
            >
              <span className="navbar-toggler-bar bar1" />
              <span className="navbar-toggler-bar bar2" />
              <span className="navbar-toggler-bar bar3" />
            </button>
          </div>
          <NavbarBrand className="text-muted" href="/"><b>{getBrand()}</b></NavbarBrand>
        </div>
        <NavbarToggler onClick={toggle}>
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
        </NavbarToggler>
        <Collapse isOpen={isOpen} navbar className="justify-content-end">
          <Nav navbar>
            <div className="pmInfo text-center text-muted" id="pmInfo">
                <span>미세먼지&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{pm10Text}</span><br/> 
                <span>초미세먼지&nbsp;&nbsp;{pm25Text}</span>
              <Tooltip
                placement="bottom"
                isOpen={tooltipOpen}
                autohide={true}
                target="pmInfo"
                toggle={toggleTooltip}
              >
                <div className="text-left">
                  <b>미세먼지</b> : {pm10Value} ㎍/㎥ &nbsp; {pm10Text}<br/>
                  <b>초미세먼지</b> : {pm25Value} ㎍/㎥ &nbsp; {pm25Text}<br/>
                  <b>측정일시</b> : {pmDataTime}
                  <b>측정소</b> : {user ? user.pmStation : ""}
                </div>
              </Tooltip>
            </div>
            <Dropdown
              nav
              isOpen={pmDropdownOpen}
              toggle={(e) => pmDropdownToggle(e)}
              className="pmDropdown mr-2"
            >
              <DropdownToggle caret nav>
                <PiFaceMask className="mb-1 text-muted" style={{ fontSize: 24 }}/>
              </DropdownToggle>
              <DropdownMenu className="text-muted" right>
                <div className="scrollable-dropdown-items">
                  {stationInfo}
                </div>
                <DropdownItem divider />
                <DropdownItem>
                  <Row>
                    <Col md="6">
                      측정소
                    </Col>
                    <Col md="6">
                      {selectedStation > 7 ? (
                        <span id="longPmStationText">
                          <b>{`${selectedStation.substring(0, 7)}...`}</b>
                          <Tooltip
                            placement="top"
                            isOpen={pmStationTooltipOpen}
                            autohide={true}
                            target="longPmStationText"
                            toggle={togglePmStationTooltip}
                          >
                            <b>{selectedStation}</b>
                          </Tooltip>
                        </span>
                      ) : (
                        <b>{selectedStation}</b>
                      )}
                    </Col>
                  </Row>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem toggle={false}>
                  <Row>
                    <Col md="9">
                      경보 알림
                    </Col>
                    <Col md="3">
                      <CustomInput 
                        type="switch"
                        id="notifyPmInfo"
                        checked={notifyPmChecked}
                        onChange={handleNotifyPmInfo}
                      />
                    </Col>
                  </Row>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <NavItem onClick={() => { navigate('/meorla/dashboard')}}>
              <Link to="#pablo" className="nav-link btn-magnify">
                <i className="nc-icon nc-layout-11" />
                <p>
                  <span className="d-lg-none d-md-block">Stats</span>
                </p>
              </Link>
            </NavItem>
            <Dropdown
              nav
              isOpen={bookmarkDropdownOpen}
              toggle={(e) => bookmarkDropdownToggle(e)}
            >
              <DropdownToggle caret nav>
                <i className="nc-icon nc-bookmark-2" />
                {/* <p>
                  <span className="d-lg-none d-md-block">Some Actions</span>
                </p> */}
              </DropdownToggle>
              <DropdownMenu className="text-muted" right>
                {dropdownBookmarkItems}
                <DropdownItem divider />
                <DropdownItem onClick={handleBookmark}>북마크 설정</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown
              nav
              isOpen={dropdownOpen}
              toggle={(e) => dropdownToggle(e)}
            >
              <DropdownToggle caret nav>
                <i className="nc-icon nc-bell-55" />
                <p>
                  <span className="d-lg-none d-md-block">Some Actions</span>
                </p>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem tag="a">Action</DropdownItem>
                <DropdownItem tag="a">Another Action</DropdownItem>
                <DropdownItem tag="a">Something else here</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {/* <NavItem>
              <Link to="#pablo" className="nav-link btn-rotate">
                <i className="nc-icon nc-settings-gear-65" />
                <p>
                  <span className="d-lg-none d-md-block">Account</span>
                </p>
              </Link>
            </NavItem> */}
            <Dropdown
              nav
              isOpen={workStatusDropdownOpen}
              toggle={(e) => workStatusDropdownToggle(e)}
            >
              <DropdownToggle caret nav>
                {workStatus === 'working' && <Badge className="mr-1" style={{ backgroundColor: '#9A9A9A', fontSize: 14 }}>근무</Badge>}
                {workStatus === 'outOfOffice' && <Badge className="mr-1" style={{ backgroundColor: '#9A9A9A', fontSize: 14 }}>부재</Badge>}
                {workStatus === 'businessTrip' && <Badge className="mr-1" style={{ backgroundColor: '#9A9A9A', fontSize: 14 }}>출장</Badge>}
                {workStatus === 'vacation' && <Badge className="mr-1" style={{ backgroundColor: '#9A9A9A', fontSize: 14 }}>휴가</Badge>}
              </DropdownToggle>
              <DropdownMenu className="text-muted work-status-dropdown-menu" right>
                <DropdownItem id="working" onClick={handleWorkStatus}>근무</DropdownItem>
                <DropdownItem id="outOfOffice" onClick={handleWorkStatus}>부재</DropdownItem>
                <DropdownItem id="businessTrip" onClick={handleWorkStatus}>출장</DropdownItem>
                <DropdownItem id="vacation" onClick={handleWorkStatus}>휴가</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown
              nav
              isOpen={userInfoDropdownOpen}
              toggle={(e) => userInfoDropdownToggle(e)}
            >
              <DropdownToggle caret nav>
                {/* <i className="nc-icon nc-circle-10 text-muted" /> */}
                <p>
                  <span className="text-muted mr-1" style={{ fontWeight: 'bold' }}>{userName} 보건교사님</span>
                </p>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem tag="a">사용자 메뉴얼</DropdownItem>
                <DropdownItem tag="a" onClick={() => navigate('/meorla/user-page')}>사용자 정보</DropdownItem>
                <DropdownItem tag="a">비밀번호 초기화</DropdownItem>
                <DropdownItem tag="a" onClick={onLogout}>로그아웃</DropdownItem>
              </DropdownMenu>
            </Dropdown>

          </Nav>
        </Collapse>
      </Container>

      <Modal isOpen={modal} toggle={toggleModal} centered style={{ minWidth: '20%' }}>
          <ModalHeader toggle={toggleModal}><b className="text-muted">북마크 설정</b></ModalHeader>
          <ModalBody className="pb-0">
            <Form onSubmit={saveBookmark}>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  stopEditingWhenCellsLoseFocus={true}
                  // singleClickEdit={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 북마크가 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  overlayLoadingTemplate={
                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                  }
                  onGridReady={onGridReady}
                  rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                  onCellEditingStarted={onCellEditingStarted}
                  onCellEditingStopped={onCellEditingStopped}
                  onRowDataUpdated={onRowDataUpdated}
                />
              </div>
            </Form>
            <Row>
              <Col className="justify-content-start no-gutters">
                <Button className="btn-plus" size="sm" onClick={appendRow}>
                  추가
                </Button>
                <Button className="btn-minus" size="sm" onClick={removeRow}>
                  삭제
                </Button>
              </Col>
              <Col>
                <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allRemoveRow}>전체 삭제</Button>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button className="mr-1" color="secondary" onClick={saveBookmark}>저장</Button>
            <Button color="secondary" onClick={toggleModal}>취소</Button>
          </ModalFooter>
       </Modal>
    </Navbar>
  );
}

export default Header;

/**
 * Bookmark Modal 내 알림 표시 내용
 * 1. Cell을 더블 클릭 시 Edit(편집)할 수 있다. 
 * 2. Ctrl키를 누른 채로 행을 선택하면 여러 행을 선택할 수 있고 선택 삭제가 가능하다. 
 * 3. 현재 편집 중인 Cell에서 Tab키 누를 시 다음 Cell로 이동할 수 있다.
 */

/**
 * Bookmark 가져올 때 Split 방법
 * 예: 데이터베이스로부터 가져온 bookmark
 * const bookmarkArrayString = "네이버::www.naver.com,구글::www.google.com";
 * const bookmarkArray = bookmarkArrayString.split(',').map(item => {
 *  const [bookmarkName, bookmarkAddress] = item.split('::');
 *  return { bookmarkName, bookmarkAddress };
 * });
 */

/**
 * 수정 후 새로고침 할때 마다
 * OST http://localhost:8000/bookmark/getBookmark net::ERR_CONNECTION_REFUSED
 * 에러 발생
 */

/**
 * 미세먼지 정보가 관측소를 변경하면 바로 반영이 안되는 현상 발생 -> 수정 필요
 */