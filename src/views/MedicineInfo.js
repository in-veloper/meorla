/* 
  - 분류 선택하지 않은 채로 조회 시 해당 키워드가 모든 카테고리에 포함된 경우 가정 -> 동작하도록 처리
*/

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "contexts/UserContext";
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

const BASE_URL = process.env.REACT_APP_BASE_URL;

function MedicalInfo() {
  const { user } = useUser();
  const [searchCategory, setSearchCategory] = useState("");             // 약품 정보 검색 시 선택 분류
  const [searchText, setSearchText] = useState("");                     // 검색어 입력 값 할당 변수
  const [searchResult, setSearchResult] = useState([]);                 // 검색 결과 할당 변수
  const [modal, setModal] = useState(false);                            // 검색 결과 중 선택 Row 상세보기 Modal Open 상태 값 변수
  const [bookmarkMedicineModal, setBookmarkMedicineModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);         // 선택한 Row Data 할당 변수 (상세화면 출력)
  const [medicineData, setMedicineData] = useState(null);
  const [grainMedicineData, setGrainMedicineData] = useState(null);
  const [discriminationText, setDiscriminationText] = useState("");
  const [bookmarkMedicineData, setBookmarkMedicineData] = useState(null);
  const [selectedCells, setSelectedCells] = useState({
    shape: null,
    color: null,
    formulation: null,
    dividing: null
  });
  
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
    {field: 'itemSeq', headerName: '품목코드', flex: 1.5, tooltipValueGetter: (params) => params.value},
    {field: 'efcyQesitm', headerName: '효능', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'useMethodQesitm', headerName: '사용법', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'atpnQesitm', headerName: '주의사항', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'intrcQesitm', headerName: '상호작용', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'seQesitm', headerName: '부작용', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'depositMethodQesitm', headerName: '보관법', flex: 2, tooltipValueGetter: (params) => params.value}
  ]);

  const [bookmarkMedicineColumnDefs] = useState([
    {field: 'itemName', headerName: '제품명', flex: 2, tooltipValueGetter: (params) => params.value},
    {field: 'entpName', headerName: '업체명', flex: 1.5, tooltipValueGetter: (params) => params.value},
    {field: 'itemSeq', headerName: '품목코드', flex: 1.5, tooltipValueGetter: (params) => params.value},
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
  };

  useEffect(() => {
    Block.dots('.ag-theme-alpine', '약품 정보를 불러오는 중');
    if(medicineData && grainMedicineData) {
      if (document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
    }
  }, [medicineData, grainMedicineData]);

  useEffect(() => {
    if(!searchCategory) setSearchCategory(document.getElementById('searchCategory').value);
  }, [searchCategory]);

  // 검색 Event
  const handleSearch = async (e) => {
    resetShapeSearchArea();
    
    try {
      if (!document.querySelector('.notiflix-block')) Block.dots('.ag-theme-alpine');

      if(medicineData.length > 0) {
        let filteredResults = medicineData;

        if(searchText.trim() !== "") {
          filteredResults = medicineData.filter(item => (
            (searchCategory === 'mCompany' && item.entpName.includes(searchText)) ||
            (searchCategory === 'mName' && item.itemName.includes(searchText)) ||
            (searchCategory === 'mCode' && item.itemSeq.includes(searchText)) ||
            (searchCategory === 'mEffect' && item.efcyQesitm.includes(searchText))
          ));
        }

        setSearchResult(filteredResults);
        if (document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
      }
    } catch (error) {
      console.log("검색 조건과 일치하는 약품 조회 처리 중 ERROR", error);
      if (document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
    }
  };

  // 검색어 입력 후 Enter 입력 시 검색 Event
  const handleKeyDown = (e) => {
    if(e.key === 'Enter') handleSearch(); // Key 입력이 Enter인 경우 검색 Event 호출
  };

  const handleSearchShapeKeyDown = (e) => {
    if(e.key === 'Enter') searchByMedicineShape();
  };

  // 검색어 입력 시 입력 값 전역 변수에 할당 
  const handleSearchText = (e) => {   
    e.preventDefault();             // 기본 Event 방지
    setSearchText(e.target.value);  // 전역 변수에 검색어 입력 값 할당
  };

  // 검색 결과 중 Row 선택 시 상세화면 Modal Open 상태 Handle Event
  const toggleModal = () => setModal(!modal);

  const toggleBookmarkMedicineModal = () => setBookmarkMedicineModal(!bookmarkMedicineModal);

  // 검색 결과 중 Row Double Click 시 상세화면 출력 Event
  const handleRowDoubleClick = (params) => {
    setSelectedRowData(params.data);  // 전역 변수에 선택한 Row 값 할당
    toggleModal();                    // 상세화면 Modal Open
  };

  const handleDiscriminationText = (e) => {
    e.preventDefault();
    setDiscriminationText(e.target.value);
  };

  // 약품별 Bookmark 상태 Toggle Function
  const handleBookmarkMedicine = async () => {
    const isBookmarked = bookmarkMedicineData?.some(bookmark => bookmark.itemSeq === selectedRowData.itemSeq);

    if(!isBookmarked) {
      const response = await axios.post(`${BASE_URL}/api/medicineInfo/saveBookmarkMedicine`, {
        userId: user.userId,
        schoolCode: user.schoolCode,
        itemSeq: selectedRowData.itemSeq
      });
      
      if(response.data === "success") fetchBookmarkMedicineData();
    }else{
      const response = await axios.post(`${BASE_URL}/api/medicineInfo/deleteBookmarkMedicine`, {
        userId: user.userId,
        schoolCode: user.schoolCode,
        itemSeq: selectedRowData.itemSeq
      });

      if(response.data === "success") fetchBookmarkMedicineData();
    }
  };

  const handleCellClick = (e, category, label) => {
    const prevSelectedCells = document.querySelectorAll('.search-' + category +  ' td.selected-cell');
    prevSelectedCells.forEach(cell => {
        cell.classList.remove('selected-cell');
    });

    setSelectedCells(prevState => ({
      ...prevState,
      [category]: label
    }));

    e.currentTarget.classList.add('selected-cell');
  };

  const handleEntireCellClick = (e, category) => {
    const prevSelectedCells = document.querySelectorAll('.search-' + category +  ' td.selected-cell');
    prevSelectedCells.forEach(cell => {
        cell.classList.remove('selected-cell');
    });

    document.querySelector('.search-' + category).getElementsByTagName('td')[0].classList.add('selected-cell');
  };

  const searchByMedicineShape = async () => {
    Block.dots('.ag-theme-alpine', '검색 조건으로 조회중');

    const selectedShape = document.querySelectorAll('td.selected-cell')[0].getElementsByTagName('span')[0].textContent === "모양전체" ? null : document.querySelectorAll('td.selected-cell')[0].getElementsByTagName('span')[0].textContent;
    const selectedColor = document.querySelectorAll('td.selected-cell')[1].getElementsByTagName('span')[0].textContent === "색상전체" ? null : document.querySelectorAll('td.selected-cell')[1].getElementsByTagName('span')[0].textContent;
    const selectedFormulation = document.querySelectorAll('td.selected-cell')[2].getElementsByTagName('span')[0].textContent === "제형전체" ? null : document.querySelectorAll('td.selected-cell')[2].getElementsByTagName('span')[0].textContent;
    const selectedDividing = document.querySelectorAll('td.selected-cell')[3].getElementsByTagName('span')[0].textContent === "분할선전체" ? null : document.querySelectorAll('td.selected-cell')[3].getElementsByTagName('span')[0].textContent;

    // FORM_CODE_NAME 값에 따라 패턴 정의
    let formulationPattern;
    if (selectedFormulation === '정제류') {
      formulationPattern = /정$/; // '정'으로 끝나는 경우
    } else if (selectedFormulation === '연질캡슐') {
      formulationPattern = /연질캡슐/; // '연질캡슐'이 포함된 경우
    } else if (selectedFormulation === '경질캡슐') {
      formulationPattern = /경질캡슐/; // '경질캡슐'이 포함된 경우
    }

    // LINE_BACK 값에 따라 패턴 정의
    let dividingPattern;
    if (selectedDividing === 'none') {
      dividingPattern = /^null$/; // 'null'인 경우
    } else if (selectedDividing === '(-)') {
      dividingPattern = /^-$/; // '-'인 경우
    } else if (selectedDividing === '(+)') {
      dividingPattern = /^\+$/; // '+'인 경우
    } else {
      dividingPattern = /^null$|^-$|^\+$/; // 'none', '(-)', '(+)'이 아닌 경우
    }

    try {
      if(!selectedShape && !selectedColor && !selectedFormulation && !selectedDividing) {
        setSearchResult(medicineData); // 모든 약데이터를 검색결과로 설정
        if(document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
      }else{
        const filteredItemSeqs = grainMedicineData.filter(item => {
          return (
            (!selectedShape || item.DRUG_SHAPE === selectedShape) &&
            (!selectedColor || item.COLOR_CLASS1 === selectedColor) &&
            (!selectedFormulation || formulationPattern.test(item.FORM_CODE_NAME)) &&
            (!selectedDividing || formulationPattern.test(item.LINE_BACK)) &&
            (!discriminationText || 
              (item.PRINT_FRONT && item.PRINT_FRONT.includes(discriminationText)) ||
              (item.PRINT_BACK && item.PRINT_BACK.includes(discriminationText))
            )
          )
        }).map(item => item.ITEM_SEQ);
  
        const filteredMedicineData = medicineData.filter(item => filteredItemSeqs.includes(item.itemSeq));
        setSearchResult(filteredMedicineData);
        if(document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
      }
    } catch (error) {
      console.log("약품 모양으로 일치하는 검색 결과 조회 중 ERROR", error);
      if(document.querySelector('.notiflix-block')) Block.remove('.ag-theme-alpine');
    }
  };

  const resetSearch = () => {
    setSearchText("");
    setSearchResult([]);
    setSearchCategory("mName");
  };

  const resetSearchByMedicineShape = () => {
    setDiscriminationText("");
    setSearchResult([]);
    resetShapeSearchArea();
  };

  const resetShapeSearchArea = () => {
    const selectedCells = document.querySelectorAll('td.selected-cell');
    selectedCells.forEach(cell => {
      cell.classList.remove('selected-cell');
    });

    document.querySelector('.search-shape').getElementsByTagName('td')[0].classList.add('selected-cell');
    document.querySelector('.search-color').getElementsByTagName('td')[0].classList.add('selected-cell');
    document.querySelector('.search-formulation').getElementsByTagName('td')[0].classList.add('selected-cell');
    document.querySelector('.search-dividing').getElementsByTagName('td')[0].classList.add('selected-cell');
  };

  const fetchMedicineData = async () => {
    const response = await axios.get(`${BASE_URL}/api/medicineInfo/getMedicineData`, {});

    if(response.data) {
      setMedicineData(response.data);
      setSearchResult(response.data)
    }
  };

  const fetchGrainMedicineData = async () => {
    const response = await axios.get(`${BASE_URL}/api/medicineInfo/getGrainMedicineData`, {});

    if(response.data) setGrainMedicineData(response.data);
  };

  useEffect(() => {
    fetchMedicineData();
    fetchGrainMedicineData();
  }, []);

  const fetchBookmarkMedicineData = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/medicineInfo/getBookmarkMedicine`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) setBookmarkMedicineData(response.data);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarkMedicineData();
  }, [fetchBookmarkMedicineData]);

  const isBookmarkedMedicine = (itemSeq) => {
    return bookmarkMedicineData?.some(bookmark => bookmark.itemSeq === itemSeq);
  };

  const handleBookmarkMedicineList = () => {
    toggleBookmarkMedicineModal();
  };

  const [convertedBookmarkMedicineData, setConvertedBookmarkMedicineData] = useState([]);

  const convertBookmarkMedicineData = () => {
    if (!Array.isArray(bookmarkMedicineData) || bookmarkMedicineData.length === 0) {
      setConvertedBookmarkMedicineData([]);
    }else{
      const result = bookmarkMedicineData.map(bookmark => {
        return medicineData.find(med => med.itemSeq === bookmark.itemSeq);
      });

      setConvertedBookmarkMedicineData(result);
    }
  };

  useEffect(() => {
    if(bookmarkMedicineData && medicineData) {
      convertBookmarkMedicineData();
    }
  }, [bookmarkMedicineData, medicineData]);

  return (
    <>
      <div className="content" style={{ height: '84.8vh' }}>
        <Row>
          <Col md="7">
            <Table bordered className="text-center search-shape mb-1" style={{ width: 'auto' }}>
              <tbody>
                <tr>
                  <td className="align-items-center justify-content-center fixed-width-cell selected-cell" onClick={(e) => handleEntireCellClick(e, 'shape')}>
                    <span style={{ fontSize: 12 }}>모양<br/>전체</span>
                  </td>
                  {shapes.map((shape, index) => (
                    <td key={index} onClick={(e) => handleCellClick(e, 'shape', shape.label)}>
                      <img src={shape.image} alt={shape.label} />
                      <span>{shape.label}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </Table>
            <Table bordered className="text-center search-color mb-1" style={{ width: 'auto' }}>
              <tbody>
                <tr>
                  <td className="align-items-center justify-content-center fixed-width-cell selected-cell"  onClick={(e) => handleEntireCellClick(e, 'color')}>
                    <span style={{ fontSize: 12 }}>색상<br/>전체</span>
                  </td>
                  {colors.map((color, index) => (
                    <td className="text-center" key={index} onClick={(e) => handleCellClick(e, 'color', color.label)}>
                      <div className="d-flex justify-content-center mb-1" style={{ marginTop: -5 }}>
                        <div style={{ border: '0.5px solid lightgrey', borderRadius: 10, height: 12, width: 12, backgroundColor: color.color }}></div>
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
              <Table bordered className="text-center search-formulation" style={{ width: 'auto', }}>
                <tbody>
                  <tr>
                    <td className="align-items-center justify-content-center fixed-width-cell selected-cell" onClick={(e) => handleEntireCellClick(e, 'formulation')}>
                      <span style={{ fontSize: 12 }}>제형<br/>전체</span>
                    </td>
                    {formulation.map((formulation, index) => (
                      <td key={index} onClick={(e) => handleCellClick(e, 'formulation', formulation.label)}>
                        <img src={formulation.image} alt={formulation.label} />
                        <span>{formulation.label}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
              <Table bordered className="text-center search-dividing ml-5" style={{ width: 'auto' }}>
                <tbody>
                  <tr>
                    <td className="align-items-center justify-content-center fixed-width-cell selected-cell" onClick={(e) => handleEntireCellClick(e, 'dividing')}>
                      <span style={{ fontSize: 12 }}>분할선<br/>전체</span>
                    </td>
                    {dividing.map((dividing, index) => (
                      <td key={index} onClick={(e) => handleCellClick(e, 'dividing', dividing.label)}>
                        <img src={dividing.image} alt={dividing.label} />
                        <span>{dividing.label}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
            </Row>
          </Col>
          <Col md="5">
            <Row className="justify-content-end no-gutters mb-0" style={{ height: '4.7vh', marginTop: '-7px', marginBottom: 12 }}>
              <Button onClick={handleBookmarkMedicineList}>북마크 약품 목록</Button>
            </Row>
            <Row className="justify-content-end no-gutters">
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
                style={{ width: '39.2%', height: '40px'}}
                onChange={handleSearchText}
              />
              <Button className="ml-2" style={{ height: '38px', marginTop: 1 }} onClick={handleSearch}>약 정보로 검색</Button>
              <Button className="ml-1" style={{ height: '38px', marginTop: 1 }} onClick={resetSearch}>초기화</Button>
            </Row>
            <Row className="d-flex align-items-center justify-content-end no-gutters" style={{ marginTop: -7}}>
              <Input 
                type="text"
                placeholder="식별문자 (약의 앞면이나 뒷면에 표기된 문자)로 검색"
                style={{ width: '60.8%', height: '40px' }}
                value={discriminationText}
                onChange={handleDiscriminationText}
                onKeyDown={handleSearchShapeKeyDown}
              />
              <Button className="ml-2" onClick={searchByMedicineShape}>약 모양으로 검색</Button>
              <Button className="ml-1" style={{ height: '38px' }} onClick={resetSearchByMedicineShape}>초기화</Button>
            </Row>
          </Col>
        </Row>
        <Row>
         <Col md="12">
            <div className="ag-theme-alpine" style={{ height: '100vh', minHeight: '67.9vh', maxHeight: '67.9vh' }}>
              <AgGridReact
                ref={gridRef}
                rowData={searchResult}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                pagination={true}                                               // Pagination 사용 설정
                paginationPageSize={14}                                         // 한 페이지에 표시하고 싶은 데이터 Row 수
                enableBrowserTooltips="true"
                onRowDoubleClicked={handleRowDoubleClick}
              />
            </div>
          </Col>
        </Row>

        <Modal isOpen={modal} toggle={toggleModal} centered style={{ minWidth: '55%' }}>
          <ModalHeader toggle={toggleModal}><b>상세 정보</b></ModalHeader>
          <ModalBody>
            {selectedRowData && (
              <div>
                <ListGroup>
                  <ListGroupItem>
                    <span className="mr-1 row-detail-span" >제품명</span> 
                    <div className="row-detail-div">{selectedRowData.itemName}
                      {!isBookmarkedMedicine(selectedRowData.itemSeq) ? (
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

        <Modal isOpen={bookmarkMedicineModal} toggle={toggleBookmarkMedicineModal} centered style={{ minWidth: '25%' }}>
          <ModalHeader toggle={toggleBookmarkMedicineModal}><b>북마크 약품 목록</b></ModalHeader>
          <ModalBody>
            <div className="ag-theme-alpine" style={{ height: '30vh', minHeight: '30vh', maxHeight: '30vh' }}>
              <AgGridReact
                // ref={gridRef}
                rowData={convertedBookmarkMedicineData}
                columnDefs={bookmarkMedicineColumnDefs}
                defaultColDef={defaultColDef}
                overlayNoRowsTemplate={ '<span style="color: #6c757d;">일치하는 검색결과가 없습니다</span>' }  // 표시할 데이터가 없을 시 출력 문구
                pagination={true}                                               // Pagination 사용 설정
                paginationPageSize={10}                                         // 한 페이지에 표시하고 싶은 데이터 Row 수
                enableBrowserTooltips="true"
                onRowDoubleClicked={handleRowDoubleClick}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleBookmarkMedicineModal}>닫기</Button>
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