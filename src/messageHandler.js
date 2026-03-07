const {
  setLastScoreEvent,
  setLastResult,
  stopSession,
  getSnapshot
} = require("./gameState");

function safeParse(rawMessage) {
  try {
    return JSON.parse(rawMessage.toString());
  } catch (error) {
    return null;
  }
}

function handleMessage(ws, rawMessage) {
  const data = safeParse(rawMessage);

  if (!data) {
    console.log("[UNITY -> SERVER] Invalid JSON:", rawMessage.toString());
    return;
  }

  const { command } = data;

  if (!command) {
    console.log("[UNITY -> SERVER] Missing command:", data);
    return;
  }

  switch (command) {
    case "ready":
      console.log("[UNITY] Client is ready.");
      break;

    case "score":
      setLastScoreEvent(data);
      console.log("[UNITY SCORE]", {
        song: data.song,
        rating: data.rating,
        score: data.score,
        combo: data.combo
      });
      break;

    case "result":
      setLastResult(data);
      console.log("[UNITY RESULT]", {
        song: data.song,
        finalScore: data.finalScore,
        perfect: data.perfect,
        great: data.great,
        good: data.good,
        miss: data.miss,
        maxCombo: data.maxCombo,
        grade: data.grade
      });
      break;

    case "state":
      console.log("[UNITY STATE]", data);
      break;

    case "stopped":
      stopSession();
      console.log("[UNITY] Game stopped.");
      break;

    case "pong":
      console.log("[UNITY] Pong received.");
      break;

    case "ping":
      ws.send(JSON.stringify({ command: "pong" }));
      console.log("[SERVER -> UNITY] { command: 'pong' }");
      break;

    case "status":
      console.log("[UNITY STATUS REQUEST]");
      ws.send(
        JSON.stringify({
          command: "status",
          data: getSnapshot()
        })
      );
      break;

    default:
      console.log("[UNITY -> SERVER] Unknown command:", data);
      break;
  }
}

module.exports = {
  handleMessage
};