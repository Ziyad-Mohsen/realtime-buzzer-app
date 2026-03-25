import { useMemo } from "react";

export default function useAudio(sound: string) {
  const audio = useMemo<HTMLAudioElement>(() => {
    return new Audio(sound);
  }, [sound]);

  const play = () => {
    audio.play();
  };

  const pause = () => {
    audio.pause();
  };

  const stop = () => {
    audio.pause();
    // eslint-disable-next-line react-hooks/immutability
    audio.currentTime = 0;
  };

  return { play, pause, stop };
}
