import React, { useEffect, useRef } from "react";
import SlateInput from "./SlateInput";
function Homepage() {
  //send message
  const onMessageSubmit = (messages) => {
    console.log(messages);
  };
  // const inputRef = useRef(null);

  // useEffect(() => {
  //   inputRef.current.focus();
  // }, []);

  return (
    <div>
      <SlateInput onMessageSubmit={onMessageSubmit} />
      {/* <input type="text" ref={inputRef} /> */}
    </div>
  );
}

export default Homepage;
