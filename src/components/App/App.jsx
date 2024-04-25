import Race from "../Race/Race.jsx";
import { fromSocketEvent } from "../../shared.js";

const { default: workbenches } = await import("/test/workbenches.js");

const Runner = () => {
  let socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("open", () => {
    console.log("socket connected");
  });
  const send = (type, payload = null) => {
    socket.send(JSON.stringify({ type, payload }));
  };

  return {
    startTimeAnalysis: (workbenchName, iterations) => {
      send("START_TIME_ANALYSIS", { workbenchName, iterations });
      return fromSocketEvent(socket, "NEW_TIME_MARK", "TIME_ANALYSIS_COMPLETE");
    },
    stopTimeAnalysis: () => {
      send("STOP_TIME_ANALYSIS");
    },
    startSpaceAnalysis: (workbenchName) => {
      send("START_SPACE_ANALYSIS", { workbenchName });
      return fromSocketEvent(
        socket,
        "NEW_SPACE_MARK",
        "SPACE_ANALYSIS_COMPLETE"
      );
    },
    stopSpaceAnalysis: () => {
      send("STOP_SPACE_ANALYSIS");
    },
  };
};

const App = () => {
  const runner = Runner();

  return (
    <main>
      <Race workbenches={workbenches} runner={runner} />
    </main>
  );
};

export default App;
