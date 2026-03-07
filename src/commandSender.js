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
  const sent = sendJson({
    command: "start",
    song: Number(songId)
  });

  if (sent) {
    startSession(Number(songId));
  }
}

function sendStop() {
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