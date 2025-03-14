import React from "react";

import { Button } from "reactstrap";

function FixedPlugin(props) {
  const [classes, setClasses] = React.useState("dropdown"); // 초기 상태 dropdown show -> dropdown 으로 수정 (처음 load될때 열려있지 않도록 수정)
  const handleClick = () => {
    if (classes === "dropdown") {
      setClasses("dropdown show");
    } else {
      setClasses("dropdown");
    }
  };
  return (
    <div className="fixed-plugin">
      <div className={classes}>
        <div onClick={handleClick}>
          <i className="fa fa-cog fa-2x" />
        </div>
        <ul className="dropdown-menu show">
          <li className="header-title">사이드 메뉴 배경 색상</li>
          <li className="adjustments-line">
            <div className="badge-colors text-center">
              <span
                className={
                  props.bgColor === "white"
                    ? "badge filter badge-light active"
                    : "badge filter badge-light"
                }
                data-color="white"
                onClick={() => {
                  props.handleBgClick("white");
                }}
              />
              <span
                className={
                  props.bgColor === "black"
                    ? "badge filter badge-dark active"
                    : "badge filter badge-dark"
                }
                data-color="black"
                onClick={() => {
                  props.handleBgClick("black");
                }}
              />
            </div>
          </li>
          <li className="header-title">사이드 메뉴 활성화 색상</li>
          <li className="adjustments-line">
            <div className="badge-colors text-center">
              <span
                className={
                  props.activeColor === "primary"
                    ? "badge filter badge-primary active"
                    : "badge filter badge-primary"
                }
                data-color="primary"
                onClick={() => {
                  props.handleActiveClick("primary");
                }}
              />
              <span
                className={
                  props.activeColor === "info"
                    ? "badge filter badge-info active"
                    : "badge filter badge-info"
                }
                data-color="info"
                onClick={() => {
                  props.handleActiveClick("info");
                }}
              />
              <span
                className={
                  props.activeColor === "success"
                    ? "badge filter badge-success active"
                    : "badge filter badge-success"
                }
                data-color="success"
                onClick={() => {
                  props.handleActiveClick("success");
                }}
              />
              <span
                className={
                  props.activeColor === "warning"
                    ? "badge filter badge-warning active"
                    : "badge filter badge-warning"
                }
                data-color="warning"
                onClick={() => {
                  props.handleActiveClick("warning");
                }}
              />
              <span
                className={
                  props.activeColor === "danger"
                    ? "badge filter badge-danger active"
                    : "badge filter badge-danger"
                }
                data-color="danger"
                onClick={() => {
                  props.handleActiveClick("danger");
                }}
              />
            </div>
          </li>
          <li className="button-container">
            <Button
              href="https://www.creative-tim.com/product/paper-dashboard-react?ref=pdr-fixed-plugin"
              color="primary"
              block
              className="btn-round"
            >
              문의 및 요청
            </Button>
          </li>
          <li className="button-container">
            <Button
              href="https://www.creative-tim.com/product/paper-dashboard-react/#/documentation/tutorial?ref=pdr-fixed-plugin"
              color="default"
              block
              className="btn-round"
              outline
            >
              <i className="nc-icon nc-paper" /> 사용자 메뉴얼 다운로드
            </Button>
          </li>
          <li className="header-title">더 궁금하신 사항은?</li>
          <li className="button-container">
            <Button
              href="https://www.creative-tim.com/product/paper-dashboard-pro-react?ref=pdr-fixed-plugin"
              color="danger"
              block
              className="btn-round"
              target="_blank"
            >
              관리자에게 메일로 문의
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default FixedPlugin;
