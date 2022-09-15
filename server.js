const WebSocket = require("ws");

const PORT = 5000;

// 0 - Waiting, 1 - Start, 2 - End

const wsServer = new WebSocket.Server({
    port: PORT,
});

const USER_TYPE_USER = "User";
const USER_TYPE_ADMIN = "Admin";
const USER_TYPE_SCREEN = "Screen";

var currentState = "0";
var connectedClients = [];

function currentStateMsg() {
    return "CurrentState:" + currentState;
}

function changeState(state) {
    currentState = state;
    wsServer.clients.forEach((client) => client.send(currentStateMsg()));
}

function sendAdminNumOfConnectedClients() {
    getAdmins().forEach((admin) =>
        admin.Socket.send("ConnectedUsers:" + getUsers().length)
    );
}

function sendNumOfConnectedClients() {
    let clients = wsServer.clients;
    let numberOfAdmins = getAdmins().length <= 0 ? 1 : getAdmins().length;
    let numOfConnectedUsers =
        clients.length - numberOfAdmins - getScreens().length;
    if (numOfConnectedUsers < 0) numOfConnectedUsers = 0;
    clients.forEach((client) =>
        client.send("ConnectedUsers:" + getUsers().length)
    );
}

function getAdmins() {
    return connectedClients.filter((client) => client.Type === USER_TYPE_ADMIN);
}

function getUsers() {
    return connectedClients.filter((client) => client.Type === USER_TYPE_USER);
}

function getScreens() {
    return connectedClients.filter((client) => client.Type === USER_TYPE_SCREEN);
}

function getNumberOfUsersMessage() {
    let userDetail = {
        wsClients: wsServer.clients.size,
        myClients: connectedClients.length,
        user: getUsers().length,
        admin: getAdmins().length,
        screen: getScreens().length,
    };
    console.log(userDetail);
}

wsServer.on("connection", function (socket) {
    // Some feedback on the console
    console.log("A client just connected");

    // Attach some behavior to the incoming socket
    socket.on("message", function (msg) {
        if (!msg.includes("Ping") && !msg.includes("GetState"))
            console.log("Received message from client: " + msg);
        if (msg.includes("Connect:")) {
            connectedClients.push({ Socket: socket, Type: msg.split(":")[1] });
            socket.send(currentStateMsg());
            console.log(
                "MyClient: " +
                connectedClients.length +
                ", WsClient: " +
                wsServer.clients.size
            );
            sendNumOfConnectedClients();
        } else if (msg.includes("ChangeState:")) {
            changeState(msg.split(":")[1]);
        } else if (msg.includes("NumberOfUsers")) {
            getNumberOfUsersMessage();
        }
        else if (msg.includes("GetState")) {
            socket.send(currentStateMsg());
        }
    });

    socket.on("close", function () {
        let client = connectedClients.findIndex((c) => c.Socket === socket);
        if (client != undefined && client != null)
            connectedClients.splice(client, 1);
        console.log("Client disconnected");
        console.log(
            "MyClient: " +
            connectedClients.length +
            ", WsClient: " +
            wsServer.clients.size
        );
        //sendAdminNumOfConnectedClients();
        sendNumOfConnectedClients();
        if (wsServer.clients.size === 0) connectedClients = [];
    });
});
