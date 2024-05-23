import React, { useRef, useState } from "react";
import { Row, Col, Input, Button, Modal, ModalHeader, ModalBody, Form, ModalFooter, FormGroup, Label } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../assets/css/qnarequest.css';
import { FaCheck } from "react-icons/fa";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function QnaRequest() {
    const [searchCategory, setSearchCategory] = useState("");
    const [searchText, setSearchText] = useState("");
    const [writingModal, setWritingModal] = useState(false);
    const [writingCategory, setWritingCategory] = useState("");
    const [quaRequestTitleValue, setQnaRequestTitleValue] = useState("");
    const [qnaRequestContentValue, setQnaRequestContentValue] = useState("");
    
    const gridRef = useRef();
    
    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

    const toggleWritingModal = () => setWritingModal(!writingModal);

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

    const handleWriting = () => {
        toggleWritingModal();
    };

    const saveQnaRequest = () => {
        debugger
    };

    const handleChangeWritingCategory = (e) => {
        const targetValue = e.target.value;
        setWritingCategory(targetValue);
    };

    return (
        <>
            <div className="content" style={{ height: '84.8vh' }}>
                <Row className="pb-2">
                    <Col className="d-flex align-items-center">
                        <div className="p-2 text-muted align-items-center text-left" style={{ border: '1px dashed lightgrey', width: '100%', fontSize: 12, borderRadius: 5, backgroundColor: '#fcfcfc' }}>
                            <span>
                                <FaCheck className="mr-2" style={{ color: 'gray' }}/> 개선사항이나 오류사항이 있다면 부담없이 이곳에 글을 작성해 주세요. 가능한 빠른 시간 내에 처리하도록 하겠습니다.
                            </span>
                        </div>
                    </Col>
                    <Col>
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
                        <div className="ag-theme-alpine" style={{ height: '73vh'}}>
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
                    <Button className="mr-1" onClick={handleWriting}>글쓰기</Button>
                    <Button>내 문의 및 요청 내역</Button>
                </Row>
            </div>

            <Modal isOpen={writingModal} toggle={toggleWritingModal} centered style={{ minWidth: '20%' }}>
                <ModalHeader toggle={toggleWritingModal}><b className="text-muted">문의 및 요청 글쓰기</b></ModalHeader>
                <ModalBody>
                    <Row className="d-flex align-items-center no-gutters text-muted mb-2">
                        <Col className="d-flex align-items center" md="5" xs="auto">
                            <label className="pt-2" style={{ width: 25 }}>분류</label>
                            <Input
                                id="writingCategory"
                                className="ml-3"
                                type="select"
                                style={{ width: '80%' }}
                                value={writingCategory}
                                onChange={handleChangeWritingCategory}
                            >
                                <option value="qna">문의사항</option>
                                <option value="request">요청사항</option>
                            </Input>
                        </Col>
                        <Col xs="auto" style={{ marginBottom: '-13px'}}>
                            <Form className="ml-5">
                                <FormGroup inline>
                                    <Input 
                                        id="isSecret"
                                        type="checkbox"
                                    />
                                    <Label>비밀글</Label>
                                </FormGroup>
                            </Form>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center no-gutters text-muted mb-2">
                        <label>제목</label>
                        <Input
                            id="qnaRequestTitle"
                            className="ml-3 p-2"
                            type="text"
                            style={{ width: '90%' }}
                            value={quaRequestTitleValue}
                            onChange={(e) => setQnaRequestTitleValue(e.target.value)}
                        />
                    </Row>
                    <Row className="d-flex align-items-center no-gutters text-muted">
                        <label>내용</label>
                        <Input
                            id="qnaRequestContent"
                            className="ml-3 p-2" 
                            type="textarea"
                            style={{ width: '90%', minHeight: 200 }}
                            value={qnaRequestContentValue}
                            onChange={(e) => setQnaRequestContentValue(e.target.value)}
                        />
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button className="mr-1" color="secondary" onClick={saveQnaRequest}>등록</Button>
                    <Button color="secondary" onClick={toggleWritingModal}>취소</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default QnaRequest;