import Race from "../Race/Race.tsx";
import { useRunner } from "../../shared/index.ts";

// @ts-ignore
const { default: workbenches } = await import("/test/workbenches.js");

const App = () => {
  const runner = useRunner("ws://localhost:3000");
  console.log('runner', runner.value)

  return (
    <main>
      {runner.value && <Race workbenches={workbenches} runner={runner.value} />}
    </main>
  );
};

export default App;
