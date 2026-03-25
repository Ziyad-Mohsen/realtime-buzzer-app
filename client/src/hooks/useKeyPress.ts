import { useEffect } from "react";

interface UseKeysControlsProps {
  key: string;
  callback: (event: KeyboardEvent) => void;
}

export function useKeysControls(keyControls: UseKeysControlsProps[]) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      keyControls.forEach((keyControl) => {
        if (event.key === keyControl.key) {
          keyControl.callback(event);
        }
      });
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [keyControls]);
}
