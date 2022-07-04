import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";

import { auth, firestore } from "../../firebase";
import AppBar from "../app/AppBar";
import Contact from "./Contact";
import LoadingContact from "./LoadingContact";

export default function Contacts() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  //const [contacts, setContacts] = useState(null);
  const [requestors, setRequestors] = useState(null);

  let usersCollection = firestore.collection("users");
  let requestsCollection = firestore.collection("requests");

  useEffect(
    () => {
      getRequests();
    },
    //eslint-disable-next-line
    []
  );

  async function getRequests() {
    try {
      load();

      let requestsFrom = await requestsCollection
        .where("to", "!=", auth.currentUser.uid)
        .get()
        .then((snapshots) => {
          return snapshots.docs.map((e) => e.data());
        });
      setLoading(false);

      if (!requestsFrom) return;

      load();
      let users = await usersCollection
        .where(
          "uid",
          "in",
          requestsFrom.map((e) => e.from)
        )
        .get()
        .then((snapshots) => {
          return snapshots.docs.map((e) => e.data());
        });
      setLoading(false);

      if (!users) return;

      let requestsAndUsers = [];
      requestsFrom.forEach((request) => {
        var user =
          users.filter((e) => e.uid === request.from).map((e) => e)[0] ?? null;
        var data = { request, user };
        user.requested = request.createdDate;
        //console.log(data.request.from, data?.user?.uid);
        requestsAndUsers.push(data);
        //console.log(requestsAndUsers[0]);
      });
      setRequestors(requestsAndUsers);

      //setLoading(false);
    } catch (e) {
      catchError(e, "get-user-error.");
    }
  }

  async function handleRequest(e) {
    //e.preventDefault();

    var action = e.target.getAttribute("title").toLowerCase();
    //console.log(action);
    if (action === "accept") {
    } else if (action === "delete") {
    }
  }

  function switchTab(e) {
    e.preventDefault();
    var tabContentId = e.target.getAttribute("href");

    var tabs = document.querySelectorAll(".tab");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove("active");
    }

    document
      .querySelectorAll('[href="' + tabContentId + '"]')[0]
      .closest(".tab")
      .classList.add("active");

    var tabContents = document.querySelectorAll(".tab-content");
    for (var j = 0; j < tabContents.length; j++) {
      tabContents[j].classList.remove("active");
      if (tabContents[j].getAttribute("id") === tabContentId) {
        tabContents[j].classList.add("active");
      }
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
    <div className="page">
      <AppBar history="/" title="Contacts" />
      {/* {loading && <Loading />} */}
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}{" "}
      <div className="tab-menu">
        <ul className="tabs">
          <li className="tab active">
            <a href="#tab-1" onClick={switchTab}>
              Requests
            </a>
          </li>
          <li className="tab">
            <a href="#tab-2" onClick={switchTab}>
              Your Contacts
            </a>
          </li>
        </ul>
        <div className="tab-contents">
          <ul id="#tab-1" className="tab-content contacts active">
            {loading && <LoadingContact count={1} />}
            {!loading && !requestors && <li>None</li>}
            {!loading &&
              requestors &&
              requestors
                .sort((a, b) => b.request.createdDate - a.request.createdDate)
                .map((data, i) => {
                  var requestor = data.user;
                  var detail = data.request.createdDate;
                  //console.log(data.user);
                  return (
                    <Contact
                      key={i}
                      user={requestor}
                      size="medium"
                      showIfOnline={false}
                      onError={handleOnError}
                      type="request"
                      detail={detail}
                      actions={
                        <div className="actions">
                          <button
                            className="btn btn-theme-success wide"
                            type="button"
                            title="Accept"
                            onClick={handleRequest}
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-defafult wide"
                            type="submit"
                            title="Delete"
                            onClick={handleRequest}
                          >
                            Delete
                          </button>
                        </div>
                      }
                    />
                  );
                })}
          </ul>
          <ul id="#tab-2" className="tab-content">
            <li>Person 1</li>
          </ul>
        </div>
      </div>{" "}
    </div>
  );
}
