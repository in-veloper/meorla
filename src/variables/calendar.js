import React, { useState, useEffect, useCallback, useRef } from "react";
import { FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Button, Row, Col, Form } from "reactstrap";
import FullCalendar from "@fullcalendar/react";
import "../assets/css/mycalendar.css";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { TwitterPicker } from "react-color";
import Notiflix from "notiflix";
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import axios from "axios";
import { useUser } from "contexts/UserContext";

const MyCalendar = () => {
    const { user } = useUser();   
    const [showRegistScheduleModal, setRegistScheduleModal] = useState(false);
    const [showUpdateScheduleModal, setUpdateScheduleModal] = useState(false);
    const [eventCategory, setEventCategory] = useState("보건행사");
    const [eventTitle, setEventTitle] = useState("");
    const [eventStartDate, setEventStartDate] = useState("");
    const [eventEndDate, setEventEndDate] = useState("");
    const [registeredEventId, setRegisteredEventId] = useState("");
    const [registeredEventCategory, setRegisteredEventCategory] = useState("");
    const [registeredEventTitle, setRegisteredEventTitle] = useState("");
    const [registeredEventStartDate, setRegisteredEventStartDate] = useState("");
    const [registeredEvendEndDate, setRegisteredEventEndDate] = useState("");
    const [isRegisteredEvent, setIsRegisteredEvent] = useState(false);
    const [originalEventData, setOriginalEventData] = useState(null);
    const [eventData, setEventData] = useState(null);
    const [isUpdatedEvent, setIsUpdatedEvent] = useState(false);
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const [selectedCategoryColor, setSelectedCategoryColor] = useState("#FF6900");
    const [categorySettingModal, setCategorySettingModal] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);
    const [setModifiedData] = useState([]);
    const [categoryRowData, setCategoryRowData] = useState([]);
    const [filteredCategory, setFilteredCategory] = useState(categoryRowData);

    const categorySettingGridRef = useRef();

    const onGridReady = useCallback((params) => {}, []);

    // 기본 컬럼 속성 정의 (공통 부분)
    const defaultColDef = {
        sortable: true,
        resizable: true,
        filter: true,
        editable: true
    };

    const [categoryColumnDefs] = useState([
        { field: "eventCategory", headerName: "행사분류", flex: 1, cellStyle: { textAlign: "center" }}
    ]);

    const createNewCategoryRowData = () => {
        const newData = {
            eventCategory: "",
            editable: true
        };
        return newData;
    };

    const appendCategoryRow = useCallback(() => {
        const api = categorySettingGridRef.current.api;
        const displayedRowCount = api.getDisplayedRowCount();
        const newItem = [createNewCategoryRowData()];

        api.deselectAll();
        api.applyTransaction({ add: newItem, addIndex: displayedRowCount });
        setIsRemoved(false);
        setIsRegistered(false);
    }, []);

    const onCategoryRowDataUpdated = useCallback(() => {
        const api = categorySettingGridRef.current.api;
        const displayedRowCount = api.getDisplayedRowCount();
        const lastRowIndex = displayedRowCount - 1;

        if(isRemoved || isRegistered) {
            api.stopEditing(true);
            return;
        }

        if(lastRowIndex > -1) api.startEditingCell({ rowIndex: lastRowIndex, colKey: 'eventCategory' });
    }, [isRemoved, isRegistered]);

    const removeCategoryRow = () => {
        const api = categorySettingGridRef.current.api;
        const selectedRow = api.getSelectedRows();

        if(selectedRow.length === 0) {
            Notiflix.Notify.warning('선택된 행이 없습니다.<br/>삭제할 행을 선택해 주세요.', {
                position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
              
            return;
        }

        api.applyTransaction({ remove: selectedRow });
        setIsRemoved(true);
    };

    const allCategoryRemoveRow = () => {
        const api = categorySettingGridRef.current.api;
        const displayedRowCount = api.getDisplayedRowCount();

        if(displayedRowCount === 0) {
            Notiflix.Notify.warning('등록된 행사분류가 없습니다.', {
                position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
    
            return;
        }else{
            api.setRowData([]);
        }
    };

    const onCellValueChanged = (e) => {
        const updatedRowData = e.api.getRowNode(e.rowIndex).data;
        // setModifiedData((prevData) => [...prevData, updatedRowData]);
    }

    // 행사 등록 form modal handler
    const toggleRegistModal = () => {
        setRegistScheduleModal(!showRegistScheduleModal);
    };

    const toggleUpdateModal = () => {
        setUpdateScheduleModal(!showUpdateScheduleModal);
    };

    const toggleCategorySettingModal = () => setCategorySettingModal(!categorySettingModal);

    // 날짜 클릭 시 event
    const handleDateClick = (e) => {
        setRegistScheduleModal(true);
        setEventStartDate(e.dateStr);
    };

    // 행사 등록 form 초기화 function
    const resetRegistEventForm = () => {
        setRegistScheduleModal(false);
        setEventTitle("");
        setEventStartDate("");
        setEventEndDate("");
    };

    // 행사 등록 form 초기화 function
    const resetUpdateEventForm = () => {
        setUpdateScheduleModal(false);
        setRegisteredEventTitle("");
        setRegisteredEventStartDate("");
        setRegisteredEventEndDate("");
    };

    // 행사 등록 event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        Notiflix.Confirm.show(                                                                  // Confirm 창 Show
        '보건일정 등록',                                                                   // Confirm 창 Title
        '작성하신 일정을 등록하시겠습니까?',   // Confirm 창 내용
        '예',                                                                                 // Confirm 창 버튼
        '아니요',                                                                              // Confirm 창 버튼
        async () => {                                                                        // Confirm 창에서 '예' 선택한 경우
          e.preventDefault();                                                                // 기본 Event 방지

          const response = await axios.post("http://localhost:8000/workSchedule/insert", {
            userId: user.userId,
            schoolCode: user.schoolCode,
            eventCategory: eventCategory,
            eventTitle: eventTitle,
            eventStartDate: eventStartDate,
            eventEndDate: eventEndDate
        });

        if(response.data === 'success') {
            Notiflix.Notify.info('보건일정이 정상적으로 등록되었습니다.', {
                position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
            setIsRegisteredEvent(true);
            resetRegistEventForm();
        }
        },() => {                                                         // Confirm 창에서 '아니요' 선택한 경우
          return;                                                         // return
        },{                                                               // Confirm 창 Option 설정
          position: 'center-center', showOnlyTheLastOne: true, plainText: false
        }
      );
    };

    // 등록된 행사일정 획득 function
    const fetchEventData = useCallback(async () => {
        if(user) {
            const response = await axios.get("http://localhost:8000/workSchedule/getWorkSchedule", {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });
    
            if(response.data) {
                const resultData = response.data.map(item => {
                    return ({
                        id: item.id,
                        title: "[" + item.eventCategory + "] " + item.eventTitle,
                        start: item.eventStartDate,
                        end: convertEndDate(item.eventEndDate)
                    });
                });
                setOriginalEventData(response.data);
                setEventData(resultData);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchEventData();
    }, [fetchEventData, isRegisteredEvent, isUpdatedEvent]);

    // 행사 종료일 그대로 출력 시 등록된 날짜보다 하루 차감되어 오표시 -> converting(+1일) 하여 정상 출력 처리 function
    const convertEndDate = (endDate) => {
        return new Date(new Date(endDate).getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    };

    const handleEventClick = (e) => {
        setUpdateScheduleModal(true);
        const eventId = e.event['id'];
        let eventCategory = "";
        let eventTitle = "";
        let eventStartDate = "";
        let eventEndDate = "";

        if(originalEventData) {
            originalEventData.forEach(item => {
                if(item.id === parseInt(eventId)) {
                    eventCategory = item.eventCategory;
                    eventTitle = item.eventTitle;
                    eventStartDate = item.eventStartDate;
                    eventEndDate = item.eventEndDate;
                }
            });
        }

        setRegisteredEventId(eventId);
        setRegisteredEventCategory(eventCategory);
        setRegisteredEventTitle(eventTitle);
        setRegisteredEventStartDate(eventStartDate);
        setRegisteredEventEndDate(eventEndDate);
    };

    const handleUpdateEvent = (e) => {
        e.preventDefault();

        Notiflix.Confirm.show(                                                                  // Confirm 창 Show
        '보건일정 수정',                                                                   // Confirm 창 Title
        '작성하신 일정을 수정하시겠습니까?',   // Confirm 창 내용
        '예',                                                                                 // Confirm 창 버튼
        '아니요',                                                                              // Confirm 창 버튼
        async () => {                                                                        // Confirm 창에서 '예' 선택한 경우
          e.preventDefault();                                                                // 기본 Event 방지

          const response = await axios.post("http://localhost:8000/workSchedule/update", {
            userId: user.userId,
            schoolCode: user.schoolCode,
            eventId: registeredEventId,
            eventCategory: registeredEventCategory,
            eventTitle: registeredEventTitle,
            eventStartDate: registeredEventStartDate,
            eventEndDate: registeredEvendEndDate
        });

        if(response.data === 'success') {
            Notiflix.Notify.info('보건일정이 정상적으로 수정되었습니다.', {
                position: 'center-center', showOnlyTheLastOne: true, plainText: false
            });
            setIsUpdatedEvent(true);
            resetUpdateEventForm();
        }
        },() => {                                                         // Confirm 창에서 '아니요' 선택한 경우
          return;                                                         // return
        },{                                                               // Confirm 창 Option 설정
          position: 'center-center', showOnlyTheLastOne: true, plainText: false
        }
      );
    };

    const showColorPicker = () => {
        setDisplayColorPicker(!displayColorPicker);
    };

    const handleColorPickerChange = (color) => {
        setSelectedCategoryColor(color.hex);
        setDisplayColorPicker(!displayColorPicker);
    };

    const handleCategorySetting = () => {
        toggleCategorySettingModal();
        fetchCategoryData();
    };

    const categoryOptions = () => {
        // let optionData = null;
        // categoryRowData.forEach(item => {
        //     optionData = (
        //         <option>{item.eventCategory}</option>
        //     )
        // });
        // return optionData;
        const optionsData = categoryRowData.map((item, index) => (
            <option key={index}>{item.eventCategory}</option>
        ));

        return optionsData;
    };

    const fetchCategoryData = useCallback(async () => {
        try {
            if(user) {
                const response = await axios.get('http://localhost:8000/eventSetting/getCategory', {
                    params: {
                        userId: user.userId,
                        schoolCode: user.schoolCode
                    }
                });
                
                if(response.data) {
                    const categoryString = response.data.eventSetting.eventCategory;
                    const categoryArray = categoryString.split('::').map(item => {
                        return { eventCategory: item };
                    });

                    setCategoryRowData(categoryArray);
                    setFilteredCategory(categoryArray);
                    setIsRegistered(true);
                } 
            }
        }catch (error) {
            console.log("행사분류 조회 중 ERROR", error);
        }
    }, [user]);

    useEffect(() => {
        fetchCategoryData();
    }, [fetchCategoryData]);

    const saveCategorySetting = async (e) => {
        try {
            Notiflix.Confirm.show(                                           // Confirm 창 Show
                '행사분류 설정',                                                     // Confirm 창 Title
                '작성하신 행사분류를 저장하시겠습니까?',                                   // Confirm 창 내용
                '예',                                                          // Confirm 창 버튼
                '아니요',                                                       // Confirm 창 버튼
                async () => {                                                 // Confirm 창에서 '예' 선택한 경우
                    e.preventDefault();                                     // 기본 Event 방지
                    const api = categorySettingGridRef.current.api;                      // Grid api 획득
                    let categoryString = "";                                      // Parameter 전송 위한 증상 담을 배열
        
                    api.forEachNode(function(rowNode, index) {                  // 현재 Grid 행 순회
                        const category = rowNode.data.eventCategory;                     // 증상 획득
                        if(category.length !== 0 && user) categoryString += category + "::";
                    });
                    categoryString = categoryString.slice(0, -2);
                
                    let response = null;            
                    if(categoryRowData.length > 0) {
                        response = await axios.post('http://localhost:8000/eventSetting/update', {
                            userId: user.userId,
                            schoolCode: user.schoolCode,
                            category: categoryString
                        });
                    }else{                            // 등록된 증상이 없는 경우 - Insert
                        response = await axios.post('http://localhost:8000/eventSetting/insert', {
                            userId: user.userId,
                            schoolCode: user.schoolCode,
                            category: categoryString
                        });
                    }
                
                    if(response.data === "success") {   // Api 호출 성공한 경우
                        fetchCategoryData();              // Dropdown에도 공통 적용되기 위해 북마크 데이터 재조회

                        Notiflix.Notify.info('행사분류 설정이 정상적으로 저장되었습니다.', {
                            position: 'center-center', showOnlyTheLastOne: true, plainText: false
                        });
                    }
                },() => {                                                         // Confirm 창에서 '아니요' 선택한 경우
                    return;                                                         // return
                },{                                                               // Confirm 창 Option 설정
                    position: 'center-center', showOnlyTheLastOne: true, plainText: false
                }
            )
        } catch(error) {
            console.error('행사분류 저장 중 ERROR', error);
        }
    };

    return (
        <>
            <div className="content">
                <Row className="no-gutters">
                    <Button onClick={handleCategorySetting}>행사분류 설정</Button>
                </Row>
                <div className="mt-5">
                    <FullCalendar
                        locale="kr"
                        // defaultView="dayGridMonth"
                        height={'70vh'} // calendar 영역 크기
                        initialView={'dayGridMonth'}
                        headerToolbar={{
                            // start: 'prevYear,prev,next,nextYear today',
                            start: 'prev,next today', 
                            center: 'title',
                            end: 'dayGridMonth,timeGridWeek,timeGridDay' 
                        }}
                        titleFormat={{
                            year: 'numeric',
                            month: 'numeric'
                        }}
                        // footerToolbar={{
                        //     left: "prev",
                        //     center: "",
                        //     right: "next"
                        // }}
                        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                        events={eventData}
                        eventClick={handleEventClick}
                        // events={[   // 임의 값 (calendar에 이벤트 설정할 때 아래와 같은 방식으로 세팅)
                        //     { title: '이벤트 1', date: '2023-11-04' },
                        //     { title: '이벤트 2', date: '2023-11-05' }
                        //     // {title : '공부하기', start:'2023-02-13', end:'2023-02-14', color:'#b1aee5'} -> 이런 형식으로 넣을 수 있음
                        // ]}
                        // editable="true" -> false로 설정시 draggable 동작 X
                        // eventBackgroundColor=""
                        // eventBorderColor=""
                        // eventColor="black" -> 이벤트 등록되었을 때 표시되는 배경 색상
                        // eventTextColor="black" -> 이벤트 등록되었을 때 표시되는 font 색상
                        dateClick={handleDateClick}
                    />
                    {showRegistScheduleModal && (
                        <Modal
                            isOpen={showRegistScheduleModal}
                            backdrop={true}
                            toggle={toggleRegistModal}
                            centered={true}
                            autoFocus={false}   // Modal Tag에서 autoFocus를 false로 설정 -> Focus하고 싶은 Input Tag에서 autoFocus를 True로 설정해야 적용
                            // className=""
                            // keyboard={}
                        >
                            <ModalHeader className="text-muted" toggle={toggleRegistModal} closebutton="true">보건일정 등록</ModalHeader>
                            <ModalBody>
                                <FormGroup className="mr-3" onSubmit={handleAddEvent}>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventTitle">일정분류</Label>
                                        </Col>
                                        <Col md="8">
                                            <Input
                                                id="eventCategory"
                                                name="eventCategory"
                                                type="select"
                                                value={eventCategory}
                                                onChange={(e) => setEventCategory(e.target.value)}
                                                autoFocus={true}
                                            >
                                                {categoryOptions()}
                                                {/* <option>보건행사</option>
                                                <option>학교행사</option>
                                                <option>교육/연수</option>
                                                <option>세미나</option>
                                                <option>회의</option> */}
                                            </Input>
                                        </Col>
                                        <Col className="p-0" md="1">
                                            <div style={{ backgroundColor: selectedCategoryColor, width: '25px', height: '25px', borderRadius: '10px', marginLeft: '-3px', cursor: 'pointer' }} onClick={showColorPicker}></div>
                                            {displayColorPicker ?
                                                <div style={{ position: 'absolute', zIndex: 999, marginLeft: '-11px', marginTop: '10px' }}>
                                                    <TwitterPicker
                                                        color={selectedCategoryColor}
                                                        width="210px"
                                                        onChange={handleColorPickerChange}
                                                    />
                                                </div> : null
                                            }
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventTitle">일정명</Label>
                                        </Col>
                                        <Col md="9">
                                            <Input
                                                id="eventTitle"
                                                name="eventTitle"
                                                type="text"
                                                placeholder="일정명"
                                                value={eventTitle}
                                                onChange={(e) => setEventTitle(e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventStart">시작날짜</Label>
                                        </Col>
                                        <Col md="9">
                                            <Input
                                                id="eventStartDate"
                                                name="eventStartDate"
                                                type="date"
                                                placeholder="시작 날짜"
                                                defaultValue={eventStartDate}
                                                onChange={(e) => setEventStartDate(e.target.value)}
                                                // value={eventStart}
                                                // readOnly
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventEnd">종료날짜</Label>
                                        </Col>
                                        <Col md="9">
                                            <Input
                                                id="eventEndDate"
                                                name="eventEndDate"
                                                type="date"
                                                placeholder="종료 날짜"
                                                value={eventEndDate}
                                                onChange={(e) => setEventEndDate(e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="mr-1" color="secondary" onClick={handleAddEvent}>이벤트 추가</Button>
                                <Button color="secondary" onClick={toggleRegistModal}>취소</Button>
                                {/* <Button className="btn-neutral" onClick={handleAddEvent}>이벤트 추가</Button>
                                <Button className="btn-neutral" onClick={toggleModal}>취소</Button> */}
                            </ModalFooter>
                        </Modal>
                    )}

                    {showUpdateScheduleModal && (
                        <Modal
                            isOpen={showUpdateScheduleModal}
                            backdrop={true}
                            toggle={toggleUpdateModal}
                            centered={true}
                            autoFocus={false}   // Modal Tag에서 autoFocus를 false로 설정 -> Focus하고 싶은 Input Tag에서 autoFocus를 True로 설정해야 적용
                            // className=""
                            // keyboard={}
                        >
                            <ModalHeader className="text-muted" toggle={toggleUpdateModal} closebutton="true">보건일정 수정</ModalHeader>
                            <ModalBody>
                                <FormGroup className="mr-3" onSubmit={handleAddEvent}>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventTitle">일정분류</Label>
                                        </Col>
                                        <Col md="9">
                                            <Input
                                                id="eventCategory"
                                                name="eventCategory"
                                                type="select"
                                                value={registeredEventCategory}
                                                onChange={(e) => setRegisteredEventCategory(e.target.value)}
                                                autoFocus={true}
                                            >
                                                <option>보건행사</option>
                                                <option>학교행사</option>
                                                <option>교육/연수</option>
                                                <option>세미나</option>
                                                <option>회의</option>
                                            </Input>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventTitle">일정명</Label>
                                        </Col>
                                        <Col md="9">
                                            <Input
                                                id="eventTitle"
                                                name="eventTitle"
                                                type="text"
                                                placeholder="일정명"
                                                value={registeredEventTitle}
                                                onChange={(e) => setRegisteredEventTitle(e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventStart">시작날짜</Label>
                                        </Col>
                                        <Col md="9">
                                            <Input
                                                id="eventStartDate"
                                                name="eventStartDate"
                                                type="date"
                                                placeholder="시작 날짜"
                                                defaultValue={registeredEventStartDate}
                                                onChange={(e) => setRegisteredEventStartDate(e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventEnd">종료날짜</Label>
                                        </Col>
                                        <Col md="9">
                                            <Input
                                                id="eventEndDate"
                                                name="eventEndDate"
                                                type="date"
                                                placeholder="종료 날짜"
                                                value={registeredEvendEndDate}
                                                onChange={(e) => setRegisteredEventEndDate(e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="mr-1" color="secondary" onClick={handleUpdateEvent}>이벤트 수정</Button>
                                <Button color="secondary" onClick={toggleUpdateModal}>취소</Button>
                            </ModalFooter>
                        </Modal>
                    )}
                </div>
            </div>

            <Modal isOpen={categorySettingModal} toggle={toggleCategorySettingModal} centered style={{ minWidth: '20%' }}>
                <ModalHeader toggle={toggleCategorySettingModal}><b className="text-muted">행사분류 설정</b></ModalHeader>
                <ModalBody className="pb-0">
                    <Form onSubmit={saveCategorySetting}>
                        <div className="ag-theme-alpine" style={{ height: '20.5vh' }}>
                            <AgGridReact
                                ref={categorySettingGridRef}
                                rowData={filteredCategory}
                                columnDefs={categoryColumnDefs}
                                stopEditingWhenCellsLoseFocus={true}
                                // singleClickEdit={true}
                                paginationPageSize={5} // 페이지 크기를 원하는 값으로 설정
                                defaultColDef={defaultColDef}
                                overlayNoRowsTemplate={ '<span>등록된 처치사항이 없습니다.</span>' }  // 표시할 데이터가 없을 시 출력 문구
                                overlayLoadingTemplate={
                                    '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>'
                                }
                                onGridReady={onGridReady}
                                rowSelection={'multiple'} // [필요 : Panel로 Ctrl키를 누른채로 클릭하면 여러행 선택하여 삭제가 가능하다 표시]
                                enterNavigatesVertically={true}
                                enterNavigatesVerticallyAfterEdit={true}
                                onRowDataUpdated={onCategoryRowDataUpdated}
                                onCellValueChanged={onCellValueChanged}
                            />
                        </div>
                    </Form>
                    <Row>
                        <Col className="justify-content-left no-gutters">
                            <Button className="btn-plus" size="sm" onClick={appendCategoryRow}>
                            추가
                            </Button>
                            <Button className="btn-minus" size="sm" onClick={removeCategoryRow}>
                            삭제
                            </Button>
                        </Col>
                        <Col>
                            <Button className="btn-allMinus" size="sm" style={{float:'right'}} onClick={allCategoryRemoveRow}>전체 삭제</Button>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button className="mr-1" color="secondary" onClick={saveCategorySetting}>저장</Button>
                    <Button color="secondary" onClick={toggleCategorySettingModal}>취소</Button>
                </ModalFooter>
            </Modal>
        </>
    )
};

export default MyCalendar;


// Header Toolbar 설정 참고
/* 
    headerToolbar {
    title : text containing the current month/week/day 
    현재 월 / 일 / 년 의 텍스트
    prev : button for moving the calendar back one month/week/day
    이전 버튼
    next : button for moving the calendar forward one month/week/day
    다음 버튼
    prevYear : button for moving the calendar back on year
    이전 년도
    nextYear : button for moving the calendar forward one year
    다음 년도
    today : button for moving the calendar to the current month/week/day
    오늘로 이동
    }
    footerToolbar : headerToolbar와 동일한 옵션
*/

/*
    titleFormat={{ year: "numeric", month: "short", day: "numeric" }}


    buttonText={{
        // prev: "이전", // 부트스트랩 아이콘으로 변경 가능
        // next: "다음",
        // prevYear: "이전 년도",
        // nextYear: "다음 년도",
        today: "오늘",
        month: "월별",
        week: "주별",
        day: "일별",
        list: "리스트"
    }}
*/