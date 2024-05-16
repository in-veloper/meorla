
import React, { useState, useEffect } from "react";
import Dashboard from "views/Dashboard.js";
import WorkNote from "views/WorkNote";
import MedicalInfo from "views/MedicineInfo";
import Notifications from "views/Notifications.js";
import Icons from "views/Icons.js";
import WorkSchedule from "views/WorkSchedule";
import Community from "views/Community";
import UserPage from "views/User.js";
import QnaRequest from "views/QnaRequest";
import Request from "views/Request";
import Examination from "views/Examination";
import ManageMediFixt from "views/ManageMediFixt";
import Statistics from "views/Statistics";


const GetRoutes = () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const thirdPartyUserCode = sessionStorage.getItem('thirdPartyUserCode');
  // const isUser = accessToken ? true : false;                // 보건교사 / 일반교사 구분 Flag (Flag에 따라 메뉴 숨김)
  var routes = [];
  // debugger
  // if(isUser) {                        // Login한 User가 보건교사인 경우
  // if(accessToken) {
    routes = [
      {
        path: "/dashboard",
        name: "대시보드",
        icon: "nc-icon nc-layout-11",
        component: <Dashboard />,
        layout: "/meorla",
      },
      {
        path: "/workNote",
        name: "보건일지",
        icon: "nc-icon nc-paper",
        component: <WorkNote />,
        layout: "/meorla",
      },
      {
        path: "/workSchedule",
        name: "보건일정",
        icon: "nc-icon nc-calendar-60",
        component: <WorkSchedule />,
        layout: "/meorla",
      },
      {
        path: "/medicineInfo",
        name: "약품정보",
        icon: "nc-icon nc-zoom-split",
        component: <MedicalInfo />,
        layout: "/meorla",
      },
      {
        path: "/manageMediFixt",
        name: "약품 · 비품 관리",
        icon: "nc-icon nc-box-2",
        component: <ManageMediFixt />,
        layout: "/meorla",
      },
      {
        path: "/healthCheck",
        name: "건강검진",
        icon: "nc-icon nc-ambulance",
        component: <Examination />,
        layout: "/meorla",
      },
      {
        path: "/certificate",
        name: "증명서 발급",
        icon: "nc-icon nc-badge",
        component: <Notifications />,
        layout: "/meorla",
      },
      {
        path: "/community",
        name: "커뮤니티",
        icon: "nc-icon nc-globe",
        component: <Community />,
        layout: "/meorla",
      },
      {
        path: "/statistics",
        name: "통계",
        icon: "nc-icon nc-chart-pie-36",
        component: <Statistics />,
        layout: "/meorla",
      },
      // {
      //   path: "/notifications",
      //   name: "알림",
      //   icon: "nc-icon nc-bell-55",
      //   component: <Notifications />,
      //   layout: "/meorla",
      // },
      {
        path: "/survey",
        name: "설문조사",
        icon: "nc-icon nc-single-copy-04",
        component: <Notifications />,
        layout: "/meorla",
      },
      {
        path: "/user-page",
        name: "사용자 정보",
        icon: "nc-icon nc-single-02",
        component: <UserPage />,
        layout: "/meorla",
      },
      {
        path: "/qnaRequest",
        name: "문의 및 요청",
        icon: "nc-icon nc-send",
        component: <QnaRequest />,
        layout: "/meorla",
      },
      {
        path: '/request/:thirdPartyUserCode',
        name: "보건실 방문 요청",
        icon: "nc-icon nc-tap-01",
        component: <Request />,
        layout: "/meorla"
      },
      // {
      //   path: "/icons",
      //   name: "Icons",
      //   icon: "nc-icon nc-diamond",
      //   component: <Icons />,
      //   layout: "/meorla",
      // },
    ];

  return routes;
}

const routes = GetRoutes();

export default routes;
