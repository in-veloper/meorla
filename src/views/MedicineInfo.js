/* 
  - 약품정보 북마크 상태가 모든 Row 공통으로 적용되는 문제점 처리 필요
  - pagination으로 하니 page를 동적으로 계속해서 로드하는 문제 처리 필요
*/

import React, { useCallback, useRef, useState } from "react";
import axios from "axios";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { Input, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, ListGroup, ListGroupItem } from "reactstrap";
import '../assets/css/medicalInfo.css';

const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

function MedicalInfo() {
  const [searchCategory, setSearchCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const gridRef = useRef();

  const [columnDefs] = useState([
    {field: 'itemName', headerName: '제품명', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'entpName', headerName: '업체명', flex: 1.5, tooltipValueGetter: (params) => params.value},
    {field: 'itemSeq', headerName: '품목코드', flex: 1, tooltipValueGetter: (params) => params.value},
    {field: 'efcyQesitm', headerName: '효능', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'useMethodQesitm', headerName: '사용법', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'atpnQesitm', headerName: '주의사항', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'intrcQesitm', headerName: '상호작용', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'seQesitm', headerName: '부작용', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'depositMethodQesitm', headerName: '보관법', flex: 2, tooltipValueGetter: (params) => params.value}
  ]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    // flex: 1,
    // minWidth: 100,
    resizable: true,
  };

  const handleSearchCategory = (e) => {
    const selectedCategory = e.target.value;
    setSearchCategory(selectedCategory);
  }

  const handleSearch = async (e) => {
    try {
      const totalResponse = await axios.get(URL, {
        params: {
          serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
          pageNo: 1,
          numOfRows: 1, 
          entpName: searchCategory === 'mCompany' ? searchText : '',
          itemName: searchCategory === 'mName' ? searchText : '',
          itemSeq: searchCategory === 'mCode' ? searchText : '',
          efcyQesitm: searchCategory === 'mEffect' ? searchText : '',
          type: 'json'
        }
      });

      if (totalResponse.data.hasOwnProperty('body')) {
        const totalCount = totalResponse.data.body.totalCount;
        const totalPages = calculateTotalPages(totalCount);
        const allResults = [];

        onBtShowLoading();
        
        for(let page = 1; page <= totalPages; page++) {
          const response = await axios.get(URL, {
            params: {
              serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
              pageNo: page,
              numOfRows: 100,
              entpName: searchCategory === 'mCompany' ? searchText : '',
              itemName: searchCategory === 'mName' ? searchText : '',
              itemSeq: searchCategory === 'mCode' ? searchText : '',
              efcyQesitm: searchCategory === 'mEffect' ? searchText : '',
              type: 'json'
            }
          });

          if(response.data.hasOwnProperty('body')) {
            allResults.push(...response.data.body.items);
          }
        }

        setSearchResult(allResults);
      }
    } catch (error) {
      console.log("약품 정보 조회 중 ERROR", error);
    }
  }

  const handleKeyDown = (e) => {
    if(e.key === 'Enter') {
      handleSearch();
    }
  }

  const handleSearchText = (e) => {
    e.preventDefault();
    setSearchText(e.target.value);
  }

  const toggleModal = () => setModal(!modal);

  const handleRowDoubleClick = (params) => {
    setSelectedRowData(params.data);
    toggleModal();
  }

  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / 100); // 페이지당 보여질 개수 100 으로 Divide
  }

  const onBtShowLoading = useCallback(() => {
      gridRef.current.api.showLoadingOverlay();
  }, []);

  return (
    <>
      <div className="content">
        <Row>
          <Input
            className="ml-3 mr-2"
            id="searchCategory"
            name="select"
            type="select"
            style={{ width: '120px'}}
            onChange={handleSearchCategory}
            value={searchCategory}
          >
            <option value='none'>분류 선택</option>
            <option value='mName'>제품명</option>
            <option value='mCompany'>업체명</option>
            <option value='mEffect'>효능</option>
            <option value='mCode'>품목기준코드</option>
          </Input>
          <Input
            type="search"
            value={searchText}
            placeholder="검색 키워들르 입력하세요"
            onKeyDown={handleKeyDown}
            autoFocus={true}
            style={{ width: '300px', height: '40px'}}
            onChange={handleSearchText}
          />
          <Button className="ml-2" style={{ height: '38px', marginTop: 1 }} onClick={handleSearch}>검색</Button>
        </Row>
        <br/>
        <Row>
         <Col md="12">
            <div className="ag-theme-alpine" style={{ height: '100vh', minHeight: '99.4vh', maxHeight: '99.4vh' }}>
              <AgGridReact
                ref={gridRef}
                rowData={searchResult}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                overlayNoRowsTemplate={ '<span>일치하는 검색결과가 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                pagination={true}       // Pagination 사용 설정
                paginationPageSize={28} // 한 페이지에 표시하고 싶은 데이터 Row 수
                enableBrowserTooltips="true"
                onRowDoubleClicked={handleRowDoubleClick}
                overlayLoadingTemplate={
                  '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                }
                // domLayout="autoHeight"  // Grid의 높이를 자동으로 조정
              />
            </div>
          </Col>
        </Row>

        <Modal isOpen={modal} toggle={toggleModal} centered style={{ minWidth: '35%' }}>
          <ModalHeader toggle={toggleModal}><b>상세 정보</b></ModalHeader>
          <ModalBody>
            {selectedRowData && (
              <div>
                <ListGroup className="text-muted">
                  <ListGroupItem><span className="mr-1 row-detail-span">제품명</span> <div className="row-detail-div">{selectedRowData.itemName}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">업체명</span> <div className="row-detail-div">{selectedRowData.entpName}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">품목코드</span> <div className="row-detail-div">{selectedRowData.itemSeq}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">효능</span> <div className="row-detail-div">{selectedRowData.efcyQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">사용법</span> <div className="row-detail-div">{selectedRowData.useMethodQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">주의사항</span> <div className="row-detail-div">{selectedRowData.atpnQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">상호작용</span> <div className="row-detail-div">{selectedRowData.intrcQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">부작용</span> <div className="row-detail-div">{selectedRowData.seQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">보관법</span> <div className="row-detail-div">{selectedRowData.depositMethodQesitm}</div></ListGroupItem>
                </ListGroup>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>닫기</Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
}

export default MedicalInfo;