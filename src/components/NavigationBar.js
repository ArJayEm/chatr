import { Container, Dropdown, Image, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
//import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth } from "../context/AuthContext";
import myIconInverted from "../images/chatr_icon_inverted.png";
//import myIcon from "../images/chatr_icon.png";
import { useState } from "react";
import * as Icon from "react-bootstrap-icons";
import {
  BrowserView,
  isBrowser,
  isMobile,
  MobileView,
} from "react-device-detect";
import { auth, firestore } from "../firebase";
import defaultUser from "../images/default_user.jpg";
import { slide as Menu } from "react-burger-menu";

export default function NavigationBar() {
  //const handleClose = () => setShow(false);
  //const handleShow = () => setShow(true);
  const { currentUser } = useAuth();
  //no-unused-vars
  const { logout } = useAuth();
  const history = useNavigate();
  //const [error, setError] = useState("");
  //const [loading, setLoading] = useState(false);
  const displayName =
    currentUser && (currentUser.displayName ?? currentUser.email);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  async function handleLogout() {
    try {
      //setLoading(true);
      //if (auth.currentUser.uid != null) {
      var doc = firestore.collection("users").doc(auth.currentUser.id);
      if ((await doc.get()).exists) {
        await doc.update({
          isLoggedIn: false,
        });
        await logout();
      }
      //}
      history("/login");
    } catch (e) {
      //setLoading(false);
      console.error(e.message);
      //return setError("Log out failed.");
    }
  }

  function handleOnOpen() {
    setShowMobileMenu(true);
  }

  function handleOnClose() {
    setShowMobileMenu(false);
  }

  function handleOnError() {}

  return (
    <Navbar bg="success" variant="dark">
      <Container>
        <ul className="nav">
          <li>
            <Link className="link active" to="/" title="Chatr">
              <img
                alt=""
                src={myIconInverted}
                width="30"
                height="30"
                className="d-inline-block align-top"
              />
            </Link>
          </li>
        </ul>
        <Dropdown>
          <Dropdown.Toggle
            variant="success"
            id="dropdown-basic"
            title={displayName}
            style={{ display: "inline-flex" }}
          >
            <Image
              roundedCircle
              onError={() => handleOnError}
              src={(currentUser && currentUser.photoURL) || defaultUser}
              alt="photoURL"
              style={{ width: "1.5em" }}
            />{" "}
            &nbsp;
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>
              <Icon.PersonFill /> {displayName}
            </Dropdown.Header>
            <Link className="link dropdown-item" to="/update-profile">
              <Icon.PersonFill /> Profile
            </Link>
            <Link className="link dropdown-item" to="/notifications">
              <Icon.BellFill /> Notifications
            </Link>
            <Dropdown.Divider></Dropdown.Divider>
            <Dropdown.Item onClick={handleLogout}>
              <Icon.BoxArrowRight /> Log Out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {isBrowser && <BrowserView></BrowserView>}
        {/* {isMobile && (
          <MobileView>
            <Menu
              isOpen={showMobileMenu}
              onOpen={handleOnOpen}
              onClose={handleOnClose}
              disableCloseOnEsc
              noOverlay //customCrossIcon={ <img src="img/cross.svg" /> }
            >
              <Dropdown.Header>
                <Icon.PersonFill /> {displayName}
              </Dropdown.Header>
              <Link className="link dropdown-item" to="/update-profile">
                <Icon.PersonFill /> Profile
              </Link>
              <Link className="link dropdown-item" to="/notifications">
                <Icon.BellFill /> Notifications
              </Link>
              <Link className="link dropdown-item" onClick={handleLogout}>
                <Icon.BoxArrowRight /> Log Out
              </Link>
            </Menu>
          </MobileView> */}
      </Container>
    </Navbar>
  );
}
