import React from "react";

const SocketContext = React.createContext();

export default SocketContext;

// import { io } from "socket.io-client";

// const SocketContext = new io("http://localhost:8000", {
//   autoConnect: false,
//   withCredentials: true,
// });

// export default SocketContext;
