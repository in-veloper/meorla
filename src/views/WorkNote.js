/* 일반 교사가 진입하는 메뉴에서 학생이 침상 안정했는지 보건실 이용했는지 조회할 수 있도록 요청 */

import React, {useState, useRef} from "react";
import {Card, CardHeader, CardBody, CardFooter, CardTitle, Row, Col, Input, Button, Alert, ListGroup, ListGroupItem, Badge, UncontrolledAlert } from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import '../assets/css/worknote.css';

function WorkNote() {

  const gridRef = useRef();

  const [rowData] = useState([
    { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
    { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
    { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
  ]);

  const [columnDefs] = useState([
    { field: "registeredDate", headerName: "등록일", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "studentName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "treatAction", headerName: "처치사항", flex: 2, cellStyle: { textAlign: "center" } },
    { field: "dosageAction", headerName: "투약사항", flex: 2, cellStyle: { textAlign: "center" } },
    { field: "measureAction", headerName: "조치사항", flex: 2, cellStyle: { textAlign: "center" } },
    { field: "bedRest", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" } }
  ]);

  const [ntRowData] = useState([
    { stGrade: "2", stClass: "3", stNum: "23", stName: "김은지" },
    { stGrade: "1", stClass: "5", stNum: "17", stName: "정영인" },
    { stGrade: "3", stClass: "2", stNum: "15", stName: "홍길동" },
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
    { field: "onBed", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" }}
  ]);


  return (
    <>
      <div className="content">
        <Row>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-globe text-warning" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">Capacity</p>
                      <CardTitle tag="p">150GB</CardTitle>
                      <p />
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="stats">
                  <i className="fas fa-sync-alt" /> Update Now
                </div>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-money-coins text-success" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">Revenue</p>
                      <CardTitle tag="p">$ 1,345</CardTitle>
                      <p />
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="stats">
                  <i className="far fa-calendar" /> Last day
                </div>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-vector text-danger" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">Errors</p>
                      <CardTitle tag="p">23</CardTitle>
                      <p />
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="stats">
                  <i className="far fa-clock" /> In the last hour
                </div>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-favourite-28 text-primary" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <p className="card-category">Followers</p>
                      <CardTitle tag="p">+45K</CardTitle>
                      <p />
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="stats">
                  <i className="fas fa-sync-alt" /> Update now
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col className="pr-2" md="4">
            <Card style={{ height: '610px'}}>
              <CardHeader className="text-muted text-center" tag="h5">
                <b>학생 조회</b>
              </CardHeader>
              <CardBody>
                <Row className="pr-3">
                  <Col md="3">
                    <Row className="align-items-center">
                      <Col md="6" className="text-right">
                        <label>학년</label>
                      </Col>
                      <Col md="6" className="p-0">
                        <Input
                          className="text-right"
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
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="3">
                    <Row className="align-items-center">
                      <Col md="6" className="text-right">
                        <label>번호</label>
                      </Col>
                      <Col md="6" className="p-0">
                        <Input
                          className="text-right"
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="4">
                    <Row className="align-items-center">
                      <Col md="4" className="text-right">
                        <label>이름</label>
                      </Col>
                      <Col md="8" className="p-0">
                        <Input
                          className="text-right"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="d-flex justify-content-center">
                  <Button className="mr-1">초기화</Button>
                  <Button>조회</Button>
                </Row>
                <Row>
                  <Col md="12">
                  <Alert color="secondary" className="text-center" style={{ color: 'gray' }}>
                    <i className="nc-icon nc-bulb-63" /> 일부 항목 입력으로도 조회 가능합니다
                  </Alert>
                  </Col>
                </Row>
                <Row className="pt-3">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '30vh' }}>
                      <AgGridReact
                        ref={gridRef}
                        rowData={ntRowData} 
                        columnDefs={ntColumnDefs} 
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
            <Card style={{ height: '480px', overflowY: 'scroll' }}>
              <CardHeader className="text-muted text-center" tag="h5">
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
            <Card style={{ height: '1110px'}}>
              <CardHeader className="text-muted text-center" tag="h5">
                <b>보건 일지</b>
              </CardHeader>
              <CardBody>
                <Row className="d-flex justify-content-center pl-3 pr-3">
                  <Col md="2"></Col>
                  <Col md="8">
                    <Row className="align-items-center">
                      <Col md="1" className="text-right">
                        <label>학년</label>
                      </Col>
                      <Col md="1" className="pl-0">
                        <Input
                          readOnly 
                        />
                      </Col>
                      <Col md="1" className="text-right">
                        <label>반</label>
                      </Col>
                      <Col md="1" className="pl-0">
                        <Input
                          readOnly
                        />
                      </Col>
                      <Col md="1" className="text-right">
                        <label>번호</label>
                      </Col>
                      <Col md="1" className="pl-0">
                        <Input
                          readOnly
                        />
                      </Col>
                      <Col md="1" className="text-right">
                        <label>성별</label>
                      </Col>
                      <Col md="1" className="pl-0">
                        <Input
                          readOnly
                        />
                      </Col>
                      <Col md="1" className="text-right">
                        <label>이름</label>
                      </Col>
                      <Col md="2" className="pl-0">
                        <Input
                          readOnly
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="2"></Col>
                </Row>
                <Row className="pt-3">
                  <Col md="12">
                    <div className="ag-theme-alpine" style={{ height: '20vh' }}>
                      <AgGridReact
                        ref={gridRef}
                        rowData={wnRowData} 
                        columnDefs={wnColumnDefs} 
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md="6" className="pt-3">
                    <Card color="light">
                      <CardHeader className="text-muted text-center" style={{ fontSize: 17 }}>
                        <b>증상</b>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '240px', overflowY: 'scroll' }}>
                          <ListGroupItem>
                            증상1
                          </ListGroupItem>
                          <ListGroupItem>
                            증상2
                          </ListGroupItem>
                          <ListGroupItem>
                            증상3
                          </ListGroupItem>
                          <ListGroupItem>
                            증상4
                          </ListGroupItem>
                          <ListGroupItem>
                            증상5
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6" className="pt-3">
                    <Card color="light">
                      <CardHeader className="text-muted text-center" style={{ fontSize: 17 }}>
                        <b>처치사항</b>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '240px', overflowY: 'scroll' }}>
                          <ListGroupItem>
                            처치사항1
                          </ListGroupItem>
                          <ListGroupItem>
                            처치사항2
                          </ListGroupItem>
                          <ListGroupItem>
                            처치사항3
                          </ListGroupItem>
                          <ListGroupItem>
                            처치사항4
                          </ListGroupItem>
                          <ListGroupItem>
                            처치사항5
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Card color="light">
                      <CardHeader className="text-muted text-center" style={{ fontSize: 17 }}>
                        <b>투약사항</b>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '240px', overflowY: 'scroll' }}>
                          <ListGroupItem>
                            투약사항1
                          </ListGroupItem>
                          <ListGroupItem>
                            투약사항2
                          </ListGroupItem>
                          <ListGroupItem>
                            투약사항3
                          </ListGroupItem>
                          <ListGroupItem>
                            투약사항4
                          </ListGroupItem>
                          <ListGroupItem>
                            투약사항5
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6">
                    <Card color="light">
                      <CardHeader className="text-muted text-center" style={{ fontSize: 17 }}>
                        <b>조치사항</b>
                      </CardHeader>
                      <CardBody>
                        <Input
                          placeholder="직접 입력"
                        />
                        <ListGroup className="pt-2" style={{ maxHeight: '101px', overflowY: 'scroll' }}>
                          <ListGroupItem>
                            조치사항1
                          </ListGroupItem>
                          <ListGroupItem>
                            조치사항2
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                    </Card>
                    <Card className="pb-2" color="light">
                      <CardHeader className="text-muted text-center" style={{ fontSize: 17 }}>
                        <b>침상안정</b>
                      </CardHeader>
                      <CardBody>
                        <Row>
                          <h5><Badge color="secondary" className="ml-2">시작시간</Badge></h5>
                          <Input
                            className="ml-3"
                            type="time"
                            style={{ width: '100px', height: '37px' }}
                          />
                          <Button size="sm" className="ml-2 m-0" style={{ height: '36px' }}>현재시간</Button>
                          <h5><Badge color="secondary" className="ml-4">종료시간</Badge></h5>
                          <Input
                            className="ml-3"
                            type="time"
                            style={{ width: '100px', height: '37px' }}
                          />
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row className="d-flex justify-content-center">
                  <Button className="mr-1">등록</Button>
                  <Button>초기화</Button>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md="12">
            <div className="ag-theme-alpine" style={{ height: '50vh' }}>
              <AgGridReact
                ref={gridRef}
                rowData={rowData} 
                columnDefs={columnDefs} 
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default WorkNote;
