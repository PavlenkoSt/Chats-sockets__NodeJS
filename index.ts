import express, { Express, Request, Response } from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

import chatSocketHandler from "./sockets/chatSocket";

const PORT = 3000;

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.send(path.join(process.cwd(), "public", "index.html"));
});

chatSocketHandler(io);

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
