import React, { useRef, useState } from "react";
import { Row, Col, Input, Button } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../assets/css/qnarequest.css';
import { FaCheck } from "react-icons/fa";

function QnaRequest() {
    const [searchCategory, setSearchCategory] = useState("");
    const [searchText, setSearchText] = useState("");

    const gridRef = useRef();
    
    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

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

    const [rowData] = useState([
        {inquiryCategory: "수업문의", inquiryTitle: "문의 게시판", writer: "정영인", registDate: "2023-12-13", views: "12"},
        {inquiryCategory: "기타문의", inquiryTitle: "기타 질문", writer: "정영인", registDate: "2023-12-17", views: "10"},
        {inquiryCategory: "행사문의", inquiryTitle: "행사 관련하여 질문", writer: "정영인", registDate: "2023-12-15", views: "25"}
    ]);

    const [columnDefs] = useState([
        { field: "inquiryCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "inquiryTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "writer", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "registDate", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" } },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } }
    ]);

    return (
        <>
            <div className="content">
                <Row className="pb-2">
                    <Col>
                        <blockquote>
                            <p className="blockquote">
                                <FaCheck style={{ color: 'gray' }}/> 주기적으로 선생님(회원)들의 문의나 요청을 확인하고 지속적으로 개선해 나가기 위한 페이지입니다.
                                <br />
                                <FaCheck style={{ color: 'gray' }}/> 개선사항이나 오류사항이 있다면 부담없이 이곳에 글을 작성해 주세요. 가능한 빠른 시간 내에 처리하도록 하겠습니다.
                            </p>
                        </blockquote>
                    </Col>
                    <Col>
                        <Row className="justify-content-end align-items-center no-gutters" style={{ paddingTop: '23px'}}>
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
                                placeholder="검색 키워들르 입력하세요"
                                autoFocus={true}
                                style={{ width: '300px', height: '40px' }}
                            />
                            <Button className="ml-2" style={{ height: '38px' }}>검색</Button>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col md="12">
                        <div className="ag-theme-alpine" style={{ height: '75vh'}}>
                            <AgGridReact 
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                            />
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-end">
                    <Button className="mr-3">글쓰기</Button>
                </Row>
            </div>
        </>
    )
}

export default QnaRequest;