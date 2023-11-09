import Dashboard from "views/Dashboard.js";
import WorkNote from "views/WorkNote";
import MedicalInfo from "views/MedicineInfo";
import Notifications from "views/Notifications.js";
import Icons from "views/Icons.js";
import Typography from "views/Typography.js";
import TableList from "views/Tables.js";
import WorkSchedule from "views/WorkSchedule";
import UserPage from "views/User.js";
import UpgradeToPro from "views/Upgrade.js";

var routes = [
  {
    path: "/dashboard",
    name: "대시보드",
    icon: "nc-icon nc-layout-11",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/workNote",
    name: "보건일지",
    icon: "nc-icon nc-paper",
    component: <WorkNote />,
    layout: "/admin",
  },
  {
    path: "/workSchedule",
    name: "보건일정",
    icon: "nc-icon nc-calendar-60",
    component: <WorkSchedule />,
    layout: "/admin",
  },
  {
    path: "/medicineInfo",
    name: "약품정보",
    icon: "nc-icon nc-atom",
    component: <MedicalInfo />,
    layout: "/admin",
  },
  {
    path: "/healthCheck",
    name: "건강검진",
    icon: "nc-icon nc-ambulance",
    component: <Notifications />,
    layout: "/admin",
  },
  {
    path: "/certificate",
    name: "증명서 발급",
    icon: "nc-icon nc-badge",
    component: <Notifications />,
    layout: "/admin",
  },
  {
    path: "/community",
    name: "커뮤니티",
    icon: "nc-icon nc-globe",
    component: <Notifications />,
    layout: "/admin",
  },
  {
    path: "/requestBoard",
    name: "문의 및 요청",
    icon: "nc-icon nc-send",
    component: <Notifications />,
    layout: "/admin",
  },
  {
    path: "/notifications",
    name: "알림",
    icon: "nc-icon nc-bell-55",
    component: <Notifications />,
    layout: "/admin",
  },
  {
    path: "/user-page",
    name: "사용자 정보",
    icon: "nc-icon nc-single-02",
    component: <UserPage />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Table List",
    icon: "nc-icon nc-tile-56",
    component: <TableList />,
    layout: "/admin",
  },
  {
    path: "/typography",
    name: "Typography",
    icon: "nc-icon nc-caps-small",
    component: <Typography />,
    layout: "/admin",
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "nc-icon nc-diamond",
    component: <Icons />,
    layout: "/admin",
  },
  {
    pro: true,
    path: "/upgrade",
    name: "Upgrade to PRO",
    icon: "nc-icon nc-spaceship",
    component: <UpgradeToPro />,
    layout: "/admin",
  },
];
export default routes;
