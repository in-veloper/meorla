import React, {useEffect} from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";
import { useUser } from "contexts/UserContext";
import mainLogoWhite from "../../assets/img/main_header_logo_white.png";
import mainLogoBlack from "../../assets/img/main_header_logo_black.png";

var ps;

function Sidebar(props) {
  const { user, logout } = useUser();
  const location = useLocation();
  const sidebar = React.useRef();
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  React.useEffect(() => {
    if (navigator.userAgentData.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      if (navigator.userAgentData.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  });

  const onLogout = () => {
    // 여기서 처음 로그아웃 버튼 누를 때는 user 가 null -> 에러 발생하며 로그아웃 수행 X , 두번째 누를 시 로그아웃 실행 ===> 해결 필요
    // 추측: 이미 로그인할 때 user 정보를 가져와야함 -> 그래야 사용자정보에서도 처음에 빈값이 아니라 바로 정보가 뜨고 로그아웃도 무리없이 수행됨
    // 예를 들어 사용자 정보 메뉴에 들어가서 값이 비어있을떄 새로고침을 통해 user 정보가 있는 상태로 로그아웃을 누르면 정상적으로 한번에 로그아웃 수행됨
    const userId = user.userId;
    logout(userId);
  }

  return (
    <div
      className="sidebar"
      data-color={props.bgColor}
      data-active-color={props.activeColor}
    >
      <div className="logo">
        <a
          href="https://www.creative-tim.com"
          className="simple-text logo-mini"
        >
          <div className="logo-img">
            <img src={props.bgColor === 'black' ? mainLogoBlack : mainLogoWhite} alt="react-logo" />
          </div>
        </a>
        <a
          href="https://www.creative-tim.com"
          className="simple-text logo-normal text-muted"
        >
          <b>TEA:FORM</b>
        </a>
      </div>
      <div className="sidebar-wrapper" ref={sidebar}>
        <Nav>
          {props.routes.map((prop, key) => {
            return (
              <li
                className={
                  activeRoute(prop.path) + (prop.pro ? " active-pro" : "")
                }
                key={key}
              >
                <NavLink to={prop.layout + prop.path} className="nav-NavLink">
                  <i className={prop.icon} />
                  <p>{prop.name}</p>
                </NavLink>
              </li>
            );
          })}
          <li className="active-pro">
            <NavLink onClick={onLogout}>
              <i className="nc-icon nc-button-power"/>
              <p>로그아웃</p>
            </NavLink>
          </li>
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
