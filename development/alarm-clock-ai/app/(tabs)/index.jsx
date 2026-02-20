import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';


export default function App() {
	const router = useRouter();

  return (
    <View style={styles.container}>

      <Text style={styles.text}>Know why to wake up</Text>

	  <Image 
	  	style={styles.image} 
		source={require('../../assets/images/clock-icon-1.png')}
	  />

	  <Pressable
	  	style={styles.buttonVoice}
		onPress={() => router.push('/choose-voice')}>
		<Text style={styles.buttonTextVoice}>Choose Voice</Text> {/*"Wisdom Purveyor"*/}
	  </Pressable>
	  
	  <Pressable
	  	style={styles.buttonWakeUp}
		onPress={() => router.push('/wake-reason')}>
		<Text style={styles.buttonTextWakeUp}>your why</Text>
	  </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginTop: 100,
	},
	image: {
		width: 300,
		height: 300,
		marginBottom: 100,
		borderRadius: 100,
	},
	text: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 50,
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
})