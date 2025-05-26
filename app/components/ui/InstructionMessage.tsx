import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants";

interface InstructionMessageProps {
  message: string;
}

export const InstructionMessage = memo<InstructionMessageProps>(
  ({ message }) => (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
);

InstructionMessage.displayName = "InstructionMessage";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: COLORS.WHITE,
    fontSize: 16,
    textAlign: "center",
  },
});
