import { format } from "date-fns";
import { auth } from "../firebase";

export default function MessageBubble({
  index,
  len,
  message,
  previousMessage,
  nextMessage,
}) {
  const isSent = message.from === auth.currentUser.uid;
  let isPreviousSameSender = false;
  let isNextSameSender = false;
  let bubbleCounter = 0;
  let sameTime = false;
  let sameTimeNext = false;
  let bubbleClass = "";
  //let newKey = message.id + index;

  //function convertTime() {}

  // if (index === 5) {
  //   console.log(message?.createdDate); //new Date(d * 1000)
  // }

  function secondsToHms(d) {
    let date = new Date(d.seconds * 1000 + d.nanoseconds / 1000000); //.setUTCSeconds(d);
    let now = new Date(Date.now());

    // if (index === 5) {
    //   const fireBaseTime = date.toDateString();
    //   const atTime = date.toLocaleTimeString();

    //   console.log(fireBaseTime, atTime);
    //   console.log(d.toDate());
    // }

    let dateFormat = "";
    let timeFormat = "h:mm a";

    let isSameMonth = format(now, "MMM") === format(date, "MMM");
    let isSameYear = format(now, "yy") === format(date, "yy");
    let isSameWeek = format(now, "w") === format(date, "w");
    let isSameDay = format(now, "d") === format(date, "d");
    let isSameHour = format(now, "H") === format(date, "H");
    let isSameMinute = format(now, "m") === format(date, "m");
    let isWithinAWeek =
      isSameYear && isSameMonth && date.getDay() - now.getDay() < 8;
    //let isOneDayAgo = now.getDay() - date.getDay() === 1;

    if (!isSameMonth) {
      dateFormat += "MMM d";
    }
    if (!isSameYear) {
      dateFormat += ", yyyy ";
    }
    if (!isSameDay) {
      dateFormat += "EEE ";
    }
    if (!isSameWeek) {
      dateFormat = dateFormat.replace("EEE", "");

      if (isSameMonth) {
        dateFormat += "MMM d ";
      }
    }

    if (now.getDay() !== date.getDay()) {
      //dateFormat += "MMM d ";
    }
    if (isWithinAWeek) {
      //weekFormat = format(date, "EEE") + " ";
      //dateFormat = dateFormat.replace("MMM d", "");
    } else {
      //dateFormat = dateFormat.replace("EEE", "");
      //dateFormat += "MMM d ";
    }
    //not same hour
    if (format(now, "h") !== format(date, "h")) {
      //dateFormat += "h ";
    }
    let displayTime = "";
    displayTime =
      (dateFormat && format(date, dateFormat) + " at ") +
      format(date, timeFormat);

    // if (isOneDayAgo) {
    //   dateFormat = dateFormat.replace("EEE", "");
    // displayTime =
    //   "Yesterday" +
    //   (format(date, dateFormat) + " at ") +
    //   format(date, timeFormat);
    // } else {
    if (isSameDay) {
      if (isSameHour) {
        let minutes = now.getMinutes() - date.getMinutes();
        displayTime = minutes === 1 ? "a minute ago" : minutes + " minutes ago";

        if (isSameMinute) {
          displayTime = "now";
        }
      }
      if (!isSameHour && now.getHours() - date.getHours() < 2) {
        displayTime = "an hour ago";
      }
    }
    // }

    return displayTime;
  }

  if (index > 0) {
    sameTime =
      format(new Date(message.createdDate.seconds * 1000), "MMM dd yy h:mm") ===
      format(
        new Date(previousMessage.createdDate.seconds * 1000),
        "MMM dd yy h:mm"
      );
    isPreviousSameSender =
      (message.from === previousMessage.from &&
        message.from === auth.currentUser.uid) ||
      (message.from === previousMessage.from &&
        message.from !== auth.currentUser.uid);
    if (sameTime) {
      if (isPreviousSameSender) {
        bubbleClass = "bubble-last";
        bubbleCounter += 1;
      } else {
        bubbleClass = "bubble-first";
        bubbleCounter = 0;
      }
    } else {
      bubbleCounter = 0;
      bubbleClass = "bubble-first";
    }
  }

  if (index < len - 1) {
    sameTimeNext =
      format(new Date(message.createdDate.seconds * 1000), "MMM dd yy h:mm") ===
      format(
        new Date(nextMessage.createdDate.seconds * 1000),
        "MMM dd yy h:mm"
      );
    isNextSameSender =
      (message.from === nextMessage.from &&
        message.from === auth.currentUser.uid) ||
      (message.from === nextMessage.from &&
        message.from !== auth.currentUser.uid);
    if (sameTimeNext && bubbleCounter > 0) {
      bubbleClass = "bubble-" + (isNextSameSender ? "middle" : "last");
    }
  }

  // if ((!isNextSameSender) && (!isPreviousSameSender)) {
  //   // && 
  //   bubbleClass = "bubble-only";
  // }

  //bubbleClass = "bubble-" + bubbleCounter + " " + bubbleClass;
  //console.log(message)
  try {
    return (
      <>
        {!sameTime && (
          <>
            {index !== 0 && (
              <tr>
                <td>&nbsp;</td>
              </tr>
            )}
            <tr>
              <td>
                <small>{secondsToHms(message.createdDate)}</small>
              </td>
            </tr>
          </>
        )}
        <tr className={bubbleClass}>
          <td>
            <p className={isSent ? "sent" : "recieved"}>
              {message.message} {message.status === 0}
            </p>
          </td>
        </tr>
      </>
    );
  } catch (e) {
    //console.error(e.message);
    return (
      <>
        {!sameTime && (
          <>
            {index !== 0 && (
              <tr>
                <td>&nbsp;</td>
              </tr>
            )}
            <tr>
              <td>
                <small>Can't load timestamp</small>
              </td>
            </tr>
          </>
        )}
        <tr className={bubbleClass}>
          <td>
            <p className={isSent ? "sent" : "recieved"}>Can't load message</p>
          </td>
        </tr>
      </>
    );
  }
}
