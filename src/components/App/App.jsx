import { h, Fragment } from "preact";
import Race from "../Race/Race.jsx";
import { fromSocketEvent } from "../../shared.js";

const { default: workbenches } = await import("/test/workbenches.js");

const Runner = () => {
  let socket = new WebSocket("ws://localhost:3000");

  socket.addEventListener("open", () => {
    console.log("socket connected");
  });
  const send = (name, payload = null) => {
    socket.send(JSON.stringify({ name, payload }));
  };
  return {
    runWorkbench: (workbenchName, iterations) => {
      send("RUN_WORKBENCH", { workbenchName, iterations });
      return fromSocketEvent(socket, "NEW_MARKS", "MARKSET_COMPLETE");
    },
    stopWorkbench: () => {
      send("STOP_WORKBENCH");
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
