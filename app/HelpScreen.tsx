import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FC, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { EmergencyButtons } from "./components/help/EmergencyButtons";
import { InfoSection } from "./components/help/InfoSection";
import { PanicModal } from "./components/help/PanicModal";
import { SafetyLegend } from "./components/help/SafetyLegend";
import { useAudio } from "./hooks/useAudio";
import { usePanicModal } from "./hooks/usePanicModal";

import { COLORS } from "./constants";

const HelpScreenInner: FC = () => {
  const router = useRouter();
  const { isPlaying, startSiren, toggleSiren } = useAudio();
  const {
    isVisible: modalVisible,
    skipConfirm,
    showModal,
    hideModal,
    toggleSkipConfirm,
  } = usePanicModal();

  const handlePanicPress = useCallback((): void => {
    if (isPlaying) {
      toggleSiren();
    } else if (skipConfirm) {
      startSiren();
    } else {
      showModal();
    }
  }, [isPlaying, skipConfirm, toggleSiren, startSiren, showModal]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.backText}>Return</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafetyLegend />
        <InfoSection />
      </ScrollView>

      {/* Emergency Buttons */}
      <EmergencyButtons
        onPanicPress={handlePanicPress}
        sirenActive={isPlaying}
      />

      {/* Panic Modal */}
      <PanicModal
        visible={modalVisible}
        skipConfirm={skipConfirm}
        onClose={hideModal}
        onToggleSkipConfirm={toggleSkipConfirm}
        onStartSiren={startSiren}
      />
    </View>
  );
};

// Main component with error boundary
const HelpScreen: FC = () => (
  <ErrorBoundary>
    <HelpScreenInner />
  </ErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: COLORS.BACKGROUND,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  backText: {
    color: COLORS.PRIMARY,
    fontSize: 18,
    marginLeft: 4,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 160,
  },
});

export default HelpScreen;
