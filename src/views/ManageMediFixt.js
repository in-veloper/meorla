import React, { useState, useRef, useEffect, useCallback } from "react";
import { Row, Col, Nav, NavItem, NavLink, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Form, Label } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import Notiflix from "notiflix";
import { useUser } from "../contexts/UserContext.js";
import axios from "axios";
import '../assets/css/managemedifixt.css';
import { useMemo } from "react";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

function ManageMediFixt() {
    const {user} = useUser();
    const [selectedMenu, setSelectedMenu] = useState("medicine");
    const [registMedicineModal, setRegistMedicineModal] = useState(false);
    const [searchCategory, setSearchCategory] = useState("");         // 약품 정보 검색 시 선택 분류
    const [searchText, setSearchText] = useState("");                 // 검색어 입력 값 할당 변수
    const [searchResult, setSearchResult] = useState([]);             // 검색 결과 할당 변수
    const [selectedMedicine, setSelectedMedicine] = useState({ medicineName: "", coporateName: "" });
    const [medicineFormData, setMedicineFormData] = useState({ unit: "", stockAmount: 0, extinctAmount: 0, registrationUnitAmount: 0, lastestPurchaseDate: "" });

    const medicineGridRef = useRef();
    const fixtureGridRef = useRef();
    const registMedicineGridRef = useRef();

    const toggleRegistMedicineModal = () => setRegistMedicineModal(!registMedicineModal);

    // const onGridReady = useCallback((params) => {
    // }, []);

    const [medicineRowData, setMedicineRowData] = useState([]);

    const [fixtureRowData] = useState([]);


    // 아래 에러나는거부터 처리

    const purchaseDateFormatter = (params) => {
        if (!params.value) return '';
        
        const purchaseDate = new Date(params.value);  
        const month = purchaseDate.getMonth() + 1;
        const day = purchaseDate.getDate();

        return `${purchaseDate.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }

    // 최근구매일, 최근수정일 Column Fomatter Function
    const updateAtFormatter = (params) => {
        if (!params.value) return '';
        
        const updateDate = new Date(params.value);  
        const month = updateDate.getMonth() + 1;
        const day = updateDate.getDate();

        return `${updateDate.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }

    // 기본 컬럼 속성 정의 (공통 부분)
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            resizable: true,
            filter: true,
            editable: true
        };
    }, []) ;

    const [medicineColDef] = useState([
        {field: "medicineName", headerName: "약품명", flex: 2, cellStyle: { textAlign: "left" }},
        {field: "coporateName", headerName: "업체명", flex: 2, cellStyle: { textAlign: "left" }},
        {field: "unit", headerName: "단위", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "stockAmount", headerName: "재고량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "extinctAmount", headerName: "소실량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "registrationUnitAmount", headerName: "등록단위", flex: 1, cellStyle: { textAlign: "center"}},
        {field: "latestPurchaseDate", headerName: "최근 구매일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: purchaseDateFormatter},
        {field: "updatedAt", headerName: "최근 수정일", flex: 2, cellStyle: { textAlign: "center" },  valueFormatter: updateAtFormatter}
    ]);

    const [fixtureColDef] = useState([
        {field: "fixtureName", headerName: "비품명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "coporateName", headerName: "업체명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "unit", headerName: "단위", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "inventory", headerName: "재고량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "extinct", headerName: "소실량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "latestPurchaseDate", headerName: "최근 구매일", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "updateAt", headerName: "최근 수정일", flex: 2, cellStyle: { textAlign: "center" }}
    ]);

    const [registMedicineColDefs] = useState([
        { field: "itemName", headerName: "약품명", flex: 1, cellStyle: { textAlign: "left" }},
        { field: "entpName", headerName: "업체명", flex: 1, cellStyle: { textAlign: "left" }}
    ]);

    const moveManageMenu = (e) => {
        const targetMenuId = e.target.id;
        setSelectedMenu(targetMenuId);
    }

    const onCellContextMenu = (params) => {
        const addItems = [
            {
                name: 'Custom Action',
                action: function () {
                console.log('Custom Action Clicked');
                },
            },
        ];
      
        const defaultItems = params.defaultItems;
    
        return addItems.concat(defaultItems);
    }

    // // Row에 데이터 변경 시 Ag-Grid 내장 Event
    // const onRowDataUpdated = useCallback(() => {                                    // 행이 추가되고 난 후 이벤트 (이 지점에서 추가된 행 확인 가능)
    //     const api = medicineGridRef.current.api;                                    // Ag-Grid api 획득
    //     const displayedRowCount = api.getDisplayedRowCount();                       // 현재 화면에 보여지는 행의 개수
    //     const lastRowIndex = displayedRowCount - 1;                                 // Edit 속성 부여 위한 마지막 행 Index
        
    //     if(isRemoved || isRegistered) {                                             // 항목 삭제 버튼 클릭 시 || 초기 bookmark 데이터 불러왔을 시
    //         api.stopEditing(true);                                                  // Edit 모드 중지
    //         return;                                                                 // return
    //     }
        
    //     if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'medicineName' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
    // }, [isRemoved, isRegistered]);

    const addMedicine = () => {
        toggleRegistMedicineModal();
        setSearchCategory('mName');
    }

    const onRowClicked = (params) => {
        const selectedMedicineData = params.data;
        setSelectedMedicine(selectedMedicineData);
    }

    const saveMedicine = async (event) => {
        event.preventDefault();
        
        try {
            const medicineName = document.getElementById('selectedMedicineInput').value;
            const coporateName = document.getElementById('selectedCoporateInput').value;
            const unit = document.getElementById('unit').value;
            const stockAmount = document.getElementById('stockAmount').value;
            const extinctAmount = document.getElementById('extinctAmount').value;
            const registrationUnitAmount = document.getElementById('registrationUnitAmount').value;
            const latestPurchaseDate = document.getElementById('latestPurchaseDate').value;

            Notiflix.Confirm.show(
                '약품 등록',
                '작성하신 약품 정보를 등록하시겠습니까?',
                '예',
                '아니요',
                async () => {
                    const response = await axios.post(`http://${BASE_URL}:8000/stockMedicine/insert`, {
                        userId: user.userId,
                        schoolCode: user.schoolCode,
                        medicineName: medicineName,
                        coporateName: coporateName,
                        unit: unit,
                        stockAmount: stockAmount,
                        extinctAmount: extinctAmount,
                        registrationUnitAmount: registrationUnitAmount,
                        latestPurchaseDate: latestPurchaseDate
                    });

                    if(response.data === "success") {
                        fetchStockMedicineData();

                        Notiflix.Notify.info('약품 등록이 정상적으로 처리되었습니다.', {
                            position: 'center-center', showOnlyTheLastOne: true, plainText: false
                        });

                        resetMedicineForm();
                    }
                },() => {
                    return;
                },{
                    position: 'center-center', showOnlyTheLastOne: true, plainText: false
                }
            )
        } catch (error) {
            console.error('약품 관리 등록 중 ERROR', error);
        }
    }

    const fetchStockMedicineData = useCallback(async () => {
        try {
            if(user?.userId && user?.schoolCode) {
                const response = await axios.post(`http://${BASE_URL}:8000/stockMedicine/getStockMedicine`, {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                });

                if(response.data) {
                    const stockMedicineData = response.data.stockMedicineData;
                    setMedicineRowData(stockMedicineData);
                }
            }
        } catch (error) {
            console.log("약품 재고 조회 중 ERROR", error);
        }
    }, [user?.userId, user?.schoolCode]);
    
    useEffect(() => {
        fetchStockMedicineData();
    },[fetchStockMedicineData]);
    
    
    const resetMedicineForm = () => {
        setSearchText("");

        registMedicineGridRef.current.api.setRowData([]);

        setSelectedMedicine({
            medicineName: "",
            coporateName: ""
        });

        setMedicineFormData({
            unit: "",
            stockAmount: 0,
            extinctAmount: 0,
            registrationUnitAmount: 0,
            lastestPurchaseDate: ""
        });
    }

    // 검색 분류 선택 Event
    const handleSearchCategory = (e) => {
        const selectedCategory = e.target.value;  // 선택한 분류 값
        setSearchCategory(selectedCategory);      // 전역 변수에 할당
    }

    // 검색 Event
    const handleSearch = async (e) => {
        try {
            // 약품 정보 API(e약은요) 호출
            const totalResponse = await axios.get(URL, {
                params: {
                    serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
                    pageNo: 1,                                                    // 페이지 수
                    numOfRows: 1,                                                 // Row 수
                    entpName: searchCategory === 'mCompany' ? searchText : '',    // 업체명
                    itemName: searchCategory === 'mName' ? searchText : '',       // 제품명
                    itemSeq: searchCategory === 'mCode' ? searchText : '',        // 품목코드
                    efcyQesitm: searchCategory === 'mEffect' ? searchText : '',   // 효능
                    type: 'json'                                                  // 조회 시 Return 받을 데이터 Type
                }
            });

            if (totalResponse.data.hasOwnProperty('body')) {                    // 조회 결과 있을 경우(body가 존재할 경우)
                const totalCount = totalResponse.data.body.totalCount;          // 검색 결과 총 수
                const allResults = [];                                          // 모든 결과 할당 변수

                onBtShowLoading();                                              // 검색 처리 시 Loading 화면 출력
                
                const response = await axios.get(URL, {
                    params: {
                        serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
                        pageNo: 1,                                                    // 페이지 수
                        numOfRows: totalCount,                                        // Row 수
                        entpName: searchCategory === 'mCompany' ? searchText : '',    // 업체명
                        itemName: searchCategory === 'mName' ? searchText : '',       // 제품명
                        itemSeq: searchCategory === 'mCode' ? searchText : '',        // 품목코드
                        efcyQesitm: searchCategory === 'mEffect' ? searchText : '',   // 효능
                        type: 'json'                                                  // 조회 시 Return 받을 데이터 Type
                    }
                });

                if(response.data.hasOwnProperty('body')) {                          // 조회 결과 있을 경우(body가 존재할 경우)
                    allResults.push(...response.data.body.items);                   // 조회 결과 할당
                }

                setSearchResult(allResults);                                        // 최종 조회 결과 Grid Row Data로 할당
            }
        } catch (error) {
            console.log("약품 정보 조회 중 ERROR", error);
        }
    }

    // 검색어 입력 후 Enter 입력 시 검색 Event
    const handleKeyDown = (e) => {
        if(e.key === 'Enter') handleSearch(); // Key 입력이 Enter인 경우 검색 Event 호출
    }

    // 검색어 입력 시 입력 값 전역 변수에 할당 
    const handleSearchText = (e) => {   
        e.preventDefault();             // 기본 Event 방지
        setSearchText(e.target.value);  // 전역 변수에 검색어 입력 값 할당
    }

    // 검색 처리 시 Loading 화면 출력 Event
    const onBtShowLoading = useCallback(() => {
        registMedicineGridRef.current.api.showLoadingOverlay(); // Overlay로 로딩 Animation 출력
    }, []);

    return (
        <>
            <div className="content">
                <Row className="align-items-center pb-2">
                    <Col md="7" className="align-items-left no-gutters">
                        <Nav className="medifixt-nav" pills>
                            <NavItem>
                                <NavLink id="medicine" onClick={moveManageMenu} active={selectedMenu === 'medicine'}>약품관리</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink id="fixture" onClick={moveManageMenu} active={selectedMenu === 'fixture'}>비품관리</NavLink>
                            </NavItem>
                        </Nav>
                    </Col>
                    <Col md="5">
                        <Row className="justify-content-end align-items-center no-gutters">
                            <Input
                                className="ml-3 mr-2"
                                id="entireSearchCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                // value={entireSearchCategory}
                                // onChange={handleEntireSearchCategory}
                            >
                                <option value='none'>전체</option>
                                <option value='none'>분류명</option>
                                <option value='mName'>제목</option>
                                <option value='mCompany'>작성자</option>
                                <option value='mEffect'>작성일</option>
                            </Input>
                            <Input
                                type="search"
                                // value={searchText}
                                // onChange={handleSearchText}
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
                        <div className="ag-theme-alpine" style={{ height: '72.7vh' }}>
                            {selectedMenu === 'medicine' && (
                                <AgGridReact
                                    ref={medicineGridRef}
                                    rowData={medicineRowData} 
                                    columnDefs={medicineColDef}
                                    defaultColDef={defaultColDef}
                                    onCellContextMenu={onCellContextMenu}
                                    preventDefaultOnContextMenu={true}
                                    stopEditingWhenCellsLoseFocus={true}
                                    // onRowDataUpdated={onRowDataUpdated}
                                    overlayNoRowsTemplate={ '<span>등록된 약품이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                    overlayLoadingTemplate={
                                        '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                                    }
                                    rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                                    enterNavigatesVertically={true}
                                    enterNavigatesVerticallyAfterEdit={true}
                                />
                            )}
                            {selectedMenu === 'fixture' && (
                                <AgGridReact
                                    ref={fixtureGridRef}
                                    rowData={fixtureRowData} 
                                    columnDefs={fixtureColDef} 
                                />
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-end no-gutters">
                    <Button id="addMedicineButton" className="" onClick={addMedicine}>추가</Button>
                    <Button id="removeMedicineButton" className="ml-1">삭제</Button>
                </Row>
            </div>

            <Modal isOpen={registMedicineModal} toggle={toggleRegistMedicineModal} centered style={{ minWidth: '30%' }}>
                <ModalHeader toggle={toggleRegistMedicineModal}><b className="text-muted">약품 등록</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row>
                        <Input
                            className="ml-3 mr-2"
                            id="searchCategory"
                            name="select"
                            type="select"
                            style={{ width: '20%'}}
                            onChange={handleSearchCategory}
                            value={searchCategory}
                        >
                            <option value='mName'>제품명</option>
                            <option value='mCompany'>업체명</option>
                            <option value='mEffect'>효능</option>
                            <option value='mCode'>품목기준코드</option>
                        </Input>
                        <Input
                            type="search"
                            value={searchText}
                            placeholder="검색 키워드를 입력하세요"
                            onKeyDown={handleKeyDown}
                            autoFocus={true}
                            style={{ width: '59.5%', height: '40px'}}
                            onChange={handleSearchText}
                        />
                        <Button className="ml-2" style={{ height: '38px', marginTop: 1 }} onClick={handleSearch}>검색</Button>
                    </Row>
                    <Row>
                        <Col md="12">
                            <div className="ag-theme-alpine" style={{ height: '17.5vh' }}>
                                <AgGridReact
                                    ref={registMedicineGridRef}
                                    rowData={searchResult}
                                    columnDefs={registMedicineColDefs}
                                    stopEditingWhenCellsLoseFocus={true}
                                    onRowClicked={onRowClicked}
                                    paginationPageSize={4} // 페이지 크기를 원하는 값으로 설정
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 증상이 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                    overlayLoadingTemplate={
                                        '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                                    }
                                    rowSelection={'single'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                                    enterNavigatesVertically={true}
                                    enterNavigatesVerticallyAfterEdit={true}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Form onSubmit={saveMedicine} className="mt-2 mb-3" style={{ border: '1px dotted #babfc7', borderRadius: 4 }}>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">약품명</Label>
                            </Col>
                            <Col md="10" className="no-gutters">
                                <Input
                                    id="selectedMedicineInput" 
                                    type="text" 
                                    value={selectedMedicine.itemName || ""}
                                    onChange={(e) => setSelectedMedicine({...selectedMedicine, itemName: e.target.value})}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">업체명</Label>
                            </Col>
                            <Col md="4" className="no-gutters">
                                <Input
                                    id="selectedCoporateInput"
                                    type="text" 
                                    value={selectedMedicine.entpName || ""}
                                    onChange={(e) => setSelectedMedicine({...selectedMedicine, entpName: e.target.value})}
                                />
                            </Col>
                            <Col md="3" className="text-center align-items-center">
                                <Label className="text-muted">최근 구매일</Label>
                            </Col>
                            <Col md="3" className="no-gutters">
                                <Input
                                    id="latestPurchaseDate"
                                    type="date" 
                                    value={medicineFormData.lastestPurchaseDate || ""}
                                    onChange={(e) => setMedicineFormData({...medicineFormData, lastestPurchaseDate: e.target.value})}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mb-3 mr-3 d-flex align-items-center no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="unit" 
                                    className="text-right" 
                                    type="text"
                                    value={medicineFormData.unit}
                                    onChange={(e) => setMedicineFormData({ ...medicineFormData, unit: e.target.value })}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">재고량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="stockAmount" 
                                    className="text-right" 
                                    type="number" 
                                    value={medicineFormData.stockAmount}
                                    onChange={(e) => setMedicineFormData({ ...medicineFormData, stockAmount: e.target.value })}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">소실량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="extinctAmount" 
                                    className="text-right" 
                                    type="number" 
                                    value={medicineFormData.extinctAmount}
                                    onChange={(e) => setMedicineFormData({ ...medicineFormData, extinctAmount: e.target.value })}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">등록단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="registrationUnitAmount"
                                    className="text-right"
                                    type="number"
                                    value={medicineFormData.registrationUnitAmount}
                                    onChange={(e) => setMedicineFormData({ ...medicineFormData, registrationUnitAmount: e.target.value })}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            <Button onClick={resetMedicineForm}>초기화</Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="mr-1" color="secondary" onClick={saveMedicine}>저장</Button>
                            <Button color="secondary" onClick={toggleRegistMedicineModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default ManageMediFixt;

/**
 * 약품정보 메뉴도 동일하지만 
 * 검색 결과가 없을때 알려주지 않고 계속 로딩 애니메이션만 노출
 * 처리 필요
 * 
 * 행 추가 할떄 계속 첫번째 비정상적인 로우 발생
 * 
 * 삭제 시 모든 로우 삭제되는 현상 발생
 */