import React, {useEffect, useRef, useState, useCallback} from "react";
import {Card, CardTitle, Row, Col, UncontrolledAlert, Input, Button} from "reactstrap";
import { useUser } from "contexts/UserContext";
import NotiflixWarn from "components/Notiflix/NotiflixWarn";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import axios from "axios";
import moment from 'moment';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import { useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BASE_PORT = process.env.REACT_APP_BASE_PORT;
const BASE_URL = process.env.REACT_APP_BASE_URL;

function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const isAdmin = user?.userId === "admin";
  const [visitRequestList, setVisitRequestList] = useState([]);
  const [qnaRequestData, setQnaRequestData] = useState([]);
  const [todayScheduleRowData, setTodayScheduleRowData] = useState([]);
  const [entireScheduleRowData, setEntireScheduleRowData] = useState([]);
  const [filteredScheduleRowData, setFilteredScheduleRowData] = useState([]);
  const [memoData, setMemoData] = useState("");

  const qrGridRef = useRef(null);
  const visitRequestGridRef = useRef(null);
  const todayScheduleGridRef = useRef(null);
  const entireScheduleGridRef = useRef(null);
  const gridRef = useRef(null);
  const quillRef = useRef(null);

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

  const categoryFormatter = (params) => {
    if(params.data.qrCategory === "qna") return "문의사항";
    else if(params.data.qrCategory === "request") return "요청사항";
  };

  const customContentRenderer = (params) => {
    return params.data.displayContent;
  };

  const replyFormatter = (params) => {
    if(params.data.reply) return "답변";
    else return "미답변";
  };

  const [qrColumnDefs] = useState([
    { field: "qrCategory", headerName: "분류", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: categoryFormatter },
    { field: "qrTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "left" } },
    { field: "qrContent", headerName: "내용", flex: 3, cellStyle: { textAlign: "left" }, cellRenderer: customContentRenderer },
    { field: "reply", headerName: "답변여부", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: replyFormatter }
  ]);

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
    { field: "requestContent", headerName: "요청내용", flex: 4, cellStyle: { textAlign: "center" } },
    { field: "teacherName", headerName: "요청교사", flex: 1.5, cellStyle: { textAlign: "center" } }
  ]);

  const fetchQnaRequestData = useCallback(async () => {
    if(user) {
        const response = await axios.get(`http://${BASE_URL}:${BASE_PORT}/qnaRequest/getQnaRequest`, {});
        
        if(response.data) {
            const convertedData = response.data.map(item => {
                return {
                    ...item,
                    displayContent: item.isSecret && item.userId !== user.userId ? "비밀글" : item.qrContent
                };
            });
            setQnaRequestData(convertedData);
        }
    }
  }, [user]);

  const fetchVisitRequest = useCallback(async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:${BASE_PORT}/workNote/getVisitRequest`, {
        params: {
          schoolCode: user.schoolCode,
          isRead: false
        }
      });

      if(response.data) setVisitRequestList(response.data);
    }
  }, [user]);

  useEffect(() => {
   fetchVisitRequest(); 
  }, [fetchVisitRequest]);

  const fetchTodaySchedule = useCallback(async () => {
    const today = moment().format('YYYY-MM-DD');

    if(user) {
      const response = await axios.get(`http://${BASE_URL}:${BASE_PORT}/workSchedule/getTodaySchedule`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode,
          today: today
        }
      });
  
      if(response.data) setTodayScheduleRowData(response.data);
    }
  }, [user]);

  const fetchEntireSchedule = useCallback(async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:${BASE_PORT}/workSchedule/getEntireSchedule`, {
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
  }, [user]);

  useEffect(() => {
    fetchQnaRequestData();
    fetchTodaySchedule();
    fetchEntireSchedule();
  }, [fetchQnaRequestData, fetchTodaySchedule, fetchEntireSchedule]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [
        { list: "ordered" },
        { list: "bullet" }
      ],
      ["link", "image"],
      [{ align: [] }, { color: [] }, { background: [] }], // dropdown with defaults from theme
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "align",
    "color",
    "background",
  ]; 

  const handleQuillChange = (content, delta, source, editor) => {
    setMemoData(editor.getContents());
  };

  const resetMemo = () => {
    const warnMessage = "초기화 후 저장 버튼 클릭 시 모든 메모 내용이 삭제됩니다";
    NotiflixWarn(warnMessage, '370px');
    setMemoData("");
  };

  const saveMemo = async () => {
    const payload = { content: memoData };
    
    const response = await axios.post(`http://${BASE_URL}:${BASE_PORT}/dashboard/saveMemo`, {
      userId: user.userId,
      schoolCode: user.schoolCode,
      memo: JSON.stringify(payload)
    });

    if(response.data === "success") {
      const infoMessage = "메모가 정상적으로 저장되었습니다";
      NotiflixInfo(infoMessage);
    }
  };

  const fetchMemoData = useCallback(async () => {
    if(user) {
      const response = await axios.get(`http://${BASE_URL}:${BASE_PORT}/dashboard/getMemo`, {
        params: {
          userId: user.userId,
          schoolCode: user.schoolCode
        }
      });

      if(response.data && response.data.length > 0) {
        const memoData = response.data[0].memo;
        const parsedContent = JSON.parse(memoData);
        
        setMemoData(parsedContent.content);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchMemoData()
  }, [fetchMemoData]);

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
          <Col md="7">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>공지사항</b>
                </Col>
                {isAdmin && (
                  <Col className="d-flex justify-content-end">
                    <Button className="m-0 pb-0 pt-0" size="sm">공지사항 작성</Button>
                  </Col>
                )}
              </Row>
            </CardTitle>
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
          <Col md="5">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>문의 및 요청</b>
                </Col>
                <Col className="d-flex align-items-center justify-content-end text-muted">
                  <b onClick={() => navigate('/meorla/qnaRequest')} style={{ cursor: 'pointer' }}>MORE</b>
                </Col>
              </Row>
            </CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
                  ref={qrGridRef}
                  rowData={qnaRequestData}
                  columnDefs={qrColumnDefs}
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>침상안정 신청내역</b>
                </Col>
                <Col className="d-flex align-items-center justify-content-end text-muted">
                  <b onClick={() => navigate('/meorla/workNote')} style={{ cursor: 'pointer' }}>MORE</b>
                </Col>
              </Row>
            </CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
                  ref={visitRequestGridRef}
                  rowData={visitRequestList}
                  columnDefs={visitRequestColumnDefs}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">침상안정 신청내역이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
          <Col md="6">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>커뮤니티 알림</b>
                </Col>
                <Col className="d-flex align-items-center justify-content-end text-muted">
                  <b onClick={() => navigate('/meorla/community')} style={{ cursor: 'pointer' }}>MORE</b>
                </Col>
              </Row>
            </CardTitle>
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
          <Col md="4">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>오늘의 보건일정</b>
                </Col>
                <Col className="d-flex align-items-center justify-content-end text-muted">
                  <b onClick={() => navigate('/meorla/workSchedule')} style={{ cursor: 'pointer' }}>MORE</b>
                </Col>
              </Row>
            </CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
                  ref={todayScheduleGridRef}
                  rowData={todayScheduleRowData}
                  columnDefs={eventColumnDefs}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">오늘 등록된 일정이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
          <Col md="4">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>전체 보건일정</b>
                </Col>
                <Col className="d-flex align-items-center justify-content-end text-muted">
                  <b onClick={() => navigate('/meorla/workSchedule')} style={{ cursor: 'pointer' }}>MORE</b>
                </Col>
              </Row>
            </CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
                  ref={entireScheduleGridRef}
                  rowData={filteredScheduleRowData}
                  columnDefs={eventColumnDefs}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 일정이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
          <Col md="4">
            <CardTitle style={{ marginBottom: 10 }}>
              <Row className="no-gutters">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>메모</b>
                </Col>
                <Col className="d-flex justify-content-end" md="6">
                  <Button className="m-0 pb-0 pt-0" size="sm" onClick={resetMemo}>초기화</Button>
                  <Button className="m-0 ml-1 pb-0 pt-0" size="sm" onClick={saveMemo}>저장</Button>
                </Col>
              </Row>
            </CardTitle>
            <Card>
              <div style={{ height: '20.6vh'}}>
                <ReactQuill
                  ref={quillRef}
                  style={{ height: "16.6vh" }}
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={memoData || ""}
                  onChange={handleQuillChange}
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
