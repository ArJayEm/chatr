import React from "react";
import myIconInverted from "../../images/chatr_icon_inverted.png";

export default function Toast(msg) {
  return (
    <div className="toast">
      <img alt="" src={myIconInverted} width="15" /> {msg}
    </div>
  );
}
