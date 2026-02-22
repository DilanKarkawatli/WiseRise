import { View, Text, Pressable } from 'react-native';
import { useEffect, useRef } from 'react';
import { createAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { voices } from '../../data/voices';

export default function AlarmRing() {
  const playerRef = useRef(null);

  const playVoice = async () => {
    const id = await AsyncStorage.getItem('selectedVoice');
    const voice = voices.find(v => v.id === id);

    if (!voice) return;

    const player = createAudioPlayer(voice.sound);
    playerRef.current = player;
    player.play();
	// player.setIsLooping(true);
  };

  useEffect(() => {
    playVoice();

    return () => playerRef.current?.remove();
  }, []);

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:32 }}>Wake up</Text>

      <Pressable onPress={() => playerRef.current?.pause()}>
        <Text>Stop</Text>
      </Pressable>
    </View>
  );
}