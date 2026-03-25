import { useRouter } from 'expo-router';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import AlarmSetter from '../../components/AlarmSetter';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';


import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Notifications from 'expo-notifications';
import { voices } from '../../data/voices';

import Onboarding from '../../components/Onboarding';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowList: true,
		shouldShowBanner: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
})

export default function App() {
	const [wakeTime, setWakeTime] = useState(null);
	const router = useRouter();
	const [timerVisible, setTimerVisible] = useState(false);

	const [showOnboarding, setShowOnboarding] = useState(false);
	const [checkingOnboarding, setCheckingOnboarding] = useState(true);

	useEffect(() => {
	(async () => {
		const done = await AsyncStorage.getItem('user_data');
		setShowOnboarding(!done);
		setCheckingOnboarding(false);
	})();
	}, []);

	const handleOnboardingSubmit = async ({ name, email, goal }) =>  {
		// await AsyncStorage.setItem('user_data', 'true');
		await AsyncStorage.setItem('user_data', JSON.stringify({ name, email, goal }));

		setShowOnboarding(false);
	}

	const resetOnboarding = async () => {
		try {
			await AsyncStorage.removeItem('user_data');
			console.log('Onboarding reset successfully');
		} catch (error) {
			console.error("Failed to reset onboarding:", error);
		}
	};

	const loadWakeTime = async () => {
		const saved = await AsyncStorage.getItem('wakeTime');

		if (saved) {
			const date = new Date(saved); // Convert ISO string -> Date

			const formatted = date.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
				})

			setWakeTime(formatted);

			} else {
				setWakeTime(null);
			}
		};

	useEffect(() => {
		loadWakeTime();
	}, []);

	useEffect(() => {
		if (Platform.OS === 'android') {
			Notifications.setNotificationChannelAsync('default', {
				name: 'Alarm',
				importance: Notifications.AndroidImportance.HIGH,
				sound: 'default',
			});
		}

	Notifications.requestPermissionsAsync();
  	}, []);

	useEffect(() => {
		const sub = Notifications.addNotificationReceivedListener(() => {
			console.log("NOTIFICATION RECEIVED");
			playSelectedVoice();      // start alarm sound immediately
			router.push('/alarm-ring'); // show alarm UI
		});

		return () => sub.remove();
	}, []);

	useEffect(() => {
		setAudioModeAsync({
			playsInSilentMode: true,
			shouldDuck: false,
		});
	}, []);

	const playSelectedVoice = async () => {
		try {
			const savedVoiceId = await AsyncStorage.getItem('selectedVoice');

			const voice = voices.find(v => v.id === savedVoiceId);

			if (!voice) return;

			const player = createAudioPlayer(voice.sound);
			playerRef.current = player;

			await player.play();

		} catch (error) {
			console.error("Error playing selected voice:", error);
		}
  };

  return (
    <View style={styles.container}>
		<Onboarding
			visible={!checkingOnboarding && showOnboarding}
			onSubmit={handleOnboardingSubmit}
		/>

      {/* <Text style={styles.text}>Know why to wake up</Text> */}

	  {wakeTime && (
		<Text style={styles.wakeTimeText}>
			{wakeTime}
		</Text>
	  )}
	  
	  <Pressable onLongPress={() => setTimerVisible(true)}>
		<Image 
			style={styles.image} 
			source={require('../../assets/images/clock-icon-1.png')}
		/>
	  </Pressable>

	  <Text style={styles.holdText}> Hold to set time </Text>

	  <Pressable
	  	style={styles.buttonVoice}
		onPress={() => router.push('/choose-voice')}>
		<Text style={styles.buttonTextVoice}>Choose Voice</Text>
	  </Pressable>
	  
	  <Pressable
	  	style={styles.buttonWakeUp}
		onPress={() => router.push('/wake-reason')}>
		<Text style={styles.buttonTextWakeUp}>your why</Text>
	  </Pressable>

	  <Pressable style={styles.button} onPress={resetOnboarding}>
		<Text style={styles.buttonText}>Reset Onboarding (Dev)</Text>
	  </Pressable>

	  <Modal
	  	visible={timerVisible}
		animationType="fade"
		transparent={true}
		presentationStyle="overFullScreen"
		// onRequestClose={() => setTimerVisible(false)}
	  >
		<View style={styles.modalOverlay}>
			<View style={styles.modalContent}>
				<Text style={styles.modalTitle}>Alarm Clock</Text>
				<AlarmSetter 
					onAlarmChange={loadWakeTime}
					onClose={() => setTimerVisible(false)}
				/>
			</View>
		</View>
	  </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 40,
	},
	image: {
		width: 300,
		height: 300,
		marginTop: 10,
		marginBottom: 10,
		borderRadius: 100,
	},
	text: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
		fontStyle: 'italic',
		textAlign: 'center',
	},
	buttonVoice: {
		backgroundColor: 'lightgray',
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 10,
		marginBottom: 20,
		width: '100%',
		alignItems: 'center',
	},
	buttonWakeUp: {
		backgroundColor: 'gray',
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 10,
		marginBottom: 20,
		width: '100%',
		alignItems: 'center',
	},
	buttonTextVoice: {
		color: 'gray',
		fontSize: 18,
		fontWeight: 'bold',
	},
	buttonTextWakeUp: {
		color: 'lightgray',
		fontSize: 18,
		fontWeight: 'bold',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(126, 126, 126, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: '80%',
		backgroundColor: 'white',
		borderRadius: 10,
		padding: 20,
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	closeButton: {
		marginTop: 30,
		backgroundColor: 'lightgray',
		padding: 10,
		borderRadius: 5,
		width: '100%',
		alignItems: 'center',
	},
	wakeTimeText: {
		fontSize: 80,
		fontWeight: 'bold',
		color: '#8d8d8d',
		textShadowColor: 'rgba(99, 99, 99, 0.5)',
		textShadowOffset: { width: 4, height: 4 },
		textShadowRadius: 20,
		marginBottom: 20,
	},
	holdText: {
		fontSize: 14,
		fontWeight: 'italic',
		color: '#8d8d8d',
		marginBottom: 70,
	}
})