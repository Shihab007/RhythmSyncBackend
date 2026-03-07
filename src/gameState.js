const gameState = {
  client: null,
  clientId: null,
  isPlaying: false,
  currentSong: null,
  sessionStartedAt: null,
  lastScoreEvent: null,
  lastResult: null
};

function setClient(ws, clientId) {
  gameState.client = ws;
  gameState.clientId = clientId;
}

function clearClient() {
  gameState.client = null;
  gameState.clientId = null;
}

function startSession(songId) {
  gameState.isPlaying = true;
  gameState.currentSong = songId;
  gameState.sessionStartedAt = new Date().toISOString();
  gameState.lastScoreEvent = null;
  gameState.lastResult = null;
}

function stopSession() {
  gameState.isPlaying = false;
}

function setLastScoreEvent(payload) {
  gameState.lastScoreEvent = {
    ...payload,
    receivedAt: new Date().toISOString()
  };
}

function setLastResult(payload) {
  gameState.lastResult = {
    ...payload,
    receivedAt: new Date().toISOString()
  };
  gameState.isPlaying = false;
}

function getSnapshot() {
  return {
    clientConnected: !!gameState.client,
    clientId: gameState.clientId,
    isPlaying: gameState.isPlaying,
    currentSong: gameState.currentSong,
    sessionStartedAt: gameState.sessionStartedAt,
    lastScoreEvent: gameState.lastScoreEvent,
    lastResult: gameState.lastResult
  };
}

module.exports = {
  gameState,
  setClient,
  clearClient,
  startSession,
  stopSession,
  setLastScoreEvent,
  setLastResult,
  getSnapshot
};