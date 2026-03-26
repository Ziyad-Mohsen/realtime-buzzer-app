import { useEffect, useState } from "react";
import styles from "./ToggleKbdButton.module.css";

export default function ToggleKbdButton() {
  const [showKbd, setShowKbd] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleScreenChange = (e: MediaQueryListEvent) => {
      const mobile = e.matches;
      setIsMobile(mobile);

      if (mobile) {
        setShowKbd(false);
      }
    };

    handleScreenChange(mediaQuery as unknown as MediaQueryListEvent);

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  useEffect(() => {
    const documentElement = document.documentElement;

    documentElement.classList.toggle("show-kbd", showKbd);

    return () => {
      documentElement.classList.remove("show-kbd");
    };
  }, [showKbd]);

  if (isMobile) return null;

  return (
    <button
      className={`${styles.toggleBtn} ${
        showKbd ? styles.active : styles.inactive
      }`}
      style={{ display: isMobile ? "none" : "block" }}
      onClick={() => setShowKbd((prev) => !prev)}
    >
      {showKbd ? "Shortcuts On" : "Shortcuts Off"}
    </button>
  );
}
