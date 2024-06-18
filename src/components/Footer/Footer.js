import React, { useState } from "react";
import { Container, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import PropTypes from "prop-types";
import TOU from "../../components/documents/TOU.js";
import PP from "../../components/documents/PP.js";
import LN from "../../components/documents/LN.js";
import RCE from "components/documents/RCE.js";

function Footer(props) {
  const [touModal, setTouModal] = useState(false);
  const [ppModal, setPpModal] = useState(false);
  const [lnModal, setLnModal] = useState(false);
  const [rceModal, setRceModal] = useState(false);

  const toggleTouModal = () => setTouModal(!touModal);
  const togglePpModal = () => setPpModal(!ppModal);
  const toggleLnModal = () => setLnModal(!lnModal);
  const toggleRceModal = () => setRceModal(!rceModal);

  const showTOU = () => {
    toggleTouModal();
  };

  const showPP = () => {
    togglePpModal();
  };

  const showLN = () => {
    toggleLnModal();
  };

  const showRCE = () => {
    toggleRceModal();
  };

  return (
    <footer className={"footer" + (props.default ? " footer-default" : "")}>
      <Container fluid={props.fluid ? true : false}>
        <Row>
          <nav className="footer-nav">
            <ul>
              <li className="text-muted pr-2" style={{ fontWeight: 'bold'}} >MEORLA</li>
              <li className="pr-2" onClick={showTOU} style={{ cursor: 'pointer' }}>이용약관</li>
              <li className="pr-2" onClick={showPP} style={{ cursor: 'pointer' }}>개인정보처리방침</li>
              <li className="pr-2" onClick={showLN} style={{ cursor: 'pointer' }}>법적고지</li>
              <li className="pr-3" onClick={showRCE} style={{ cursor: 'pointer' }}>이메일무단수집거부</li>
              <li className="pr-2">Blog</li>
              <li className="pr-2">Instagram</li>
              <li>Licenses</li>
            </ul>
          </nav>
          <div className="credits ml-auto">
            <div className="copyright">
              <span className="pr-2">이해컴퍼니 [사업자번호 : 473-43-01316]</span>
              <span className="pr-2">대표 : 정영인</span>
              <span className="pr-3">Email : meorla@meorla.com</span>
              &copy; {1900 + new Date().getYear()} {" "}
              Copyright 이해 컴퍼니. All right reserved.
            </div>
          </div>
        </Row>
      </Container>

      <Modal isOpen={touModal} toggle={toggleTouModal} centered style={{ minWidth: '40%' }}>
        <ModalHeader><b className="text-muted">이용약관</b></ModalHeader>
        <ModalBody style={{ height: '50vh', overflowY: 'scroll' }}>
          <TOU/>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button onClick={toggleTouModal}>닫기</Button>
          </Row>
        </ModalFooter>
      </Modal>

      <Modal isOpen={ppModal} toggle={togglePpModal} centered style={{ minWidth: '40%' }}>
        <ModalHeader><b className="text-muted">개인정보처리방침</b></ModalHeader>
        <ModalBody style={{ height: '50vh', overflowY: 'scroll' }}>
          <PP/>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button onClick={togglePpModal}>닫기</Button>
          </Row>
        </ModalFooter>
      </Modal>

      <Modal isOpen={lnModal} toggle={toggleLnModal} centered style={{ minWidth: '40%' }}>
        <ModalHeader><b className="text-muted">법적고지</b></ModalHeader>
        <ModalBody style={{ height: '50vh', overflowY: 'scroll' }}>
          <LN/>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button onClick={toggleLnModal}>닫기</Button>
          </Row>
        </ModalFooter>
      </Modal>

      <Modal isOpen={rceModal} toggle={toggleRceModal} centered style={{ minWidth: '40%' }}>
        <ModalHeader><b className="text-muted">이메일무단수집거부</b></ModalHeader>
        <ModalBody style={{ height: 'auto', overflowY: 'scroll' }}>
          <RCE/>
        </ModalBody>
        <ModalFooter>
          <Row className="d-flex justify-content-end no-gutters w-100">
            <Button onClick={toggleRceModal}>닫기</Button>
          </Row>
        </ModalFooter>
      </Modal>
    </footer>
  );
}

Footer.propTypes = {
  default: PropTypes.bool,
  fluid: PropTypes.bool,
};

export default Footer;
