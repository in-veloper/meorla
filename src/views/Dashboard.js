import React, {useRef, useState} from "react";
import {Card, CardTitle, Row, Col, UncontrolledAlert} from "reactstrap";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

function Dashboard() {

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
      <UncontrolledAlert color="info" fade={false}>
        <span>
          <b>알림 &nbsp; </b>
          This is a regular notification made with
          color="info"
        </span>
      </UncontrolledAlert>
      <Row>
          <Col md="12">
            <CardTitle><b><h5>공지사항</h5></b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '25vh' }}>
                <AgGridReact 
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="6">
          <CardTitle><b><h5>침상안정 신청내역</h5></b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '25vh' }}>
                <AgGridReact 
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                />
              </div>
            </Card>
          </Col>
          <Col md="6">
            <CardTitle><b><h5>커뮤니티 알림</h5></b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '25vh' }}>
                <AgGridReact 
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <CardTitle><b><h5>보건일정</h5></b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '25vh' }}>
                <AgGridReact 
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
