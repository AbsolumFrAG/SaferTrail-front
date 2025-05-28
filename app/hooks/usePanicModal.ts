import { useCallback, useState } from "react";

function usePanicModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [skipConfirm, setSkipConfirm] = useState(false);

  const showModal = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggleSkipConfirm = useCallback(() => {
    setSkipConfirm((prev) => !prev);
  }, []);

  return {
    isVisible,
    skipConfirm,
    showModal,
    hideModal,
    toggleSkipConfirm,
  };
}

export default usePanicModal;