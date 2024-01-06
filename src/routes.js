import Dashboard from "views/Dashboard.js";
import WorkNote from "views/WorkNote";
import MedicalInfo from "views/MedicineInfo";
import Notifications from "views/Notifications.js";
import Icons from "views/Icons.js";
import Typography from "views/Typography.js";
import TableList from "views/Tables.js";
import WorkSchedule from "views/WorkSchedule";
import Community from "views/Community";
import UserPage from "views/User.js";
import QnaRequest from "views/QnaRequest";
import Request from "views/Request";

const isUser = true;
var routes = [];

if(isUser) {
  routes = [
    {
      path: "/dashboard",
      name: "대시보드",
      icon: "nc-icon nc-layout-11",
      component: <Dashboard />,
      layout: "/teaform",
    },
    {
      path: "/workNote",
      name: "보건일지",
      icon: "nc-icon nc-paper",
      component: <WorkNote />,
      layout: "/teaform",
    },
    {
      path: "/workSchedule",
      name: "보건일정",
      icon: "nc-icon nc-calendar-60",
      component: <WorkSchedule />,
      layout: "/teaform",
    },
    {
      path: "/medicineInfo",
      name: "약품정보",
      icon: "nc-icon nc-zoom-split",
      component: <MedicalInfo />,
      layout: "/teaform",
    },
    {
      path: "/healthCheck",
      name: "건강검진",
      icon: "nc-icon nc-ambulance",
      component: <Notifications />,
      layout: "/teaform",
    },
    {
      path: "/certificate",
      name: "증명서 발급",
      icon: "nc-icon nc-badge",
      component: <Notifications />,
      layout: "/teaform",
    },
    {
      path: "/community",
      name: "커뮤니티",
      icon: "nc-icon nc-globe",
      component: <Community />,
      layout: "/teaform",
    },
    {
      path: "/qnaRequest",
      name: "문의 및 요청",
      icon: "nc-icon nc-send",
      component: <QnaRequest />,
      layout: "/teaform",
    },
    {
      path: "/notifications",
      name: "알림",
      icon: "nc-icon nc-bell-55",
      component: <Notifications />,
      layout: "/teaform",
    },
    {
      path: "/user-page",
      name: "사용자 정보",
      icon: "nc-icon nc-single-02",
      component: <UserPage />,
      layout: "/teaform",
    },
    {
      path: "/request",
      name: "보건실 사용 요청",
      icon: "nc-icon nc-tap-01",
      component: <Request />,
      layout: "/teaform"
    },
    {
      path: "/tables",
      name: "Table List",
      icon: "nc-icon nc-tile-56",
      component: <TableList />,
      layout: "/teaform",
    },
    {
      path: "/typography",
      name: "Typography",
      icon: "nc-icon nc-caps-small",
      component: <Typography />,
      layout: "/teaform",
    },
    {
      path: "/icons",
      name: "Icons",
      icon: "nc-icon nc-diamond",
      component: <Icons />,
      layout: "/teaform",
    },
    // {
    //   pro: true,
    //   path: "/upgrade",
    //   name: "로그아웃",
    //   icon: "nc-icon nc-button-power",
    //   component: <UpgradeToPro />,
    //   layout: "/teaform",
    // },
  ];
}else{
  routes = [
    {
      path: "/request",
      name: "보건실 사용 요청",
      icon: "nc-icon nc-tap-01",
      component: <Request />,
      layout: "/teaform"
    },
  ];
}

export default routes;
