import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Input, Button } from "reactstrap";
import WorkCalendar from "../variables/calendar";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useUser } from "contexts/UserContext";
import moment from 'moment';
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function WorkSchedule() {
  const { user } = useUser();
  const [todayScheduleRowData, setTodayScheduleRowData] = useState([]);
  const [entireScheduleRowData, setEntireScheduleRowData] = useState([]);
  const [filteredScheduleRowData, setFilteredScheduleRowData] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchEventStartDate, setSearchEventStartDate] = useState("");
  const [searchEventEndDate, setSearchEventEndDate] = useState("");
  const [searchEventTitle, setSearchEventTitle] = useState("");

  const calendarRef = useRef(null);
  const todayGridRef = useRef(null);
  const entireGridRef = useRef(null);

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
      const response = await axios.get(`http://${BASE_URL}/api/workSchedule/getTodaySchedule`, {
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
      const response = await axios.get(`http://${BASE_URL}/api/workSchedule/getEntireSchedule`, {
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
      <div style={{ display: 'flex', justifyContent: 'start', width: 300 }}>
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

  return (
    <>
      <div className="content" style={{ height: '84.8vh' }}>
        <Row>
          <Col md="4">
            <label className="text-muted text-left pl-2 w-100" style={{ fontSize: 16, fontWeight: 'bold'}}>오늘의 일정</label>
            <div className="ag-theme-alpine" style={{ height: '13vh' }}>
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
          </Col>
          <Col md="4">
            <label className="text-muted text-left pl-2 w-100" style={{ fontSize: 16, fontWeight: 'bold'}}>일정 목록</label>
            <div className="ag-theme-alpine" style={{ height: '13vh' }}>
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
            <label className="text-muted text-left pl-2 w-100" style={{ fontSize: 16, fontWeight: 'bold'}}>상세 검색</label>
            <div style={{ border: '1px dashed lightgrey', height: '13vh', backgroundColor: '#FFFFFF', display: 'grid'}}>
              <Row className="no-gutters pl-3 pt-2 pb-2">
                <Col md="9">
                    <div className="d-flex flex-column justify-content-between pt-1 pb-1" style={{ height: '100%' }}>
                      <Row className="d-flex align-items-center no-gutters">
                        <label className="text-muted" style={{ width: 50 }}>기간</label>
                        <Input
                          type="date"
                          style={{ width: 140 }}
                          value={searchEventStartDate}
                          onChange={handleSearchEventStartDate}
                        />
                        <span className="text-center" style={{ width: 20 }}>~</span>
                        <Input
                          type="date"
                          style={{ width: 140 }}
                          value={searchEventEndDate}
                          onChange={handleSearchEventEndDate}
                        />
                      </Row>
                      <Row className="d-flex align-items-center no-gutters">
                        <label className="text-muted" style={{ width: 50 }}>일정명</label>
                        <Input 
                          type="text"
                          style={{ width: 300 }}
                          value={searchEventTitle}
                          onChange={handleSearchEventTitle}
                        />
                      </Row>
                      <Row className="d-flex align-items-center no-gutters">
                        <label className="text-muted" style={{ width: 50 }}>범주</label>
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
        <WorkCalendar ref={calendarRef} />
      </div>
    </>
  );
}

export default WorkSchedule;
