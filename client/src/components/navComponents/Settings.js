import React from "react";

function Settings() {
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");

  return (
    <div>
      <div>email: {email}</div>
      <div>username: {username}</div>
    </div>
  );
}

export default Settings;
