import React, {useEffect, useRef, useState, useCallback} from "react";
import {Card, CardTitle, Row, Col, UncontrolledAlert} from "reactstrap";
import { useUser } from "contexts/UserContext";
import axios from "axios";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Dashboard() {
  const { user } = useUser();
  const [visitRequestList, setVisitRequestList] = useState([]);
  const [entireScheduleRowData, setEntireScheduleRowData] = useState([]);
  const [filteredScheduleRowData, setFilteredScheduleRowData] = useState([]);

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

  const eventPeriodFormatter = (params) => {
    if(!params.data) return '';

    const eventStartDate = params.data.eventStartDate;
    const eventEndDate = params.data.eventEndDate;

    if(!eventEndDate) return eventStartDate;
    else return eventStartDate + " ~ " + eventEndDate;
  };

  const [eventColumnDefs] = useState([
    { field: 'eventPeriod', headerName: '기간', valueFormatter: eventPeriodFormatter, flex: 1, cellStyle: { textAlign: "center" } },
    { field: 'eventTitle', headerName: '일정명', flex: 1 }
  ]);

  const [visitRequestColumnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "sGender", headerName: "성별", flex: 1, cellStyle: { textAlign: "center" } },
    { field: "sName", headerName: "이름", flex: 1.5, cellStyle: { textAlign: "center" } },
    { field: "requestContent", headerName: "요청내용", flex: 3, cellStyle: { textAlign: "center" } },
    { field: "teacherName", headerName: "요청교사", flex: 1.5, cellStyle: { textAlign: "center" } }
  ]);

  const fetchVisitRequest = useCallback(async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:8000/workNote/getVisitRequest`, {
        params: {
          schoolCode: user.schoolCode,
          isRead: false
        }
      });

      if(response.data) setVisitRequestList(response.data);
      console.log(response.data)
    }
  }, [user]);

  useEffect(() => {
   fetchVisitRequest(); 
  }, [fetchVisitRequest]);

  const fetchEntireSchedule = async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:8000/workSchedule/getEntireSchedule`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data) {
        setEntireScheduleRowData(response.data);
        setFilteredScheduleRowData(response.data);
      }
    }
  };

  useEffect(() => {
    // fetchTodaySchedule();
    fetchEntireSchedule();
  }, []);

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
            <CardTitle><b className="text-muted" style={{ fontSize: '17px' }}>공지사항</b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
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
          <CardTitle><b className="text-muted" style={{ fontSize: '17px' }}>침상안정 신청내역</b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
                  ref={gridRef}
                  rowData={visitRequestList}
                  columnDefs={visitRequestColumnDefs}
                />
              </div>
            </Card>
          </Col>
          <Col md="6">
            <CardTitle><b className="text-muted" style={{ fontSize: '17px' }}>커뮤니티 알림</b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
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
            <CardTitle><b className="text-muted" style={{ fontSize: '17px' }}>보건일정</b></CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
                  ref={gridRef}
                  rowData={filteredScheduleRowData}
                  columnDefs={eventColumnDefs}
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
