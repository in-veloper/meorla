import React, { useState } from "react";
import { FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Button, Row, Col } from "reactstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../assets/css/mycalendar.css";

const MyCalendar = () => {

    const [showRegistScheduleModal, setRegistScheduleModal] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [eventStart, setEventStart] = useState("");
    const [eventEnd, setEventEnd] = useState("");

    const toggleModal = () => {
        setRegistScheduleModal(!showRegistScheduleModal);
    }

    const handleDateClick = (e) => {
        setRegistScheduleModal(true);
        setEventStart(e.dateStr);
    };

    const handleAddEvent = () => {
        // const newEvent = {
        //     title: eventTitle,
        //     start: eventStart,
        //     end: eventEnd
        // };

        setRegistScheduleModal(false);
        setEventTitle("");
        setEventStart("");
        setEventEnd("");
    }

    return (
        <div className="mt-5">
            <FullCalendar
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
                events={[   // 임의 값 (calendar에 이벤트 설정할 때 아래와 같은 방식으로 세팅)
                    { title: '이벤트 1', date: '2023-11-04' },
                    { title: '이벤트 2', date: '2023-11-05' }
                    // {title : '공부하기', start:'2023-02-13', end:'2023-02-14', color:'#b1aee5'} -> 이런 형식으로 넣을 수 있음
                ]}
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
                    toggle={toggleModal}
                    centered={true}
                    autoFocus={false}   // Modal Tag에서 autoFocus를 false로 설정 -> Focus하고 싶은 Input Tag에서 autoFocus를 True로 설정해야 적용
                    // className=""
                    // keyboard={}
                >
                    <ModalHeader className="text-muted" toggle={toggleModal} closebutton="true">보건일정 등록</ModalHeader>
                    <ModalBody>
                        <FormGroup>
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
                                        autoFocus={true}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3 align-items-center">
                                <Col className="text-center" md="3">
                                    <Label for="eventStart">시작날짜</Label>
                                </Col>
                                <Col md="9">
                                    <Input
                                        id="eventStart"
                                        name="eventStart"
                                        type="date"
                                        placeholder="시작 날짜"
                                        defaultValue={eventStart}
                                        onChange={(e) => setEventStart(e.target.value)}
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
                                        id="eventEnd"
                                        name="eventEnd"
                                        type="date"
                                        placeholder="종료 날짜"
                                        value={eventEnd}
                                        onChange={(e) => setEventEnd(e.target.value)}
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button className="btn-simple mr-1" onClick={handleAddEvent}>이벤트 추가</Button>
                        <Button className="btn-simple" onClick={toggleModal}>취소</Button>
                        {/* <Button className="btn-neutral" onClick={handleAddEvent}>이벤트 추가</Button>
                        <Button className="btn-neutral" onClick={toggleModal}>취소</Button> */}
                    </ModalFooter>
                </Modal>
            )}
        </div>
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