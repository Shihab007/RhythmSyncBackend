const WebSocket = require("ws");
const readline = require("readline");

const { HOST, PORT } = require("./config");
const { handleMessage } = require("./messageHandler");
const { sendStart, sendStop, sendJson } = require("./commandSender");
const { setClient, clearClient, getSnapshot, gameState } = require("./gameState");

const wss = new WebSocket.Server({
  host: HOST,
  port: PORT
});

let clientCounter = 0;

wss.on("listening", () => {
  console.log(`\n[SERVER] WebSocket server running at ws://${HOST}:${PORT}`);
  console.log("[SERVER] Waiting for Unity client connection...\n");
  printTerminalHelp();
});

wss.on("connection", (ws, req) => {
  clientCounter += 1;
  const clientId = `client-${clientCounter}`;

  setClient(ws, clientId);

  console.log(`[SERVER] Unity connected: ${clientId}`);
  console.log(`[SERVER] Remote address: ${req.socket.remoteAddress}`);

  ws.on("message", (message) => {
    handleMessage(ws, message);
  });

  ws.on("close", () => {
    if (gameState.clientId === clientId) {
      clearClient();
    }
    console.log(`[SERVER] Unity disconnected: ${clientId}`);
  });

  ws.on("error", (error) => {
    console.error(`[SERVER] Client error (${clientId}):`, error.message);
  });

  ws.send(
    JSON.stringify({
      command: "server_connected",
      message: "Backend connected successfully"
    })
  );
});

wss.on("error", (error) => {
  console.error("[SERVER] WebSocket server error:", error.message);
});

function printTerminalHelp() {
  console.log("Terminal commands:");
  console.log("  start <songId>   -> Start game with song id");
  console.log("  stop             -> Stop the game");
  console.log("  status           -> Print backend runtime state");
  console.log("  ping             -> Send ping to Unity");
  console.log("  help             -> Show commands");
  console.log("  exit             -> Stop backend\n");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("line", (input) => {
  const [command, arg] = input.trim().split(/\s+/);

  switch (command) {
    case "start":
      sendStart(arg || 1);
      break;

    case "stop":
      sendStop();
      break;

    case "status":
      console.log("[SERVER STATE]", getSnapshot());
      break;

    case "ping":
      sendJson({ command: "ping" });
      break;

    case "help":
      printTerminalHelp();
      break;

    case "exit":
      console.log("[SERVER] Shutting down...");
      rl.close();
      wss.close(() => {
        process.exit(0);
      });
      break;

    case "":
      break;

    default:
      console.log(`[SERVER] Unknown terminal command: ${command}`);
      printTerminalHelp();
      break;
  }
});

process.on("SIGINT", () => {
  console.log("\n[SERVER] Caught SIGINT. Closing server...");
  rl.close();
  wss.close(() => {
    process.exit(0);
  });
});