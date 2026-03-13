import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { NativeModules, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
const { AlarmScheduler } = NativeModules;

import DatePicker from "react-native-date-picker";

export default function AlarmSetter({ onAlarmChange, onClose }) {
  const [time, setTime] = useState('');
  const [alarmInfo, setAlarmInfo] = useState(null);

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const scheduleExpoAlarm = async (alarmTime) => {
	const id = await Notifications.scheduleNotificationAsync({
		content: {
			title: "Wake up",
			body: "Your wisdom awaits.",
			sound: true,
		},
		trigger: {
			date: alarmTime,
			type: Notifications.SchedulableTriggerInputTypes.DATE,
			channelId: 'default',
		},
	});
	console.log("Scheduled notification:", id);

	await AsyncStorage.setItem('alarmNotificationId', id);
  }

  async function generateAlarmAudio(alarmDate) {
	const voiceKey = (await AsyncStorage.getItem('selectedVoice')) || 'daniel';
	const name = 'Dilan';
	const wakeTime = alarmDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	const baseUrl = process.env.EXPO_PUBLIC_API_URL;

	if (!baseUrl) {
		throw new Error('API base URL not working');
	}

	const response = await fetch(`${baseUrl}/generate-alarm`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, wakeTime, voiceKey }),
	});

	const data = await response.json();
	if (!response.ok) throw new Error(data.error || 'Failed to generate alarm');
	console.log('Alarm audio URL stored:', data.file_key);

	const signedRes = await fetch(`${baseUrl}/alarms/${encodeURIComponent(data.file_key)}/download-url`);
	const signedData = await signedRes.json();
	if (!signedRes.ok || !signedData.download_url) throw new Error(signedData.error || 'Failed to get signed URL');


	const alarmsDir = new Directory(Paths.document, 'alarms');
	alarmsDir.create({ intermediates: true, idempotent: true });
	const targetFile = new File(alarmsDir, 'latest-alarm.mp3');
	if (!data.file_key) throw new Error("Missing file_key from backend");
	const downloadedFile = await File.downloadFileAsync(signedData.download_url, targetFile, { idempotent: true });

	await AsyncStorage.setItem('latestAlarmLocalUri', downloadedFile.uri);
	await AsyncStorage.setItem('latestAlarmRemoteUrl', data.file_key);
	console.log('Alarm audio downloaded to:', downloadedFile.uri);
	console.log('Alarm audio URL stored:', data.file_key);

	if (AlarmScheduler?.setAlarmSoundUri) {
		await AlarmScheduler.setAlarmSoundUri(downloadedFile.uri);
	}
	console.log('Alarm sound URI set for native scheduler:', downloadedFile.uri);
  }

  const setAlarm = async () => {
    // if (!time.includes(':')) return;

	const hours = date.getHours();
	const minutes = date.getMinutes();

	if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

    const now = new Date();
    const alarm = new Date();

    alarm.setHours(hours);
	alarm.setMinutes(minutes);
    alarm.setSeconds(0);
	alarm.setMilliseconds(0);

    // If time already passed today → tomorrow
    if (alarm <= now) {
      alarm.setDate(alarm.getDate() + 1);
    }

	await AsyncStorage.setItem('wakeTime', alarm.toISOString());

	await generateAlarmAudio(alarm);

	console.log('Alarm set for', alarm.toISOString());
	console.log('Alarm audio URL stored:', await AsyncStorage.getItem("latestAlarmRemoteUrl"));

	// schedule only once, after URI is saved
	if (Platform.OS === 'android' && AlarmScheduler) {
	await AlarmScheduler.scheduleAlarm(alarm.getTime());
	} else {
	await scheduleExpoAlarm(alarm);
	}

	// await AlarmScheduler.scheduleAlarm(alarm.getTime());

	const formatted = alarm.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	})

	setAlarmInfo(formatted)
	onAlarmChange?.(); // notify parent to refresh wake time display
	onClose?.();
  };

  const cancelAlarm = async () => {
	if (Platform.OS === 'android' && AlarmScheduler) {
		await AlarmScheduler.setAlarmSoundUri(null);
		await AlarmScheduler.cancelAlarm();
	} else {
		const id = await AsyncStorage.getItem('alarmNotificationId');
		if (id) {
			await Notifications.cancelScheduledNotificationAsync(id);
		}
		await AsyncStorage.removeItem('alarmNotificationId');
	}

	// await AsyncStorage.removeItem('wakeTime');
    // setAlarmInfo(null);
	onAlarmChange?.(); // notify parent to refresh wake time display
	onClose?.();
  };

  return (
    <View style={styles.container}>
		<Pressable
			style={styles.input}
			onPress={() => setOpen(true)}
			>
			<Text style={{ fontSize: 18 }}>
				{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
			</Text>
		</Pressable>
		<DatePicker
			modal
			open={open}
			date={date}
			mode="time"
			onConfirm={(selectedDate) => {
				setOpen(false);
				setDate(selectedDate);
			}}
			onCancel={() => {
				setOpen(false);
			}}
		/>
      <Pressable style={styles.button} onPress={setAlarm}>
        <Text style={styles.buttonText}>Set Alarm</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={cancelAlarm}>
        <Text style={styles.buttonText}>Cancel</Text>
      </Pressable>

      {alarmInfo &&
        <Text style={styles.info}>
          Alarm set for {alarmInfo}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#757575',
    padding: 12,
	
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  info: {
    marginTop: 15,
    fontSize: 16,
  },
	input: {
	backgroundColor: "#d9d9d9",
	padding: 18,
	borderRadius: 12,
	width: "100%",
	alignItems: "center",
	marginBottom: 15,
	},
});