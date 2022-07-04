import React from "react";

import defaultUserImage from "../../images/default_user.jpg";

export default function LoadingContact({ count }) {
  return [...Array(count)].map((e, i) => (
    <li className="loading-contact" key={i}>
      <div className="user-icon">
        <img
          className="rounded-circle"
          src={defaultUserImage}
          alt="defaultUserImage"
          style={{ width: "3em" }}
        />
      </div>
      <span>
        <strong>&nbsp;</strong>
        <small>&nbsp;</small>
      </span>
    </li>
  ));
}
