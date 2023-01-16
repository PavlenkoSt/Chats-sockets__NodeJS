import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io();

const chatList = document.getElementById("chatList");
const chatBody = document.getElementById("chatBody");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

chatBody.textContent = "<--- Select chat here";

const name = prompt("Your name", "Anonym") || "Guest";

let currentChat = null; // string | null

const addMessageToList = (messageObj) => {
  const div = document.createElement("div");
  div.className = "message";

  const { message, username } = messageObj;

  div.textContent = `${username}: ${message}`;

  chatBody.append(div);
};

const sendMessage = () => {
  const message = input.value;

  if (!message) return;

  socket.emit("sendMessage", { chat: currentChat, message });
  input.value = "";
};

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.keyCode === 13) {
    sendMessage();
  }
});

socket.on("chats", (chats) => {
  if (!chats || !chats.length) return;

  chats.forEach((chat) => {
    const chatname = chat.name;

    const div = document.createElement("div");
    div.className = "chat";
    div.textContent = chatname;

    div.addEventListener("click", function (e) {
      const items = document.getElementsByClassName("chat");

      for (let i = 0; i < items.length; i++) {
        items.item(i).className = "chat";
      }

      this.className += " active";

      if (currentChat) {
        socket.emit("leaveChat", {
          chat: currentChat,
        });
        currentChat = null;
      }

      socket.emit("enterToChat", {
        chat: chatname,
        name,
      });

      currentChat = chatname;
    });
    chatList.append(div);
  });
});

socket.on("initialMessages", (chatDetails) => {
  chatBody.innerHTML = "";

  if (!chatDetails) return;

  const { users, messages } = chatDetails;

  const namesList = users.map((user) => user.name).join(" ");

  const div = document.createElement("div");
  div.id = "usersList";
  div.textContent = `Users list: ${namesList}`;

  chatBody.append(div);

  messages.forEach((messageObj) => {
    addMessageToList(messageObj);
  });
});

socket.on("messageReceive", (messageObj) => {
  console.log("here");
  addMessageToList(messageObj);
});

socket.on("usersUpdated", (users) => {
  const namesList = users.map((user) => user.name).join(" ");
  console.log("namesList", namesList);

  const usersListElem = document.getElementById("usersList");

  if (!usersListElem) return;

  usersListElem.textContent = `Users list: ${namesList}`;
});
