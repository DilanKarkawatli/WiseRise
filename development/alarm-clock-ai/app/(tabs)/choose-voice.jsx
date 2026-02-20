import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useState } from 'react';
import { voices } from '../../data/voices';

import { Audio } from 'expo-av';
import { useRef, useEffect } from 'react';

export default function ChooseVoice() {
	const [selectedVoice, setSelectedVoice] = useState(null);

	const renderVoiceItem = ({ item }) => {
		const isSelected = selectedVoice === item.id;
		
		return (
			<Pressable
				style={[styles.VoiceItem, isSelected && styles.selectedVoice]}
				onPress={() => {
					setSelectedVoice(item.id);
					playSound(item.sound);
				}}
			>
				<Image
					source={item.image}
					style={[styles.voiceImage, isSelected && styles.selectedImage]}
				/>
				
				<Text style={[styles.voiceText, isSelected && styles.selectedText]}>
					{item.name}
				</Text>
			</Pressable>
		)
	};

	const soundRef = useRef(null);

	const playSound = async (soundFile) => {
		try {
			if (soundRef.current) {
				await soundRef.current.stopAsync();
				await soundRef.current.unloadAsync();
			}

			const { sound } = await Audio.Sound.createAsync(soundFile);
			soundRef.current = sound;

			await sound.playAsync();
		} catch (error) {
			console.error('Error playing sound:', error);
		}
	}

	useEffect(() => {
		return () => {
			if (soundRef.current) {
				soundRef.current.unloadAsync();
			}
		}
	}, [])

	return (
		<View style={styles.container}>
			<Text style={styles.titleText}>Choose your ally wisely</Text>

			<FlatList
				data={voices}
				keyExtractor={(item) => item.id}
				renderItem={renderVoiceItem}
				style={styles.voiceList}
				contentContainerStyle={{ paddingBottom: 20 }}
			/>
		</View>
	)
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
		paddingTop: 80,
	},
	titleText: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 30, // Perfect
		textAlign: 'center',
	},
	voiceList: {
		width: '100%',
		height: 'auto',
		overflow: 'visible'
	},
	VoiceItem: {
		padding: 15,
		backgroundColor: '#d4d4d4',
		borderRadius: 10,
		marginBottom: 10,
		alignItems: 'center',
		overflow: 'visible'
	},
	selectedVoice: {
		backgroundColor: '#9b9b9b',
	},
	voiceText: {
		fontSize: 18,
		fontWeight: '500',
		color: '#9b9b9b',
	},
	selectedText: {
		color: '#d4d4d4',
		fontWeight: 'bold',
		fontSize: 30,
		textShadowColor: 'rgba(0, 0, 0, 0.5)', // color of the shadow
		textShadowOffset: { width: 2, height: 2 }, // how far the shadow is offset
		textShadowRadius: 3, // how blurry the shadow is
	},
	selectedImage: {
		borderWidth: 3,          // thick border around the image
		borderColor: '#646464',  // same color as the selected background
		transform: [{ scale: 1.8 }], // slightly bigger image
	},
	voiceImage: {
		width: 80,
		height: 80,
		borderRadius: 40, // Circular
		marginBottom: 10,

		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 6,
	}
	
})