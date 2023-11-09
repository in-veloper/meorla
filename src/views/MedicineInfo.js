import React, { useState } from "react";
import 'tui-grid/dist/tui-grid.css';
import Grid from '@toast-ui/react-grid';
import ReactSearchBox from "react-search-box";
import axios from "axios";
import { FiSearch } from 'react-icons/fi';
// import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

// import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
// import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import {
  Input,
  Row
} from "reactstrap";

const URL = 'http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList';

const data = [
  {id: 1, name: 'Editor'},
  {id: 2, name: 'Grid'},
  {id: 3, name: 'Chart'}
];

const columns = [
  {name: 'itemName', header: '제품명'},
  {name: 'entpName', header: '업체명'},
  {name: 'itemSeq', header: '품목코드'},
  {name: 'efcyQesitm', header: '효능'},
  {name: 'useMethodQesitm', header: '사용법'},
  {name: 'atpnQesitm', header: '주의사항'},
  {name: 'intrcQesitm', header: '상호작용'},
  {name: 'seQesitm', header: '부작용'},
  {name: 'depositMethodQesitm', header: '보관법'}
];

const searchData = [
  {
    key: "john",
    value: "John Doe",
  },
  {
    key: "jane",
    value: "Jane Doe",
  },
  {
    key: "mary",
    value: "Mary Phillips",
  },
  {
    key: "robert",
    value: "Robert",
  },
  {
    key: "karius",
    value: "Karius",
  },
]





function MedicalInfo() {

  const [searchCategory, setSearchCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searchResultCount, setSearchResultCount] = useState(0);

  const handleSearchCategory = (e) => {
    const selectedCategory = e.target.value;
    setSearchCategory(selectedCategory);
  }

  const handleSearch = (e) => {
    console.log(searchCategory);
    console.log(searchText)

    getMedicineInfo();
  }

  const handleSearchText = (keyword) => {
    setSearchText(keyword);
  }

  const getMedicineInfo = async () => {
    try {
      const response = await axios.get(URL, {
        params: {
          serviceKey: 'keLWlFS+rObBs8V1oJnzhsON3lnDtz5THBBLn0pG/2bSG4iycOwJfIf5fx8Vl7SiOtsgsat2374sDmkU6bA7Zw==',
          pageNo: 1,
          numOfRows: 100,
          entpName: searchCategory === 'mCompany' ? searchText : '',  // 업체명
          itemName: searchCategory === 'mName' ? searchText : '',     // 제품명
          itemSeq: searchCategory === 'mCode' ? searchText : '',      // 품목기준코드
          efcyQesitm: searchCategory === 'mEffect' ? searchText : '', // 약 효능
          type: 'json'
        }
      });

      if(response.data.hasOwnProperty('body')) {
        setSearchResult(response.data.body.items);
        console.log(response.data.body)
        setSearchResultCount(response.data.body.items.length);
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
          <ReactSearchBox
            placeholder="검색 키워드를 입력하세요"
            value={searchText}
            data={searchData}
            onChange={handleSearchText}
            callback={(record) => console.log(record)}
          />
          <FiSearch className="ml-2 mt-2" style={{ fontSize : 20, cursor : 'pointer' }} onClick={handleSearch}/>
        </Row>
        <br/>
        <Grid
          data={searchResult}
          columns={columns}
          rowHeight={25}
          bodyHeight={1010}
          
          heightResizable={true}
          rowHeaders={['rowNum']}
        />
      </div>
    </>
  );
}

export default MedicalInfo;
