import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const chats: IChat[] = [
  {
    name: "Guests",
    messages: [
      {
        username: "Vasya",
        message: "Message from guests chat",
      },
    ],
    users: [],
  },
  {
    name: "Big guns",
    messages: [
      {
        username: "Vasya",
        message: "Message from guests chat",
      },
    ],
    users: [],
  },
  {
    name: "Dota funs",
    messages: [
      {
        username: "Vasya",
        message: "Message from guests chat",
      },
    ],
    users: [],
  },
];

const findChat = (chatname: string) => {
  const targetChatDetails = chats.find((chatObj) => chatObj.name === chatname);

  return targetChatDetails;
};

const chatSocketHandler = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.emit("chats", chats);

    socket.on("disconnect", (reason) => {
      console.log("user disconnected ->", reason);

      chats.forEach((chat) => {
        chat.users = chat.users.filter((user) => user.id !== socket.id);
      });
    });

    socket.on(
      "enterToChat",
      ({ chat, name }: { chat: string; name: string }) => {
        const targetChatDetails = findChat(chat);

        if (!targetChatDetails) return;

        targetChatDetails.users.push({
          id: socket.id,
          name,
        });

        socket.join(chat);

        io.to(chat).emit("usersUpdated", targetChatDetails.users);

        socket.emit("initialMessages", targetChatDetails);
      }
    );

    socket.on("leaveChat", ({ chat }: { chat: string }) => {
      const targetChatDetails = findChat(chat);

      if (!targetChatDetails) return;

      targetChatDetails.users = targetChatDetails.users.filter(
        (user) => user.id !== socket.id
      );

      socket.leave(chat);

      io.to(chat).emit("usersUpdated", targetChatDetails.users);
    });

    socket.on(
      "sendMessage",
      ({ chat, message }: { chat: string; message: string }) => {
        const targetChatDetails = findChat(chat);

        if (!targetChatDetails) return;

        const targetUser = targetChatDetails.users.find(
          (user) => user.id === socket.id
        );

        if (!targetUser) return;

        const messageObj = {
          message,
          username: targetUser.name,
        };

        targetChatDetails.messages.push(messageObj);

        io.to(chat).emit("messageReceive", messageObj);
      }
    );
  });
};

export default chatSocketHandler;

interface IChat {
  name: string;
  messages: {
    username: string;
    message: string;
  }[];
  users: {
    id: string;
    name: string;
  }[];
}
