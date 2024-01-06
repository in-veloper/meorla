import React, {useState, useEffect} from "react";
import {Button, ButtonGroup, Card, CardHeader, CardBody, CardFooter, CardTitle, FormGroup, Form, Input, Row, Col} from "reactstrap";
import { useUser } from "contexts/UserContext";
import ExcelJS from "exceljs";
import { read, utils } from "xlsx";
import axios from "axios";
import Notiflix from "notiflix";
import '../assets/css/users.css';

function User() {
  const { user, getUser } = useUser();                          // 사용자 정보
  const [currentUser, setCurrentUser] = useState(null);         // ?
  const [schoolGrade, setSchoolGrade] = useState("송촌중학교");    // 학년 정보
  const [selectedFile, setSelectedFile] = useState(null);       // 선택한 파일
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUser();

        if(userData) {
          setCurrentUser(userData);
          setSchoolGrade(userData.schoolName);
        }
      }catch(error) {
        console.error("User 정보 Fetching 중 ERROR", error);
      }
    }

    if(!user) {
      fetchData();
    }else{
      setCurrentUser(user);
      setSchoolGrade(user.schoolName);
    }
  }, [user, getUser]);

  // 소속학교 기준 명렬표 학년별 등록 확인 버튼 생성
  const generateNameTableButtons = () => {
    if(schoolGrade.includes("초등학교")) {                                          // 소속학교가 '초등학교'일 경우 - 6
      return Array.from({ length: 6 }, (_, index) => index + 1);
    }else if(schoolGrade.includes("중학교") || schoolGrade.includes("고등학교")) {    // 소속학교가 '중학교' || '고등학교'일 경우 - 3
      return Array.from({ length: 3 }, (_, index) => index + 1);
    }else{
      return Array.from({ length: 3 }, (_, index) => index + 1);
    }
  };
  
  // 명렬표 Upload 위해 템플릿(Excel 형식) 다운로드 Function
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();                        // workbook 생성
    const worksheet = workbook.addWorksheet("Sheet1");              // worksheet 생성

    const data = [["학년", "반", "번호", "성별", "이름"]];                // 위 worksheet에 입력할 데이터 (컬럼)

    worksheet.addRows(data);                                        // 생성한 Row 추가

    const headerRow = worksheet.getRow(1);                          // Header Row 획득
    headerRow.eachCell((cell) => {                                  // 템플릿 style 설정
      cell.fill = {
        type: "pattern",
        pattern: 'solid',
        fgColor: { argb: "C0C0C0"}
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      
      cell.alignment = { horizontal: "center", vertical: "middle" };  // 중앙 정렬 적용
    });

    const buffer = await workbook.xlsx.writeBuffer();   // buffer 쓰기 처리 (파일로 쓰기)
    const blob = new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const fileName = "명렬표 템플릿.xlsx";                  // 다운로드할 파일 이름 설정

    const link = document.createElement("a");           // 다울로드할 수 있는 a 요소 획득
    link.href = window.URL.createObjectURL(blob);       // a 태그의 href 설정
    link.download = fileName;                           // 선택한 파일의 다운로드는 fileName으로 설정
    document.body.appendChild(link);                    // 위에서 생성한 link 추가
    link.click();                                       // link 강제 Click
    document.body.removeChild(link);                    // 필요없는 link 삭제 
  }
  
  // 명렬표 파일 Change Event ([필요] handleBulkRegist Function과 중복으로 존재할 필요 있는지 확인)
  const handleFileChange = (event) => {
    const file = event.target.files[0];   // 파일 획득
    setSelectedFile(file);                // useState로 전역 사용
    event.target.value = '';              // 파일 Input 초기화
    handleBulkRegist();                   // 명렬표 등록 Event 호출
  }

  // Default 파일 첨부 버튼 외 Custom 버튼으로 사용하기 위해 별도 태그 처리
  const onBulkRegist = () => {
    const fileInput = document.createElement("input");        // 파일 Input 생성
    fileInput.type = "file";                                  // Input type 설정
    fileInput.accept = ".xlsx,.xls";                          // 첨부 가능 확장자 설정
    fileInput.addEventListener("change", handleFileChange);   // change Event 속성 설정
    fileInput.click();                                        // 파일 첨부 강제 Click
  }

  // 명렬표 일괄등록 버튼 Click Event
  const handleBulkRegist = () => {
    if(selectedFile) {  // 업로드할 파일 존재할 경우
      Notiflix.Confirm.show('명렬표 일괄 등록', '선택하신 파일로 명렬표를 등록하시겠습니까?', '예', '아니요', () => {
        const reader = new FileReader();        // File Reader 객체 획득
        reader.onload = (e) => {                // 학생 정보 DB Insert 시 async(비동기) 사용할 경우 onload에 사용하기 부적합 (Function으로 분리 호출)
          handleExcelUpload(e);                 // 명렬표(Excel 파일) Upload Function 호출
        };
        reader.readAsArrayBuffer(selectedFile); // 파일 읽음
      },() => {
        return;                                 // return
      },{
        position: 'center-center', showOnlyTheLastOne: true, plainText: false
      })
    }
  }

  // 명렬표 파일 선택 시 Upload & DB Insert API 호출
  const handleExcelUpload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);                     // 파일 Data 획득
      const workbook = read(data, { type: "array" });                   // array type으로 workbook 획득
      const sheetName = workbook.SheetNames[0];                         // sheet명 획득
      const workSheet = workbook.Sheets[sheetName];                     // sheet명으로 필요 sheet 획득
      const sheetData = utils.sheet_to_json(workSheet, { header: 1 });  // sheet 내 데이터 획득 (header: 1 -> 첫쨰 줄을 header로 사용하겠다는 의미)

      for(let i = 1; i < sheetData.length; i++) {                       // 명렬표 데이터 획득 위해 순회
        const studentData = sheetData[i];                               // 명렬표 Sheet 데이터 획득
        const sGrade = studentData[0];                                  // 학년 획득
        const sClass = studentData[1];                                  // 반 획득
        const sNumber = studentData[2];                                 // 번호 획득
        const sGender = studentData[3];                                 // 성별 획득
        const sName = studentData[4];                                   // 이름 획득

        if(user) {                                                              // user 정보 Parameter로 전달 위해 user 정보 존재여부 확인
          try {
            await axios.post('http://localhost:8000/studentsTable/insert', {    // 명렬표 DB Insert API 호출
              userId: user.userId,                                              // 사용자 ID
              schoolName: user.schoolName,                                      // 사용자 재직 학교명
              schoolCode: user.schoolCode,                                      // 사용자 재직 학교 코드
              sGrade: sGrade,                                                   // 학년
              sClass: sClass,                                                   // 반
              sNumber: sNumber,                                                 // 번호
              sGender: sGender,                                                 // 성별
              sName: sName                                                      // 이름
            }).then((response) => {
              console.log(response.data);
            });
          }catch(error) {
            console.log("학생 정보 Server 전송 중 ERROR", error);
          }
        }
      }
    }catch(error) {
      console.log("Excel 파일 읽기 중 ERROR", error);
    }
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="4">
            <Card className="card-user" style={{ height: '560px'}}> {/* 높이 임의 설정 - 수정필요 (반응형) */}
              <div className="image">
                <img alt="..." src={require("assets/img/damir-bosnjak.jpg")} />
              </div>
              <CardBody>
                <div className="author">
                  <a href="#pablo" onClick={(e) => e.preventDefault()}>
                    <img
                      alt="..."
                      className="avatar border-gray"
                      src={require("assets/img/mike.jpg")}
                    />
                    <h5 className="title">{currentUser ? currentUser.name : ''}</h5>
                  </a>
                  <p className="description">{currentUser ? currentUser.schoolName : ''}</p>
                </div>
                <p className="description text-center">
                  "I like the way you work it <br />
                  No diggity <br />I wanna bag it up"
                </p>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="button-container">
                  <Row>
                    <Col className="ml-auto" lg="3" md="6" xs="6">
                      <h5>
                        12 <br />
                        <small>Files</small>
                      </h5>
                    </Col>
                    <Col className="ml-auto mr-auto" lg="4" md="6" xs="6">
                      <h5>
                        2GB <br />
                        <small>Used</small>
                      </h5>
                    </Col>
                    <Col className="mr-auto" lg="3">
                      <h5>
                        24,6$ <br />
                        <small>Spent</small>
                      </h5>
                    </Col>
                  </Row>
                </div>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-muted" tag="h6">관리자 문의</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="list-unstyled team-members">
                  <li>
                    <Row>
                      <Col md="2" xs="2">
                        <div className="avatar">
                          <img
                            alt="..."
                            className="img-circle img-no-padding img-responsive"
                            src={require("assets/img/faces/clem-onojeghuo-2.jpg")}
                          />
                        </div>
                      </Col>
                      <Col className="col-ms-7" xs="7">
                        관리자 <br />
                        <span className="text-success">
                          <small>online</small>
                        </span>
                      </Col>
                      <Col className="text-right" md="3" xs="3" style={{ marginTop: -6}}>
                        <Button
                          className="btn-round btn-icon"
                          color="success"
                          outline
                          size="sm"
                        >
                          <i className="fa fa-envelope" />
                        </Button>
                      </Col>
                    </Row>
                  </li>
                </ul>
              </CardBody>
            </Card>
          </Col>
          <Col md="8">
            <Card className="card-user">
              <CardHeader>
                <CardTitle className="text-muted" tag="h5"><b>사용자 정보</b></CardTitle>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col className="pr-1" md="5">
                      <FormGroup>
                        <label>소속학교</label>
                        <Input
                          defaultValue={currentUser ? currentUser.schoolName : ''}
                          disabled
                          // placeholder="Company"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="3">
                      <FormGroup>
                        <label>이름</label>
                        <Input
                          defaultValue={currentUser ? currentUser.name : ''}
                          placeholder="Username"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="4">
                      <FormGroup>
                        <label htmlFor="exampleInputEmail1">
                          Email
                        </label>
                        <Input 
                          defaultValue={currentUser ? currentUser.email : ''}
                          placeholder="Email" 
                          type="email" 
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="6">
                      <FormGroup>
                        <label>가입된 서비스</label>
                        <Input
                          defaultValue="Standard"
                          placeholder="Company"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="6">
                      <FormGroup>
                        <label>서비스 사용기간</label>
                        <Input
                          defaultValue="2023.11.17 ~ 2024.11.16"
                          placeholder="Last Name"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Address</label>
                        <Input
                          defaultValue="Faker"
                          placeholder="Home Address"
                          type="text"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="4">
                      <FormGroup>
                        <label>이용중인 서비스</label>
                        <Input
                          defaultValue="Standard"
                          placeholder="City"
                          type="text"
                          disabled
                        />
                      </FormGroup>
                    </Col>
                    <Col className="px-1" md="4">
                      <FormGroup>
                        <label>서비스 사용기간</label>
                        <Input
                          defaultValue="2023.11.17 - 2024.11.16"
                          placeholder="Country"
                          type="text"
                          disabled
                        />
                      </FormGroup>
                    </Col>
                    <Col className="pl-1" md="4">
                      <FormGroup>
                        <label>서비스 이용상태</label>
                        <Input 
                          defaultValue="사용중"
                          placeholder="ZIP Code" 
                          type="text" 
                          disabled
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>About Me</label>
                        <Input
                          type="textarea"
                          defaultValue="Oh so, your weak rhyme You doubt I'll bother, reading into it"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="align-items-center">
                    <Col md="8">
                      <FormGroup>
                        <label>명렬표</label>
                        <div style={{ marginTop: -12}}>
                          <ButtonGroup className="" size="md">
                            {generateNameTableButtons().map((buttonNumber) => (
                              <Button key={buttonNumber} className="btn-outline-default">
                                {buttonNumber}
                              </Button>
                            ))}
                          </ButtonGroup>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col md="4" className="">
                      <Row className="justify-content-end no-gutters">
                          <Button className="btn-round mr-1" onClick={handleDownloadTemplate}>템플릿 다운로드</Button>
                          <Button className="btn-round" style={{ marginRight : '10px'}} onClick={onBulkRegist}>일괄등록</Button>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <div className="update ml-auto mr-auto">
                      <Button
                        className=""
                        color="secondary"
                        type="submit"
                      >
                        사용자 정보 수정
                      </Button>
                      <Button
                        className="ml-2"
                        color="secondary"
                        type="submit"
                      >
                        비밀번호 재설정
                      </Button>
                    </div>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default User;
