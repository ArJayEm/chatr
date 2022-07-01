import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Image } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Link, useParams } from "react-router-dom";

import { auth, firestore } from "../../firebase";
import defaultUserImage from "../../images/default_user.jpg";
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
  const [unseenMessage, setUnseenMessage] = useState("");
  const messageRef = useRef(null);
  const scrollRef = useRef(null);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [withScroll, setWithScroll] = useState(false);
  const [reachedTop, setReachedTop] = useState(false);
  let from = auth.currentUser.uid + " - " + contactId;
  let to = contactId + " - " + auth.currentUser.uid;
  let senders = [from, to];
  const [showSendButton, setShowSendButton] = useState(false);
  const onKeyUp = () => setShowSendButton(messageRef.current.value.length > 0);
  //const onBlur = () => setShowSendButton(false);

  let messagesCollection = firestore
    .collection("messages")
    .where("senders", "in", senders);

  let unseenFilter = messagesCollection
    .where("status", "==", 0)
    .where("to", "==", auth.currentUser.uid);
  let unseenCount = 0;
  unseenFilter.get().then((snapshots) => {
    // console.log(snapshots.exists)
    // if (snapshots.exists) {
    unseenCount = snapshots.docs.length;
    if (unseenCount > 0) {
      //console.log(snapshots.docs.sort((a, b) => b.data().createdDate.seconds - a.data().createdDate.seconds).map((e, i) => i === 0 ? e.data().message : null).filter((e) => e) ?? "")
      //setConversationsHeight();
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
    setConversationsHeight();
  });

  let conversationFilter = messagesCollection; //hasUnseen ? messagesCollection : messagesCollection.limit(10);
  let [conversations] = useCollectionData(conversationFilter);
  //lastIndex = conversations.reverse().map((e) => e.uid);
  //console.log(conversations.map((e) => {return e.uid}));

  let usersCollection = firestore.collection("users");

  useEffect(
    () => {
      getContact();
      //setConversationsHeight();
    },
    //eslint-disable-next-line
    []
  );

  function setConversationsHeight() {
    let navbarHeight = 0; //document.getElementsByClassName("navbar")[0].offsetHeight;
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
      //seenNewMessages();
    } else {
      setWithScroll(true);
      //scrollToBottom();
    }
    //console.log(withScroll, hasUnseen)
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

    if (messageRef.current.value.length > 0) {
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
      scrollToBottom();
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
      //console.log(currentScrollPosition === divScrollHeight);
      if (currentScrollPosition === divScrollHeight) {
        seenNewMessages();
      }
      setReachedTop(scrollTop === 0);
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
      setHasUnseen(unseenCount > 0);
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
      {/* <NavigationBar /> */}
      <div className="contact contact_small">
        <Link className="link" to="/">
          <Icon.ArrowLeftShort style={{ color: "#198754" }} />
        </Link>
        <div className="user-icon">
          <Image
            roundedCircle
            onError={() => handleOnError}
            src={(contact && contact.providerData.photoURL) || defaultUserImage}
            alt=""
            style={{ width: "2em" }}
          />
          <span
            className={
              contact && contact.isLoggedIn ? "logged-in" : "logged-out"
            }
          >
            ●
          </span>
        </div>
        <div
          style={{ display: "grid", height: "fit-content", fontSize: "0.8em" }}
        >
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
        // style={{ display: hasUnseen && withScroll ? "" : "none" }}
        className={hasUnseen && withScroll ? "shown" : ""}
      >
        <button type="button" onClick={scrollToBottom}>
          {/* <small>
          New Message
          {unseenCount > 1 ? "s " : " "}
        </small> */}
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
            className="form"
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

<script type="text/javascript">
  {/* let height = document.getElementsByClassName('contact')[0].offsetHeight +
  document.getElementsByClassName('navbar')[0].offsetHeight;
  document.getElementsByClassName('page')[0]. */}
</script>;
