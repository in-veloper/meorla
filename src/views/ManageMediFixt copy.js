import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Nav, NavItem, NavLink, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Form } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import Notiflix from "notiflix";
import axios from "axios";
import '../assets/css/managemedifixt.css';

const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

function ManageMediFixt_copy() {
    const [selectedMenu, setSelectedMenu] = useState("medicine");
    const [isRemoved, setIsRemoved] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const [registMedicineModal, setRegistMedicineModal] = useState(false);
    const [registMedicineRowData, setRegistMedicineRowData] = useState([]);
    const [searchCategory, setSearchCategory] = useState("");         // 약품 정보 검색 시 선택 분류
    const [searchText, setSearchText] = useState("");                 // 검색어 입력 값 할당 변수
    const [searchResult, setSearchResult] = useState([]);             // 검색 결과 할당 변수

    const medicineGridRef = useRef();
    const fixtureGridRef = useRef();
    const registMedicineGridRef = useRef();

    const toggleRegistMedicineModal = () => setRegistMedicineModal(!registMedicineModal);

    const onGridReady = useCallback((params) => {
    }, []);

    const [medicineRowData] = useState([]);

    const [fixtureRowData] = useState([]);

    // 최근구매일, 최근수정일 Column Fomatter Function
    const valueFormatter = (params) => {
        if (!params.value) return '';
          
        const month = params.value.getMonth() + 1;
        const day = params.value.getDate();
        
        return `${params.value.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }

    // 기본 컬럼 속성 정의 (공통 부분)
    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true,
        editable: true
    };

    const [medicineColDef] = useState([
        {field: "medicineName", headerName: "약품명", flex: 2, cellStyle: { textAlign: "center" }, editable: false},
        {field: "coporateName", headerName: "업체명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "unit", headerName: "단위", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "inventory", headerName: "재고량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "extinct", headerName: "소실량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "lastestPurchaseDate", headerName: "최근 구매일", flex: 2, cellStyle: { textAlign: "center" }, cellEditor: 'agDateCellEditor', valueFormatter: valueFormatter},
        {field: "lastestUpdateDate", headerName: "최근 수정일", flex: 2, cellStyle: { textAlign: "center" }, cellEditor: 'agDateCellEditor', valueFormatter: valueFormatter}
    ]);

    const [fixtureColDef] = useState([
        {field: "fixtureName", headerName: "비품명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "coporateName", headerName: "업체명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "unit", headerName: "단위", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "inventory", headerName: "재고량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "extinct", headerName: "소실량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "lastestPurchaseDate", headerName: "최근 구매일", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "lastestUpdateDate", headerName: "최근 수정일", flex: 2, cellStyle: { textAlign: "center" }}
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

    // 추가할 행 생성
    const createNewRowData = () => {
        const newData = {
            medicineName: "",
            coporateName: "",
            unit: "",
            inventory: 0,
            extinct: 0,
            editable: true
        }
        return newData;
    };

    // Grid 행 추가 Function
    const appendRow = useCallback(() => {
        const api = medicineGridRef.current.api;                                  // api 획득
        const displayedRowCount = api.getDisplayedRowCount();                     // 현재 Grid에서 출력된 행 수
        const newItem = [createNewRowData()];                                     // 추가할 행 데이터 획득

        api.deselectAll();                                                        // 행 선택 상태에서 행 추가 이벤트 발생 시 항목 삭제하는 경우 예외 방지 (모든 행 선택 해제)
        api.applyTransaction({ add: newItem, addIndex: displayedRowCount });      // Grid 최하단 마지막 행으로 추가
        setIsRemoved(false);                                                      // 삭제 상태 state - false 
        setIsRegistered(false);                                                   // Modal Open isRegistered state - false
    }, []);

    // Row에 데이터 변경 시 Ag-Grid 내장 Event
    const onRowDataUpdated = useCallback(() => {                                // 행이 추가되고 난 후 이벤트 (이 지점에서 추가된 행 확인 가능)
        const api = medicineGridRef.current.api;                                  // Ag-Grid api 획득
        const displayedRowCount = api.getDisplayedRowCount();                     // 현재 화면에 보여지는 행의 개수
        const lastRowIndex = displayedRowCount - 1;                               // Edit 속성 부여 위한 마지막 행 Index
        
        if(isRemoved || isRegistered) {                                           // 항목 삭제 버튼 클릭 시 || 초기 bookmark 데이터 불러왔을 시
            api.stopEditing(true);                                                  // Edit 모드 중지
            return;                                                                 // return
        }
        
        if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'medicineName' }); // Edit 모드 진입 (삭제 시 행이 없을 때는 Edit 모드 진입하지 않음)
    }, [isRemoved, isRegistered]);

    // Grid 행 삭제 Function
    const removeRow = () => {                                                     // [필요] : 삭제된 후 마지막 행의 첫 Cell 진입 시 Edit Mode 
        const api = medicineGridRef.current.api;                                  // api 획득
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
        const api = medicineGridRef.current.api;
        const displayedRowCount = api.getDisplayedRowCount(); // 현재 Grid에 출력된 행 수
        
        if(displayedRowCount === 0) {                         // 현재 등록된 약품이 없을 경우
            // 등록된 북마크 없음 Notify
            Notiflix.Notify.warning('등록된 약품이 없습니다.', {
                position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });

            return;                                           // return
        }else{                                                // 등록된 약품이 있을 경우
            api.setRowData([]);                               // 약품 행 전체 삭제 (빈 배열 삽입으로 초기화)
        }
    };

    const onCellClicked = (params) => {
        if(params.column.colId === "medicineName") {
            toggleRegistMedicineModal();
            setSearchCategory('mName');
        }
    }

    const selectMedicine = () => {
        const selectedRows = registMedicineGridRef.current.api.getSelectedRows();

        if(selectedRows.length > 0) {
            const selectedMedicine = selectedRows[0];
            const medicineApi = medicineGridRef.current.api;
            const existingRowNode = medicineApi.getRowNode(selectedMedicine.id);
            
            // 기존 등록된 약품인 경우
            if(existingRowNode) {
                existingRowNode.setData({
                    ...existingRowNode.data,
                    medicineName: selectedMedicine.itemName,
                    coporateName: selectedMedicine.entpName
                });
            }

            toggleRegistMedicineModal();
        }
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
                    
                </Row>
                <Row className="no-gutters">
                    <Col md="7" className="pt-2">
                        <Button size="sm" onClick={appendRow}>추가</Button>
                        <Button className="ml-1" size="sm" onClick={removeRow}>삭제</Button>
                        <Button className="ml-3" size="sm" onClick={allRemoveRow}>전체 삭제</Button>
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
                        <div className="ag-theme-alpine" style={{ height: '78vh' }}>
                            {selectedMenu === 'medicine' && (
                                <AgGridReact
                                    getRowId={(params, index) => index}
                                    ref={medicineGridRef}
                                    rowData={medicineRowData} 
                                    columnDefs={medicineColDef}
                                    defaultColDef={defaultColDef}
                                    onCellContextMenu={onCellContextMenu}
                                    onCellClicked={onCellClicked}
                                    preventDefaultOnContextMenu={true}
                                    stopEditingWhenCellsLoseFocus={true}
                                    onRowDataUpdated={onRowDataUpdated}
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
                    <Button id="medicineInitButton" className="">초기화</Button>
                    <Button id="medicineSaveButton" className="ml-1">저장</Button>
                </Row>
            </div>

            <Modal isOpen={registMedicineModal} toggle={toggleRegistMedicineModal} centered style={{ minWidth: '30%' }}>
                <ModalHeader toggle={toggleRegistMedicineModal}><b className="text-muted">약품 입력</b></ModalHeader>
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
                            style={{ width: '60%', height: '40px'}}
                            onChange={handleSearchText}
                        />
                        <Button className="ml-2" style={{ height: '38px', marginTop: 1 }} onClick={handleSearch}>검색</Button>
                    </Row>
                    <br/>
                    <Row>
                        <Col md="12">
                            <Form onSubmit={selectMedicine}>
                                <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                                    <AgGridReact
                                        ref={registMedicineGridRef}
                                        rowData={searchResult}
                                        columnDefs={registMedicineColDefs}
                                        stopEditingWhenCellsLoseFocus={true}
                                        // singleClickEdit={true}
                                        paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                                        // defaultColDef={defaultColDef}
                                        overlayNoRowsTemplate={ '<span>등록된 증상이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                        overlayLoadingTemplate={
                                            '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                                        }
                                        // onGridReady={onGridReady}
                                        rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                                        enterNavigatesVertically={true}
                                        enterNavigatesVerticallyAfterEdit={true}
                                        // onCellEditingStarted={onCellEditingStarted}
                                        // onCellEditingStopped={onCellEditingStopped}
                                        // onRowDataUpdated={onSymptomRowDataUpdated}
                                        // onCellValueChanged={onCellValueChanged}
                                    />
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button className="mr-1" color="secondary" onClick={selectMedicine}>선택</Button>
                    <Button color="secondary" onClick={toggleRegistMedicineModal}>취소</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default ManageMediFixt_copy;

/**
 * 약품정보 메뉴도 동일하지만 
 * 검색 결과가 없을때 알려주지 않고 계속 로딩 애니메이션만 노출
 * 처리 필요
 * 
 * 행 추가 할떄 계속 첫번째 비정상적인 로우 발생
 * 
 * 삭제 시 모든 로우 삭제되는 현상 발생
 */