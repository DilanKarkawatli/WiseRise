import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { profileTemplate } from '../../data/profileTemplate';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WakeReason() {
	const [profile, setProfile] = useState(profileTemplate)
	const [savedGoal, setSavedGoal] = useState("");

	const handleChange = (text) => {
		setProfile(prev => ({
			...prev,
			wakeReason: text
		}))
	}

	const saveProfile = async () => {
		try {
			const userDataRaw = await AsyncStorage.getItem('user_data');
			const userData = userDataRaw ? JSON.parse(userDataRaw) : {};

			const updatedProfile = {
				...userData,
				goal: profile.wakeReason,
			}
			
			await AsyncStorage.setItem('user_data', JSON.stringify(updatedProfile));
			setSavedGoal(updatedProfile.goal || '');
			console.log('Profile saved successfully:', updatedProfile);
		} catch (error) {
			console.error('Error saving profile:', error);
		}
	}

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const saved = await AsyncStorage.getItem('user_data');
				if (!saved) return;

				const parsed = JSON.parse(saved)
				const goalText = parsed.goal || '';

				setProfile(prev => ({
					...prev,
					wakeReason : goalText || ''}));
				setSavedGoal(goalText || '');
				} catch (error) {
				console.error('Error loading saved voice:', error);
			}
		}

		loadProfile();
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.titleText}>What's your why?</Text>

			<View style={styles.goalBox}>
				<Text style={styles.goalTitle}>Goal:</Text> 
				
				<Text style={styles.goalText}>
					{savedGoal || "You haven't set a goal yet"}
				</Text>
			</View>

			<TextInput
				style={styles.input}
				placeholder="Why do you want to wake up?"
				value={profile.wakeReason}
				onChangeText={handleChange}
				multiline
			/>

			<Pressable
				style={styles.button}
				onPress={saveProfile}
			>
				<Text style={styles.buttonText}>Save</Text>
			</Pressable>
				
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 30,
		paddingTop: 80,
		// justifyContent: 'center',
		// alignItems: 'center',
	},
	titleText: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	input: {
		backgroundColor: '#e0e0e0',
		borderRadius: 10,
		padding: 15,
		fontSize: 16,
		minHeight: 120,
		textAlignVertical: 'top',
		marginBottom: 20,
	},
	button: {
		backgroundColor: 'gray',
		paddingVertical: 15,
		borderRadius: 10,
		alignItems: 'center',
	},
	buttonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	goalBox: {
		marginBottom: 30,
		backgroundColor: '#f2f2f2',
		padding: 20,
		borderRadius: 15,
		borderLeftWidth: 5,
		borderLeftColor: 'gray',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 4,
	},

	goalTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#666',
	},

	goalText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		fontWeight: 'thin',
		fontStyle: 'italic',
	},
})