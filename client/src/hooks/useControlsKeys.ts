import { useEffect } from "react";

interface UseKeysControlsProps {
  key: string;
  callback: (event: KeyboardEvent) => void;
}

export function useControlsKeys(keyControls: UseKeysControlsProps[]) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      keyControls.forEach((keyControl) => {
        const currentElement = document.activeElement;
        const tagName = currentElement?.tagName.toLowerCase();

        // Check if the active element is an input or textarea
        if (tagName === "input" || tagName === "textarea") {
          return;
        }

        // Check if the event has any modifier keys pressed
        if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
          return;
        }

        if (event.key === keyControl.key || event.code === keyControl.key) {
          event.preventDefault();
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
