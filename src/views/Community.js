import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Nav, NavItem, NavLink, Button, Input } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "../assets/css/community.css";

function Community() {
    const [searchCategory, setSearchCategory] = useState("");
    const [searchText, setSearchText] = useState("");
    const [selectedMenu, setSelectedMenu] = useState("question");
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);

    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

    // 해야할 부분 : 메뉴 전환될 때 스피너나 로딩화면 찾아서 이곳부터 처리하기 시작해야 함
    useEffect(() => {
        moveCommunityMenu({ target: { id: selectedMenu }});
    }, []);

    const gridRef = useRef();

    // 검색 시 카테고리 선택 Event
    const handleSearchCategory = (e) => {
        const selectedCategory = e.target.value;
        setSearchCategory(selectedCategory);
    };

    // 검색어 입력 Setting
    const handleSearchText = (e) => {
        e.preventDefault();
        setSearchText(e.target.value);
    };

    // 메뉴별 각각 다른 Grid Setting
    const moveCommunityMenu = (e) => {
        const targetMenuId = e.target.id;
        setSelectedMenu(targetMenuId);
        
        if(targetMenuId === "question") {               // 선택한 메뉴 - 문의
            setRowData([
                {inquiryCategory: "수업문의", inquiryTitle: "문의 게시판", writer: "정영인", registDate: "2023-12-13", views: "12"},
                {inquiryCategory: "기타문의", inquiryTitle: "기타 질문", writer: "정영인", registDate: "2023-12-17", views: "10"},
                {inquiryCategory: "행사문의", inquiryTitle: "행사 관련하여 질문", writer: "정영인", registDate: "2023-12-15", views: "25"}
            ]);
            setColumnDefs([
                { field: "inquiryCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "inquiryTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
                { field: "writer", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "registDate", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" } },
                { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } }
            ]);
        }else if(targetMenuId === "resourceSharing") {  // 선택한 메뉴 - 자료공유
            setRowData([
                {inquiryCategory: "수업문의", inquiryTitle: "자료공유 게시판", writer: "정영인", registDate: "2023-12-13", views: "12"},
                {inquiryCategory: "기타문의", inquiryTitle: "기타 질문", writer: "정영인", registDate: "2023-12-17", views: "10"},
                {inquiryCategory: "행사문의", inquiryTitle: "행사 관련하여 질문", writer: "정영인", registDate: "2023-12-15", views: "25"}
            ]);
            setColumnDefs([
                { field: "inquiryCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "inquiryTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
                { field: "writer", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "registDate", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" } },
                { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } }
            ]);
        }else if(targetMenuId === "interact") {         // 선택한 메뉴 - 시도교류
            setRowData([
                {inquiryCategory: "수업문의", inquiryTitle: "시도교류 게시판", writer: "정영인", registDate: "2023-12-13", views: "12"},
                {inquiryCategory: "기타문의", inquiryTitle: "기타 질문", writer: "정영인", registDate: "2023-12-17", views: "10"},
                {inquiryCategory: "행사문의", inquiryTitle: "행사 관련하여 질문", writer: "정영인", registDate: "2023-12-15", views: "25"}
            ]);
            setColumnDefs([
                { field: "inquiryCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "inquiryTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
                { field: "writer", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "registDate", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" } },
                { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } }
            ]);
        }else if(targetMenuId === "bambooForest") {     // 선택한 메뉴 - 대나무숲
            setRowData([
                {inquiryCategory: "수업문의", inquiryTitle: "대나무숲 게시판", writer: "정영인", registDate: "2023-12-13", views: "12"},
                {inquiryCategory: "기타문의", inquiryTitle: "기타 질문", writer: "정영인", registDate: "2023-12-17", views: "10"},
                {inquiryCategory: "행사문의", inquiryTitle: "행사 관련하여 질문", writer: "정영인", registDate: "2023-12-15", views: "25"}
            ]);
            setColumnDefs([
                { field: "inquiryCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "inquiryTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
                { field: "writer", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
                { field: "registDate", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" } },
                { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } }
            ]);
        }

        setSelectedMenu(targetMenuId);
    }

    return (
        <>
            <div className="content" style={{ height: '84.8vh' }}>
                <Row className="align-items-center pb-2">
                    <Col md="7" className="align-items-left no-gutters">
                        <Nav className="community-nav" pills>
                            <NavItem>
                                <NavLink id="question" onClick={moveCommunityMenu} active={selectedMenu === 'question'}>문의</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink id="resourceSharing" onClick={moveCommunityMenu} active={selectedMenu === 'resourceSharing'}>자료공유</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink id="interact" onClick={moveCommunityMenu} active={selectedMenu === 'interact'}>시도교류</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink id="bambooForest" onClick={moveCommunityMenu} active={selectedMenu === 'bambooForest'}>대나무숲</NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                    <Col md="5">
                        <Row className="justify-content-end align-items-center no-gutters">
                            <Input
                                className="ml-3 mr-2"
                                id="searchCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                value={searchCategory}
                                onChange={handleSearchCategory}
                            >
                                <option value='none'>전체</option>
                                <option value='none'>분류명</option>
                                <option value='mName'>제목</option>
                                <option value='mCompany'>작성자</option>
                                <option value='mEffect'>작성일</option>
                            </Input>
                            <Input
                                type="search"
                                value={searchText}
                                onChange={handleSearchText}
                                placeholder="검색 키워드를 입력하세요"
                                autoFocus={true}
                                style={{ width: '300px', height: '40px' }}
                            />
                            <Button className="ml-2" style={{ height: '38px' }}>검색</Button>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <div className="ag-theme-alpine" style={{ height: '72vh' }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData} 
                                columnDefs={columnDefs} 
                                defaultColDef={defaultColDef}
                            />
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-end no-gutters">
                    <Button>글쓰기</Button>
                </Row>
            </div>
        </>
    );
}

export default Community;