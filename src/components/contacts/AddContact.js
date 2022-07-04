import { useRef, useState } from "react";
import { Alert, Button, Image } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { QrReader } from "react-qr-reader";

import { auth, firestore } from "../../firebase";
import defaultUserImage from "../../images/default_user.jpg";
import AppBar from "../app/AppBar";
import Toast from "../app/Toast";
import { useAuth } from "../context/AuthContext";

export default function AddContact() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const userCodeRef = useRef("");
  const [contacts, setContacts] = useState(null);
  const { currentUser } = useAuth();
  //const [user, setUser] = useState();
  const [data, setData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [rotateCamera, setRotateCamera] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);
  //const [enableSearch, setEnableSearch] = useState(false);

  var usersRef = firestore.collection("users");
  var requestsRef = firestore
    .collection("requests")
    .where("from", "==", auth.currentUser.uid);
  let [requests] = useCollectionData(requestsRef);

  async function handleOnSearch(e) {
    e.preventDefault();
    var code = data ?? userCodeRef.current.value;

    if (code.length === 12) {
      load();
      setContacts(null);
      setHasCameraError(false);

      await usersRef
        .doc(auth.currentUser.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            //setUser(snapshot.data());

            if (true) {
              //snapshot.data().contacts
              let userContacts =
                (snapshot.data().contacts ?? []).map((e) => e.uid) ?? [];

              if (userContacts.length > 0) {
                var contactsAndSelf = [...userContacts, currentUser.uid];

                usersRef
                  .where("userCode", "==", code)
                  .where("uid", "not-in", contactsAndSelf)
                  .get()
                  .then((snapshot) => {
                    snapshot.docs.map((doc) => setContacts(doc.data()));
                  })
                  .catch((e) => {
                    catchError(e, "get-contacts-error.");
                  });
              } else {
                usersRef
                  .where("userCode", "==", code)
                  .where("uid", "!=", currentUser.uid)
                  .get()
                  .then((snapshot) => {
                    snapshot.docs.map((doc) => setContacts(doc.data()));
                  })
                  .catch((e) => {
                    catchError(e, "get-contacts-error.");
                  });
              }
            }
          }
        })
        .catch((e) => {
          catchError(e, "get-user-error.");
        });
      setLoading(false);
    }
  }

  //eslint-disable-next-line
  function handleOnScan() {
    setContacts(null);
    userCodeRef.current.value = "";
    setShowScanner(true);
  }

  async function handleSendRequest(uid) {
    try {
      setMessage("");
      setError("");
      setLoading(true);

      await firestore.collection("requests").add({
        createdDate: new Date(Date.now()),
        to: uid,
        from: auth.currentUser.uid,
        deleted: 0,
        accepted: 0
      });

      //setMessage("Request sent.");
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError("Request not sent.");
      setLoading(false);
      return false;
    }
  }

  function handleOnError() {}

  function load() {
    setMessage("");
    setError("");
    setLoading(true);
  }

  function catchError(e, msg) {
    setLoading(false);
    var message = msg + " " + e.message;
    console.error(e.message);
    return setError(message);
  }

  return (
    <div className="page">
      <AppBar history="/" title="Contacts" />
      <div className="container">
        {error && <Toast />}
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        {hasCameraError ? (
          <Alert variant="danger">camera-not-found.</Alert>
        ) : (
          showScanner && (
            <section className="mb-dot5">
              <QrReader
                key={rotateCamera ? "user" : "environment"}
                constraints={{
                  facingMode: rotateCamera ? "user" : "environment",
                }} //user, left, right
                onResult={(result, error) => {
                  if (!!result) {
                    setData(result?.text);
                    setShowScanner(false);
                    userCodeRef.current.value = data;
                    handleOnSearch();
                  }

                  if (!!error) {
                    console.info(error);
                    //setHasCameraError(error);
                  }
                }}
                style={{ width: "100%" }}
              />
              {/* <p>{data}</p> */}
              <button
                type="button"
                onClick={() => {
                  //console.log(!rotateCamera);
                  setRotateCamera(!rotateCamera);
                }}
                className="btn wide"
              >
                <Icon.ArrowRepeat />
              </button>
            </section>
          )
        )}
        <form className="form-group" onSubmit={handleOnSearch}>
          <input
            //type="number"
            maxLength="12"
            //max={12}
            className="form-control"
            placeholder="User Code..."
            ref={userCodeRef}
            //onKeyUp={setEnableSearch(true)}
          />
          <button
            type="submit"
            title="Search"
            onError={() => handleOnError()}
            //onClick={() => handleOnSearch()}
            //disabled={enableSearch}
          >
            <Icon.Search />
          </button>
          <button
            type="button"
            title="Scan"
            onError={() => handleOnError()}
            onClick={() => handleOnScan()}
          >
            <Icon.QrCodeScan />
          </button>
        </form>
        <ul id="Users" className="contacts mt-2">
          {loading ? (
            <>
              <li className="loading-contact">
                <div className="user-icon">
                  <Image
                    roundedCircle
                    src={defaultUserImage}
                    style={{ width: "3em" }}
                  />
                </div>
                <span>
                  <strong>&nbsp;</strong>
                </span>
                <span>
                  <small>&nbsp;</small>
                </span>
              </li>
              <li className="loading-contact">
                <div className="user-icon">
                  <Image
                    roundedCircle
                    src={defaultUserImage}
                    style={{ width: "3em" }}
                  />
                </div>
                <span>
                  <strong>&nbsp;</strong>
                </span>
                <span>
                  <small>&nbsp;</small>
                </span>
              </li>
            </>
          ) : contacts ? (
            [contacts].map((contact, i) => {
              let isRequested =
                requests.filter((e) => e.to === contact.uid).length > 0;
              return (
                <li id={contact.uid} key={i}>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <Image
                      roundedCircle
                      onError={() => handleOnError}
                      src={
                        (contact && contact.providerData.photoURL) ||
                        defaultUserImage
                      }
                      alt=""
                      style={{ width: "3em" }}
                    />
                    <h6>
                      &nbsp;&nbsp;
                      {contact.displayName ??
                        contact.providerData.displayName ??
                        contact.email}
                    </h6>
                  </span>
                  <Button
                    disabled={isRequested}
                    variant={isRequested ? "light" : "success"}
                    type="button"
                    onError={() => handleOnError}
                    onClick={() => handleSendRequest(contact.uid)}
                  >
                    {isRequested ? "Request Sent" : "Send Request"}
                  </Button>
                </li>
              );
            })
          ) : (
            <li>No contacts found...</li>
          )}
        </ul>
      </div>
    </div>
  );
}
