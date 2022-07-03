import React from "react";
import defaultUserImage from "../../images/default_user.jpg";

export default function Contact(contact, onError) {
  //console.log(contact);

  return (
    <div
      className={
        "contact contact_small logged-" +
        (contact && contact.isLoggedIn ? "in" : "out")
      }
    >
      <div className="user">
        <img
          className="rounded-circle"
          onError={() => onError}
          src={contact && (contact.providerData.photoURL || defaultUserImage)}
          alt={contact && contact.displayName}
        />
        <span className="dot indicator">●</span>
      </div>
      <div className="content">
        <strong className="title">
          {contact && (contact.displayName || contact.providerData.displayName)}
        </strong>
        <span className="tag indicator">
          {contact && (contact.isLoggedIn ? "Online" : "Offline")}
        </span>
      </div>
    </div>
  );
}
