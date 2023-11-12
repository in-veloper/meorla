/* 
  - 스크롤 시 스크롤 포지션이 최상단으로 이동되는 이슈 
*/

import React, { useMemo, useRef, useState } from "react";
import axios from "axios";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { Input, Row, Col, Button } from "reactstrap";
import '../assets/css/medicalInfo.css';

const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

function MedicalInfo() {
  const [searchCategory, setSearchCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchResultCount, setSearchResultCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const gridRef = useRef();

  const [columnDefs] = useState([
    {field: 'itemName', headerName: '제품명'},
    {field: 'entpName', headerName: '업체명', flex: 1},
    {field: 'itemSeq', headerName: '품목코드', flex: 1},
    {field: 'efcyQesitm', headerName: '효능'},
    {field: 'useMethodQesitm', headerName: '사용법'},
    {field: 'atpnQesitm', headerName: '주의사항'},
    {field: 'intrcQesitm', headerName: '상호작용'},
    {field: 'seQesitm', headerName: '부작용'},
    {field: 'depositMethodQesitm', headerName: '보관법'}
  ]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    // flex: 1,
    // minWidth: 100,
    resizable: true,
  };

  const handleScroll = (e) => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    getMedicineInfo(nextPage);
  }

  const handleSearchCategory = (e) => {
    const selectedCategory = e.target.value;
    setSearchCategory(selectedCategory);
  }

  const handleSearch = (e) => {
    getMedicineInfo();
  }

  const handleKeyDown = (e) => {
    if(e.key === 'Enter') {
      getMedicineInfo();
    }
  }

  const handleSearchText = (e) => {
    e.preventDefault();
    setSearchText(e.target.value);
  }

  const getMedicineInfo = async (page) => {
    try {
      const response = await axios.get(URL, {
        params: {
          serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
          pageNo: page,
          numOfRows: 100,
          entpName: searchCategory === 'mCompany' ? searchText : '',  // 업체명
          itemName: searchCategory === 'mName' ? searchText : '',     // 제품명
          itemSeq: searchCategory === 'mCode' ? searchText : '',      // 품목기준코드
          efcyQesitm: searchCategory === 'mEffect' ? searchText : '', // 약 효능
          type: 'json'
        }
      });

      if(response.data.hasOwnProperty('body')) {
        const resultItems = response.data.body.items;
        
        setSearchResult(resultItems);
        setSearchResultCount(resultItems.length);
      }
    } catch (error) {
      console.log("약품 정보 조회 중 Error", error);
    }
  }

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
            <div className="ag-theme-alpine" style={{ height: '100vh' }}>
              <AgGridReact
                ref={gridRef}
                rowData={searchResult}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                overlayNoRowsTemplate={ '<span>일치하는 검색결과가 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                pagination={true}       // Pagination 사용 설정
                paginationPageSize={28} // 한 페이지에 표시하고 싶은 데이터 Row 수
                domLayout="autoHeight"  // Grid의 높이를 자동으로 조정
                // onBodyScrollEnd={handleScroll}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default MedicalInfo;
