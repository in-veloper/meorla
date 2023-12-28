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
    { field: "registeredDate", headerName: "등록일", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "studentName", headerName: "이름", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "symptom", headerName: "증상", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "treatAction", headerName: "처치사항", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "dosageAction", headerName: "투약사항", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "measureAction", headerName: "조치사항", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "bedRest", headerName: "침상안정", flex: 1, cellStyle: { textAlign: "center" } }
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
              <div className="ag-theme-alpine" style={{ height: '23vh' }}>
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
              <div className="ag-theme-alpine" style={{ height: '23vh' }}>
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
              <div className="ag-theme-alpine" style={{ height: '23vh' }}>
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
              <div className="ag-theme-alpine" style={{ height: '23vh' }}>
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
