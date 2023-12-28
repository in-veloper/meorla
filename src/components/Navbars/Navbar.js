import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Container, InputGroup, InputGroupText, InputGroupAddon, Input, Modal, ModalHeader, ModalBody, Row, Col, ModalFooter, Button, Form } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

import routes from "routes.js";

function Header(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [bookmarkDropdownOpen, setBookmarkDropdownOpen] = React.useState(false);
  const [color, setColor] = React.useState("transparent");
  const sidebarToggle = React.useRef();
  const location = useLocation();
  const [modal, setModal] = useState(false);

  const gridRef = useRef();

  const [rowData, setRowData] = useState([
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },
    { bookmarkName: "네이버", bookmarkAddress: "www.google.com" },

  ]);

  const [columnDefs] = useState([
    { field: "bookmarkName", headerName: "북마크명", flex: 1, cellStyle: { textAlign: "center" }, editable: true },
    { field: "bookmarkAddress", headerName: "북마크 주소", flex: 2, cellStyle: { textAlign: "center" }, editable: true }
  ]);

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

  // 북마크 설정 클릭 시 Modal Open
  const handleBookmark = () => {
    toggleModal();
  };

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  // 북마크 항목 추가
  const appendRow = () => {
    const newData = [...rowData, { bookmarkName: "", bookmarkAddress: "" }];
    setRowData(newData);
    
    // 새로운 행 추가 후 마지막 행 Focus
    const lastRowIndex = newData.length - 1;
    gridRef.current.api.ensureNodeVisible(lastRowIndex, "bottom");
    gridRef.current.api.setFocusedCell(lastRowIndex, "bookmarkName");
    gridRef.current.api.startEditingCell({ rowIndex: lastRowIndex, colKey: "bookmarkName" });
  };

  const saveBookmark = (event) => {
    try {
      event.preventDefault();
      console.log(document.getElementById('bookmarkDiv'))
      // console.log(bookmarks)
      // // 값이 비어있는 input Filtering
      // const nonEmptyBookmarks = bookmarks.filter(({ name, address }) => name.trim() !== '' || address.trim() !== '');

      // // 입력된 북마크 항목만 추출
      // const bookmarkData = nonEmptyBookmarks.map(({ name, address }) => ({ name, address }));

      // console.log(bookmarkData)
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
                <DropdownItem tag="a">Action</DropdownItem>
                <DropdownItem tag="a">Another Action</DropdownItem>
                <DropdownItem tag="a">Something else here</DropdownItem>
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
                  singleClickEdit={true}
                  paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                  defaultColDef={defaultColDef}
                  overlayNoRowsTemplate={ '<span>등록된 북마크가 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                  overlayLoadingTemplate={
                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                  }
                  enterNavigatesVertically={true}
                  enterNavigatesVerticallyAfterEdit={true}
                />
              </div>
            </Form>
            <Row className="justify-content-center">
              <Button className="btn-round" size="sm" onClick={appendRow}>항목 추가</Button>
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
