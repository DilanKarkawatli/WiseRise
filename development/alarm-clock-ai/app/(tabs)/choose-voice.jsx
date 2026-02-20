import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { voices } from '../data/voices';

export default function ChooseVoice() {
	const [selectedVoice, setSelectedVoice] = useState(null);

	const renderVoiceItem = ({ item }) => (
		const isSelected = selectedVoice === item.id;
		
		return (
			<Pressable
		)

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Choose your voice</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 50,
	},
})

// Implement this from chatGPT
/* 
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { voices } from './voices'; // adjust path if in a different folder

export default function ChooseVoice() {
  const [selectedVoice, setSelectedVoice] = useState(null);

  const renderVoiceItem = ({ item }) => {
    const isSelected = selectedVoice === item.id;

    return (
      <Pressable
        style={[styles.voiceItem, isSelected && styles.selectedVoice]}
        onPress={() => setSelectedVoice(item.id)}
      >
        <Text style={[styles.voiceText, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Choose your voice</Text>

      <FlatList
        data={voices}
        keyExtractor={(item) => item.id}
        renderItem={renderVoiceItem}
        style={styles.voiceList}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  voiceList: {
    width: '100%',
  },
  voiceItem: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedVoice: {
    backgroundColor: '#4B7BEC',
  },
  voiceText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
*/