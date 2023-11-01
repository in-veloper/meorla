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
              <li>
                <a href="https://www.creative-tim.com" target="_blank">
                  TEA : FORM
                </a>
              </li>
              <li>
                <a href="https://blog.creative-tim.com" target="_blank">
                  Blog
                </a>
              </li>
              <li>
                <a href="https://www.creative-tim.com/license" target="_blank">
                  Licenses
                </a>
              </li>
            </ul>
          </nav>
          <div className="credits ml-auto">
            <div className="copyright">
              &copy; {1900 + new Date().getYear()} {" "}
              {/* <i className="fa fa-heart heart" />  */}
              powered by yiniwini
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
