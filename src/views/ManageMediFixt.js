import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Row, Col, Nav, NavItem, NavLink, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Form, Label } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { useUser } from "../contexts/UserContext.js";
import axios from "axios";
import { Block } from 'notiflix/build/notiflix-block-aio';
import '../assets/css/managemedifixt.css';
import NotiflixInfo from "components/Notiflix/NotiflixInfo.js";
import NotiflixWarn from "components/Notiflix/NotiflixWarn.js";
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm.js";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function ManageMediFixt() {
    const {user} = useUser();
    const [selectedMenu, setSelectedMenu] = useState("medicine");
    const [registMedicineModal, setRegistMedicineModal] = useState(false);
    const [updateMedicineModal, setUpdateMedicineModal] = useState(false);
    const [registFixtModal, setRegistFixtModal] = useState(false);
    const [searchCategory, setSearchCategory] = useState("mName");         // 약품 정보 검색 시 선택 분류
    const [searchText, setSearchText] = useState("");                 // 검색어 입력 값 할당 변수
    const [searchResult, setSearchResult] = useState([]);             // 검색 결과 할당 변수
    const [selectedMedicine, setSelectedMedicine] = useState({ medicineName: "", coporateName: "" });
    const [medicineFormData, setMedicineFormData] = useState({ unit: "", stockAmount: 0, extinctAmount: 0, registrationUnitAmount: 0, lastestPurchaseDate: "" });
    const [medicineData, setMedicineData] = useState([]);
    const [medicineRowData, setMedicineRowData] = useState([]);
    const [fixtureRowData, setFixtureRowData] = useState([]);
    const [fixtNameValue, setFixtNameValue] = useState("");
    const [fixtCoporateValue, setFixtCoporateValue] = useState("");
    const [fixtLatestPurchaseDate, setFixtLatestPurchaseDate] = useState("");
    const [fixtUnit, setFixtUnit] = useState("");
    const [fixtStockAmount, setFixtStockAmount] = useState("");
    const [fixtExtinctAmount, setFixtExtinctAmount] = useState("");
    const [fixtRegistrationUnitAmount, setFixtRgistrationUnitAmount] = useState("");
    const [selectedMedicineRowData, setSelectedMedicineRowData] = useState(null);
    const [selectedFixtRowData, setSelectedFixtRowData] = useState(null);
    const [updatedMedicineName, setUpdatedMedicineName] = useState("");
    const [updatedMedicineCoporateName, setUpdateeMedicineCoporateName] = useState("");
    const [updatedMedicineLatestPurchaseDate, setUpdatedMedicineLatestPurchaseDate] = useState("");
    const [updatedMedicineUnit, setUpdatedMedicineUnit] = useState("");
    const [updatedMedicineStockAmount, setUpdatedMedicineStockAmount] = useState("");
    const [updatedMedicineExtinctAmount, setUpdatedMedicineExtinctAmount] = useState("");
    const [updatedMedicineRegistrationUnit, setUpdatedMedicineRegistrationUnit] = useState("");
    const [selectedMedicineInUpdate, setSelectedMedicineInUpdate] = useState("");
    const [updateFixtModal, setUpdateFixtModal] = useState(false);
    const [updatedFixtName, setUpdatedFixtName] = useState("");
    const [updatedFixtCoporate, setUpdatedCoporate] = useState("");
    const [updatedFixtLatestPurchaseDate, setUpdatedFixtLatestPurchaseDate] = useState("");
    const [updatedFixtUnit, setUpdatedFixtUnit] = useState("");
    const [updatedFixtStockAmount, setUpdatedFixtStockAmount] = useState("");
    const [updatedFixtExtinctAmount, setUpdatedFixtExtinctAmount] = useState("");
    const [updatedFixtRegistrationUnitAmount, setUpdatedFixtRgistrationUnitAmount] = useState("");

    const medicineGridRef = useRef();
    const fixtureGridRef = useRef();
    const registMedicineGridRef = useRef();

    const toggleRegistMedicineModal = () => setRegistMedicineModal(!registMedicineModal);
    const toggleRegistFixtModal = () => setRegistFixtModal(!registFixtModal);
    const toggleUpdateMedicineModal = () => setUpdateMedicineModal(!updateMedicineModal);
    const toggleUpdateFixtModal = () => setUpdateFixtModal(!updateFixtModal);

    const purchaseDateFormatter = (params) => {
        if (!params.value) return '';
        
        const purchaseDate = new Date(params.value);  
        const month = purchaseDate.getMonth() + 1;
        const day = purchaseDate.getDate();

        return `${purchaseDate.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    };

    // 최근구매일, 최근수정일 Column Fomatter Function
    const updateAtFormatter = (params) => {
        if (!params.value) return '';
        
        const updateDate = new Date(params.value);  
        const month = updateDate.getMonth() + 1;
        const day = updateDate.getDate();

        return `${updateDate.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    };

    // 기본 컬럼 속성 정의 (공통 부분)
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            resizable: true,
            filter: true,
            editable: false
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
        {field: "updatedAt", headerName: "최근 수정일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: updateAtFormatter}
    ]);

    const [fixtureColDef] = useState([
        {field: "fixtName", headerName: "비품명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "fixtCoporate", headerName: "업체명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "fixtUnit", headerName: "단위", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "fixtStockAmount", headerName: "재고량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "fixtExtinctAmount", headerName: "소실량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "fixtLatestPurchaseDate", headerName: "최근 구매일", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "updatedAt", headerName: "최근 수정일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: updateAtFormatter}
    ]);

    const [registMedicineColDefs] = useState([
        { field: "itemName", headerName: "약품명", flex: 1, cellStyle: { textAlign: "left" }},
        { field: "entpName", headerName: "업체명", flex: 1, cellStyle: { textAlign: "left" }}
    ]);

    const moveManageMenu = (e) => {
        const targetMenuId = e.target.id;
        setSelectedMenu(targetMenuId);
    };

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
    };

    const fetchMedicineData = useCallback(async () => {
        if(!document.querySelector('.notiflix-block')) Block.dots('.ag-theme-alpine');

        const response = await axios.get(`${BASE_URL}/api/medicineInfo/getMedicineData`, {});

        if(response.data) {
            setMedicineData(response.data);
            setSearchResult(response.data);
        }

        if(document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
    }, [user]);

    useEffect(() => {
        fetchMedicineData();
    }, [fetchMedicineData]);

    const addMedicineFixt = () => {
        if(selectedMenu === "medicine") {
            toggleRegistMedicineModal();
            setSearchCategory('mName');
        }else if(selectedMenu === "fixture") {
            toggleRegistFixtModal();
        }
    };

    const onRowClicked = (params) => {
        const selectedMedicineData = params.data;
        setSelectedMedicine(selectedMedicineData);
    };

    const onRowClickedInUpdate = (params) => {
        const selectedMedicineData = params.data;
        setSelectedMedicineInUpdate(selectedMedicineData);
        
        const updatedMedicineInput = document.getElementById("updatedMedicineInput");
        const updatedCoporateInput = document.getElementById("updatedCoporateInput");
        updatedMedicineInput.value = selectedMedicineData.itemName;
        updatedCoporateInput.value = selectedMedicineData.entpName;
    };

    const saveMedicine = async () => {
        const medicineName = document.getElementById('selectedMedicineInput').value;
        const coporateName = document.getElementById('selectedCoporateInput').value;
        const unit = document.getElementById('unit').value;
        const stockAmount = document.getElementById('stockAmount').value;
        const extinctAmount = document.getElementById('extinctAmount').value;
        const registrationUnitAmount = document.getElementById('registrationUnitAmount').value;
        const latestPurchaseDate = document.getElementById('latestPurchaseDate').value;

        const response = await axios.post(`${BASE_URL}/api/stockMedicine/insert`, {
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
            const infoMessage = "약품 재고가 정상적으로 등록되었습니다";
            NotiflixInfo(infoMessage);

            fetchStockMedicineData();
            resetMedicineForm();
        }
    };

    const fetchStockMedicineData = useCallback(async () => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/stockMedicine/getStockMedicine`, {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });

            if(response.data)  setMedicineRowData(response.data);
        }
    }, [user]);
    
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
    };

    // 검색 분류 선택 Event
    const handleSearchCategory = (e) => {
        const selectedCategory = e.target.value;  // 선택한 분류 값
        setSearchCategory(selectedCategory);      // 전역 변수에 할당
    };

    // 검색 Event
    const handleSearch = async (e) => {
        if(!document.querySelector('.notiflix-block')) Block.dots('.search-medicine');
        
        if(medicineData.length > 0) {
            let filteredResults = medicineData;
            
            if(searchText.trim() !== "") {
                filteredResults = medicineData.filter(item => {
                    return (
                        (searchCategory === 'mCompany' && item.entpName.includes(searchText)) ||
                        (searchCategory === 'mName' && item.itemName.includes(searchText)) ||
                        (searchCategory === 'mCode' && item.itemSeq.includes(searchText)) ||
                        (searchCategory === 'mEffect' && item.efcyQesitm.includes(searchText))
                    )
                });
            }
            
            setSearchResult(filteredResults);
        }

        if(document.querySelector('.notiflix-block')) Block.remove('.search-medicine');
    };

    // 검색어 입력 후 Enter 입력 시 검색 Event
    const handleKeyDown = (e) => {
        if(e.key === 'Enter') handleSearch(); // Key 입력이 Enter인 경우 검색 Event 호출
    };

    // 검색어 입력 시 입력 값 전역 변수에 할당 
    const handleSearchText = (e) => {   
        e.preventDefault();             // 기본 Event 방지
        setSearchText(e.target.value);  // 전역 변수에 검색어 입력 값 할당
    };

    const saveFixt = async () => {
        if(user) {
            const response = await axios.post(`${BASE_URL}/api/stockFixt/saveStockFixt`, {
                userId: user.userId,
                schoolCode: user.schoolCode,
                fixtName: fixtNameValue,
                fixtCoporate: fixtCoporateValue,
                fixtLatestPurchaseDate: fixtLatestPurchaseDate,
                fixtUnit: fixtUnit,
                fixtStockAmount: fixtStockAmount,
                fixtExtinctAmount: fixtExtinctAmount,
                fixtRegistrationUnitAmount: fixtRegistrationUnitAmount
            });

            if(response.data === "success") {
                const infoMessage = "비품이 정상적으로 등록되었습니다";
                NotiflixInfo(infoMessage);

                fetchStockFixtData();
                resetFixtForm();
            }
        }
    };

    const fetchStockFixtData = useCallback(async () => {
        if(user) {
            const response = await axios.get(`${BASE_URL}/api/stockFixt/getStockFixt`, {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });

            if(response.data) setFixtureRowData(response.data);
        }
    }, [user]);

    useEffect(() => {
        fetchStockFixtData();
    }, [fetchStockFixtData]);

    const resetFixtForm = () => {
        setFixtNameValue("");
        setFixtCoporateValue("");
        setFixtLatestPurchaseDate("");
        setFixtUnit("");
        setFixtStockAmount("");
        setFixtExtinctAmount("");
        setFixtRgistrationUnitAmount("");
    };

    const updateMedicineFixt = () => {
        if(selectedMenu === "medicine") {
            if(selectedMedicineRowData) {
                toggleUpdateMedicineModal();
            }else{
                const warnMessage = "수정할 행을 선택해 주세요";
                NotiflixWarn(warnMessage);
            }
        }else if(selectedMenu === "fixture") {
            if(selectedFixtRowData) {
                toggleUpdateFixtModal();
            }else{
                const warnMessage = "수정할 행을 선택해 주세요";
                NotiflixWarn(warnMessage);
            }
        }
    };

    const deleteMedicineFixt = async () => {
        if(selectedMenu === "medicine") {
            const medicineSelectedRow = medicineGridRef.current.api.getSelectedRows()[0];
            if(medicineSelectedRow) { 
                const confirmTitle = "약품관리 삭제";
                const confirmMessage = "선택하신 약품 재고를 삭제하시겠습니까?";

                const yesCallback = async () => {
                    const response = await axios.post(`${BASE_URL}/api/stockMedicine/deleteStockMedicine`, {
                        userId: user.userId,
                        schoolCode: user.schoolCode,
                        rowId: medicineSelectedRow.id
                    });
                    
                    if(response.data === 'success') {
                        const infoMessage = "약품 재고가 정상적으로 삭제되었습니다";
                        NotiflixInfo(infoMessage);
                        fetchStockMedicineData();
                    }
                };

                const noCallback = () => {
                    return;
                }

                NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
            }else{
                const warnMessage = "삭제할 행을 선택해 주세요";
                NotiflixWarn(warnMessage);
            }
        }else if(selectedMenu === "fixture") {
            const fixtureSelectedRow = fixtureGridRef.current.api.getSelectedRows()[0];
            if(fixtureSelectedRow) {
                const confirmTitle = "비품관리 삭제";
                const confirmMessage = "선택하신 비품 재고를 삭제하시겠습니까?";

                const yesCallback = async () => {
                    const response = await axios.post(`${BASE_URL}/api/stockFixt/deleteStockFixt`, {
                        userId: user.userId,
                        schoolCode: user.schoolCode,
                        rowId: fixtureSelectedRow.id
                    });

                    if(response.data === 'success') {
                        const infoMessage = "비품 재고가 정상적으로 삭제되었습니다";
                        NotiflixInfo(infoMessage);
                        fetchStockFixtData();
                    }
                };

                const noCallback = () => {
                    return;
                };

                NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
            }else{
                const warnMessage = "삭제할 행을 선택해 주세요";
                NotiflixWarn(warnMessage);
            }
        }
    };

    const handleMedicineRowClick = (params) => {
        setSelectedMedicineRowData(params.data);
        setUpdatedMedicineName(params.data.medicineName);
        setUpdateeMedicineCoporateName(params.data.coporateName);
        setUpdatedMedicineLatestPurchaseDate(params.data.latestPurchaseDate);
        setUpdatedMedicineUnit(params.data.unit);
        setUpdatedMedicineStockAmount(params.data.stockAmount);
        setUpdatedMedicineExtinctAmount(params.data.extinctAmount);
        setUpdatedMedicineRegistrationUnit(params.data.registrationUnitAmount);
    };

    const handleMedicineRowDoubleClick = () => {
        toggleUpdateMedicineModal();
    };

    const handleFixtRowClick = (params) => {
        setSelectedFixtRowData(params.data);
        setUpdatedFixtName(params.data.fixtName);
        setUpdatedCoporate(params.data.fixtCoporate);
        setUpdatedFixtLatestPurchaseDate(params.data.fixtLatestPurchaseDate);
        setUpdatedFixtUnit(params.data.fixtUnit);
        setUpdatedFixtStockAmount(params.data.fixtStockAmount);
        setUpdatedFixtExtinctAmount(params.data.fixtExtinctAmount);
        setUpdatedFixtRgistrationUnitAmount(params.data.fixtRegistrationUnitAmount);
    };

    const handleFixtRowDoubleClick = () => {
        toggleUpdateFixtModal();
    };

    const updateMedicine = async () => {
        const response = await axios.post(`${BASE_URL}/api/stockMedicine/updateStockMedicine`,{
            userId: user.userId,
            schoolCode: user.schoolCode,
            rowId: selectedMedicineRowData.id,
            medicineName: updatedMedicineName,
            coporateName: updatedMedicineCoporateName,
            latestPurchaseDate: updatedMedicineLatestPurchaseDate,
            unit: updatedMedicineUnit,
            stockAmount: updatedMedicineStockAmount,
            extinctAmount: updatedMedicineExtinctAmount,
            registrationUnitAmount: updatedMedicineRegistrationUnit
        });

        if(response.data === 'success') {
            const infoMessage = "약품 재고가 정상적으로 수정되었습니다";
            NotiflixInfo(infoMessage);
            fetchStockMedicineData();
            toggleUpdateMedicineModal();
        }
    };

    const resetUpdateMedicineForm = () => {
        setSearchText("");
        registMedicineGridRef.current.api.setRowData([]);

        const updatedMedicineInput = document.getElementById("updatedMedicineInput");
        const updatedCoporateInput = document.getElementById("updatedCoporateInput");
        const updatedLatestPurchaseDate = document.getElementById("updatedLatestPurchaseDate");
        const updatedMedicineUnit = document.getElementById("updatedMedicineUnit");
        const updatedMedicineStockAmount = document.getElementById("updatedMedicineStockAmount");
        const updatedMedicineExtinctAmount = document.getElementById("updatedMedicineExtinctAmount");
        const updatedMedicineRegistrationUnitAmount = document.getElementById("updatedMedicineRegistrationUnitAmount");

        updatedMedicineInput.value = "";
        updatedCoporateInput.value = "";
        updatedLatestPurchaseDate.value = "";
        updatedMedicineUnit.value = "";
        updatedMedicineStockAmount.value = "";
        updatedMedicineExtinctAmount.value = "";
        updatedMedicineRegistrationUnitAmount.value = "";
    };

    const updateFixt = async () => {
        const response = await axios.post(`${BASE_URL}/api/stockFixt/updateStockFixt`, {
            userId: user.userId,
            schoolCode: user.schoolCode,
            rowId: selectedFixtRowData.id,
            fixtName: updatedFixtName,
            fixtCoporate: updatedFixtCoporate,
            fixtLatestPurchaseDate: updatedFixtLatestPurchaseDate,
            fixtUnit: updatedFixtUnit,
            fixtStockAmount: updatedFixtStockAmount,
            fixtExtinctAmount: updatedFixtExtinctAmount,
            fixtRegistrationUnitAmount: updatedFixtRegistrationUnitAmount
        });

        if(response.data === 'success') {
            const infoMessage = "비품 재고가 정상적으로 수정되었습니다";
            NotiflixInfo(infoMessage);
            fetchStockFixtData();
            toggleUpdateFixtModal();
        }
    };

    const resetUpdateFixtForm = () => {
        setUpdatedFixtName("");
        setUpdatedCoporate("");
        setUpdatedFixtLatestPurchaseDate("");
        setUpdatedFixtUnit("");
        setUpdatedFixtStockAmount("");
        setUpdatedFixtExtinctAmount("");
        setUpdatedFixtRgistrationUnitAmount("");
    };

    return (
        <>
            <div className="content" style={{ height: '84.1vh', display: 'flex', flexDirection: 'column' }}>
                <Row className="align-items-center pb-2" style={{ flex: '1 1 auto' }}>
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
                                placeholder="검색 키워드를 입력하세요"
                                autoFocus={true}
                                style={{ width: '300px', height: '40px' }}
                            />
                            <Button className="ml-2" style={{ height: '38px' }}>검색</Button>
                        </Row>
                    </Col>
                </Row>
                <Row style={{ flex: '1 1 auto' }}>
                    <Col md="12">
                        <div className="ag-theme-alpine" style={{ height: '72.7vh' }}>
                            {selectedMenu === 'medicine' && (
                                <AgGridReact
                                    ref={medicineGridRef}
                                    rowData={medicineRowData} 
                                    columnDefs={medicineColDef}
                                    defaultColDef={defaultColDef}
                                    overlayNoRowsTemplate={ '<span>등록된 약품이 없습니다</span>' }
                                    rowSelection={'single'} 
                                    onRowClicked={handleMedicineRowClick}
                                    onRowDoubleClicked={handleMedicineRowDoubleClick}
                                />
                            )}
                            {selectedMenu === 'fixture' && (
                                <AgGridReact
                                    ref={fixtureGridRef}
                                    rowData={fixtureRowData} 
                                    columnDefs={fixtureColDef} 
                                    defaultColDef={defaultColDef}
                                    rowSelection={'single'} 
                                    overlayNoRowsTemplate={ '<span>등록된 비품이 없습니다</span>' }
                                    onRowClicked={handleFixtRowClick}
                                    onRowDoubleClicked={handleFixtRowDoubleClick}
                                />
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="justify-content-end no-gutters" style={{ flex: '1 1 auto' }}>
                    <Button id="addMedicineButton" onClick={addMedicineFixt}>추가</Button>
                    <Button id="updateMedicineButton" className="ml-1" onClick={updateMedicineFixt}>수정</Button>
                    <Button id="removeMedicineButton" className="ml-1" onClick={deleteMedicineFixt}>삭제</Button>
                </Row>
            </div>

            <Modal isOpen={registMedicineModal} toggle={toggleRegistMedicineModal} centered style={{ minWidth: '30%' }}>
                <ModalHeader toggle={toggleRegistMedicineModal}><b className="text-muted">약품 재고 등록</b></ModalHeader>
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
                            <div className="ag-theme-alpine search-medicine" style={{ height: '17.5vh' }}>
                                <AgGridReact
                                    ref={registMedicineGridRef}
                                    rowData={searchResult}
                                    columnDefs={registMedicineColDefs}
                                    stopEditingWhenCellsLoseFocus={true}
                                    onRowClicked={onRowClicked}
                                    paginationPageSize={4} // 페이지 크기를 원하는 값으로 설정
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">검색 결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
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

            <Modal isOpen={updateMedicineModal} toggle={toggleUpdateMedicineModal} centered style={{ minWidth: '30%' }}>
                <ModalHeader toggle={toggleUpdateMedicineModal}><b className="text-muted">약품 재고 수정</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Row className="d-flex w-100 no-gutters">
                        <Input
                            className="mr-2"
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
                            style={{ width: '62%', height: '40px'}}
                            onChange={handleSearchText}
                        />
                        <Col className="d-flex justify-content-end">
                            <Button className="ml-2" style={{ height: '38px', marginTop: 1 }} onClick={handleSearch}>검색</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <div className="ag-theme-alpine search-medicine" style={{ height: '17.5vh' }}>
                                <AgGridReact
                                    ref={registMedicineGridRef}
                                    rowData={searchResult}
                                    columnDefs={registMedicineColDefs}
                                    stopEditingWhenCellsLoseFocus={true}
                                    onRowClicked={onRowClickedInUpdate}
                                    paginationPageSize={4} // 페이지 크기를 원하는 값으로 설정
                                    overlayNoRowsTemplate={ '<span style="color: #6c757d;">검색 결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                    rowSelection={'single'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                                    enterNavigatesVertically={true}
                                    enterNavigatesVerticallyAfterEdit={true}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Form onSubmit={updateMedicine} className="mt-2 mb-3" style={{ border: '1px dotted #babfc7', borderRadius: 4 }}>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">약품명</Label>
                            </Col>
                            <Col md="10" className="no-gutters">
                                <Input
                                    id="updatedMedicineInput" 
                                    type="text" 
                                    defaultValue={selectedMedicineRowData ? selectedMedicineRowData.medicineName : ""}
                                    onChange={(e) => setUpdatedMedicineName(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">업체명</Label>
                            </Col>
                            <Col md="4" className="no-gutters">
                                <Input
                                    id="updatedCoporateInput"
                                    type="text" 
                                    defaultValue={selectedMedicineRowData ? selectedMedicineRowData.coporateName : ""}
                                    onChange={(e) => setUpdateeMedicineCoporateName(e.target.value)}
                                />
                            </Col>
                            <Col md="3" className="text-center align-items-center">
                                <Label className="text-muted">최근 구매일</Label>
                            </Col>
                            <Col md="3" className="no-gutters">
                                <Input
                                    id="updatedLatestPurchaseDate"
                                    type="date" 
                                    value={selectedMedicineRowData ? selectedMedicineRowData.lastestPurchaseDate : ""}
                                    onChange={(e) => setUpdatedMedicineLatestPurchaseDate(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mb-3 mr-3 d-flex align-items-center no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="updatedMedicineUnit" 
                                    className="text-right" 
                                    type="text"
                                    defaultValue={selectedMedicineRowData ? selectedMedicineRowData.unit : ""}
                                    onChange={(e) => setUpdatedMedicineUnit(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">재고량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="updatedMedicineStockAmount" 
                                    className="text-right" 
                                    type="number" 
                                    value={selectedMedicineRowData ? selectedMedicineRowData.stockAmount : ""}
                                    onChange={(e) => setUpdatedMedicineStockAmount(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">소실량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="updatedMedicineExtinctAmount" 
                                    className="text-right" 
                                    type="number" 
                                    defaultValue={selectedMedicineRowData ? selectedMedicineRowData.extinctAmount : ""}
                                    onChange={(e) => setUpdatedMedicineExtinctAmount(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">등록단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="updatedMedicineRegistrationUnitAmount"
                                    className="text-right"
                                    type="number"
                                    defaultValue={selectedMedicineRowData ? selectedMedicineRowData.registrationUnitAmount : ""}
                                    onChange={(e) => setUpdatedMedicineRegistrationUnit(e.target.value)}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            <Button onClick={resetUpdateMedicineForm}>초기화</Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="mr-1" color="secondary" onClick={updateMedicine}>저장</Button>
                            <Button color="secondary" onClick={toggleUpdateMedicineModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>

            <Modal isOpen={registFixtModal} toggle={toggleRegistFixtModal} centered style={{ minWidth: '30%' }}>
                <ModalHeader toggle={toggleRegistFixtModal}><b className="text-muted">비품 재고 등록</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Form onSubmit={saveFixt} className="mb-3" style={{ border: '1px dotted #babfc7', borderRadius: 4 }}>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">비품명</Label>
                            </Col>
                            <Col md="10" className="no-gutters">
                                <Input
                                    id="fixtName" 
                                    type="text" 
                                    value={fixtNameValue}
                                    onChange={(e) => setFixtNameValue(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">업체명</Label>
                            </Col>
                            <Col md="4" className="no-gutters">
                                <Input
                                    id="fixtCoporate"
                                    type="text" 
                                    value={fixtCoporateValue}
                                    onChange={(e) => setFixtCoporateValue(e.target.value)}
                                />
                            </Col>
                            <Col md="3" className="text-center align-items-center">
                                <Label className="text-muted">최근 구매일</Label>
                            </Col>
                            <Col md="3" className="no-gutters">
                                <Input
                                    id="fixtLatestPurchaseDate"
                                    type="date" 
                                    value={fixtLatestPurchaseDate}
                                    onChange={(e) => setFixtLatestPurchaseDate(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mb-3 mr-3 d-flex align-items-center no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtUnit" 
                                    className="text-right" 
                                    type="text"
                                    value={fixtUnit}
                                    onChange={(e) => setFixtUnit(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">재고량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtStockAmount" 
                                    className="text-right" 
                                    type="number" 
                                    value={fixtStockAmount}
                                    onChange={(e) => setFixtStockAmount(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">소실량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtExtinctAmount" 
                                    className="text-right" 
                                    type="number" 
                                    value={fixtExtinctAmount}
                                    onChange={(e) => setFixtExtinctAmount(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">등록단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtRegistrationUnitAmount"
                                    className="text-right"
                                    type="number"
                                    value={fixtRegistrationUnitAmount}
                                    onChange={(e) => setFixtRgistrationUnitAmount(e.target.value)}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            <Button onClick={resetFixtForm}>초기화</Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="mr-1" color="secondary" onClick={saveFixt}>저장</Button>
                            <Button color="secondary" onClick={toggleRegistFixtModal}>취소</Button>
                        </Col>
                    </Row>
                </ModalFooter>
            </Modal>

            <Modal isOpen={updateFixtModal} toggle={toggleUpdateFixtModal} centered style={{ minWidth: '30%' }}>
                <ModalHeader toggle={toggleUpdateFixtModal}><b className="text-muted">비품 재고 수정</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Form onSubmit={saveFixt} className="mb-3" style={{ border: '1px dotted #babfc7', borderRadius: 4 }}>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">비품명</Label>
                            </Col>
                            <Col md="10" className="no-gutters">
                                <Input
                                    id="fixtName" 
                                    type="text" 
                                    value={updatedFixtName}
                                    onChange={(e) => setUpdatedFixtName(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mr-3 no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">업체명</Label>
                            </Col>
                            <Col md="4" className="no-gutters">
                                <Input
                                    id="fixtCoporate"
                                    type="text" 
                                    value={updatedFixtCoporate}
                                    onChange={(e) => setUpdatedCoporate(e.target.value)}
                                />
                            </Col>
                            <Col md="3" className="text-center align-items-center">
                                <Label className="text-muted">최근 구매일</Label>
                            </Col>
                            <Col md="3" className="no-gutters">
                                <Input
                                    id="fixtLatestPurchaseDate"
                                    type="date" 
                                    value={updatedFixtLatestPurchaseDate}
                                    onChange={(e) => setUpdatedFixtLatestPurchaseDate(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-3 mb-3 mr-3 d-flex align-items-center no-gutters">
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtUnit" 
                                    className="text-right" 
                                    type="text"
                                    value={updatedFixtUnit}
                                    onChange={(e) => setUpdatedFixtUnit(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">재고량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtStockAmount" 
                                    className="text-right" 
                                    type="number" 
                                    value={updatedFixtStockAmount}
                                    onChange={(e) => setUpdatedFixtStockAmount(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">소실량</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtExtinctAmount" 
                                    className="text-right" 
                                    type="number" 
                                    value={updatedFixtExtinctAmount}
                                    onChange={(e) => setUpdatedFixtExtinctAmount(e.target.value)}
                                />
                            </Col>
                            <Col md="2" className="text-center align-items-center">
                                <Label className="text-muted">등록단위</Label>
                            </Col>
                            <Col md="1" className="no-gutters">
                                <Input 
                                    id="fixtRegistrationUnitAmount"
                                    className="text-right"
                                    type="number"
                                    value={updatedFixtRegistrationUnitAmount}
                                    onChange={(e) => setUpdatedFixtRgistrationUnitAmount(e.target.value)}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter className="p-0">
                    <Row style={{ width: '100%'}}>
                        <Col className="d-flex justify-content-start">
                            <Button onClick={resetUpdateFixtForm}>초기화</Button>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            <Button className="mr-1" color="secondary" onClick={updateFixt}>저장</Button>
                            <Button color="secondary" onClick={toggleUpdateFixtModal}>취소</Button>
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