import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Button, Row, Col, Form } from "reactstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { TwitterPicker } from "react-color";
import EmojiPicker from "emoji-picker-react";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import axios from "axios";
import { useUser } from "contexts/UserContext";
import "../assets/css/mycalendar.css";

const BASE_PORT = process.env.REACT_APP_BASE_PORT;
const BASE_URL = process.env.REACT_APP_BASE_URL;

const WorkCalendar = forwardRef((props, ref) => {
    const { user } = useUser(); 
    const [showRegistScheduleModal, setRegistScheduleModal] = useState(false);
    const [showUpdateScheduleModal, setUpdateScheduleModal] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [eventStartDate, setEventStartDate] = useState("");
    const [eventEndDate, setEventEndDate] = useState("");
    const [registeredEventId, setRegisteredEventId] = useState("");
    const [registeredEventTitle, setRegisteredEventTitle] = useState("");
    const [registeredEventColor, setRegisteredEventColor] = useState("");
    const [registeredEventStartDate, setRegisteredEventStartDate] = useState("");
    const [registeredEvendEndDate, setRegisteredEventEndDate] = useState("");
    const [isRegisteredEvent, setIsRegisteredEvent] = useState(false);
    const [originalEventData, setOriginalEventData] = useState(null);
    const [eventData, setEventData] = useState(null);
    const [isUpdatedEvent, setIsUpdatedEvent] = useState(false);
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const [selectedEventColor, setSelectedEventColor] = useState("#FF6900");
    const [displayEmojiPicker, setDisplayEmojiPicker] = useState(false);

    const calendarRef = useRef(null);

    // 행사 등록 form modal handler
    const toggleRegistModal = () => {
        if(displayColorPicker) setDisplayColorPicker(!displayColorPicker);
        if(displayEmojiPicker) setDisplayEmojiPicker(!displayEmojiPicker);
        setRegistScheduleModal(!showRegistScheduleModal);
        resetRegistEventForm();
    };

    const toggleUpdateModal = () => {
        if(displayColorPicker) setDisplayColorPicker(!displayColorPicker);
        if(displayEmojiPicker) setDisplayEmojiPicker(!displayEmojiPicker);
        setUpdateScheduleModal(!showUpdateScheduleModal);
    };

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
        if(displayColorPicker) setDisplayColorPicker(!displayColorPicker);
        if(displayEmojiPicker) setDisplayEmojiPicker(!displayEmojiPicker);

        const confirmTitle = "보건일정 등록";
        const confirmMessage = "작성하신 일정을 등록하시겠습니까?";
        const infoMessage = "보건일정이 정상적으로 등록되었습니다.";
        
        const yesCallback = async () => {
            const response = await axios.post(`http://${BASE_URL}:${BASE_PORT}/workSchedule/insert`, {
                userId: user.userId,
                schoolCode: user.schoolCode,
                eventTitle: eventTitle,
                eventColor: selectedEventColor,
                eventStartDate: eventStartDate,
                eventEndDate: eventEndDate
            });

            if(response.data === 'success') {
                NotiflixInfo(infoMessage);

                setIsRegisteredEvent(true);
                resetRegistEventForm();
            }
        }; 

        const noCallback = () => {
            return;
        };

        NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
    };

    // 등록된 행사일정 획득 function
    const fetchEventData = useCallback(async () => {
        if(user) {
            const response = await axios.get(`http://${BASE_URL}:${BASE_PORT}/workSchedule/getWorkSchedule`, {
                params: {
                    userId: user.userId,
                    schoolCode: user.schoolCode
                }
            });
    
            if(response.data) {
                const resultData = response.data.map(item => {
                    return ({
                        id: item.id,
                        title: item.eventTitle,
                        color: item.eventColor ? item.eventColor : '#FF6900',
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
        setIsRegisteredEvent(false);
        fetchEventData();
    }, [fetchEventData, isRegisteredEvent, isUpdatedEvent]);

    // 행사 종료일 그대로 출력 시 등록된 날짜보다 하루 차감되어 오표시 -> converting(+1일) 하여 정상 출력 처리 function
    const convertEndDate = (endDate) => {
        return new Date(new Date(endDate).getTime() + (24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    };

    const handleEventClick = (e) => {
        setUpdateScheduleModal(true);
        
        if(displayColorPicker) setDisplayColorPicker(!displayColorPicker);
        if(displayEmojiPicker) setDisplayEmojiPicker(!displayEmojiPicker);

        const eventId = e.event['id'];
        let eventTitle = "";
        let eventColor = "";
        let eventStartDate = "";
        let eventEndDate = "";

        if(originalEventData) {
            originalEventData.forEach(item => {
                if(item.id === parseInt(eventId)) {
                    eventTitle = item.eventTitle;
                    eventColor = item.eventColor ? item.eventColor : '#FF6900';
                    eventStartDate = item.eventStartDate;
                    eventEndDate = item.eventEndDate;
                }
            });
        }

        setRegisteredEventId(eventId);
        setRegisteredEventTitle(eventTitle);
        setRegisteredEventColor(eventColor);
        setRegisteredEventStartDate(eventStartDate);
        setRegisteredEventEndDate(eventEndDate);
    };

    const handleUpdateEvent = (e) => {
        e.preventDefault();

        const confirmTitle = "보건일정 수정";
        const confirmMessage = "작성하신 보건일정으로 수정하시겠습니까?";
        const infoMessage = "보건일정이 정상적으로 수정되었습니다.";

        const yesCallback = async () => {
            const response = await axios.post(`http://${BASE_URL}:${BASE_PORT}/workSchedule/update`, {
                userId: user.userId,
                schoolCode: user.schoolCode,
                eventId: registeredEventId,
                eventTitle: registeredEventTitle,
                eventColor: registeredEventColor,
                eventStartDate: registeredEventStartDate,
                eventEndDate: registeredEvendEndDate
            });

            if(response.data === 'success') {
                NotiflixInfo(infoMessage);
                setIsUpdatedEvent(true);
                resetUpdateEventForm();
            }
        };

        const noCallback = () => {
            return;
        };

        NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback);
    };

    const showColorPicker = (e) => {
        e.preventDefault();
        if(displayEmojiPicker) setDisplayEmojiPicker(!displayEmojiPicker);
        setDisplayColorPicker(!displayColorPicker);
    };

    const handleColorPickerChange = (color) => {
        setSelectedEventColor(color.hex);
        setDisplayColorPicker(!displayColorPicker);
    };

    const handleUpdateColorPickerChange = (color) => {
        setRegisteredEventColor(color.hex);
        setDisplayColorPicker(!displayColorPicker);
    };

    const showEmojiPicker = (e) => {
        e.preventDefault();
        if(displayColorPicker) setDisplayColorPicker(!displayColorPicker);
        setDisplayEmojiPicker(!displayEmojiPicker);
    };

    // Emoji 삽임 function
    const onEmojiClick = (emoji) => {
        const emojiValue = document.querySelector('#eventTitle').value += emoji.emoji;
        setEventTitle(emojiValue);
    };

    const onFocusOutside = () => {
        if(displayEmojiPicker) setDisplayEmojiPicker(!displayEmojiPicker);
        if(displayColorPicker) setDisplayColorPicker(!displayColorPicker);
    };

    const handleEventDrop = (eventInfo) => {
        const { event, oldEvent } = eventInfo;
        const oldEventStart = oldEvent.startStr;
        const oldEventEnd = oldEvent.endStr;
        const newEventStart = event.startStr;
        const newEventEnd = event.endStr;
        
        const confirmTitle = "보건일정 수정";
        const confirmMessage = "보건일정을<br/>" + oldEventStart + " ~ " + subtractOneDayFromDate(oldEventEnd) + "에서 " + newEventStart + " ~ " + subtractOneDayFromDate(newEventEnd) + "<br/>으로 수정하시겠습니까?";
        const infoMessage = "보건일정이 정상적으로 수정되었습니다.";
        
        const yesCallback = async () => {
            const response = await axios.post(`http://${BASE_URL}:${BASE_PORT}/workSchedule/reSchedule`, {
                userId: user.userId,
                schoolCode: user.schoolCode,
                eventId: oldEvent.id,
                eventStartDate: newEventStart,
                eventEndDate: subtractOneDayFromDate(newEventEnd)
            });

            if(response.data === 'success') {
                NotiflixInfo(infoMessage);
            }
        };

        const noCallback = () => {
            eventInfo.revert();
            return;
        };

        NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '450px');
    };

    const subtractOneDayFromDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() - 1);
        return date.toISOString().slice(0, 10);
    };

    const handleEventResize = (eventInfo) => {
        const { event, oldEvent } = eventInfo;
        const oldEventStart = oldEvent.startStr;
        const oldEventEnd = oldEvent.endStr;
        const newEventStart = event.startStr;
        const newEventEnd = event.endStr;
        const confirmTitle = "보건일정 수정";
        const confirmMessage = "보건일정을<br/>" + oldEventStart + " ~ " + subtractOneDayFromDate(oldEventEnd) + "에서 " + newEventStart + " ~ " + subtractOneDayFromDate(newEventEnd) + "<br/>으로 수정하시겠습니까?";
        const infoMessage = "보건일정이 정상적으로 수정되었습니다.";

        const yesCallback = async () => {
            const response = await axios.post(`http://${BASE_URL}:${BASE_PORT}/workSchedule/reSchedule`, {
                userId: user.userId,
                schoolCode: user.schoolCode,
                eventId: oldEvent.id,
                eventStartDate: newEventStart,
                eventEndDate: subtractOneDayFromDate(newEventEnd)
            });

            if(response.data === 'success') {
                NotiflixInfo(infoMessage);
            }
        };

        const noCallback = () => {
            eventInfo.revert();
            return;
        };

        NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '450px');
    };

    useImperativeHandle(ref, () => ({
        focusCalendar: (date) => {
            if(calendarRef && calendarRef.current) {
                calendarRef.current.getApi().gotoDate(date);
            }
        },

        focusToday: () => {
            if(calendarRef && calendarRef.current) {
                calendarRef.current.getApi().today();
            }
        }
    }));

    return (
        <>
            <div className="content">
                <div className="mt-4">
                    <FullCalendar
                        ref={calendarRef}
                        locale="kr"
                        height={'66.5vh'} // calendar 영역 크기
                        initialView={'dayGridMonth'}
                        headerToolbar={{
                            start: 'prev,next today', 
                            center: 'title',
                            end: 'dayGridMonth,timeGridWeek,timeGridDay' 
                        }}
                        titleFormat={{
                            year: 'numeric',
                            month: 'long'
                        }}
                        buttonText={{
                            today: "오늘날짜",
                            month: "월 단위",
                            week: "주 단위",
                            day: "일 단위"
                        }}
                        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                        events={eventData}
                        eventClick={handleEventClick}
                        editable={true}
                        eventResizableFromStart={true}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        defaultAllDay={true}
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
                        >
                            <ModalHeader className="text-muted" toggle={toggleRegistModal} closebutton="true">보건일정 등록</ModalHeader>
                            <ModalBody>
                                <FormGroup className="mr-3" onSubmit={handleAddEvent}>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventTitle">일정명</Label>
                                        </Col>
                                        <Col md="7">
                                            <Input
                                                id="eventTitle"
                                                name="eventTitle"
                                                type="text"
                                                placeholder="일정명"
                                                value={eventTitle}
                                                onChange={(e) => setEventTitle(e.target.value)}
                                                onFocus={onFocusOutside}
                                            />
                                        </Col>
                                        <Col className="pl-1 mr-1 text-muted" md="1" style={{ marginLeft: '-10px' }}>
                                            <MdOutlineEmojiEmotions style={{ fontSize: 25 }} onClick={showEmojiPicker}/>
                                            {displayEmojiPicker ? 
                                                <div style={{ position: 'absolute', zIndex: 999 }}>
                                                    <EmojiPicker
                                                        searchPlaceHolder="이모지 검색"
                                                        width={300}
                                                        height={400}
                                                        onEmojiClick={onEmojiClick}
                                                    />
                                                </div> : null
                                            }
                                        </Col>
                                        <Col className="p-0" md="1">
                                            <div style={{ backgroundColor: selectedEventColor, width: '25px', height: '25px', borderRadius: '10px', marginLeft: '-3px', cursor: 'pointer' }} onClick={showColorPicker}></div>
                                            {displayColorPicker ?
                                                <div style={{ position: 'absolute', zIndex: 999, marginLeft: '-11px', marginTop: '10px' }}>
                                                    <TwitterPicker
                                                        color={selectedEventColor}
                                                        width="210px"
                                                        onChange={handleColorPickerChange}
                                                    />
                                                </div> : null
                                            }
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
                                                onFocus={onFocusOutside}
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
                                                onFocus={onFocusOutside}
                                            />
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button className="mr-1" color="secondary" onClick={handleAddEvent}>등록</Button>
                                <Button color="secondary" onClick={toggleRegistModal}>취소</Button>
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
                        >
                            <ModalHeader className="text-muted" toggle={toggleUpdateModal} closebutton="true">보건일정 수정</ModalHeader>
                            <ModalBody>
                                <FormGroup className="mr-3" onSubmit={handleAddEvent}>
                                    <Row className="mb-3 align-items-center">
                                        <Col className="text-center" md="3">
                                            <Label for="eventTitle">일정명</Label>
                                        </Col>
                                        <Col md="7">
                                            <Input
                                                id="eventTitle"
                                                name="eventTitle"
                                                type="text"
                                                placeholder="일정명"
                                                value={registeredEventTitle}
                                                onChange={(e) => setRegisteredEventTitle(e.target.value)}
                                            />
                                        </Col>
                                        <Col className="pl-1 mr-1 text-muted" md="1" style={{ marginLeft: '-10px' }}>
                                            <MdOutlineEmojiEmotions style={{ fontSize: 25 }} onClick={showEmojiPicker}/>
                                            {displayEmojiPicker ? 
                                                <div style={{ position: 'absolute', zIndex: 999 }}>
                                                    <EmojiPicker
                                                        searchPlaceHolder="이모지 검색"
                                                        width={300}
                                                        height={400}
                                                        onEmojiClick={onEmojiClick}
                                                    />
                                                </div> : null
                                            }
                                        </Col>
                                        <Col className="p-0" md="1">
                                            <div style={{ backgroundColor: registeredEventColor, width: '25px', height: '25px', borderRadius: '10px', marginLeft: '-3px', cursor: 'pointer' }} onClick={showColorPicker}></div>
                                            {displayColorPicker ?
                                                <div style={{ position: 'absolute', zIndex: 999, marginLeft: '-11px', marginTop: '10px' }}>
                                                    <TwitterPicker
                                                        color={registeredEventColor}
                                                        width="210px"
                                                        onChange={handleUpdateColorPickerChange}
                                                    />
                                                </div> : null
                                            }
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
                                <Button className="mr-1" color="secondary" onClick={handleUpdateEvent}>수정</Button>
                                <Button color="secondary" onClick={toggleUpdateModal}>취소</Button>
                            </ModalFooter>
                        </Modal>
                    )}
                </div>
            </div>
        </>
    )
});

export default WorkCalendar;


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

/*
    시간 개념 추가
    시간 추가 이후 온종일, 반나절 등등 추가하여 종료시간 자동 입력되도록 처리
    emoji-picker-react 적용

*/ 

// 시작일자보다 종료일자가 앞서는 경우 예외 처리 필요

// 이벤트 