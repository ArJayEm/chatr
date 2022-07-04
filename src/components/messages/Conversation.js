import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Link, useParams } from "react-router-dom";

import { auth, firestore } from "../../firebase";
import defaultUserImage from "../../images/default_user.jpg";
import AppBar from "../app/AppBar";
import MessageBubble from "./MessageBubble";
import Loading from "../app/Loading";
//import Contact from "../contacts/Contact";

export default function Conversation() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  let { uid: contactId } = useParams();
  const [contact, setContact] = useState(null);
  const [conversations, setConversations] = useState(null);
  const [unseenMessage, setUnseenMessage] = useState("");
  const messageRef = useRef(null);
  const scrollRef = useRef(null);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [withScroll, setWithScroll] = useState(false);
  const [reachedTop, setReachedTop] = useState(false);

  var fromIds = auth.currentUser.uid + " - " + contactId;
  var toIds = contactId + " - " + auth.currentUser.uid;
  var senderIds = [fromIds, toIds];

  const [showSendButton, setShowSendButton] = useState(false);
  const onKeyUp = () => setShowSendButton(messageRef.current.value.length > 0);
  //const onBlur = () => setShowSendButton(false);

  let usersCollection = firestore.collection("users");
  let messagesCollection = firestore
    .collection("messages")
    .where("senders", "in", senderIds);

  //let conversationFilter = messagesCollection;
  //let [conversations] = useCollectionData(conversationFilter);

  messagesCollection
    .get()
    .then((snapshots) => {
      setConversations(snapshots.docs.map((e) => e.data()));
      //getUnseen();
      //setConversationsHeight();
      setLoading(false);
    })
    .finally(() => {})
    .catch((e) => {
      catchError(e, "get-contact-error.");
    });

  let unseenFilter = messagesCollection
    .where("status", "==", 0)
    .where("to", "==", auth.currentUser.uid);
  let [unseen] = useCollectionData(unseenFilter);
  let unseenCount = (unseen ?? []).length;

  // let requestorsRef = usersCollection.doc(contactId);
  // // .get()
  // // .then((snapshot) => {
  // //   //load();
  // //   if (snapshot.exists) {
  // //     setContact(snapshot.data());
  // //   }
  // //   //setLoading(false);
  // // })
  // // .finally(() => {})
  // // .catch((e) => {
  // //   catchError(e, "get-contact-error.");
  // // });
  // let [contact] = useCollectionData(requestorsRef);

  unseenFilter.get().then((snapshots) => {
    // console.log(snapshots.exists)
    // if (snapshots.exists) {
    unseenCount = snapshots.docs.length;
    if (unseenCount > 0) {
      setHasUnseen(true);
      let latestUnseenMessage =
        snapshots.docs
          .sort(
            (a, b) =>
              b.data().createdDate.seconds - a.data().createdDate.seconds
          )
          .map((e, i) => (i === 0 ? e.data().message : null))
          .filter((e) => e) ?? "";
      //scrollToBottom();
      setUnseenMessage(latestUnseenMessage);
    }
    //}
  });

  useEffect(
    () => {
      getContact();
      //getConversations();
      //getUnseen();
      //setConversationsHeight();
    },
    //eslint-disable-next-line
    []
  );

  async function setConversationsHeight() {
    let navbarHeight = 4; //document.getElementsByClassName("navbar")[0].offsetHeight;
    let contactHeight =
      (document.getElementsByClassName("appbar")[0] ?? []).offsetHeight ?? 0;
    let replyHeight = document.getElementById("Reply").offsetHeight;
    const heightToDeduct = navbarHeight + contactHeight + replyHeight;
    //console.log(heightToDeduct);
    let conversationsDiv = document.getElementById("Conversations");
    conversationsDiv.style.height = window.innerHeight - heightToDeduct + "px";

    let conversationsHeight = conversationsDiv.offsetHeight;
    let tableHeight = conversationsDiv.querySelector("table").offsetHeight;
    //console.log(tableHeight, conversationsHeight);

    conversationsDiv.style.display =
      tableHeight > conversationsHeight ? "block" : "flex";
    conversationsDiv.querySelector("table").style.alignSelf =
      tableHeight > conversationsHeight ? "unset" : "flex-end";

    if (tableHeight >= conversationsHeight) {
      setWithScroll(true);
      //seenNewMessages();
    } else {
      setWithScroll(false);
      //scrollToBottom();
    }
  }

  async function getContact() {
    load();

    await usersCollection
      .doc(contactId)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setContact(snapshot.data());
        }

        //getConversations();
      })
      .finally(() => {})
      .catch((e) => {
        catchError(e, "get-contact-error.");
      });
    setLoading(false);
  }

  async function getConversations() {
    load();

    // await messagesCollection
    //   .get()
    //   .then((snapshots) => {
    //     setConversations(snapshots.docs.map((e) => e.data()));
    //     //getUnseen();
    //     //setConversationsHeight();
    //     setLoading(false);
    //   })
    //   .finally(() => {})
    //   .catch((e) => {
    //     catchError(e, "get-contact-error.");
    //   });
  }

  async function getUnseen() {
    load();

    await unseenFilter.get().then((snapshots) => {
      // console.log(snapshots.exists)
      // if (snapshots.exists) {
      unseenCount = snapshots.docs.length;
      if (unseenCount > 0) {
        setHasUnseen(true);
        let latestUnseenMessage =
          snapshots.docs
            .sort(
              (a, b) =>
                b.data().createdDate.seconds - a.data().createdDate.seconds
            )
            .map((e, i) => (i === 0 ? e.data().message : null))
            .filter((e) => e) ?? "";
        //scrollToBottom();
        setUnseenMessage(latestUnseenMessage);
      }
      //}
    });
    setLoading(false);
    setConversationsHeight();
  }

  async function handleOnSend(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setSending(true);

    if (messageRef.current.value.length > 0) {
      await firestore
        .collection("messages")
        .add({
          createdDate: new Date(Date.now()),
          message: messageRef.current.value,
          to: contactId,
          from: auth.currentUser.uid,
          senders: fromIds,
          status: 0,
        })
        .then(() => {
          messageRef.current.value = "";
          setShowSendButton(false);
        })
        .catch((e) => {
          setSending(false);
          console.error(e);
          return setError("Message not sent.");
        });

      if (!withScroll) {
        setConversationsHeight();
      }
      if (!withScroll) {
        seenNewMessages();
      }
      //await getConversations();
      await scrollToBottom();
      setSending(false);
    }
  }

  function scrollToBottom() {
    scrollRef.current.scrollIntoView({
      behavior: "smooth",
      // block: "end",
      // inline: "nearest",
    });
    seenNewMessages();
  }

  const listInnerRef = useRef();
  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      let currentScrollPosition = Math.floor(scrollTop + clientHeight + 1);
      let divScrollHeight = Math.floor(scrollHeight);
      if (currentScrollPosition === divScrollHeight) {
        seenNewMessages();
      }
      setReachedTop(scrollTop === 0);
    }
  };

  async function seenNewMessages() {
    await unseenFilter.get().then((snapshots) => {
      const toBeSeen = [];
      snapshots.forEach((doc) =>
        toBeSeen.push(
          doc.ref.update({
            status: 1,
          })
        )
      );
      Promise.all(toBeSeen);
    });
    unseenFilter.get().then((snapshots) => {
      unseenCount = snapshots.docs.length;
      //console.log(unseenCount);
      setHasUnseen(unseenCount > 0);
    });
  }

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

  function handleOnError() {}

  return (
    <div className="page">
      {contact && (
        <AppBar
          history="/"
          component={
            // <Contact contact={contact} handleOnError={handleOnError} />
            <div
              className={
                "contact contact_small logged-" +
                (contact && contact.isLoggedIn ? "in" : "out")
              }
            >
              <div className="user">
                <img
                  className="rounded-circle"
                  onError={() => handleOnError}
                  src={
                    contact &&
                    (contact.providerData.photoURL || defaultUserImage)
                  }
                  alt={contact && contact.displayName}
                />
                <span className="dot indicator">●</span>
              </div>
              <div className="content">
                <strong className="title">
                  {contact &&
                    (contact.displayName || contact.providerData.displayName)}
                </strong>
                <span className="tag indicator">
                  {contact && (contact.isLoggedIn ? "Online" : "Offline")}
                </span>
              </div>
            </div>
          }
        />
      )}
      {!loading ? (
        <div
          id="Conversations"
          className="w-100 text-center"
          onScroll={onScroll}
          ref={listInnerRef}
        >
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <table>
            <tbody>
              {reachedTop && (
                <tr>
                  <td>Retrieving messages...</td>
                </tr>
              )}
              {conversations &&
                conversations
                  .sort((a, b) => a.createdDate - b.createdDate)
                  .map((message, i) => {
                    let previousMessage = i > 0 ? conversations[i - 1] : null;
                    let nextMessage =
                      i < conversations.length - 1
                        ? conversations[i + 1]
                        : null;

                    return (
                      <MessageBubble
                        key={i}
                        index={i}
                        len={conversations.length}
                        message={message}
                        previousMessage={previousMessage}
                        nextMessage={nextMessage}
                        uid={auth.currentUser.uid}
                      />
                    );
                  })}
            </tbody>
          </table>
          <div ref={scrollRef}></div>
        </div>
      ) : (
        <Loading />
      )}
      <div id="NewMessages" className={hasUnseen && withScroll ? "shown" : ""}>
        <button type="button" onClick={scrollToBottom}>
          {hasUnseen && <small>{unseenMessage} </small>}
          <Icon.ArrowDown />
        </button>
      </div>

      <Form id="Reply" onSubmit={handleOnSend}>
        <Link className="link" to="">
          <Icon.PlusCircleFill style={{ color: "#198754" }} />
        </Link>
        <div className="subForm">
          <Form.Control
            className=""
            type="text"
            ref={messageRef}
            onKeyUp={onKeyUp}
            onFocus={onKeyUp}
            onBlur={onKeyUp}
            autoComplete="off"
            placeholder="Type message..."
            // required
          />
          <Button
            variant="success"
            disabled={sending}
            type="submit"
            style={{ display: showSendButton ? "block" : "none" }}
          >
            <Icon.Send />
          </Button>
        </div>
      </Form>
    </div>
  );
}
