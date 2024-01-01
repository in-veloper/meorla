import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, InputGroup, InputGroupText, InputGroupAddon, Input, Modal, ModalHeader, ModalBody, Row, Col, ModalFooter, Button, Form } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import Notiflix from "notiflix";
// import { Notify } from 'notiflix/build/notiflix-notify-aio';
import '../../assets/css/navbar.css';
import { useUser } from "contexts/UserContext";
import axios from "axios";

import routes from "routes.js";

function Header(props) {
  const {user} = useUser();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [bookmarkDropdownOpen, setBookmarkDropdownOpen] = React.useState(false);
  const [dropdownBookmarkItems, setDropdownBookmarkItems] = useState([]);
  const [color, setColor] = React.useState("transparent");
  const sidebarToggle = React.useRef();
  const location = useLocation();
  const [modal, setModal] = useState(false);

  const gridRef = useRef();

  const [rowData, setRowData] = useState([{ bookmarkName: "", bookmarkAddress: "" }]);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [columnDefs] = useState([
    { field: "bookmarkName", headerName: "북마크명", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "bookmarkAddress", headerName: "북마크 주소", flex: 2, cellStyle: { textAlign: "center" } }
  ]);

  // 최초 Grid Render Event
  const onGridReady = useCallback(() => {
    // debugger
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

  useEffect(() => {
    const fetchBookmarkData = async () => {
      try {
        if(user?.userId && user?.email) {
          const response = await axios.post('http://localhost:8000/bookmark/getBookmark', {
            userId: user.userId,
            userEmail: user.email
          });

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
              <DropdownItem key={index} tag="a">
                {item.bookmarkName}
              </DropdownItem>
            ));

            setDropdownBookmarkItems(items);
          }
        }
      } catch (error) {
        console.error('북마크 가져오기 중 ERROR', error);
      }
    };

    // 북마크 데이터를 불러오기
    fetchBookmarkData();
  }, [user?.userId, user?.email]);

  // 북마크 설정 클릭 시 Modal Open
  const handleBookmark = async () => {
    // 여기서 getBookmark로 북마크 데이터 가져와서 Grid에 rowData로 set 해줘야 함

    // const response = await axios.post('http://localhost:8000/bookmark/getBookmark', {
    //   userId: user.userId,
    //   userEmail: user.email
    // });

    // if(response.data) {
    //   const bookmarkString = response.data.bookmark.bookmark;
    //   const bookmarkArray = bookmarkString.split(',').map(item => {
    //     const [bookmarkName, bookmarkAddress] = item.split('::');

    //     return {bookmarkName, bookmarkAddress};
    //   });

    //   setRowData(bookmarkArray);
    //   setIsRegistered(true);
    // }

    toggleModal();
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
      Notiflix.Notify.init();                                                 // Notify 모듈을 초기화
      Notiflix.Notify.merge({ position: 'center-center', showOnlyTheLastOne: true, plainText: false }); // Position 중앙 배치, 1회 출력, 줄바꿈 위한 plainText - false
      Notiflix.Notify.warning('선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.');
      
      return;
    }

    api.applyTransaction({ remove: selectedRow });                            // 선택 행 삭제 
    setIsRemoved(true);                                                       // 삭제 상태 state - true (삭제 시에는 Edit 모드 진입 안함)
  };

  // Grid 행 전체 삭제 Function
  const allRemoveRow = () => {
    const api = gridRef.current.api;
    const displayedRowCount = api.getDisplayedRowCount();
    
    if(displayedRowCount === 0) {                        // 현재 등록된 북마크가 없을 경우
      Notiflix.Notify.init();                            // Notify 모듈을 초기화
      Notiflix.Notify.merge({ position: 'center-center', showOnlyTheLastOne: true, plainText: false }); // Position 중앙 배치, 1회 출력, 줄바꿈 위한 plainText - false
      Notiflix.Notify.warning('등록된 북마크가 없습니다.');     // 등록된 북마크 없음 Notify
      return;                                            // return
    }else{                                               // 등록된 북마크가 있을 경우
      api.setRowData([]);                                // 북마크 행 전체 삭제 (빈 배열 삽입으로 초기화)
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

  // Bookmark 저장 Function ([필요] 등록 시만 처리 -> 수정하거나 전체삭제할 경우 일괄 삭제 한 후 다시 처리 혹은 bookmark 컬럼만 업데이트 처리)
  const saveBookmark = async (event) => {
    try {
      event.preventDefault();
      const api = gridRef.current.api;
      const paramArray = [];

      api.forEachNode(function(rowNode, index) {
        const bookmarkName = rowNode.data.bookmarkName;
        const bookmarkAddress = rowNode.data.bookmarkAddress;

        if(bookmarkName.length !== 0 && bookmarkAddress.length !== 0 && user) {
          const paramObject = {bookmarkName: bookmarkName, bookmarkAddress: bookmarkAddress};
          paramArray.push(paramObject);
        }
      });

      const bookmarkArray = paramArray.map(item => ({
        bookmarkName: item.bookmarkName,
        bookmarkAddress: item.bookmarkAddress
      }));

      const response = await axios.post('http://localhost:8000/bookmark/insert', {
        userId: user.userId,
        userEmail: user.email,
        userName: user.name,
        schoolName: user.schoolName,
        schoolCode: user.schoolCode,
        bookmarkArray: bookmarkArray
      });

      if(response.data === "success") {
        Notiflix.Notify.init(); // Notify 모듈을 초기화
        Notiflix.Notify.merge({ position: 'center-center', showOnlyTheLastOne: true, plainText: false });
        Notiflix.Notify.info('북마크 설정이 정상적으로 저장되었습니다.');
      }
    } catch(error) {
      console.error('북마크 저장 중 ERROR', error);
    }
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
          <form>
            <InputGroup className="no-border">
              <Input placeholder="Search..." />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i className="nc-icon nc-zoom-split" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </form>
          <Nav navbar>
            <NavItem>
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
                {/* <DropdownItem tag="a">Action</DropdownItem>
                <DropdownItem tag="a">Another Action</DropdownItem>
                <DropdownItem tag="a">Something else here</DropdownItem> */}
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
            <NavItem>
              <Link to="#pablo" className="nav-link btn-rotate">
                <i className="nc-icon nc-settings-gear-65" />
                <p>
                  <span className="d-lg-none d-md-block">Account</span>
                </p>
              </Link>
            </NavItem>
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
                  // pinnedBottomRowData={pinnedBottomRowData}
                  // onRowEditingStarted={onRowEditingStarted}
                  // onRowEditingStopped={onRowEditingStopped}
                  onCellEditingStarted={onCellEditingStarted}
                  onCellEditingStopped={onCellEditingStopped}
                  // onFirstDataRendered={onFirstDataRendered}
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