import React, {useEffect, useRef, useState, useCallback} from "react";
import {Card, CardTitle, Row, Col, Alert, Input, Button, Modal, ModalHeader, ModalBody, ModalFooter, Label} from "reactstrap";
import { useUser } from "contexts/UserContext";
import NotiflixWarn from "components/Notiflix/NotiflixWarn";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm";
import axios from "axios";
import moment from 'moment';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import { useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import ReactQuill from "react-quill";
import { useDropzone } from "react-dropzone";
import "react-quill/dist/quill.snow.css";

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
  const [announceWriteModal, setAnnounceWriteModal] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [announceContentData, setAnnounceContentData] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMessage, setFileMessage] = useState(<div className='d-flex justify-content-center align-items-center text-muted'>이 곳을 클릭하거나 드래그하여 <br/>파일을 업로드 해주세요</div>);
  const [announceData, setAnnounceData] = useState([]);
  const [announceDetailModal, setAnnounceDetailModal] = useState(false);
  const [announceSelectedRow, setAnnounceSelectedRow] = useState(null);
  const [announceTitleDetailValue, setAnnounceTitleDetailValue] = useState("");
  const [announceDetailContentData, setAnnounceDetailContentData]  = useState("");
  const [announceContentDetailValue, setAnnounceContentDetailValue] = useState("");
  const [communityData, setCommunityData] = useState([]);
  const [alertData, setAlertData] = useState(null);
  const [alertVisible, setAlertVisible] = useState(true);

  const qrGridRef = useRef(null);
  const visitRequestGridRef = useRef(null);
  const todayScheduleGridRef = useRef(null);
  const entireScheduleGridRef = useRef(null);
  const announceGridRef = useRef(null);
  const communityGridRef = useRef(null);
  const gridRef = useRef(null);
  const quillRef = useRef(null);
  const announceQuillRef = useRef(null);

  const toggleAnnounceWriteModal = () => setAnnounceWriteModal(!announceWriteModal);
  const toggleAnnounceDetailModal = () => setAnnounceDetailModal(!announceDetailModal);

  const isFileContainRenderer = (params) => {
    if(params.data.fileName) {
      return <b>Y</b>
    }else{
      return 'N'
    }
  };

  const registDateFormatter = (params) => {
    const dateTime = params.data.createdAt;

    let dateValue = dateTime.split("T")[0];
    let timeValue = dateTime.split("T")[1];
    const returnDateValue = dateValue.split("-")[0] + "년 " + parseInt(dateValue.split("-")[1]).toString() + "월 " + parseInt(dateValue.split("-")[2]).toString() + "일   ";
    const returnTimeValue = (timeValue.split(":")[0] === "00" ? "00" : parseInt(timeValue.split(":")[0]).toString()) + "시 " + (timeValue.split(":")[1] === "00" ? "00" : parseInt(timeValue.split(":")[1]).toString()) + "분";

    return returnDateValue + returnTimeValue;
  };

  const communityCategoryFormatter = (params) => {
    const categoryValue = params.data.category;

    if(categoryValue === "opinionSharing") return "의견공유";
    else if(categoryValue === "resourceSharing") return "자료공유";
    else if(categoryValue === "interact") return "시도교류";
    else return "";
  };

  const [rowData] = useState([
    { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
    { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
    { registeredDate: "Toyota", studentName: "Celica", symptom: "Celica", treatAction: "Celica",  dosageAction: "Celica", measureAction: "Celica", bedRest: "Celica" },
  ]);

  const [announceColumnDefs] = useState([
    { field: "announceTitle", headerName: "제목", flex: 3, cellStyle: { textAlign: "center" } },
    { field: "createdAt", headerName: "등록일", flex: 1.5, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter },
    { field: "fileName", headerName: "첨부파일 여부", flex: 1, cellStyle: { textAlign: "center" }, cellRenderer: isFileContainRenderer }
  ]);

  const [communityColumnDefs] = useState([
    { field: "category", headerName: "게시판 분류", flex: 1.5, cellStyle: { textAlign: "center" }, valueFormatter: communityCategoryFormatter },
    { field: "title", headerName: "제목", flex: 2.5, cellStyle: { textAlign: "center" } },
    { field: "createdAt", headerName: "등록일", flex: 2, cellStyle: { textAlign: "center" }, valueFormatter: registDateFormatter }
  ]);

  const [columnDefs] = useState([
    { field: "sGrade", headerName: "학년", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sClass", headerName: "반", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sNumber", headerName: "번호", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sGender", headerName: "성별", flex: 1, cellStyle: { textAlign: "center" }},
    { field: "sName", headerName: "이름", flex: 2, cellStyle: { textAlign: "center" }}
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

  const notEditDefaultColDef = {
    sortable: true,
    resizable: true,
    filter: true
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
        const response = await axios.get(`${BASE_URL}/api/qnaRequest/getQnaRequest`, {});
        
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
      const response = await axios.get(`${BASE_URL}/api/workNote/getVisitRequest`, {
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
      const response = await axios.get(`${BASE_URL}/api/workSchedule/getTodaySchedule`, {
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
      const response = await axios.get(`${BASE_URL}/api/workSchedule/getEntireSchedule`, {
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
      [{ align: [] }, { color: [] }, { background: [] }], // dropdown with defaults from theme
      ["bold", "italic", "underline", "strike"],
      [
        { list: "ordered" },
        { list: "bullet" }
      ],
      ["image"],
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
    
    const response = await axios.post(`${BASE_URL}/api/dashboard/saveMemo`, {
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
      const response = await axios.get(`${BASE_URL}/api/dashboard/getMemo`, {
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

  const handleAnnounceQuillChange = (content, delta, source, editor) => {
    setAnnounceContentData(editor.getContents());
  };

  const handleFileDelete = () => {
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setSelectedFile(null);
    setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br />파일을 업로드 해주세요</div>);
  };
  
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setUploadedFileUrl(null);
        setUploadedFileName(acceptedFiles[0].name);
        setFileMessage(
            <div className='d-flex justify-content-center align-items-center text-muted pt-2'>
                {acceptedFiles[0].name}
                <Button close onClick={() => handleFileDelete()} />
            </div>
        );
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: uploadedFileUrl !== null, // 파일이 업로드된 상태에서는 클릭 비활성화
  });

  // 공지사항 모달 열릴 시 Dropzone 파일 메시지 설정
  useEffect(() => {
    if(announceDetailModal && announceSelectedRow && announceSelectedRow.fileUrl) {
        setUploadedFileUrl(announceSelectedRow.fileUrl);
        setUploadedFileName(announceSelectedRow.fileName);
        setFileMessage(
            <div className='d-flex justify-content-center align-items-center text-muted pt-2'>
                <a href={announceSelectedRow.fileUrl} download>{announceSelectedRow.fileName}</a>
                <Button close onClick={() => handleFileDelete()} />
            </div>
        );
    } else if (announceDetailModal && !announceSelectedRow) {
        setUploadedFileUrl(null);
        setUploadedFileName(null);
        setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br />파일을 업로드 해주세요</div>);
    }
  }, [announceDetailModal, setAnnounceSelectedRow]);

  const resetAnnounceWrite = () => {
    setTitleValue("");
    setAnnounceContentData("");
    setSelectedFile(null);
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setFileMessage(<div className='text-muted'>이 곳을 클릭하거나 드래그하여 <br/>파일을 업로드 해주세요</div>);
  };

  const saveAnnounceWrite = async () => {
    const payload = { content: announceContentData };

    let fileName = null;
    let fileUrl = null;

    if (selectedFile) {
        let formData = new FormData();
        const encodedFileName = encodeURIComponent(selectedFile.name).replace(/%20/g, "+");
        formData.append("uploadPath", `${user.userId}/announceFiles`);
        formData.append("file", new File([selectedFile], encodedFileName, { type: selectedFile.type }));

        const config = { headers: { "Content-Type": "multipart/form-data" }};

        try{
            const fileUploadResponse = await axios.post(`${BASE_URL}/upload/image`, formData, config);

            if(fileUploadResponse.status === 200) {
                const { filename, fileUrl: newFileUrl } = fileUploadResponse.data;
                fileName = filename;
                fileUrl = newFileUrl;
            }
        } catch (error) {
            console.log("공지사항 파일 업로드 중 ERROR", error);
            return; // 파일 업로드 실패 시 함수 종료
        }
    }

    try{
        const response = await axios.post(`${BASE_URL}/api/dashboard/saveAnnounce`, {
            userId: user.userId,
            userName: user.name,
            schoolCode: user.schoolCode,
            announceTitle: titleValue,
            announceContent: JSON.stringify(payload),
            fileName: fileName,
            fileUrl: fileUrl,
            category: "announce"
        });

        if(response.data === 'success') {
            const infoMessage = "공지사항이 정상적으로 등록되었습니다";
            NotiflixInfo(infoMessage);
            toggleAnnounceWriteModal();
            fetchAnnounceData();
            resetAnnounceWrite();
        }
    } catch (error) {
        console.log("자료공유 파일 업로드 중 ERROR", error);
    }
  };

  const fetchAnnounceData = useCallback(async () => {
    if(user) {
        const response = await axios.get(`${BASE_URL}/api/dashboard/getAnnounce`, {});

        if(response.data) {
            const responseData = response.data;
            setAnnounceData(responseData);

            if(response.data.length > 0) setAlertData(response.data[0]);
            else setAlertData(null);
        }
    }
  }, [user]);

  useEffect(() => {
    fetchAnnounceData();
  }, [fetchAnnounceData]);

  const handleAnnounceWrite = () => {
    toggleAnnounceWriteModal();
  };

  const handleAnnounceDetailQuillChange = (content, delta, source, editor) => {
    setAnnounceContentDetailValue(editor.getContents());
  };

  const updateAnnounce = async () => {
    const payload = { content: announceContentDetailValue };
    let fileUrl = uploadedFileUrl;
    let fileName = uploadedFileName;

    if(selectedFile) {
      let formData = new FormData();
      const encodedFileName = encodeURIComponent(selectedFile.name).replace(/%20/g, "+");
      formData.append("uploadPath", `${user.userId}/resourceFiles`);
      formData.append("file", new File([selectedFile], encodedFileName, { type: selectedFile.type }));

      const config = { header: { "Content-Type": "multipart/form-data" }};

      try {
        const fileUploadResponse = await axios.post(`${BASE_URL}/upload/image`, formData, config);

        if(fileUploadResponse.status === 200) {
            const { filename, fileUrl: newFileUrl } = fileUploadResponse.data;
            fileName = filename;
            fileUrl = newFileUrl;
        }
      } catch (error) {
          console.log("공지사항 파일 업로드 중 ERROR", error);
          return;
      }
    }

    const response = await axios.post(`${BASE_URL}/api/dashboard/updateAnnounce`, {
      userId: user.userId,
      schoolCode: user.schoolCode,
      rowId: announceSelectedRow.id,
      announceTitle: announceTitleDetailValue,
      announceContent: JSON.stringify(payload),
      fileName: fileName,
      fileUrl: fileUrl
    });

    if(response.data === 'success') {
      const infoMessage = "공지사항 글이 정상적으로 수정되었습니다";
      NotiflixInfo(infoMessage);
      fetchAnnounceData();
      toggleAnnounceDetailModal();
    }
  };

  const deleteAnnounce = () => {
    if(announceSelectedRow) {
      const confirmTitle = "공지사항 글 삭제";
      const confirmMessage = "선택하신 공지사항 글을 삭제하시겠습니까?";

      const yesCallback = async () => {
        const response = await axios.post(`${BASE_URL}/api/dashboard/deleteAnnounce`, {
          rowId: announceSelectedRow.id,
          userId: user.userId,
          schoolCode: user.schoolCode
        });

        if(response.data === 'success') {
          const infoMessage = "공지사항 글이 정상적으로 삭제되었습니다";
          NotiflixInfo(infoMessage);
          fetchAnnounceData();
          toggleAnnounceDetailModal();
        }
      };

      const noCallback = () => {
        return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '320px');
    }
  };

  const announceDoubleClick = (params) => {
    const selectedRow = params.data;

    setAnnounceSelectedRow(selectedRow);
    setAnnounceTitleDetailValue(selectedRow.announceTitle);
    setAnnounceContentDetailValue(selectedRow.announceContent);
    toggleAnnounceDetailModal();

    const parsedContent = JSON.parse(selectedRow.announceContent);
    setAnnounceDetailContentData(parsedContent.content);

    if (announceQuillRef.current && announceQuillRef.current.getEditor) {
      announceQuillRef.current.getEditor().setContents(parsedContent.content);
    }
  };

  const fetchCommunityData = useCallback(async () => {
    if(user) {
      const response = await axios.get(`${BASE_URL}/api/dashboard/getCommunity`, {});

      if(response.data) {
        setCommunityData(response.data);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const handleClickAlert = (params) => {
    const selectedRow = params;

    setAnnounceSelectedRow(selectedRow);
    setAnnounceTitleDetailValue(selectedRow.announceTitle);
    setAnnounceContentDetailValue(selectedRow.announceContent);
    toggleAnnounceDetailModal();

    const parsedContent = JSON.parse(selectedRow.announceContent);
    setAnnounceDetailContentData(parsedContent.content);

    if (announceQuillRef.current && announceQuillRef.current.getEditor) {
      announceQuillRef.current.getEditor().setContents(parsedContent.content);
    }
  };

  return (
    <>
      <div className="content" style={{ height: '84.1vh' ,display: 'flex', flexDirection: 'column' }}>
        {alertData && alertVisible && (
          <div onClick={() => handleClickAlert(alertData)}>
            <Alert color="info" fade={false}>
                <span>
                  <b>알림 &nbsp; </b>
                  {alertData.announceTitle}
                </span>
            </Alert>
          </div>
        )}
        <Row style={{ flex: '1 1 auto'}}>
          <Col md="6">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>공지사항</b>
                </Col>
                {isAdmin && (
                  <Col className="d-flex justify-content-end">
                    <Button className="m-0 pb-0 pt-0" size="sm" onClick={handleAnnounceWrite}>공지사항 작성</Button>
                  </Col>
                )}
              </Row>
            </CardTitle>
            <Card>
              <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                <AgGridReact 
                  rowHeight={35}
                  ref={announceGridRef}
                  rowData={announceData}
                  columnDefs={announceColumnDefs}
                  defaultColDef={notEditDefaultColDef}
                  onRowDoubleClicked={announceDoubleClick}
                  suppressCellFocus={true}
                  rowSelection="single"
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 공지사항이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
          <Col md="6">
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
                  defaultColDef={notEditDefaultColDef}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 문의 및 요청사항이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row style={{ flex: '1 1 auto' }}>
          <Col md="7">
            <CardTitle>
              <Row className="no-gutters pl-1 pr-1">
                <Col md="6">
                  <b className="text-muted" style={{ fontSize: '17px' }}>보건실 방문 요청 내역</b>
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
                  defaultColDef={notEditDefaultColDef}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">보건실 방문 요청 내역이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
          <Col md="5">
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
                  ref={communityGridRef}
                  rowData={communityData}
                  columnDefs={communityColumnDefs}
                  defaultColDef={notEditDefaultColDef}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">커뮤니티 알림 내역이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
        </Row>
        <Row style={{ flex: '1 1 auto' }}>
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
                  defaultColDef={notEditDefaultColDef}
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
                  defaultColDef={notEditDefaultColDef}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 일정이 없습니다</span>' } 
                />
              </div>
            </Card>
          </Col>
          <Col md="4" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
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
            <Card style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: '1 1 auto' }}>
                <ReactQuill
                  ref={quillRef}
                  style={{ height: "100%", flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}
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

        <Modal isOpen={announceWriteModal} toggle={toggleAnnounceWriteModal} centered style={{ minWidth: '32%' }}>
          <ModalHeader toggle={toggleAnnounceWriteModal}><b className="text-muted">공지사항 글쓰기</b></ModalHeader>
          <ModalBody className="pb-0">
            <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                <Col md="1" className="text-center">
                    <Label>제목</Label>
                </Col>
                <Col md="11" className="pr-4">
                    <Input 
                        id="communityTitle"
                        type="text"
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                    />
                </Col>
            </Row>
            <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                <Col md="1" className="text-center">
                    <Label>내용</Label>
                </Col>
                <Col md="11" className="pr-4">
                    <div style={{ height: '20.6vh' }}>
                        <ReactQuill
                            ref={announceQuillRef}
                            style={{ height: "14vh" }}
                            theme="snow"
                            modules={modules}
                            formats={formats}
                            value={announceContentData || ""}
                            onChange={handleAnnounceQuillChange}
                        />
                    </div>
                </Col>
            </Row>
            <Row className="d-flex align-items-center text-muted no-gutters pt-0 pr-4 pb-3" style={{ marginLeft: 2}}>
                <Col md="1" className="text-center">
                    <Label>파일</Label>
                </Col>
                <Col md="11" style={{ border: '1px solid lightgrey', borderRadius: 3 }}>
                    {uploadedFileUrl ? (
                        <div className='d-flex justify-content-center align-items-center text-muted pt-2'>
                            <a href={uploadedFileUrl} download>{uploadedFileName}</a>
                            <Button close onClick={handleFileDelete} />
                        </div>
                    ) : (
                        <div {...getRootProps({ className: 'dropzone' })} style={{ width: '100%', height: '5vh', paddingTop: '7px', textAlign: 'center' }}>
                            <input {...getInputProps()} />
                            {fileMessage}
                        </div>
                    )}
                </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="p-0">
              <Row style={{ width: '100%'}}>
                  <Col className="d-flex justify-content-start">
                      <Button onClick={resetAnnounceWrite}>초기화</Button>
                  </Col>
                  <Col className="d-flex justify-content-end">
                      <Button className="mr-1" color="secondary" onClick={saveAnnounceWrite}>저장</Button>
                      <Button color="secondary" onClick={toggleAnnounceWriteModal}>취소</Button>
                  </Col>
              </Row>
          </ModalFooter>
        </Modal>

        <Modal isOpen={announceDetailModal} toggle={toggleAnnounceDetailModal} centered style={{ minWidth: '32%' }}>
          <ModalHeader toggle={toggleAnnounceDetailModal}><b className="text-muted">공지사항 상세</b></ModalHeader>
          <ModalBody className="pb-0">
              <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                  <Col md="1" className="text-center">
                      <Label>제목</Label>
                  </Col>
                  <Col md="11" className="pr-4">
                      <Input 
                          id="communityTitle"
                          type="text"
                          defaultValue={announceSelectedRow ? announceSelectedRow.announceTitle : ""}
                          onChange={(e) => setAnnounceTitleDetailValue(e.target.value)}
                          readOnly={!isAdmin}
                      />
                  </Col>
              </Row>
              <Row className="d-flex align-items-center text-muted no-gutters pt-3">
                  <Col md="1" className="text-center">
                      <Label>내용</Label>
                  </Col>
                  <Col md="11" className="pr-4">
                      {isAdmin ? (
                          <div style={{ height: '20.6vh' }}>
                              <ReactQuill
                                  ref={announceQuillRef}
                                  style={{ height: "14vh" }}
                                  theme="snow"
                                  modules={modules}
                                  formats={formats}
                                  defaultValue={announceDetailContentData || ""}
                                  onChange={handleAnnounceDetailQuillChange}
                              />
                          </div>
                      ) : (
                          <div style={{ height: '26vh'}}>
                              <ReactQuill
                                  ref={announceQuillRef}
                                  style={{ height: "24.5vh" }}
                                  theme="snow"
                                  modules={{ toolbar: false }}
                                  readOnly={true}
                                  value={announceDetailContentData || ""}
                              />
                          </div>
                      )}
                  </Col>
              </Row>
              <Row className="d-flex align-items-center text-muted no-gutters pt-0 pr-4 pb-3" style={{ marginLeft: 2 }}>
                  <Col md="1" className="text-center">
                      <Label>파일</Label>
                  </Col>
                  <Col className="p-2" md="11" style={{ border: '1px solid lightgrey', borderRadius: 3 }}>
                      {isAdmin ? (
                          <div {...getRootProps({className: 'dropzone'})} style={{ width: '100%', height: '5vh', paddingTop: '7px', textAlign: 'center' }}>
                              <input {...getInputProps()}/>
                              {fileMessage}
                          </div>
                      ) : (
                          announceSelectedRow && announceSelectedRow.fileUrl ? (
                              <b><a href={announceSelectedRow.fileUrl} download>{announceSelectedRow.fileName}</a></b>
                          ) : (
                              <div className="text-muted">파일 없음</div>
                          )
                      )}
                  </Col>
              </Row>
          </ModalBody>
          <ModalFooter className="p-0">
              <Row style={{ width: '100%'}}>
                  {isAdmin ? (
                      <Col className="d-flex justify-content-end">
                          <Button onClick={updateAnnounce}>수정</Button>
                          <Button className="ml-1" onClick={deleteAnnounce}>삭제</Button>
                          <Button className="ml-1" onClick={toggleAnnounceDetailModal}>취소</Button>
                      </Col>
                  ) : (
                      <Col className="d-flex justify-content-end">
                          <Button onClick={toggleAnnounceDetailModal}>취소</Button>
                      </Col>
                  )}
              </Row>
          </ModalFooter>
        </Modal>

      </div>
    </>
  );
}

export default Dashboard;
