/* 
  - 분류 선택하지 않은 채로 조회 시 해당 키워드가 모든 카테고리에 포함된 경우 가정 -> 동작하도록 처리
*/

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { Input, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, ListGroup, ListGroupItem, CardImg, Table } from "reactstrap";
import { Block } from 'notiflix/build/notiflix-block-aio';
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import Circle from "../assets/img/medicine/circle.png";
import Oval from "../assets/img/medicine/oval.png";
import SemiCircular from "../assets/img/medicine/semicircular.png";
import Triangle from "../assets/img/medicine/triangle.png";
import Square from "../assets/img/medicine/square.png";
import Rhombus from "../assets/img/medicine/rhombus.png";
import Rectangle from "../assets/img/medicine/rectangle.png";
import Pentagon from "../assets/img/medicine/pentagon.png";
import Hexagon from "../assets/img/medicine/hexagon.png";
import Octagon from "../assets/img/medicine/octagon.png";
import EtcShape from "../assets/img/medicine/etcShape.png";
import Tablets from "../assets/img/medicine/tablets.png";
import HardCapsule from "../assets/img/medicine/hardCapsule.png";
import SoftCapsule from "../assets/img/medicine/softCapsule.png";
import None from "../assets/img/medicine/none.png";
import Minus from "../assets/img/medicine/minus.png";
import Plus from "../assets/img/medicine/plus.png";
import Etc from "../assets/img/medicine/etc.png";
import '../assets/css/medicalInfo.css';

const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

