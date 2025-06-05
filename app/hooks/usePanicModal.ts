import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const SKIP_CONFIRM_KEY = "panic_skip_confirm";

function usePanicModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSkipConfirmPreference = async () => {
      try {
        const savedValue = await SecureStore.getItemAsync(SKIP_CONFIRM_KEY);
        if (savedValue !== null) {
          setSkipConfirm(savedValue === "true");
        }
      } catch (error) {
        console.error("Failed to load skip confirm preference:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSkipConfirmPreference();
  }, []);

  const showModal = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleSkipConfirm = useCallback(async () => {
    const newValue = !skipConfirm;
    setSkipConfirm(newValue);

    try {
      await SecureStore.setItemAsync(SKIP_CONFIRM_KEY, newValue.toString());
    } catch (error) {
      console.error("Failed to save skip confirm preference:", error);
      setSkipConfirm(skipConfirm);
    }
  }, [skipConfirm]);

  return {
    isVisible,
    skipConfirm,
    isLoaded,
    showModal,
    hideModal,
    toggleSkipConfirm,
  };
}

export default usePanicModal;