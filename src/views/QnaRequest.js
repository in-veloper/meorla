import React, { useRef, useState, useCallback, useEffect } from "react";
import { Row, Col, Input, Button, Modal, ModalHeader, ModalBody, Form, ModalFooter, FormGroup, Label } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../assets/css/qnarequest.css';
import { FaCheck } from "react-icons/fa";
import { useUser } from "contexts/UserContext";
import axios from "axios";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";

const BASE_PORT = process.env.REACT_APP_BASE_PORT;
const BASE_URL = process.env.REACT_APP_BASE_URL;

function QnaRequest() {
    const { user } = useUser();
    const isAdmin = user?.userId === "admin";
    const [searchCategory, setSearchCategory] = useState("");
    const [searchText, setSearchText] = useState("");
    const [writingModal, setWritingModal] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [writingCategory, setWritingCategory] = useState("qna");
    const [qnaRequestTitleValue, setQnaRequestTitleValue] = useState("");
    const [qnaRequestContentValue, setQnaRequestContentValue] = useState("");
    const [isSecretChecked, setIsSecretChecked] = useState(false);
    const [qnaRequestData, setQnaRequestData] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [qnaRequestReplyValue, setQnaRequestReplyValue] = useState("");
    const [myQnaRequestModal, setMyQnaRequestModal] = useState(false);
    const [filteredMyQnaRequestData, setFilteredQnaRequestData] = useState([]);
    
    const gridRef = useRef(null);
    const myQnaRequestGridRef = useRef(null);
    
    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

    const toggleWritingModal = () => setWritingModal(!writingModal);
    const toggleDetailModal = () => setDetailModal(!detailModal);
    const toggleMyQnaRequestModal = () => setMyQnaRequestModal(!myQnaRequestModal);

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

    const categoryFormatter = (params) => {
        if(params.data.qrCategory === "qna") return "문의사항";
        else if(params.data.qrCategory === "request") return "요청사항";
    };

    const registDateFormatter = (params) => {
        const dateTime = params.data.createdAt;

        let dateValue = dateTime.split("T")[0];
        let timeValue = dateTime.split("T")[1];
        const returnDateValue = dateValue.split("-")[0] + "년 " + parseInt(dateValue.split("-")[1]).toString() + "월 " + parseInt(dateValue.split("-")[2]).toString() + "일   ";
        const returnTimeValue = (timeValue.split(":")[0] === "00" ? "00" : parseInt(timeValue.split(":")[0]).toString()) + "시 " + (timeValue.split(":")[1] === "00" ? "00" : parseInt(timeValue.split(":")[1]).toString()) + "분";

        return returnDateValue + returnTimeValue;
    };

    const customContentRenderer = (params) => {
        return params.data.displayContent;
    };

    const replyFormatter = (params) => {
        if(params.data.reply) return "답변";
        else return "미답변";
    };
 
    const [columnDefs] = useState([
        { field: "qrCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: categoryFormatter },
        { field: "qrTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "qrContent", headerName: "내용", flex: 3, cellStyle: { textAlign: "left" }, cellRenderer: customContentRenderer },
        { field: "userName", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "createdAt", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "reply", headerName: "답변여부", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: replyFormatter }
    ]);

    const [myQnaRequestColumnDefs] = useState([
        { field: "qrCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: categoryFormatter },
        { field: "qrTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "qrContent", headerName: "내용", flex: 3, cellStyle: { textAlign: "left" }, cellRenderer: customContentRenderer },
        { field: "createdAt", headerName: "작성일", flex: 3, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "reply", headerName: "답변여부", flex: 1.2, cellStyle: { textAlign: "center" }, valueFormatter: replyFormatter }
    ]);

    const handleWriting = () => {
        toggleWritingModal();
        refreshWritingForm();
    };

    const saveQnaRequest = async () => {
        if(user) {
            const response = await axios.post(`http://${BASE_URL}/api/qnaRequest/saveQnaRequest`, {
                userId: user.userId,
                userName: user.name,
                schoolCode: user.schoolCode,
                writingCategory: writingCategory,
                qnaRequestTitle: qnaRequestTitleValue,
                qnaRequestContent: qnaRequestContentValue,
                isSecret: isSecretChecked
            });

            if(response.data === 'success') {
                const infoMessage = "문의 및 요청사항이 정상적으로 등록되었습니다";
                NotiflixInfo(infoMessage);
                fetchQnaRequestData();
                toggleWritingModal();
            }
        }
    };

    const fetchQnaRequestData = useCallback(async () => {
        if(user) {
            const response = await axios.get(`http://${BASE_URL}/api/qnaRequest/getQnaRequest`, {});
            
            if(response.data) {
                const convertedData = response.data.map(item => {
                    return {
                        ...item,
                        displayContent: item.isSecret && item.userId !== user.userId && !isAdmin ? "비밀글" : item.qrContent
                    };
                });
                setQnaRequestData(convertedData);
            }
        }
    }, [user, isAdmin]);

    const updateQnaRequest = async () => {
        if(user) {
            const response = await axios.post(`http://${BASE_URL}/api/qnaRequest/updateQnaRequest`, {
                rowId: selectedRowData.id,
                userId: user.userId,
                schoolCode: user.schoolCode,
                writingCategory: writingCategory,
                qnaRequestTitle: qnaRequestTitleValue,
                qnaRequestContent: qnaRequestContentValue,
                isSecret: isSecretChecked
            });

            if(response.data === 'success') {
                const infoMessage = "문의 및 요청사항이 정상적으로 수정되었습니다";
                NotiflixInfo(infoMessage);
                fetchQnaRequestData();
                toggleDetailModal();
            } 
        }
    };

    useEffect(() => {
        fetchQnaRequestData();
    }, [fetchQnaRequestData]);

    useEffect(() => {
        if(qnaRequestData && user) {
            const filteredData = qnaRequestData.filter(item => (
                item.userId === user.userId
            ));
            setFilteredQnaRequestData(filteredData);
        }
    }, [qnaRequestData]);

    const handleChangeWritingCategory = (e) => {
        const targetValue = e.target.value;
        setWritingCategory(targetValue);
    };

    const handleChangeIsSecretCheckBox = (e) => {
        setIsSecretChecked(e.target.checked);
    };

    const handleRowDoubleClick = async (params) => {
        setSelectedRowData(params.data);
        setQnaRequestTitleValue(params.data.qrTitle);
        setQnaRequestContentValue(params.data.qrContent);
        setWritingCategory(params.data.qrCategory);
        setIsSecretChecked(params.data.isSecret);
        setQnaRequestReplyValue(params.data.reply);
        setIsEditMode(params.data.userId === user.userId || isAdmin);
        
        toggleDetailModal();

        await incrementViewCount(params.data.id);
    };

    const incrementViewCount = async (rowId) => {
        const response = await axios.post(`http://${BASE_URL}/api/qnaRequest/incrementViewCount`, {
            rowId: rowId
        });

        if(response.data === "success") fetchQnaRequestData();
    };

    const handleReply = async () => {
        const response = await axios.post(`http://${BASE_URL}/api/qnaRequest/replyQnaRequest`, {
            rowId: selectedRowData.id,
            userId: user.userId,
            reply: qnaRequestReplyValue
        });

        if(response.data === 'success') {
            const infoMessage = "답변이 정상적으로 등록되었습니다";
            NotiflixInfo(infoMessage);
            fetchQnaRequestData();
            toggleDetailModal();
        }
    };

    const refreshWritingForm = () => {
        setWritingCategory("qna");
        setQnaRequestTitleValue("");
        setQnaRequestContentValue("");
        setIsSecretChecked(false);
    };

    const handleMyQnaRequest = () => {
        toggleMyQnaRequestModal();
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
                        <div className="ag-theme-alpine" style={{ height: '73vh'}}>
                            <AgGridReact 
                                ref={gridRef}
                                rowData={qnaRequestData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                onRowDoubleClicked={handleRowDoubleClick}
                                overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 문의 및 요청 내역이 없습니다</span>' } 
                            />
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-end no-gutters">
                    <Button className="mr-1" onClick={handleWriting}>글쓰기</Button>
                    <Button onClick={handleMyQnaRequest}>내 문의 및 요청 내역</Button>
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
                                        checked={isSecretChecked}
                                        onChange={handleChangeIsSecretCheckBox}
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
                            value={qnaRequestTitleValue}
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
                    <Col className="p-0 m-0">
                        <Button onClick={refreshWritingForm}>초기화</Button>
                    </Col>
                    <Button className="mr-1" onClick={saveQnaRequest}>등록</Button>
                    <Button onClick={toggleWritingModal}>취소</Button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={detailModal} toggle={toggleDetailModal} centered style={{ minWidth: '20%' }}>
                <ModalHeader toggle={toggleDetailModal}><b className="text-muted">문의 및 요청 상세</b></ModalHeader>
                <ModalBody>
                    <Row className="d-flex align-items-center no-gutters text-muted mb-2">
                        <Col className="d-flex align-items center" md="5" xs="auto">
                            <label className="pt-2" style={{ width: 25 }}>분류</label>
                            <Input
                                id="writingCategory"
                                className="ml-3"
                                type="select"
                                style={{ width: '80%' }}
                                defaultValue={selectedRowData ? selectedRowData.qrCategory : ""}
                                disabled={!isEditMode}
                                onChange={(e) => setWritingCategory(e.target.value)}
                            >
                                <option value="qna">문의사항</option>
                                <option value="request">요청사항</option>
                            </Input>
                        </Col>
                        <Col xs="auto" style={{ marginBottom: '-13px'}}>
                            {isEditMode && (
                                <Form className="ml-5">
                                    <FormGroup inline>
                                        <Input 
                                            id="isSecret"
                                            type="checkbox"
                                            checked={isSecretChecked}
                                            onChange={handleChangeIsSecretCheckBox}
                                        />
                                        {' '}
                                        <Label>비밀글</Label>
                                    </FormGroup>
                                </Form>
                            )}
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center no-gutters text-muted mb-2">
                        <label>제목</label>
                        <Input
                            id="qnaRequestTitle"
                            className="ml-3 p-2"
                            type="text"
                            style={{ width: '90%' }}
                            defaultValue={selectedRowData ? selectedRowData.qrTitle : ""}
                            readOnly={!isEditMode}
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
                            defaultValue={selectedRowData && user ? (selectedRowData.isSecret && selectedRowData.userId !== user.userId ? "비밀글" : selectedRowData.qrContent) : ""}
                            readOnly={!isEditMode}
                            onChange={(e) => setQnaRequestContentValue(e.target.value)}
                        />
                    </Row>
                    <hr className="pt-1 pb-1"/>
                    <Row className="d-flex align-items-center no-gutters text-muted">
                        <label>답변</label>
                        <Input 
                            id="qnaRequestReply"
                            className="ml-3 p-2"
                            type="textarea"
                            style={{ width: '90%', height: 70, textAlign: !qnaRequestReplyValue && !isAdmin ? 'center' : '', lineHeight: !qnaRequestReplyValue && !isAdmin ? '50px' : '', backgroundColor: !qnaRequestReplyValue && !isAdmin ? '#E9ECEF' : '' }}
                            value={qnaRequestReplyValue ? qnaRequestReplyValue : (isAdmin ? "" : "등록된 답변이 없습니다")}
                            onChange={(e) => setQnaRequestReplyValue(e.target.value)}
                            readOnly={!isAdmin}
                        />
                    </Row>
                </ModalBody>
                <ModalFooter>
                    {isAdmin && (
                        <Col className="ml-0">
                            <Button color="secondary" onClick={handleReply} style={{ marginLeft: '0 auto'}}>답변</Button>
                        </Col>
                    )}
                    {isEditMode ? (
                        <Row>
                            <Button onClick={updateQnaRequest}>수정</Button>
                            <Button className="ml-1" onClick={toggleDetailModal}>취소</Button>
                        </Row>
                    ) : (
                        <Button onClick={toggleDetailModal}>닫기</Button>
                    )}
                </ModalFooter>
            </Modal>

            <Modal isOpen={myQnaRequestModal} toggle={toggleMyQnaRequestModal} centered style={{ minWidth: '58%' }}>
                <ModalHeader toggle={toggleMyQnaRequestModal}><b className="text-muted">내 문의 및 요청 내역</b></ModalHeader>
                <ModalBody>
                    <div className="ag-theme-alpine" style={{ height: '30vh'}}>
                        <AgGridReact 
                            ref={myQnaRequestGridRef}
                            rowData={filteredMyQnaRequestData}
                            columnDefs={myQnaRequestColumnDefs}
                            defaultColDef={defaultColDef}
                            onRowDoubleClicked={handleRowDoubleClick}
                            overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 문의 및 요청 내역이 없습니다</span>' } 
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleMyQnaRequestModal}>닫기</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default QnaRequest;