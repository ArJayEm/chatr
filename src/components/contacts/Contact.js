import React from "react";
import defaultUserImage from "../../images/default_user.jpg";

export default function Contact({
  user,
  size,
  showIfOnline,
  onError,
  actions,
  type,
  detail,
}) {
  let date = new Date(detail.seconds * 1000 + detail.nanoseconds / 1000000);
  var delta = Math.abs(date - Date.now());

  var days = Math.floor(delta / 86400);
  delta -= days * 86400;

  var hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  var minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  console.log(delta);
  return (
    <li
      id={user.uid}
      className={
        "contact " +
        size +
        " logged-" +
        (user && user.isLoggedIn ? "in" : "out")
      }
    >
      <div className="user">
        <img
          className="rounded-circle"
          onError={() => onError}
          src={user && (user.providerData.photoURL || defaultUserImage)}
          alt={user && user.displayName}
        />
        {showIfOnline && <span className="dot indicator">●</span>}
      </div>
      <div className="content">
        <h6 className={"title" + (detail ? " flex" : "")}>
          {user && (user.displayName || user.providerData.displayName)}
          {/* {type === "request" && <></>} */}
          {detail && <small className="detail">date</small>}
        </h6>
        {showIfOnline && (
          <span className="tag indicator">
            {user && (user.isLoggedIn ? "Online" : "Offline")}
          </span>
        )}
        {actions}
      </div>
    </li>
  );
}
