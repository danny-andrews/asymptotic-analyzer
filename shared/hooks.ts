import { Signal, useSignal, computed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { fromSocketEvent } from "./reactivity.js";
import { EVENT_TYPES } from "./constants.js";

import type { Observable } from "rxjs";
import type { Mark } from "./types/index.js";

type Size = {
  width: number;
  height: number;
};

export const useWindowSize = (): Size => {
  const size = useSignal({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      size.value = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size.value;
};

export const useWebSocket = (url: string): Signal<WebSocket | null> => {
  const socket = useSignal<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    console.log("hi", url);
    ws.addEventListener("open", () => {
      console.log("socket open", url);
      socket.value = ws;
    });

    return () => {
      ws.close();
    };
  }, []);

  return socket;
};

const Runner = (socket: WebSocket) => {
  const send = (type: string, payload: object | null = null) => {
    socket.send(JSON.stringify({ type, payload }));
  };

  return {
    startTimeAnalysis(workbenchName: string): Observable<Mark> {
      send(EVENT_TYPES.START_TIME_ANALYSIS, { workbenchName });
      return fromSocketEvent(
        socket,
        EVENT_TYPES.NEW_TIME_MARK,
        EVENT_TYPES.TIME_ANALYSIS_COMPLETE,
        EVENT_TYPES.STOP_TIME_ANALYSIS,
      );
    },
    startSpaceAnalysis(workbenchName: string): Observable<Mark> {
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

export const useRunner = (url: string) => {
  const socket = useWebSocket(url);
  const runner = computed(() => socket.value && Runner(socket.value));

  return runner;
};
