/* 일반 교사가 진입하는 메뉴에서 학생이 침상 안정했는지 보건실 이용했는지 조회할 수 있도록 요청 */

import React, {useState, useRef} from "react";
import { Line } from "react-chartjs-2";
import {Card, CardHeader, CardBody, CardFooter, CardTitle, Row, Col} from "reactstrap";
import {dashboard24HoursPerformanceChart} from "variables/charts.js";
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
    { field: "registeredDate", headerName: "등록일" },
    { field: "studentName", headerName: "이름" },
    { field: "symptom", headerName: "증상" },
    { field: "treatAction", headerName: "처치사항" },
    { field: "dosageAction", headerName: "투약사항" },
    { field: "measureAction", headerName: "조치사항"},
    { field: "bedRest", headerName: "침상안정"}
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
            <Card style={{ height: '700px'}}>
                <span>학생조회 Card</span>
            </Card>
          </Col>
          <Col className="pl-2" md="8">
            <Card style={{ height: '700px'}}>
                <span>보건일지 등록 Card</span>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <div className="ag-theme-alpine" style={{ height: '100vh' }}>
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
