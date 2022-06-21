import {Server, Socket} from 'socket.io';


export const SocServer = ( http) => {
  const io = new Server(http);
  io.clients = {};

  io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  io.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
//      socket.connect();
    }
    console.log(`disconneted event`);
  });

  io.on('connection', function(socket) {
    console.log('Socket connection established')
    socket.on('SIGNIN', (id) => {
      io.clients[id] = socket;
//console.log(io.clients);
    });

    socket.on('DIALOGS:JOIN', (dialogId) => {
      socket.dialogId = dialogId;
      socket.join(dialogId);
    });

    socket.on('DIALOGS:TYPING', (obj) => {
      socket.broadcast.emit('DIALOGS:TYPING', obj);
    });
  });

  return io;
};

// import { WebSocketServer } from 'ws';
//
// export const SocServer = (http) => {
//   console.log(http)
//   const ws = new WebSocketServer({"port":8089});
//
//     ws.on('connection', function(socket) {
//     console.log('Socket connection established')
//     socket.on('message', (msg) => {
//       console.log(`Message:${msg}`);
//       // broadcast(msg);
//     });
//     socket.on('DIALOGS:TYPING', (obj) => {
//       socket.broadcast.emit('DIALOGS:TYPING', obj);
//     });
//   });
// }
// function broadcast(msg) {       // (4)
//   for(const client of ws.clients){
//     if(client.readyState === ws.OPEN){
//       client.send(msg)
//     }
//   }
// }
