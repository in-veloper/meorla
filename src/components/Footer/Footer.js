import React from "react";
import { Container, Row } from "reactstrap";
import PropTypes from "prop-types";

function Footer(props) {
  return (
    <footer className={"footer" + (props.default ? " footer-default" : "")}>
      <Container fluid={props.fluid ? true : false}>
        <Row>
          <nav className="footer-nav">
            <ul>
              <li className="text-muted pr-2" style={{ fontWeight: 'bold'}} >
                {/* <a href="https://www.creative-tim.com" target="_blank"> */}
                  MEORLA
                {/* </a> */}
              </li>
              <li className="pr-2">
                이용약관
              </li>
              <li className="pr-2">
                개인정보처리방침
              </li>
              <li className="pr-2">
                법적고지
              </li>
              <li className="pr-3">
                이메일무단수집거부
              </li>
              <li className="pr-2">
                {/* <a href="https://blog.creative-tim.com" target="_blank"> */}
                  Blog
                {/* </a> */}
              </li>
              <li className="pr-2">
                {/* <a href="https://blog.creative-tim.com" target="_blank"> */}
                  Instagram
                {/* </a> */}
              </li>
              <li>
                {/* <a href="https://www.creative-tim.com/license" target="_blank"> */}
                  Licenses
                {/* </a> */}
              </li>
            </ul>
          </nav>
          <div className="credits ml-auto">
            <div className="copyright">
              <span className="pr-2">이해컴퍼니 [사업자번호 : 473-43-01316]</span>
              <span className="pr-2">대표 : 정영인</span>
              <span className="pr-3">Email : meorla@meorla.com</span>
              &copy; {1900 + new Date().getYear()} {" "}
              {/* <i className="fa fa-heart heart" />  */}
              Copyright 이해 컴퍼니. All right reserved.
            </div>
          </div>
        </Row>
      </Container>
    </footer>
  );
}

Footer.propTypes = {
  default: PropTypes.bool,
  fluid: PropTypes.bool,
};

export default Footer;
