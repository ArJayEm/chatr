import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

export default function Scanner() {
  const [data, setData] = useState(null);

  return (
    <>
      <QrReader
        constraints={{ facingMode: "environment" }} //user, left, right
        onResult={(result, error) => {
          if (!!result) {
            setData(result?.text);
          }

          if (!!error) {
            console.info(error);
          }
        }}
        style={{ width: "100%" }}
      />
      <p>{data}</p>
    </>
  );
}
