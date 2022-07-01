import { useRef, useState } from "react";
import { Alert, Button, Container, Image } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { QrReader } from "react-qr-reader";

import { auth, firestore } from "../../firebase";
import defaultUserImage from "../../images/default_user.jpg";
import AppBar from "../app/AppBar";
import { useAuth } from "../context/AuthContext";

export default function AddContact() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const userCodeRef = useRef("");
  const [contacts, setContacts] = useState(null);
  const { currentUser } = useAuth();
  const [user, setUser] = useState();
  const [data, setData] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [rotateCamera, setRotateCamera] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);

  var usersRef = firestore.collection("users");
  var requestsRef = firestore
    .collection("requests")
    .where("from", "==", currentUser.uid);
  let [requests] = useCollectionData(requestsRef);

  async function handleOnSearch() {
    load();
    setContacts(null);
    setHasCameraError(false);

    await firestore
      .collection("users")
      .doc(currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setUser(snapshot.data());
        }
      })
      .catch((e) => {
        catchError(e, "get-user-error.");
      });

    if (user.contacts && user.contacts.length > 0) {
      var code = userCodeRef.current.value ?? data;
      var contactsAndSelf = [
        ...user.contacts.map((u) => u.uid),
        currentUser.uid,
      ];

      await firestore
        .collection("users")
        //.where("uid", "!=", currentUser.uid);
        .where("userCode", "==", code)
        //.where("providerData.uid", "==", code)
        .where("uid", "not-in", contactsAndSelf)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => setContacts(doc.data()));
        })
        .catch((e) => {
          catchError(e, "get-contacts-error.");
        });
    } else {
      await usersRef
        .where("userCode", "==", code)
        //.where("providerData.uid", "==", code)
        .where("uid", "!=", currentUser.uid)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => setContacts(doc.data()));
        })
        .catch((e) => {
          catchError(e, "get-contacts-error.");
        });
    }
    setLoading(false);
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
    console.error(e.message);
    return setError(msg);
  }

  return (
    <>
      <AppBar title="Contacts" />
      <Container className="d-flex" style={{ minHeight: "100vh" }}>
        <div className="w-100">
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
                      //console.info(error);
                    }
                    setHasCameraError(error);
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
          <div className="form-group">
            <input
              type="text"
              //maxLength="12"
              className="form-control"
              placeholder="User Code..."
              ref={userCodeRef}
            />
            <button
              type="button"
              title="Search"
              onError={() => handleOnError()}
              onClick={() => handleOnSearch()}
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
          </div>
          {/* <h2 className="text-center mb-4">Add Contact</h2> */}
          {!loading && contacts && (
            <div className="w-100 text-center">
              <ul id="Users" className="contacts mt-2">
                {[contacts].map((contact, i) => {
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
                          alt="photoURL"
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
                })}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
