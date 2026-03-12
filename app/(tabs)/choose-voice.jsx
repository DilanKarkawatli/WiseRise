import { useFocusEffect } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { voices } from '../../data/voices';

import { createAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChooseVoice() {
	const [selectedVoice, setSelectedVoice] = useState(null);
	const soundRef = useRef(null);

	const playSound = async (soundFile) => {
		try {
			if (soundRef.current) {
				soundRef.current.pause();
				soundRef.current.remove();
			}

			const player = await createAudioPlayer(soundFile);
			soundRef.current = player;

			player.play();
		} catch (error) {
			console.error('Error playing sound:', error);
		}
	};

	const renderVoiceItem = ({ item }) => {
		const isSelected = selectedVoice === item.id;
		
		return (
			<Pressable
				style={[styles.VoiceItem, isSelected && styles.selectedVoice]}
				onPress={async () => {
					setSelectedVoice(item.id);
					await AsyncStorage.setItem('selectedVoice', item.voiceKey);
					await AsyncStorage.setItem('selectedId', item.id);
					console.log('Selected voice:', item.voiceKey);
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

	useEffect(() => {
		const loadVoice = async () => {
			try {
				const savedVoice = await AsyncStorage.getItem('selectedVoice');
				const savedId = await AsyncStorage.getItem('selectedId');
				if (savedId) {
					setSelectedVoice(savedId);
					console.log('Loaded saved voice:', savedVoice);
				}
			} catch (error) {
				console.error('Error loading saved voice:', error);
			}
		}

		loadVoice();

		return () => {
			if (soundRef.current) {
				soundRef.current.remove();
			}
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			return () => {
				if (soundRef.current) {
					try {
						soundRef.current.pause();
						soundRef.current.remove();
						soundRef.current = null;
					} catch (error) {
						console.error('Error stopping sound on blur:', error);
					}
				}
			}
		}, [])
	)

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