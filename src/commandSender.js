const { gameState, startSession, stopSession } = require("./gameState");
const { DEFAULT_SONG_ID } = require("./config");

function isClientReady() {
  return gameState.client && gameState.client.readyState === 1;
}

function sendJson(payload) {
  if (!isClientReady()) {
    console.log("[SERVER] No active Unity client connected.");
    return false;
  }

  try {
    gameState.client.send(JSON.stringify(payload));
    console.log("[SERVER -> UNITY]", payload);
    return true;
  } catch (error) {
    console.error("[SERVER] Failed to send message:", error.message);
    return false;
  }
}

function sendStart(songId = DEFAULT_SONG_ID) {
  if (gameState.isPlaying) {
    console.log("[SERVER] Game is already running. Stop it first before starting again.");
    return;
  }

  const sent = sendJson({
    command: "start",
    song: Number(songId)
  });

  if (sent) {
    startSession(Number(songId));
  }
}

function sendStop() {
  if (!gameState.isPlaying) {
    console.log("[SERVER] No active game is running.");
    return;
  }

  const sent = sendJson({
    command: "stop"
  });

  if (sent) {
    stopSession();
  }
}

module.exports = {
  sendJson,
  sendStart,
  sendStop
};