import { useEffect, useState } from "react";
import { Container, Dropdown, Image, Navbar } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import {
  BrowserView,
  isBrowser,
  isMobile,
  MobileView,
} from "react-device-detect";
import { Link, useNavigate } from "react-router-dom";

import { auth, firestore } from "../../firebase";
import myIconInverted from "../../images/chatr_icon_inverted.png";
import defaultUserImage from "../../images/default_user.jpg";
import { useAuth } from "../context/AuthContext";

export default function NavigationBar() {
  const { currentUser } = useAuth();
  const { logout } = useAuth();
  const history = useNavigate();
  const displayName =
    currentUser && (currentUser.displayName ?? currentUser.email);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    //get navigation height
    const navbarHeight =
      document.getElementsByClassName("navbar")[0].offsetHeight;
    //set menu top offset
    document.getElementsByClassName("menu")[0].style.top = navbarHeight;
  }, []);

  async function handleLogout() {
    try {
      var doc = firestore.collection("users").doc(auth.currentUser.uid);
      await doc
        .update({
          isLoggedIn: false,
        })
        .then(() => {
          logout();
        })
        .finally(() => {
          history("/login");
        });
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
    <>
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
                {/* <Icon.ChatSquareFill /> */}
              </Link>
            </li>
          </ul>
          {isBrowser && (
            <BrowserView>
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
                    src={
                      (currentUser && currentUser.photoURL) || defaultUserImage
                    }
                    alt="photoURL"
                    style={{ width: "1.5em" }}
                  />{" "}
                  &nbsp;
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Link className="link dropdown-item" to="/update-profile">
                    <Icon.PersonFill /> {displayName}
                  </Link>
                  <Link className="link dropdown-item" to="/notifications">
                    <Icon.BellFill /> Notifications
                  </Link>
                  <Dropdown.Divider></Dropdown.Divider>
                  <Dropdown.Item onClick={() => handleLogout()}>
                    <Icon.BoxArrowRight /> Log Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </BrowserView>
          )}
          {isMobile && (
            <MobileView>
              {showMobileMenu ? (
                <Icon.XLg
                  onClick={handleOnClose}
                  style={{ color: "#fff", fontSize: "1.5em" }}
                />
              ) : (
                <Icon.List
                  onClick={handleOnOpen}
                  style={{ color: "#fff", fontSize: "1.5em" }}
                />
              )}
            </MobileView>
          )}
        </Container>
      </Navbar>
      <div
        className="menu"
        style={{ display: showMobileMenu ? "list-item" : "none" }}
      >
        <div className="backdrop"></div>
        <div className="menu-links">
          <a className="link" href="/update-profile">
            <span>
              <Icon.PersonFill /> Profile
            </span>
            {displayName}
          </a>
        </div>
        <div className="menu-links">
          <a className="link" href="/notifications">
            <span>
              <Icon.BellFill /> Notifications
            </span>
          </a>
        </div>
        <div className="menu-links">
          <div className="link" onClick={() => handleLogout()}>
            <span>
              <Icon.BoxArrowRight /> Logout
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
