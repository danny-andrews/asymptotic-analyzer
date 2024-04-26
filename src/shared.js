import { Observable } from "rxjs";
import { useState, useEffect } from "preact/hooks";

export const pipeline = (arg, ...fns) => fns.reduce((v, fn) => fn(v), arg);

export const noop = () => {};

export const wait = (time) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(time), time);
  });

export const fromSocketEvent = (
  socket,
  eventType,
  endEventType = null,
  cancelEventType = null
) =>
  new Observable((observer) => {
    const listener = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type === eventType) {
        observer.next(payload);
      }
      if (type === endEventType) {
        observer.complete();
      }
    };

    socket.addEventListener("message", listener);

    return () => {
      if (cancelEventType) {
        socket.send(JSON.stringify({ type: cancelEventType }));
      }

      socket.removeEventListener("message", listener);
    };
  });

export const fromWorkerEvent = (worker, eventType, endEventType = null) =>
  new Observable((observer) => {
    worker.on("message", ({ type, payload }) => {
      if (type === eventType) {
        observer.next(payload);
      }
      if (type === endEventType) {
        observer.complete();
      }
    });

    return () => {
      worker.terminate();
    };
  });

export const throttle = (cb, delay) => {
  let wait = false;

  return (...args) => {
    if (wait) return;

    cb(...args);
    wait = true;
    setTimeout(() => {
      wait = false;
    }, delay);
  };
};

export const median = (nums) => {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  if (n === 1) return nums[0];

  return (nums[Math.floor(n / 2)] + nums[Math.ceil(n / 2)]) / 2;
};

export const mean = (nums) =>
  nums.reduce((sum, num) => sum + num, 0) / nums.length;

export const standardDeviation = (nums) => {
  const n = nums.length;
  const sampleMean = mean(nums);

  return Math.sqrt(
    nums.reduce((sum, num) => sum + (num - sampleMean) ** 2) / (n - 1)
  );
};

export const standardError = (nums) =>
  standardDeviation(nums) / Math.sqrt(nums.length);

export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: null,
    height: null,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
};

export const EVENTS = {
  START_TIME_ANALYSIS: "START_TIME_ANALYSIS",
  STOP_TIME_ANALYSIS: "STOP_TIME_ANALYSIS",
  START_SPACE_ANALYSIS: "START_SPACE_ANALYSIS",
  STOP_SPACE_ANALYSIS: "STOP_SPACE_ANALYSIS",
  NEW_TIME_MARK: "NEW_TIME_MARK",
  TIME_ANALYSIS_COMPLETE: "TIME_ANALYSIS_COMPLETE",
  SPACE_ANALYSIS_COMPLETE: "SPACE_ANALYSIS_COMPLETE",
};

export const handleMessages = (source, handlers) => {
  source.on("message", (message) => {
    if (message instanceof Buffer) {
      message = JSON.parse(message.toString());
    }

    if (handlers[message.type] === undefined) {
      throw new Error(`Unrecognized message type given: ${message.type}`);
    }

    handlers[message.type](message.payload);
  });
};
