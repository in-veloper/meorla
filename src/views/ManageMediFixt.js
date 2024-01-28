import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Row, Col, Nav, NavItem, NavLink, Button, Input } from "reactstrap";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import Notiflix from "notiflix";
import axios from "axios";

const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

function ManageMediFixt() {
    const [selectedMenu, setSelectedMenu] = useState("medicine");
    const [isRemoved, setIsRemoved] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const [medicineName, setMedicineName] = useState("");
    const [medicineList, setMedicineList] = useState("");

    const medicineGridRef = useRef();
    const fixtureGridRef = useRef();

    const typeaheadRef = useRef(null);

    useEffect(() => {
        if(medicineList.length > 0) {
            try {
                const searchOptions = medicineList.map((medicine) => ({
                    name: medicine.itemName
                }));

                setDynamicOptions(searchOptions);
            } catch(error) {
                console.log("약품명 검색 중 ERROR", error);
            }
        }else{
            setDynamicOptions([]);
        }
    }, [medicineList]);

    const renderMenuItemChildren = (option, props, index) => {
        return (
            <span>{option.name}</span>
        );
    }

    const CustomEditor = forwardRef(({ value, api }, ref) => {
        const [selectedValue, setSelectedValue] = useState(value);
        
        useImperativeHandle(ref, () => ({
            getValue: () => {
                return selectedValue;
            }
        }));
    

        const handleMedicineSelect = (selected) => {
            debugger
            setSelectedValue(selected[0]);
            api.stopEditing(); // 편집 모드 종료
        };
    
        return (
            <div>
                <Typeahead
                    ref={typeaheadRef}
                    id="basic-typeahead-single"
                    labelKey="name"
                    onChange={handleMedicineSelect}
                    onInputChange={(input) => { searchMedicine(input)}}
                    options={dynamicOptions}
                    placeholder="약품명을 입력하세요"
                    emptyLabel="검색 결과가 없습니다."
                    // selected={selectedValue ? [selectedValue] : []}
                    style={{ height: '39px', borderWidth: 0 }}
                    renderMenuItemChildren={renderMenuItemChildren}
                />
            </div>
        );
    });

    const searchMedicine = async (input) => {
        const searchKeyword = input.trim();
        setMedicineName(searchKeyword);

        if(searchKeyword) {
            try {
                const response = await axios.get(URL, {
                    params: {
                        serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
                        pageNo: 1,
                        numOfRows: 30,
                        itemName: searchKeyword,
                        type: 'json'
                    }
                });

                if(response.data.body) {
                    const items = response.data.body.items;
                    if(items) setMedicineList(items);
                }

            } catch(error) {
                console.log("약품 및 비품 관리 > 약품명 조회 중 ERROR", error);
            }
        }else{
            setMedicineList([]);
        }
    }

    const [medicineRowData] = useState([
        // {medicineName: "약품", coporateName: "회사", unit: "단위", inventory: 0, extinct: 0, lastestPurchaseDate: "2024-01-23", lastestUpdateDate: "2024-01-23"}
    ]);

    const [fixtureRowData] = useState([

    ]);

    // 기본 컬럼 속성 정의 (공통 부분)
    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true,
        editable: true
    };

    const [medicineColDef] = useState([
        {field: "medicineName", headerName: "약품명", flex: 2, cellStyle: { textAlign: "center" }, cellEditor: CustomEditor },
        {field: "coporateName", headerName: "업체명", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "unit", headerName: "단위", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "inventory", headerName: "재고량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "extinct", headerName: "소실량", flex: 1, cellStyle: { textAlign: "center" }},
        {field: "lastestPurchaseDate", headerName: "최근 구매일", flex: 2, cellStyle: { textAlign: "center" }},
        {field: "lastestUpdateDate", headerName: "최근 수정일", flex: 2, cellStyle: { textAlign: "center" }}
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
            // medicineName: "",
            // coporateName: "",
            // unit: "",
            // // inventory: "",
            // // extinct: "",
            // lastestPurchaseDate: "",
            // medicineNalastestUpdateDateme: "",
            // editable: true
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
        // if(params.column.colId === "medicineName") {
        //     console.log(params)
        //     return (
        //         <div style={{ width: '100%' }}>
        //             <Typeahead
        //                 ref={typeaheadRef}
        //                 id="basic-typeahead-single"
        //                 labelKey="name"
        //                 // onChange={handleHospitalSelect}
        //                 // options={dynamicOptions}
        //                 placeholder="병·의원명을 입력하세요"
        //                 // onInputChange={(input) => {
        //                 //     searchHospital(input);
        //                 // }}
        //                 emptyLabel="검색 결과가 없습니다."
        //                 // renderMenuItemChildren={renderMenuItemChildren}
        //                 style={{height: '38px'}}
        //             />
        //         </div>
        //     )
        // }
    }

    return (
        <>
            <div className="content">
            <Row className="align-items-center pb-2">
                    <Col md="7" className="align-items-left no-gutters">
                        <Nav className="community-nav">
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
                                id="searchCategory"
                                name="select"
                                type="select"
                                style={{ width: '120px' }}
                                // value={searchCategory}
                                // onChange={handleSearchCategory}
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
            </div>
        </>
    )
}

export default ManageMediFixt;