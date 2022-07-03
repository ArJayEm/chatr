import { useEffect, useState } from "react";
import { Container, Image, Navbar } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { isMobile, isDesktop } from "react-device-detect";
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
  const [showMobileMenu, setShowMobileMenu] = useState("none");
  const menuClass = "user-dropdown" + (isMobile ? " mobile" : " desktop");
  const userImageSrc =
    (currentUser && currentUser.photoURL) || defaultUserImage;
  const [showLogoutModal, setShowLogoutModal] = useState("none");

  useEffect(() => {
    //get navigation height
    const navbarHeight =
      document.getElementsByClassName("navbar")[0].offsetHeight +
      (isDesktop ? 18 : 0);
    //set menu top offset
    document.getElementsByClassName("menu")[0].style.top = navbarHeight;
  }, []);

  function onLogoutClick() {
    setShowLogoutModal(showLogoutModal === "none" ? "block" : "none");
  }

  function onLogoutCancel() {
    setShowLogoutModal(showLogoutModal === "none" ? "block" : "none");
    handleOnUserDropDownClick();
  }

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

  function handleOnUserDropDownClick() {
    setShowMobileMenu(showMobileMenu === "grid" ? "none" : "grid");
  }

  function handleOnError() {}

  return (
    <>
      <Navbar bg="success" variant="dark">
        <Container style={{ position: isDesktop ? "relative" : "unset" }}>
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
          <div className={menuClass}>
            <button className="btn">
              <Icon.BellFill />
            </button>
            <button className="btn" title={displayName}>
              <Image
                roundedCircle
                onError={() => handleOnError}
                src={userImageSrc}
                alt=""
                onClick={handleOnUserDropDownClick}
              />
            </button>
            <div className="menu" style={{ display: showMobileMenu }}>
              <div
                className="backdrop"
                onClick={handleOnUserDropDownClick}
              ></div>
              <div className="menu-links">
                <a className="link" href="/update-profile">
                  <span>
                    <Icon.PersonFill /> {displayName}
                  </span>
                </a>
              </div>
              <div className="menu-links">
                <a className="link" href="/notifications">
                  <span>
                    <Icon.BellFill /> Notifications
                  </span>
                </a>
              </div>
              <div className="menu-links separator"></div>
              {/* <div className="menu-links"><a className="link" href="/logout">
                  <span>
                    <Icon.BoxArrowRight /> Log Out
                  </span>
                </a>
                <Link className="link" to="/logout">
                  Logout
                </Link> 
              </div>*/}
              <div className="menu-links">
                <div className="link" onClick={onLogoutClick}>
                  <span>
                    <Icon.BoxArrowRight /> Log Out
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Navbar>
      <div
        id="LogoutModal"
        className="modal"
        style={{ display: showLogoutModal }}
      >
        <button className="btn" onClick={onLogoutCancel}>
          Cancel
        </button>
        <button className="btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </>
  );
}
