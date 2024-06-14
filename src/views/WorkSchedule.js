import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col, Input, Button } from "reactstrap";
import WorkCalendar from "../variables/calendar";
import { AgGridReact } from 'ag-grid-react';
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useUser } from "contexts/UserContext";
import NotiflixConfirm from "components/Notiflix/NotiflixConfirm";
import NotiflixInfo from "components/Notiflix/NotiflixInfo";
import moment from 'moment';
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const MENU_ID_LEFT_GRID = 'schedule_delete_today_context_menu';
const MENU_ID_RIGHT_GRID = 'schedule_delete_entire_context_menu';

function WorkSchedule() {
  const { user } = useUser();
  const [todayScheduleRowData, setTodayScheduleRowData] = useState([]);
  const [entireScheduleRowData, setEntireScheduleRowData] = useState([]);
  const [filteredScheduleRowData, setFilteredScheduleRowData] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchEventStartDate, setSearchEventStartDate] = useState("");
  const [searchEventEndDate, setSearchEventEndDate] = useState("");
  const [searchEventTitle, setSearchEventTitle] = useState("");
  const [selectedWorkSchedule, setSelectedWorkSchedule] = useState(null);
  const [isGridSelected, setIsGridSelected] = useState(false);

  const calendarRef = useRef(null);
  const todayGridRef = useRef(null);
  const entireGridRef = useRef(null);

  const { show: showLeftMenu } = useContextMenu({
    id: MENU_ID_LEFT_GRID,
  });

  const { show: showRightMenu } = useContextMenu({
    id: MENU_ID_RIGHT_GRID
  });


  const eventPeriodFormatter = (params) => {
    if(!params.data) return '';

    const eventStartDate = params.data.eventStartDate;
    const eventEndDate = params.data.eventEndDate;

    if(!eventEndDate) return eventStartDate;
    else return eventStartDate + " ~ " + eventEndDate;
  };

  const [gridColumnDefs] = useState([
    { field: 'eventPeriod', headerName: '기간', valueFormatter: eventPeriodFormatter, flex: 1, cellStyle: { textAlign: "center" } },
    { field: 'eventTitle', headerName: '일정명', flex: 1 }
  ]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  const fetchTodaySchedule = async () => {
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
  };

  const fetchEntireSchedule = async () => {
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
  };

  useEffect(() => {
    fetchTodaySchedule();
    fetchEntireSchedule();
  }, []);

  const handleSearchEventStartDate = (event) => {
    const searchEventStartDateValue = event.target.value;
    setSearchEventStartDate(searchEventStartDateValue);
  };

  const handleSearchEventEndDate = (event) => {
    const searchEventEndDateValue = event.target.value;
    setSearchEventEndDate(searchEventEndDateValue);
  };

  const handleSearchEventTitle = (event) => {
    const searchEventTitleValue = event.target.value;
    setSearchEventTitle(searchEventTitleValue);
  };

  const generateColorPickerCategory = () => {
    let eventColorSet = new Set();
    let eventColorArray = [];
    if(entireScheduleRowData && entireScheduleRowData.length > 0) {
      entireScheduleRowData.forEach(item => {
        eventColorSet.add(item.eventColor);
      });

      eventColorArray = Array.from(eventColorSet);
    }
    return <ColorPicker colors={eventColorArray} selectedColor={selectedColor} handleColorPickerClick={handleColorPickerClick}/>
  };

  const ColorPicker = ({ colors, selectedColor, handleColorPickerClick }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'start', width: '83%' }}>
        {colors.map((color, index) => (
          <div
            key={index}
            style={{
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              margin: '5px',
              backgroundColor: color,
              border: selectedColor === color ? '2px solid black' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => handleColorPickerClick(color)}
          ></div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    generateColorPickerCategory();
  }, [entireScheduleRowData]);

  const handleColorPickerClick = (color) => {
    setSelectedColor(color);
  };

  const onTodayGridRowClicked = (event) => {
    const selectedRow = event.data;
    const selectedDate = selectedRow.eventStartDate;

    if(calendarRef.current && calendarRef.current.focusCalendar) {
      calendarRef.current.focusCalendar(selectedDate);
    }
  };

  const onEntireGridRowClicked = (event) => {
    const selectedRow = event.data;
    const selectedDate = selectedRow.eventStartDate;
    
    if(calendarRef.current && calendarRef.current.focusCalendar) {
      calendarRef.current.focusCalendar(selectedDate);
    }
  };

  const handleSearch = () => {
    if(selectedColor || searchEventTitle || (searchEventStartDate && searchEventEndDate)) {
      const searchFilteredRowData = entireScheduleRowData.filter(item => {
        let meetsAllConditions = true;

        if(selectedColor && item.eventColor !== selectedColor) {
          meetsAllConditions = false;
        }

        if(searchEventTitle && !item.eventTitle.includes(searchEventTitle)) {
          meetsAllConditions = false;
        }

        if(searchEventStartDate && searchEventEndDate) {
          const eventStartDate = new Date(item.eventStartDate);
          const eventEndDate = new Date(item.eventEndDate);
          const searchStartDate = new Date(searchEventStartDate);
          const searchEndDate = new Date(searchEventEndDate);

          if(!(eventStartDate >= searchStartDate && eventEndDate <= searchEndDate)) {
            meetsAllConditions = false;
          }else if(searchEventStartDate && !searchEventEndDate) {
            const eventStartDate = new Date(item.eventStartDate);
            const searchStartDate = new Date(searchEventStartDate);
            
            if(!(eventStartDate >= searchStartDate)) {
              meetsAllConditions = false;
            }
          }else if(!searchEventStartDate && searchEventEndDate) {
            const eventEndDate = new Date(item.eventEndDate);
            const searchEndDate = new Date(searchEventEndDate);

            if(!(eventEndDate <= searchEndDate)) {
              meetsAllConditions = false;
            }
          }
        }
        return meetsAllConditions;
      });

      setFilteredScheduleRowData(searchFilteredRowData);
    }
  };

  const handleSearchReset = () => {
    setFilteredScheduleRowData(entireScheduleRowData);
    setSelectedColor(null);
    setSearchEventTitle("");
    setSearchEventStartDate("");
    setSearchEventEndDate("");

    if(calendarRef.current && calendarRef.current.focusToday) {
      calendarRef.current.focusToday();
    }
  };

  function handleLeftGridContextMenu(event) {
    if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
      return;
    }else{
      const api = todayGridRef.current.api;
      const rowIndex = event.target.parentNode.getAttribute('row-index');

      if(rowIndex !== null) {
        api.ensureIndexVisible(rowIndex);
        api.forEachNode((node) => {
          if(node.rowIndex == rowIndex) node.setSelected(true, true);
        });

        const selectedRow = api.getSelectedRows()[0];
        if(selectedRow) setSelectedWorkSchedule(selectedRow);

        showLeftMenu({
          event,
          props: {
            key: 'value'
          }
        });
      }
    }
  };

  function handleRightGridContextMenu(event) {
    if(event.target.classList.value.includes("ag-header-cell-label") || event.target.classList.value.includes("ag-center-cols-viewport") || event.target.classList.value.includes("ag-header-cell") || event.target.classList.value.includes("ag-icon-menu") || event.target.classList.value.includes("ag-cell-label-container")) {
      return;
    }else{
      const api = entireGridRef.current.api;
      const rowIndex = event.target.parentNode.getAttribute('row-index');

      if(rowIndex !== null) {
        api.ensureIndexVisible(rowIndex);
        api.forEachNode((node) => {
          if(node.rowIndex == rowIndex) node.setSelected(true, true);
        });

        const selectedRow = api.getSelectedRows()[0];
        if(selectedRow) setSelectedWorkSchedule(selectedRow);

        showLeftMenu({
          event,
          props: {
            key: 'value'
          }
        });
      }
    }
  };

  const deleteWorkSchedule = () => {
    if(selectedWorkSchedule) {
      const confirmTitle = "보건일정 삭제";
      const confirmMessage = "선택하신 보건일정을 삭제하시겠습니까?";
      const infoMessage = "보건일정이 정상적으로 삭제되었습니다";

      const yesCallback = async () => {
        const response = await axios.post(`${BASE_URL}/api/workSchedule/deleteSchedule`, {
            userId: user.userId,
            schoolCode: user.schoolCode,
            eventId: selectedWorkSchedule.id
        });

        if(response.data === 'success') {
            NotiflixInfo(infoMessage);
            fetchTodaySchedule();
            fetchEntireSchedule();
            calendarRef.current.refreshEvents();
        }
      };

      const noCallback = () => {
          return;
      };

      NotiflixConfirm(confirmTitle, confirmMessage, yesCallback, noCallback, '330px');
    }
  };

  const refreshGrids = useCallback(() => {
    fetchTodaySchedule();
    fetchEntireSchedule();
  }, [user]);

  return (
    <>
      <div className="content" style={{ height: '84.1vh', display: 'flex', flexDirection: 'column' }}>
        <Row style={{ flex: '1 1 auto' }}>
          <Col md="4">
            <label className="text-left pl-2 w-100" style={{ fontSize: 16, fontWeight: 'bold'}}>오늘의 일정</label>
            <div className="today-work-schedule">
              <div className="ag-theme-alpine" style={{ height: '13vh' }} onContextMenu={handleLeftGridContextMenu}>
                <AgGridReact
                  headerHeight={40}
                  rowHeight={30}
                  ref={todayGridRef}
                  columnDefs={gridColumnDefs}
                  defaultColDef={defaultColDef}
                  rowData={todayScheduleRowData}
                  overlayNoRowsTemplate={ '<span style="color: #6c757d;">오늘 등록된 일정이 없습니다</span>' } 
                  rowSelection="single"
                  onRowClicked={onTodayGridRowClicked}
                />
              </div>
            </div>
            <div>
              <Menu id={MENU_ID_LEFT_GRID} animation="fade">
                <Item id="deleteWorkSchedule" onClick={deleteWorkSchedule}>보건일정 삭제</Item>
              </Menu>
              <Menu id={MENU_ID_RIGHT_GRID} animation="fade">
                <Item id="deleteWorkSchedule" onClick={deleteWorkSchedule}>보건일정 삭제</Item>
              </Menu>
            </div>
          </Col>
          <Col md="4">
            <label className="text-left pl-2 w-100" style={{ fontSize: 16, fontWeight: 'bold'}}>일정 목록</label>
            <div className="ag-theme-alpine" style={{ height: '13vh' }} onContextMenu={handleRightGridContextMenu}>
              <AgGridReact 
                headerHeight={40}
                rowHeight={30}
                ref={entireGridRef}
                columnDefs={gridColumnDefs}
                defaultColDef={defaultColDef}
                rowData={filteredScheduleRowData}
                overlayNoRowsTemplate={ '<span style="color: #6c757d;">등록된 일정이 없습니다</span>' } 
                rowSelection="single"
                onRowClicked={onEntireGridRowClicked}
              />
            </div>
          </Col>
          <Col md="4">
            <label className="text-left pl-2 w-100" style={{ fontSize: 16, fontWeight: 'bold'}}>상세 검색</label>
            <div style={{ border: '1px dashed lightgrey', height: '13vh', backgroundColor: '#FFFFFF', display: 'grid'}}>
              <Row className="no-gutters pl-3 pt-2 pb-2">
                <Col md="9">
                    <div className="d-flex flex-column justify-content-between pt-1 pb-1" style={{ height: '100%' }}>
                      <Row className="d-flex align-items-center no-gutters">
                        <label style={{ width: 50 }}>기간</label>
                        <Input
                          type="date"
                          style={{ width: '36.1%' }}
                          value={searchEventStartDate}
                          onChange={handleSearchEventStartDate}
                        />
                        <span className="text-center" style={{ width: '10%' }}>~</span>
                        <Input
                          type="date"
                          style={{ width: '36.1%' }}
                          value={searchEventEndDate}
                          onChange={handleSearchEventEndDate}
                        />
                      </Row>
                      <Row className="d-flex align-items-center no-gutters">
                        <label style={{ width: 50 }}>일정명</label>
                        <Input 
                          type="text"
                          style={{ width: '82.3%' }}
                          value={searchEventTitle}
                          onChange={handleSearchEventTitle}
                        />
                      </Row>
                      <Row className="d-flex align-items-center no-gutters">
                        <label style={{ width: 50 }}>범주</label>
                        {generateColorPickerCategory()}
                      </Row>
                    </div>
                </Col>
                <Col md="3">
                  <Row className="justify-content-center" style={{ marginTop: '-3px' }}>
                    <div className="" style={{ height: '100%' }}>
                      <Row style={{ height: '6vh' }}>
                        <Button className="mb-1" style={{ width: 80 }} onClick={handleSearch}>검색</Button>
                      </Row>
                      <Row style={{ height: '6vh' }}>
                        <Button className="mt-1" style={{ width: 80 }} onClick={handleSearchReset}>초기화</Button>
                      </Row>
                    </div>
                  </Row>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        <WorkCalendar ref={calendarRef} onEventUpdated={refreshGrids} />
      </div>
    </>
  );
}

export default WorkSchedule;