function MedicalInfo() {
  const [searchCategory, setSearchCategory] = useState("");             // 약품 정보 검색 시 선택 분류
  const [searchText, setSearchText] = useState("");                     // 검색어 입력 값 할당 변수
  const [searchResult, setSearchResult] = useState([]);                 // 검색 결과 할당 변수
  const [modal, setModal] = useState(false);                            // 검색 결과 중 선택 Row 상세보기 Modal Open 상태 값 변수
  const [selectedRowData, setSelectedRowData] = useState(null);         // 선택한 Row Data 할당 변수 (상세화면 출력)
  const [medicineBookmarked, setMedicineBookmarked] = useState(false);  // 약품별 Bookmark 상태
  
  const gridRef = useRef();                                             // 검색 결과 출력 Grid

  const shapes = [
    { image: Circle, label: "원형" },
    { image: Oval, label: "타원형" },
    { image: SemiCircular, label: "반원형" },
    { image: Triangle, label: "삼각형" },
    { image: Square, label: "사각형" },
    { image: Rhombus, label: "마름모형" },
    { image: Rectangle, label: "장방형" },
    { image: Pentagon, label: "오각형" },
    { image: Hexagon, label: "육각형" },
    { image: Octagon, label: "팔각형" },
    { image: EtcShape, label: "기타" }
  ];

  const colors = [
   { color: "white", label: "하양" },
   { color: "yellow", label: "노랑" },
   { color: "orange", label: "주황" },
   { color: "pink", label: "분홍" },
   { color: "red", label: "빨강" },
   { color: "brown", label: "갈색" },
   { color: "lightgreen", label: "연두" },
   { color: "green", label: "초록" },
   { color: "turquoise", label: "청록" },
   { color: "blue", label: "파랑" },
   { color: "navy", label: "남색" },
   { color: "magenta", label: "자주" },
   { color: "purple", label: "보라" },
   { color: "grey", label: "회색" },
   { color: "black", label: "검정" },
   { color: "transparent", label: "투명" }
  ];

  const formulation = [
    { image: Tablets, label: "정제류" },
    { image: HardCapsule, label: "경질캡슐" },
    { image: SoftCapsule, label: "연질캡슐" }
  ];

  const dividing = [
    { image: None, label: "없음" },
    { image: Minus, label: "(-)형" },
    { image: Plus, label: "(+)형" },
    { image: Etc, label: "기타" }
  ];

  // 약품 정보 Grid Column 정의
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

  // 기본(공통) Column 정의
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  // 검색 분류 선택 Event
  const handleSearchCategory = (e) => {
    const selectedCategory = e.target.value;  // 선택한 분류 값
    setSearchCategory(selectedCategory);      // 전역 변수에 할당
  }

  useEffect(() => {
    if(!searchCategory) setSearchCategory(document.getElementById('searchCategory').value);
  }, [searchCategory]);

  // 검색 Event
  const handleSearch = async (e) => {
    try {
      // 약품 정보 API(e약은요) 호출
      Block.dots('.ag-theme-alpine');

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

      if (totalResponse.data.hasOwnProperty('body')) {                  // 조회 결과 있을 경우(body가 존재할 경우)
        const totalCount = totalResponse.data.body.totalCount;          // 검색 결과 총 수
        const totalPages = calculateTotalPages(totalCount);             // 검색결과에 따른 총 페이지 수
        const allResults = [];                                          // 모든 결과 할당 변수
        const requests = [];

        for(let page = 1; page <= totalPages; page++) {                 // 페이지에 따른 결과 출력
          requests.push(axios.get(URL, {
            params: {
              serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
              pageNo: page,                                                 // 페이지 수
              numOfRows: 100,                                               // Row 수
              entpName: searchCategory === 'mCompany' ? searchText : '',    // 업체명
              itemName: searchCategory === 'mName' ? searchText : '',       // 제품명
              itemSeq: searchCategory === 'mCode' ? searchText : '',        // 품목코드
              efcyQesitm: searchCategory === 'mEffect' ? searchText : '',   // 효능
              type: 'json'                                                  // 조회 시 Return 받을 데이터 Type
            }
          }));
        }

        const responses = await Promise.all(requests);
        responses.forEach(response => {
          if(response.data.hasOwnProperty('body')) {
            allResults.push(...response.data.body.items);
          }
        });
        
        if(document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
        setSearchResult(allResults);                                        // 최종 조회 결과 Grid Row Data로 할당
      }
    } catch (error) {
      if(document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
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

  // 검색 결과 중 Row 선택 시 상세화면 Modal Open 상태 Handle Event
  const toggleModal = () => setModal(!modal);

  // 검색 결과 중 Row Double Click 시 상세화면 출력 Event
  const handleRowDoubleClick = (params) => {
    setSelectedRowData(params.data);  // 전역 변수에 선택한 Row 값 할당
    toggleModal();                    // 상세화면 Modal Open
  }

  // 검색 결과 총 페이지 수 계산 Function
  const calculateTotalPages = (totalCount) => {
    return Math.ceil(totalCount / 100); // 페이지당 보여질 개수 100 Row로 Divide
  }

  // // 검색 처리 시 Loading 화면 출력 Event
  // const onBtShowLoading = useCallback(() => {
  //     gridRef.current.api.showLoadingOverlay(); // Overlay로 로딩 Animation 출력
  // }, []);

  // 약품별 Bookmark 상태 Toggle Function
  const handleBookmarkMedicine = () => {
    setMedicineBookmarked((prev) => !prev);     // 이전 Bookmark 상태 획득 후 Toggle 값 반환
  }

  return (
    <>
      <div className="content" style={{ height: '84.8vh' }}>
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
            style={{ width: '250px', height: '40px'}}
            onChange={handleSearchText}
          />
          <Button className="ml-2" style={{ height: '38px', marginTop: 1 }} onClick={handleSearch}>검색</Button>
          <Col>
            <Table bordered className="text-center text-muted search-shape" style={{ width: 'auto' }}>
              <tbody>
                <tr>
                  <td className="align-items-center justify-content-center text-muted fixed-width-cell">
                    <span style={{ fontSize: 12 }}>모양<br/>전체</span>
                  </td>
                  {shapes.map((shape, index) => (
                    <td key={index}>
                      <img src={shape.image} alt={shape.label} />
                      <span>{shape.label}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </Table>
            <Table bordered className="text-center text-muted search-shape" style={{ width: 'auto' }}>
              <tbody>
                <tr>
                  <td className="align-items-center justify-content-center text-muted fixed-width-cell">
                    <span style={{ fontSize: 12 }}>색상<br/>전체</span>
                  </td>
                  {colors.map((color, index) => (
                    <td className="text-center" key={index}>
                      <div className="d-flex justify-content-center mb-1" style={{ marginTop: -5 }}>
                        <div style={{ border: '1px solid lightgrey', borderRadius: 10, height: 12, width: 12, backgroundColor: color.color }}></div>
                      </div>
                      <div style={{ marginBottom: -9 }}>
                        <span>{color.label}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </Table>
            <Row className="d-flex no-gutters">
              <Table bordered className="text-center text-muted search-shape" style={{ width: 'auto', }}>
                <tbody>
                  <tr>
                    <td className="align-items-center justify-content-center text-muted fixed-width-cell">
                      <span style={{ fontSize: 12 }}>제형<br/>전체</span>
                    </td>
                    {formulation.map((formulation, index) => (
                      <td key={index}>
                        <img src={formulation.image} alt={formulation.label} />
                        <span>{formulation.label}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
              <Table bordered className="text-center text-muted search-shape ml-5" style={{ width: 'auto' }}>
                <tbody>
                  <tr>
                    <td className="align-items-center justify-content-center text-muted fixed-width-cell">
                      <span style={{ fontSize: 12 }}>분할선<br/>전체</span>
                    </td>
                    {dividing.map((dividing, index) => (
                      <td key={index}>
                        <img src={dividing.image} alt={dividing.label} />
                        <span>{dividing.label}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
            </Row>
          </Col>
        </Row>
        <br/>
        <Row>
         <Col md="12">
            <div className="ag-theme-alpine" style={{ height: '100vh', minHeight: '77.9vh', maxHeight: '77.9vh' }}>
              <AgGridReact
                ref={gridRef}
                rowData={searchResult}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                pagination={true}                                               // Pagination 사용 설정
                paginationPageSize={28}                                         // 한 페이지에 표시하고 싶은 데이터 Row 수
                enableBrowserTooltips="true"
                onRowDoubleClicked={handleRowDoubleClick}
                // overlayLoadingTemplate={
                //   '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                // }
              />
            </div>
          </Col>
        </Row>

        <Modal isOpen={modal} toggle={toggleModal} centered style={{ minWidth: '55%' }}>
          <ModalHeader toggle={toggleModal}><b className="text-muted">상세 정보</b></ModalHeader>
          <ModalBody>
            {selectedRowData && (
              <div>
                <ListGroup className="text-muted">
                  <ListGroupItem>
                    <span className="mr-1 row-detail-span" >제품명</span> 
                    <div className="row-detail-div">{selectedRowData.itemName}
                      {!medicineBookmarked ? (
                        <FaRegStar className="ml-2" style={{ fontSize: 18, marginTop: -2 }} onClick={handleBookmarkMedicine}/>
                      ) : (
                        <FaStar className="ml-2" style={{ fontSize: 18, marginTop: -2 }} onClick={handleBookmarkMedicine}/>
                      )}
                    </div>
                  </ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">업체명</span> <div className="row-detail-div">{selectedRowData.entpName}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">품목코드</span> <div className="row-detail-div">{selectedRowData.itemSeq}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">효능</span> <div className="row-detail-div">{selectedRowData.efcyQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">사용법</span> <div className="row-detail-div">{selectedRowData.useMethodQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">주의사항</span> <div className="row-detail-div">{selectedRowData.atpnQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">상호작용</span> <div className="row-detail-div">{selectedRowData.intrcQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">부작용</span> <div className="row-detail-div">{selectedRowData.seQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">보관법</span> <div className="row-detail-div">{selectedRowData.depositMethodQesitm}</div></ListGroupItem>
                  <ListGroupItem><span className="mr-1 row-detail-span">이미지</span> <div className="row-detail-div"><CardImg src={selectedRowData.itemImage} style={{ width: '200px' }}/></div></ListGroupItem>
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

/**
 * 약품 좋아요 기능 추가
 * 그리드 외곽에 좋아요(즐겨찾기)한 좋아요한 약품들 리스트 볼 수 있도록 처리
 */