import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";

const audioSource = require("../../assets/sounds/siren.mp3");

export function useAudio() {
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  const isPlaying = useMemo(() => status.playing, [status.playing]);

  const startSiren = useCallback((): void => {
    try {
      player.loop = true;
      player.play();
    } catch (err) {
      console.error("Error starting siren:", err);
      Alert.alert("Error", "Failed to start siren");
    }
  }, [player]);

  const stopSiren = useCallback((): void => {
    try {
      player.pause();
      player.seekTo(0);
    } catch (err) {
      console.error("Error stopping siren:", err);
      Alert.alert("Error", "Failed to stop siren");
    }
  }, [player]);

  const toggleSiren = useCallback((): void => {
    if (isPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  }, [isPlaying, startSiren, stopSiren]);

  return {
    isPlaying,
    startSiren,
    stopSiren,
    toggleSiren,
  };
}
