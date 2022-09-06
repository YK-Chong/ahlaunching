var connected = false;
var onReceiveMessageCallback;

function connect(userType, onReceiveMessage) {
  if (!connected) {
    connected = true;
    tryConnectToWS(userType);
    onReceiveMessageCallback = onReceiveMessage;
    setInterval(() => tryConnectToWS(userType), 1000);
  }
}

function tryConnectToWS(userType) {
  if (ws == undefined || ws.readyState === ws.CLOSED) {
    console.log("Try connect: " + new Date());
    const wss = new WebSocket("wss://quixotic-grey-ceiling.glitch.me/");
    wss.on("open", () => {
      console.log("We are connected");
      ws.send("Connect:" + userType);
    });

    wss.on("message", function (event) {
      onReceiveMessageCallback(event.data);
    });

    wss.on("error", function (event) {
      console.log(event.data);
    });
  } else if (ws.readyState === ws.OPEN) {
    console.log("Ping WS");
    //ws.send('Ping');
  }
}
