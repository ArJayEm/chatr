import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Image } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { auth, firestore } from "../firebase";
import NavigationBar from "./NavigationBar";

//import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
//import { format } from "date-fns";

import DownIcon from "mdi-react/ArrowDownIcon";
import defaultUser from "../images/default_user.jpg";
import MessageBubble from "./MessageBubble";

export default function Conversation() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  //const [messages, setMessages] = useState(null);
  let { uid: contactId } = useParams();
  const [contact, setContact] = useState();
  //const [conversations, setConversations] = useState();
  const messageRef = useRef();
  const scrollRef = useRef();
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [withScroll, setWithScroll] = useState(false);

  let from = auth.currentUser.uid + " - " + contactId;
  let to = contactId + " - " + auth.currentUser.uid;
  let senders = [from, to];
  let messagesCollection = firestore
    .collection("messages")
    .where("senders", "in", senders); //.limit(10);
  let conversationFilter = messagesCollection;
  let [conversations] = useCollectionData(conversationFilter);
  let unseenFilter = messagesCollection
    .where("status", "==", 0)
    .where("to", "==", auth.currentUser.uid);
  let unseenCount = 0;
  unseenFilter.get().then((snapshots) => {
    unseenCount = snapshots.docs.length;
    //console.log(unseenCount);
    setConversationsHeight();
    setShowNewMessageButton(unseenCount > 0);
  });
  let usersCollection = firestore.collection("users");

  useEffect(
    () => {
      getContact();
      setConversationsHeight();
    },
    //eslint-disable-next-line
    []
  );

  function setConversationsHeight() {
    let navbarHeight =
      document.getElementsByClassName("navbar")[0].offsetHeight;
    let contactHeight =
      document.getElementsByClassName("contact")[0].offsetHeight;
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

    if (tableHeight <= conversationsHeight) {
      setWithScroll(false);
      seenNewMessages();
    } else {
      setWithScroll(true);
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
      })
      .finally(() => {})
      .catch((e) => {
        catchError(e, "get-contact-error.");
      });
  }

  async function handleOnSend(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setSending(true);

    await firestore
      .collection("messages")
      .add({
        createdDate: new Date(Date.now()),
        message: messageRef.current.value,
        to: contactId,
        from: auth.currentUser.uid,
        senders: from,
        status: 0,
      })
      .then(() => {
        messageRef.current.value = "";
      })
      .catch((e) => {
        setSending(false);
        console.error(e);
        return setError("Message not sent.");
      });

    if (!withScroll) {
      setConversationsHeight();
    }
    scrollToBottom();
    setSending(false);
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
      //console.log(currentScrollPosition === divScrollHeight);
      if (currentScrollPosition === divScrollHeight) {
        seenNewMessages();
      }
    }
  };

  async function seenNewMessages() {
    //if (unseenCount > 0) {
    await unseenFilter.get().then((snapshots) => {
      //console.log(snapshots.docs.length);
      //console.log("reached bottom");
      //console.log("seen all new messages");
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
      setShowNewMessageButton(unseenCount > 0);
    });
    // } else {
    //   //console.log("none to be seen");
    // }
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

  // let navbarHeight = document.getElementsByClassName("navbar").offsetHeight;
  // let contactHeight = document.getElementsByClassName("contact").offsetHeight;
  // let replyHeight = document.getElementById('#Reply').offsetHeight;
  // let conversationsDiv = document.getElementById('#Conversations');
  // console.log(navbarHeight + contactHeight + replyHeight);

  return (
    <div className="page">
      <NavigationBar />
      <div className="contact contact_medium w-100" style={{ display: "flex" }}>
        <div className="user-icon">
          <Image
            roundedCircle
            onError={() => handleOnError}
            src={(contact && contact.providerData.photoURL) || defaultUser}
            alt=""
            style={{ width: "3em" }}
          />
          <span
            className={
              contact && contact.isLoggedIn ? "logged-in" : "logged-out"
            }
          >
            ●
          </span>
        </div>
        &nbsp;&nbsp;
        <div style={{ display: "grid" }}>
          {contact && (contact.displayName || contact.providerData.displayName)}
          {contact && contact.isLoggedIn ? (
            <strong style={{ color: "#198754" }}>Online</strong>
          ) : (
            <strong style={{ color: "#dc3545" }}>Offline</strong>
          )}
        </div>
      </div>
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
            {conversations &&
              conversations
                .sort((a, b) => a.createdDate - b.createdDate)
                .map((message, i) => {
                  let previousMessage = i > 0 ? conversations[i - 1] : null;
                  let nextMessage =
                    i < conversations.length - 1 ? conversations[i + 1] : null;

                  return (
                    <MessageBubble
                      key={i}
                      index={i}
                      len={conversations.length}
                      message={message}
                      previousMessage={previousMessage}
                      nextMessage={nextMessage}
                      uid={auth.currentUser.uid}
                      // ref={i === conversations.length - 1 ? scrollRef : null}
                    />
                  );
                })}
          </tbody>
          {/* <tfoot>
          {newConversations &&
            newConversations.map((message, i) => {
              let previousMessage = i > 0 ? newConversations[i - 1] : null;
              let nextMessage =
                i < newConversations.length - 1
                  ? newConversations[i + 1]
                  : null;

              return (
                <MessageBubble
                  key={message.id}
                  index={i}
                  len={newConversations.length}
                  message={message}
                  previousMessage={previousMessage}
                  nextMessage={nextMessage}
                  uid={auth.currentUser.uid}
                />
              );
            })}
        </tfoot> */}
        </table>
        <div ref={scrollRef}></div>
      </div>
      <div
        id="NewMessages"
        style={{ display: showNewMessageButton && withScroll ? "" : "none" }}
      >
        <button type="button" onClick={scrollToBottom}>
          {/* <small>
          New Message
          {unseenCount > 1 ? "s " : " "}
        </small> */}
          <DownIcon />
        </button>
      </div>
      <Form id="Reply" onSubmit={handleOnSend}>
        <div className="subForm">
          <Form.Control
            type="text"
            ref={messageRef}
            placeholder="Reply..."
            required
          />
          <Button variant="success" disabled={sending} type="submit">
            Send
          </Button>
        </div>
      </Form>
    </div>
  );
}

<script type="text/javascript">
  let height = document.getElementsByClassName('contact')[0].offsetHeight +
  document.getElementsByClassName('navbar')[0].offsetHeight;
  document.getElementsByClassName('page')[0].
</script>;
