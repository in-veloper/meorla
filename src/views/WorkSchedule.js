import React from "react";
// import { UncontrolledAlert } from "reactstrap";
import MyCalendar from "../variables/calendar";

function WorkSchedule() {
  return (
    <>
      <div className="content" style={{ height: '84.8vh' }}>
        {/* <UncontrolledAlert color="info" fade={false}>
          <span>
            <b>알림 &nbsp; </b>
            This is a regular notification made with
            color="info"
          </span>
        </UncontrolledAlert> */}
        <MyCalendar/>
      </div>
    </>
  );
}

export default WorkSchedule;
