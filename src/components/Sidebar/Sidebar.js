/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import { NavLink, useLocation } from "react-router-dom";
import { Nav } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";
import { useUser } from "contexts/UserContext";
import mainLogoWhite from "../../assets/img/main_header_logo_white.png";
import mainLogoBlack from "../../assets/img/main_header_logo_black.png";
import { useNavigate } from 'react-router-dom';

var ps;

function Sidebar(props) {
  const [schoolCodeByParams, setSchoolCodeByParams] = useState("");
  const params = useParams();
  const { user, logout } = useUser();
  const location = useLocation();
  const sidebar = React.useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const schoolCode = params['*'].split('/')[1];
    setSchoolCodeByParams(schoolCode);
    sessionStorage.setItem("thirdPartyUserCode", schoolCode);
  }, [params]);

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  React.useEffect(() => {
    if (navigator.userAgent.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      if (navigator.userAgent.indexOf("Win") > -1) {
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
          className="simple-text logo-mini"
          onClick={() => { navigate('/meorla/dashboard')}}
        >
          <div className="logo-img">
            <img src={props.bgColor === 'black' ? mainLogoBlack : mainLogoWhite} alt="react-logo" />
          </div>
        </a>
        <a
          onClick={() => { navigate('/meorla/dashboard')}}
          className="simple-text logo-normal text-muted"
        >
          <b style={{ color: props.bgColor === 'black' ? '#FFFFFF' : '#66615B' }}>MEORLA</b>
        </a>
      </div>
      <div className="sidebar-wrapper" ref={sidebar}>
        <Nav>
          {props.routes.map((prop, key) => {
            // 여기부터 하면 될듯 보건실 사용 요청 메뉴 제외부터???
            if(!schoolCodeByParams && prop.path.split('/')[1] !== 'request') {
              return (
                <li
                  className={
                    activeRoute(prop.path) + (prop.pro ? " active-pro" : "")
                  }
                  key={key}
                >
                  <NavLink to={prop.layout + prop.path} className="nav-NavLink">
                    <i className={prop.icon} />
                    <p><b>{prop.name}</b></p>
                  </NavLink>
                </li>
              );
            }else if(prop.path.split('/')[1] === 'request') {
              // return (
              //   <li
              //     className={
              //       activeRoute(prop.path) + (prop.pro ? " active-pro" : "")
              //     }
              //     key={key}
              //   >
              //     <NavLink to={`/meorla/request/${schoolCodeByParams}`} className="nav-NavLink">
              //       <i className={prop.icon} />
              //       <p>{prop.name}</p>
              //     </NavLink>
              //   </li>
              // )
              return null;
            }
            return null;
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
