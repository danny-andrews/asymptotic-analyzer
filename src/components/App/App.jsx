import Race from "../Race/Race.jsx";
import { fromSocketEvent, EVENT_TYPES } from "../../shared/index.js";

const { default: workbenches } = await import("/test/workbenches.js");

const Runner = () => {
  const socket = new WebSocket("ws://localhost:3000");

  const send = (type, payload = null) => {
    socket.send(JSON.stringify({ type, payload }));
  };

  return {
    startTimeAnalysis: (workbenchName) => {
      send(EVENT_TYPES.START_TIME_ANALYSIS, { workbenchName });
      return fromSocketEvent(
        socket,
        EVENT_TYPES.NEW_TIME_MARK,
        EVENT_TYPES.TIME_ANALYSIS_COMPLETE,
        EVENT_TYPES.STOP_TIME_ANALYSIS,
      );
    },
    startSpaceAnalysis: (workbenchName) => {
      send(EVENT_TYPES.START_SPACE_ANALYSIS, { workbenchName });
      return fromSocketEvent(
        socket,
        EVENT_TYPES.NEW_SPACE_MARK,
        EVENT_TYPES.SPACE_ANALYSIS_COMPLETE,
        EVENT_TYPES.STOP_SPACE_ANALYSIS,
      );
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
