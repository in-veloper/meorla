/* 일반 교사가 진입하는 메뉴에서 학생이 침상 안정했는지 보건실 이용했는지 조회할 수 있도록 요청 */

import React, {useState, useRef} from "react";
import {Card, CardHeader, CardBody, Row, Col, Input, Button, Alert, ListGroup, ListGroupItem, Badge, UncontrolledAlert, Collapse, Table } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../assets/css/worknote.css';
import { GiBed } from "react-icons/gi";
import { BiMenu } from "react-icons/bi";
import { useUser } from "contexts/UserContext";
import axios from "axios";

function WorkNote(args) {
  const { user, getUser } = useUser();                          // 사용자 정보
  const [isOpen, setIsOpen] = useState(false);
  const [rowData, setRowData] = useState([]); // 검색 결과를 저장할 state
  const [searchCriteria, setSearchCriteria] = useState({
    iGrade: "",
    iClass: "",
    iNumber: "",
    iName: "",
  });

  const toggle = () => setIsOpen(!isOpen);

  const gridRef = useRef();

  // const [rowData] = useState([
  //   { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
  //   { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
  //   { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
  // ]);

  // const [columnDefs] = useState([
  //   { field: "registeredDate", headerName: "등록일", flex: 1, cellStyle: { textAlign: "center" } },
  //   { field: "studentName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" } },
  //   { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" } },
  //   { field: "treatAction", headerName: "처치사항", flex: 2, cellStyle: { textAlign: "center" } },
  //   { field: "dosageAction", headerName: "투약사항", flex: 2, cellStyle: { textAlign: "center" } },
  //   { field: "measureAction", headerName: "조치사항", flex: 2, cellStyle: { textAlign: "center" } },
  //   { field: "bedRest", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" } }
  // ]);

  const [ntRowData] = useState([
    // { stGrade: "2", stClass: "3", stNum: "23", stName: "김은지" },
    // { stGrade: "1", stClass: "5", stNum: "17", stName: "정영인" },
    // { stGrade: "3", stClass: "2", stNum: "15", stName: "홍길동" },
  ]);

  const [ntColumnDefs] = useState([
    { field: "stGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "stClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "stNum", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "stName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }}
  ]);

  const [wnRowData] = useState([
    { registDate: "2023-07-20", symptom: "감기", treatmentMatter: "", dosageMatter: "판콜 1정", actionMatter: "조퇴 권고", onBed: "" },
    { registDate: "2023-05-20", symptom: "타박상", treatmentMatter: "연고 도포", dosageMatter: "파스", actionMatter: "", onBed: "" },
    { registDate: "2023-07-20", symptom: "복통", treatmentMatter: "", dosageMatter: "베나치오 1병", actionMatter: "조퇴 권고", onBed: "15:00 - 16:00" }
  ]);

  const [wnColumnDefs] = useState([
    { field: "registDate", headerName: "등록일", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "treatmentMatter", headerName: "처치사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "dosageMatter", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "actionMatter", headerName: "조치사항", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "onBed", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "etc", headerName: "비고", flex: 1, cellStyle: { textAlign: "center" } }
  ]);

  const onInputChange = (field, value) => {
    setSearchCriteria((prevCriteria) => ({
      ...prevCriteria,
      [field]: value,
    }));
  };
  

  const fetchStudentData = async (criteria) => {
    try {
      const { iGrade, iClass, iNumber, iName } = criteria;
      if(user) {
        const response = await axios.get(`http://localhost:8000/studentsTable/getStudentInfoBySearch`, {
          params: {
            userId: user.userId,
            schoolCode: user.schoolCode,
            sGrade:  iGrade,
            sClass: iClass,
            sNumber:  iNumber,
            sName: iName
          }
        });

        console.log(response)
        // const data = await response.json();
        return response.data.studentData;
      }
    } catch (error) {
      console.error("학생 정보 조회 중 ERROR", error);
      return [];
    }
  };
  
  const onSearchStudent = async (criteria) => {
    try {
      const studentData = await fetchStudentData(criteria);
      console.log(studentData);
  
      // Check if studentData is an array before updating the grid
      if (Array.isArray(studentData) && gridRef.current) {
        gridRef.current.api.setRowData(studentData); // Update the grid
      }
  
      setRowData(studentData); // Update the state
    } catch (error) {
      console.error("Error while searching for students", error);
    }
  };


  return (
    <>
      <div className="content">
        <Row className="pl-3 pr-3">
          <Table bordered className="stats-table text-center text-muted">
            <thead>
              <tr>
                <th>감염병</th>
                <th>구강치아계</th>
                <th>근골격계</th>
                <th>비뇨생식기계</th>
                <th>소화기계</th>
                <th>순환기계</th>
                <th>안과계</th>
                <th>이비인후과계</th>
                <th>정신신경계</th>
                <th>호흡기계</th>
                <th>기타</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2</td>
                <td>3</td>
                <td>3</td>
                <td>23</td>
                <td>12</td>
                <td>3</td>
                <td>5</td>
                <td>7</td>
                <td>5</td>
                <td>10</td>
                <td>17</td>
              </tr>
            </tbody>
          </Table>
        </Row>
        <Row>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center" style={{ fontSize: '15px', fontWeight: 'bold' }} >
                      <span>정영인</span>
                      <br/>
                      <span style={{ fontSize: '12px' }}>11:00 부터 사용</span>
                    </p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <GiBed className="bed-icons-not-use"/>
                  </Col>
                  <Col md="8" xs="7">
                    <p className="text-muted text-center pt-2" style={{ fontSize: '15px', fontWeight: 'bold' }} >미사용중</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col className="pr-2" md="4">
            <Card style={{ minHeight: '420px'}}>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b>학생 조회</b>
              </CardHeader>
              <CardBody>
                <Row className="pr-3">
                  <Col md="10">
                    <Row>
                      <Col md="3">
                        <Row className="align-items-center">
                          <Col md="8" className="text-right">
                            <label>학년</label>
                          </Col>
                          <Col md="4" className="p-0">
                            <Input
                              className="text-right"
                              onChange={(e) => onInputChange("iGrade", e.target.value)}
                              value={searchCriteria.iGrade}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md="2">
                        <Row className="align-items-center">
                          <Col md="6" className="text-right">
                            <label>반</label>
                          </Col>
                          <Col md="6" className="p-0">
                            <Input
                              className="text-right"
                              style={{ width: '45px'}}
                              onChange={(e) => onInputChange("iClass", e.target.value)}
                              value={searchCriteria.iClass}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md="3">
                        <Row className="align-items-center">
                          <Col md="7" className="text-right">
                            <label>번호</label>
                          </Col>
                          <Col md="5" className="p-0" style={{ marginLeft: '-7px'}}>
                            <Input
                              className="text-right"
                              onChange={(e) => onInputChange("iNumber", e.target.value)}
                              value={searchCriteria.iNumber}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md="4">
                        <Row className="align-items-center pr-0">
                          <Col md="5" className="text-right" style={{ marginLeft: '-15px'}}>
                            <label>이름</label>
                          </Col>
                          <Col md="7" className="p-0" style={{ marginLeft: '-5px'}}>
                            <Input
                              className="text-right"
                              onChange={(e) => onInputChange("iName", e.target.value)}
                              value={searchCriteria.iName}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                  <Col md="2" style={{ marginLeft: '-20px' }}>
                    <Row>
                      <Col md="6" style={{ marginTop: '-10px', marginLeft: '-3px', marginRight: '3px' }}>
                        <Button size="sm" style={{ height: '30px' }}><i className="nc-icon nc-refresh-69"/></Button>
                      </Col>
                      <Col md="6" style={{ marginTop: '-10px' }}>
                        <Button size="sm" style={{ height: '30px' }} onClick={() => onSearchStudent(searchCriteria)}><i className="nc-icon nc-zoom-split"/></Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Alert className="text-center" style={{ color: 'gray', backgroundColor: '#f8f8f8' }}>
                      <i className="nc-icon nc-bulb-63" /> 일부 항목 입력으로도 조회 가능합니다
                    </Alert>
                  </Col>
                </Row>
                <Row className="pt-1">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '17.2vh' }}>
                      <AgGridReact
                        ref={gridRef}
                        // rowData={ntRowData} 
                        columnDefs={ntColumnDefs}
                        overlayNoRowsTemplate={ '<span>일치하는 검색결과가 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                      />
                    </div>
                  </Col>
                </Row>
                <Row className="pt-2">
                  <Col md="12" className="d-flex justify-content-center">
                    <Button className="mr-1">초기화</Button>
                    <Button>선택</Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <Card style={{ height: '278px', overflowY: 'auto' }}>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b>보건실 방문 요청 알람</b>
              </CardHeader>
              <CardBody>
                <UncontrolledAlert color="warning" fade={false}>
                  <span>
                    <b>알림 &nbsp; </b>
                    [13:20] 2학년 3반 정영인 방문 요청</span>
                </UncontrolledAlert>
                <UncontrolledAlert color="warning" fade={false}>
                  <span>
                    <b>알림 &nbsp; </b>
                    [15:33] 3학년 1반 김은지 방문 요청</span>
                </UncontrolledAlert>
                <UncontrolledAlert color="warning" fade={false}>
                  <span>
                    <b>알림 &nbsp; </b>
                    [11:10] 1학년 2반 홍길동 방문 요청</span>
                </UncontrolledAlert>
              </CardBody>
            </Card>
          </Col>
          <Col className="pl-2" md="8">
            <Card>
              <CardHeader className="text-muted text-center" style={{ fontSize: '17px' }}>
                <b style={{ marginRight: '-70px'}}>보건 일지</b>
                <b className="p-1 pl-2 pr-2" style={{ float: 'right', fontSize: '13px', backgroundColor: '#F1F3F5', borderRadius: '7px'}}>1학년&nbsp;&nbsp;2반&nbsp;&nbsp;22번&nbsp;&nbsp;정영인</b>
              </CardHeader>
              <CardBody>
                <Row className="pt-1">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '17.3vh' }}>
                      <AgGridReact
                        ref={gridRef}
                        rowData={wnRowData} 
                        columnDefs={wnColumnDefs}
                        overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="3" className="pt-3">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title" style={{ marginRight: '-15px' }}>증상</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px' }}/>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                          <ListGroupItem className="work-note-item">
                            증상1
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            증상2
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            증상3
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="4" className="pt-3">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title" style={{ marginRight: '-15px' }}>투약사항</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px' }}/>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                          <ListGroupItem className="work-note-item">
                            투약사항1
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            투약사항2
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            투약사항3
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="5" className="pt-3">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title" style={{ marginRight: '-15px' }}>조치사항</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px'}}/>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                          <ListGroupItem className="work-note-item">
                            조치사항1
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            조치사항2
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            조치사항3
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Card style={{ border: '1px solid lightgrey'}}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title" style={{ marginRight: '-15px' }}>처치사항</b>
                        <BiMenu style={{ float: 'right', marginTop: '-8px' }}/>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                          <ListGroupItem className="work-note-item">
                            처치사항1
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            처치사항2
                          </ListGroupItem>
                          <ListGroupItem className="work-note-item">
                            처치사항3
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6">
                    <Card className="pb-0" style={{ border: '1px solid lightgrey' }}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title">침상안정</b>
                      </CardHeader>
                      <CardBody style={{ marginTop: '-5px'}}>
                        <Row>
                          <h6><Badge color="secondary" className="ml-2 mt-1">시작시간</Badge></h6>
                          <Input
                            className="ml-3"
                            type="time"
                            style={{ width: '125px', height: '30px' }}
                          />
                          <Button size="sm" className="ml-2 m-0" style={{ height: '30px' }}>현재시간</Button>
                          <h6><Badge color="secondary" className="ml-4 mt-1">종료시간</Badge></h6>
                          <Input
                            className="ml-3"
                            type="time"
                            style={{ width: '125px', height: '30px' }}
                          />
                        </Row>
                      </CardBody>
                    </Card>
                    <Card className="pb-0" style={{ border: '1px solid lightgrey', marginTop: '-10px' }}>
                      <CardHeader className="card-work-note-header text-muted text-center" style={{ fontSize: 17, backgroundColor: '#F8F9FA', borderBottom: '1px solid lightgrey' }}>
                        <b className="action-title">비고</b>
                      </CardHeader>
                      <CardBody style={{ marginTop: '-5px'}}>
                        <Row className="d-flex justify-content-center">
                          <Input
                          style={{ width: '90%' }}
                          />
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className="d-flex justify-content-center">
                  <Col md="5">
                    <Button className="" onClick={toggle}>전체 보건일지</Button>
                  </Col>
                  <Col md="7" className="d-flex justify-content-left">
                    <Button className="mr-1">등록</Button>
                    <Button>초기화</Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
        </Row>
          <Collapse isOpen={isOpen} {...args}>
            <div className="ag-theme-alpine" style={{ height: '50vh' }}>
              <AgGridReact
                ref={gridRef}
                // rowData={rowData} 
                // columnDefs={columnDefs} 
                overlayNoRowsTemplate={ '<span>등록된 내용이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
              />
            </div>
          </Collapse>
      </div>
    </>
  );
}

export default WorkNote;
