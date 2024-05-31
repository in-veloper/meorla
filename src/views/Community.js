import React, { useState, useRef, useEffect, useCallback } from "react";
import { Row, Col, Nav, NavItem, NavLink, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Label } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import { useUser } from "contexts/UserContext";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "../assets/css/community.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import { LiaCrownSolid } from "react-icons/lia";
import NotiflixWarn from "components/Notiflix/NotiflixWarn";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Community() {
    const { user } = useUser();
    const [searchCategory, setSearchCategory] = useState("");
    const [searchText, setSearchText] = useState("");
    const [selectedMenu, setSelectedMenu] = useState("opinionSharing");
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [writeModal, setWriteModal] = useState(false);
    const [contentData, setContentData] = useState("");
    const [titleValue, setTitleValue] = useState("");
    const [selectedCategoryOption, setSelectedCategoryOption] = useState("healthClass");
    const [opinionSharingData, setOpinionSharingData] = useState([]);
    const [detailModal, setDetailModal] = useState(false);
    const [opinionSharingSelectedRow, setOpinionSharingSelectedRow] = useState(null);
    const [opinionDetailContentData, setOpinionDetailContentData]  = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [opinionTitleDetailValue, setOpinionTitleDetailValue] = useState("");
    const [opinionCategoryDetailValue, setOpinionCategoryDetailValue] = useState("");
    const [opinionContentDetailValue, setOpinionContentDetailValue] = useState("");
    const [isThumbedUp, setIsThumbedUp] = useState(false);
    const [opinionPinnedRows, setOpinionPinnedRows] = useState([]);

    const opinionSharingGridRef = useRef(null);
    const quillRef = useRef(null);

    const toggleWriteModal = () => setWriteModal(!writeModal);
    const toggleDetailModal = () => setDetailModal(!detailModal);

    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true
    };

    const opinionSharingCategoryFormatter = (params) => {
        if(params.data.osCategory === "healthClass") return "보건수업";
        else if(params.data.osCategory === "healthEdu") return "보건교육";
        else if(params.data.osCategory === "manageStudentHealth") return "학생건강관리";
        else if(params.data.osCategory === "manageBusiness") return "사업관리";
        else if(params.data.osCategory === "etc") return "기타";
    };

    const registDateFormatter = (params) => {
        const dateTime = params.data.createdAt;

        let dateValue = dateTime.split("T")[0];
        let timeValue = dateTime.split("T")[1];
        const returnDateValue = dateValue.split("-")[0] + "년 " + parseInt(dateValue.split("-")[1]).toString() + "월 " + parseInt(dateValue.split("-")[2]).toString() + "일   ";
        const returnTimeValue = (timeValue.split(":")[0] === "00" ? "00" : parseInt(timeValue.split(":")[0]).toString()) + "시 " + (timeValue.split(":")[1] === "00" ? "00" : parseInt(timeValue.split(":")[1]).toString()) + "분";

        return returnDateValue + returnTimeValue;
    };

    const [opinionSharingColDef] = useState([
        { field: "osCategory", headerName: "분류", flex: 1, cellStyle: { textAlign: "center" }, valueFormatter: opinionSharingCategoryFormatter },
        { field: "osTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
        { field: "userName", headerName: "작성자", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "createdAt", headerName: "작성일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
        { field: "views", headerName: "조회수", flex: 1, cellStyle: { textAlign: "center" } },
        { field: "recommendationCount", headerName: "추천수", flex: 1, cellStyle: { textAlign: "center" } }
    ]);

    const modules = {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          [
            { list: "ordered" },
            { list: "bullet" }
          ],
          ["link", "image"],
          [{ align: [] }, { color: [] }, { background: [] }], // dropdown with defaults from theme
        ],
    };
    
    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "align",
        "color",
        "background",
    ]; 

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
    };

    const writeInCommunity = () => {
        toggleWriteModal();
    };

    const resetWrite = () => {
        setTitleValue("");
        setContentData("");
    };

    const saveWrite = async () => {
        const payload = { content: contentData };

        const response = await axios.post(`http://${BASE_URL}:8000/community/saveOpinionSharing`, {
            userId: user.userId,
            userName: user.name,
            schoolCode: user.schoolCode,
            osCategory: selectedCategoryOption,
            osTitle: titleValue,
            osContent: JSON.stringify(payload)
        });

        if(response.data === 'success') {
            const infoMessage = "의견공유 글이 정상적으로 등록되었습니다";
            NotiflixInfo(infoMessage);
            toggleWriteModal();
            fetchOpinionSharingData();
        }
    };

    const fetchOpinionSharingData = useCallback(async () => {
        if(user) {
            const response = await axios.get(`http://${BASE_URL}:8000/community/getOpinionSharing`, {});

            if(response.data) {
                const responseData = response.data;
                setOpinionSharingData(responseData);

                const sortedData = responseData.sort((a, b) => b.recommendationCount - a.recommendationCount);
                setOpinionPinnedRows(sortedData.slice(0, 3));
            }
        }
    }, [user]);

    useEffect(() => {
        fetchOpinionSharingData();
    }, [fetchOpinionSharingData]);

    const handleQuillChange = (content, delta, source, editor) => {
        setContentData(editor.getContents());
    };

    const handleDetailQuillChange = (content, delta, source, editor) => {
        setOpinionContentDetailValue(editor.getContents());
    };

    const handleSelectCategoryOption = (e) => {
        setSelectedCategoryOption(e.target.value);
    };

    const opinionSharingDoubleClick = async (params) => {
        const selectedRow = params.data;
        debugger
        opinionCheckThumbsUp(selectedRow.id);
        setOpinionSharingSelectedRow(selectedRow);
        setOpinionCategoryDetailValue(selectedRow.osCategory);
        setOpinionTitleDetailValue(selectedRow.osTitle);
        setOpinionContentDetailValue(selectedRow.osContent);
        setIsEditMode(params.data.userId === user.userId);
        toggleDetailModal();

        const parsedContent = JSON.parse(selectedRow.osContent);
        setOpinionDetailContentData(parsedContent.content);

        await opinionSharingIncrementViewCount(params.data.id);
    };

    const opinionSharingIncrementViewCount = async (rowId) => {
        const response = await axios.post(`http://${BASE_URL}:8000/community/opinionSharingIncrementViewCount`, {
            rowId: rowId
        });

        if(response.data === "success") fetchOpinionSharingData();
    };

    const updateOpinionSharing = async () => {
        const payload = { content: opinionContentDetailValue };

        const response = await axios.post(`http://${BASE_URL}:8000/community/updateOpinionSharing`, {
            userId: user.userId,
            schoolCode: user.schoolCode,
            rowId: opinionSharingSelectedRow.id,
            osCategory: opinionCategoryDetailValue,
            osTitle: opinionTitleDetailValue,
            osContent: JSON.stringify(payload)
        });

        if(response.data === 'success') {
            const infoMessage = "의견공유 글이 정상적으로 수정되었습니다";
            NotiflixInfo(infoMessage);
            fetchOpinionSharingData();
            toggleDetailModal();
        }
    };

    const onThumbsUp = async (flag) => {
        if(isThumbedUp) {
            const response = await axios.post(`http://${BASE_URL}:8000/community/thumbsDown`, {
                viewType: flag,
                userId: user.userId,
                postId: opinionSharingSelectedRow.id
            });

            if(response.data === 'success') {
                const infoMessage = "추천을 취소하였습니다";
                NotiflixInfo(infoMessage);
                await opinionCheckThumbsUp(opinionSharingSelectedRow.id);
            }
        }else{
            const response = await axios.post(`http://${BASE_URL}:8000/community/thumbsUp`, {
                viewType: flag,
                userId: user.userId,
                postId: opinionSharingSelectedRow.id
            });
    
            if(response.data === 'success') {
                const infoMessage = "현재 글을 추천하였습니다";
                NotiflixInfo(infoMessage);
                await opinionCheckThumbsUp(opinionSharingSelectedRow.id);
            }else if(response.data === 'duplicate') {
                const warnMessage = "이미 현재 글을 추천하였습니다";
                NotiflixWarn(warnMessage);
                await opinionCheckThumbsUp(opinionSharingSelectedRow.id);
            }
        }
    };

    const opinionCheckThumbsUp = async (rowId) => {
        const response = await axios.get(`http://${BASE_URL}:8000/community/opinionCheckThumbsUp`, {
            params: {
                viewType: 'os',
                userId: user.userId,
                postId: rowId
            }
        });
        if(response.data) {
            if(response.data.hasThumbedUp === 0) setIsThumbedUp(false);
            else if(response.data.hasThumbedUp === 1) setIsThumbedUp(true);
        }
    };

    const getRowClass = (params) => {
        if(params.node.rowPinned) {
            return 'pinned-row';
        }
    };

    return (
        <>
            <div className="content" style={{ height: '84.8vh' }}>
                <Row className="align-items-center pb-2">
                    <Col md="7" className="align-items-left no-gutters">
                        <Nav className="community-nav" pills>
                            <NavItem>
                                <NavLink id="opinionSharing" onClick={moveCommunityMenu} active={selectedMenu === 'opinionSharing'}>의견공유</NavLink>
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
                            {selectedMenu === 'opinionSharing' && (
                                <AgGridReact
                                    ref={opinionSharingGridRef}
                                    rowData={opinionSharingData} 
                                    columnDefs={opinionSharingColDef} 
                                    defaultColDef={defaultColDef}
                                    onRowDoubleClicked={opinionSharingDoubleClick}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 의견공유 글이 없습니다</span>' } 
                                    pinnedTopRowData={opinionPinnedRows}
                                    getRowClass={getRowClass}
                                />
                            )}
                            {selectedMenu === 'resourceSharing' && (
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData} 
                                    columnDefs={columnDefs} 
                                    defaultColDef={defaultColDef}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 자료공유 글이 없습니다</span>' }
                                />
                            )}
                            {selectedMenu === 'interact' && (
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData} 
                                    columnDefs={columnDefs} 
                                    defaultColDef={defaultColDef}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 시도교류 글이 없습니다</span>' }
                                />
                            )}
                            {selectedMenu === 'bambooForest' && (
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData} 
                                    columnDefs={columnDefs} 
                                    defaultColDef={defaultColDef}
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 대나무숲 글이 없습니다</span>' }
                                />
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-end no-gutters">
                    <Button onClick={writeInCommunity}>글쓰기</Button>
                    {selectedMenu === 'opinionSharing' && (
                        <Button className="ml-1">내가 쓴 의견공유 글</Button>
                    )}
                    {selectedMenu === 'resourceSharing' && (
                        <Button className="ml-1">내가 쓴 자료공유 글</Button>
                    )}
                    {selectedMenu === 'interact' && (
                        <Button className="ml-1">내가 쓴 시도교류 글</Button>
                    )}
                    {selectedMenu === 'bambooForest' && (
                        <Button className="ml-1">내가 쓴 대나무숲 글</Button>
                    )}
                </Row>
            </div>

            <Modal isOpen={writeModal} toggle={toggleWriteModal} centered style={{ minWidth: '32%' }}>
                <ModalHeader toggle={toggleWriteModal}><b className="text-muted">의견공유 글쓰기</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row className="d-flex align-items-center text-muted no-gutters">
                        <Col md="1" className="text-center">
                            <Label>분류</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input
                                id="communityCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                value={selectedCategoryOption}
                                onChange={handleSelectCategoryOption}
                            >
                                <option value='healthClass'>보건수업</option>
                                <option value='healthEdu'>보건교육</option>
                                <option value='manageStudentHealth'>학생건강관리</option>
                                <option value='manageBusiness'>사업관리</option>
                                <option value='etc'>기타</option>
                            </Input>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>제목</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input 
                                id="communityTitle"
                                type="text"
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>내용</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <div style={{ height: '24.6vh'}}>
                                <ReactQuill
                                    ref={quillRef}
                                    style={{ height: "18vh" }}
                                    theme="snow"
                                    modules={modules}
                                    formats={formats}
                                    value={contentData || ""}
                                    onChange={handleQuillChange}
                                />
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            <Button onClick={resetWrite}>초기화</Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="mr-1" color="secondary" onClick={saveWrite}>저장</Button>
                            <Button color="secondary" onClick={toggleWriteModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>

            <Modal isOpen={detailModal} toggle={toggleDetailModal} centered style={{ minWidth: '32%' }}>
                <ModalHeader toggle={toggleDetailModal}><b className="text-muted">의견공유 상세</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row className="d-flex align-items-center text-muted no-gutters">
                        <Col md="1" className="text-center">
                            <Label>분류</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input
                                id="communityCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                defaultValue={opinionSharingSelectedRow ? opinionSharingSelectedRow.osCategory : ""}
                                onChange={(e) => setOpinionCategoryDetailValue(e.target.value)}
                                disabled={!isEditMode}
                            >
                                <option value='healthClass'>보건수업</option>
                                <option value='healthEdu'>보건교육</option>
                                <option value='manageStudentHealth'>학생건강관리</option>
                                <option value='manageBusiness'>사업관리</option>
                                <option value='etc'>기타</option>
                            </Input>
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>제목</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                            <Input 
                                id="communityTitle"
                                type="text"
                                defaultValue={opinionSharingSelectedRow ? opinionSharingSelectedRow.osTitle : ""}
                                onChange={(e) => setOpinionTitleDetailValue(e.target.value)}
                                readOnly={!isEditMode}
                            />
                        </Col>
                    </Row>
                    <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                        <Col md="1" className="text-center">
                            <Label>내용</Label>
                        </Col>
                        <Col md="11" className="pr-4">
                                {isEditMode ? (
                                    <div style={{ height: '24.6vh'}}>
                                        <ReactQuill
                                            ref={quillRef}
                                            style={{ height: "18vh" }}
                                            theme="snow"
                                            modules={modules}
                                            formats={formats}
                                            defaultValue={opinionDetailContentData || ""}
                                            onChange={handleDetailQuillChange}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: '26vh'}}>
                                        <ReactQuill
                                            ref={quillRef}
                                            style={{ height: "24.5vh" }}
                                            theme="snow"
                                            modules={{ toolbar: false }}
                                            readOnly={true}
                                            value={opinionDetailContentData || ""}
                                        />
                                    </div>
                                )}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            {!isEditMode && (
                                <Button onClick={() => onThumbsUp("os")}>
                                    <LiaCrownSolid className="mr-1" style={{ fontSize: 18, marginTop: '-2px', color: isThumbedUp ? 'gold' : '' }}/>추천
                                </Button>
                            )}
                        </Col>
                            {isEditMode ? (
                                <Col className="d-flex justify-content-end">
                                    <Button onClick={updateOpinionSharing}>수정</Button>
                                    <Button className="ml-1" onClick={toggleDetailModal}>취소</Button>
                                </Col>
                            ) : (
                                <Col className="d-flex justify-content-end">
                                    <Button onClick={toggleDetailModal}>취소</Button>
                                </Col>
                            )}
                    </Row>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default Community;