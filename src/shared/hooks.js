import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export const useWindowSize = () => {
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
