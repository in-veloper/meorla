import React, {useState, useEffect} from "react";
import {Button, ButtonGroup, Card, CardHeader, CardBody, CardFooter, CardTitle, FormGroup, Form, Input, Row, Col} from "reactstrap";
import '../assets/css/users.css';
import { useUser } from "contexts/UserContext";
import ExcelJS from "exceljs";

function User() {
  const { user, getUser } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [schoolGrade, setSchoolGrade] = useState("송촌중학교");
  
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

  const generateNameTableButtons = () => {
    if(schoolGrade.includes("초등학교")) {
      return Array.from({ length: 6 }, (_, index) => index + 1);
    }else if(schoolGrade.includes("중학교") || schoolGrade.includes("고등학교")) {
      return Array.from({ length: 3 }, (_, index) => index + 1);
    }else{
      return Array.from({ length: 3 }, (_, index) => index + 1);
    }
  };
  
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const data = [
      ["학년", "반", "번호", "성별", "이름"],
    ];

    worksheet.addRows(data);

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
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
      // 중앙 정렬 적용
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const fileName = "명렬표 템플릿.xlsx";

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                          <Button className="mr-1" onClick={handleDownloadTemplate}>템플릿 다운로드</Button>
                          <Button style={{ marginRight : '10px'}}>일괄등록</Button>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <div className="update ml-auto mr-auto">
                      <Button
                        className="btn-round"
                        color="secondary"
                        type="submit"
                      >
                        사용자 정보 수정
                      </Button>
                      <Button
                        className="btn-round ml-2"
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
