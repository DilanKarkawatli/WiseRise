import { Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { useState } from "react";
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View
} from "react-native";

export default function Onboarding({ visible = false, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");

  const handleSubmit = async () => {
    console.log(name, email, goal);
    await onSubmit?.({ name, email, goal });
  };
  const [fontsLoaded] = useFonts({
	Inter_600SemiBold,
  });

  if (!fontsLoaded) {
	return null;
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.title}>Welcome to WiseRise</Text>

            <TextInput
              placeholder="Your Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="What is your goal?"
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
            />

            <Pressable style={styles.exitButton} onPress={handleSubmit}>
				<Text style= {styles.buttonText}> Ready. </Text>
			</Pressable>
          </View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },

  popup: {
    width: '85%',
	maxWidth: 420,
    backgroundColor: "rgba(233, 233, 233, 0.95)",
    padding: 20,
    borderRadius: 20
  },

  title: {
    fontSize: 20,
	fontWeight: "bold",
    marginBottom: 20,
	textAlign: "center",
	fontFamily: "Inter_700Bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 20,
	paddingVertical: 16,
	paddingHorizontal: 20,
    borderRadius: 10,
	fontSize: 16,
	backgroundColor: "#FAFAFA",
	fontFamily: "Inter_600SemiBold"
  },
  exitButton: {
	borderRadius: 16,
	paddingVertical: 14,
	paddingHorizontal: 10,
	backgroundColor: "#ffae00",
  },
  buttonText: {
	textAlign: 'center',
	fontSize: 16,
  }
});