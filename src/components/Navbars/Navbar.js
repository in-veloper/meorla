import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, Modal, ModalHeader, ModalBody, Row, Col, ModalFooter, Button, Form, Badge } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import Notiflix from "notiflix";
import { useUser } from "../../contexts/UserContext";
import axios from "axios";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../../assets/css/navbar.css';
import { useNavigate } from 'react-router-dom';

import routes from "routes.js";

function Header(props) {
  const sidebarToggle = React.useRef();

  const {user} = useUser();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [color, setColor] = React.useState("transparent");
  const [modal, setModal] = useState(false);
  const [bookmarkDropdownOpen, setBookmarkDropdownOpen] = React.useState(false);
  const [dropdownBookmarkItems, setDropdownBookmarkItems] = useState([]);
  const [userInfoDropdownOpen, setUserInfoDropdownOpen] = React.useState(false);
  const [userName, setUserName] = React.useState("");
  const [workStatusDropdownOpen, setWorkStatusDropdownOpen] = React.useState(false);
  const [rowData, setRowData] = useState([{ bookmarkName: "", bookmarkAddress: "" }]);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEmptyBookmarkData, setIsEmptyBookmarkData] = useState(false);  
  const [workStatus, setWorkStatus] = useState("");
  
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
        const response = await axios.get('http://localhost:8000/bookmark/getBookmark', {
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
      const response = await axios.get("http://localhost:8000/user/getWorkStatus", {
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
  });

  useEffect(() => {
    fetchWorkStatusData();
  }, [user]);

  const handleWorkStatus = async (e) => {
    const selectedWorkStatus = e.target.id;

    if(user?.userId && user?.schoolCode) {
      const response = await axios.post("http://localhost:8000/user/updateWorkStatus", {
        userId: user.userId,
        schoolCode: user.schoolCode,
        workStatus: selectedWorkStatus
      });

      if(response.data === 'success') {
        fetchWorkStatusData();
      }
    }
  };

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
      Notiflix.Notify.warning('선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });
      
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
      Notiflix.Notify.warning('등록된 북마크가 없습니다.', {
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      });

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
      Notiflix.Confirm.show(                                          // Confirm 창 Show
        '북마크 설정',                                                   // Confirm 창 Title
        '작성하신 북마크를 저장하시겠습니까?',                                  // Confirm 창 내용
        '예',                                                          // Confirm 창 버튼
        '아니요',                                                       // Confirm 창 버튼
        async () => {                                                 // Confirm 창에서 '예' 선택한 경우
          event.preventDefault();                                     // 기본 Event 방지
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
            response = await axios.post('http://localhost:8000/bookmark/update', {
              userId: user.userId,
              userEmail: user.email,
              schoolCode: user.schoolCode,
              bookmarkArray: bookmarkArray
            });
          }else{                            // 등록된 북마크가 없는 경우 - Insert
            response = await axios.post('http://localhost:8000/bookmark/insert', {
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
            Notiflix.Notify.info('북마크 설정이 정상적으로 저장되었습니다.', {
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
  }
  
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
            <NavItem onClick={() => { navigate('/teaform/dashboard')}}>
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
                <p>
                  <span className="d-lg-none d-md-block">Some Actions</span>
                </p>
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
              <DropdownMenu className="text-muted" right>
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
                <DropdownItem tag="a">사용자 정보</DropdownItem>
                <DropdownItem tag="a">비밀번호 초기화</DropdownItem>
                <DropdownItem tag="a">로그아웃</DropdownItem>
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
              <Col className="justify-content-left no-gutters">
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