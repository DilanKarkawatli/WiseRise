package com.dilank.alarmclockai.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.dilank.alarmclockai.MainActivity
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

// This module will be used to schedule alarms from the React Native side
class AlarmSchedulerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

	override fun getName(): String = "AlarmScheduler" // This name is used to reference the module from JavaScript

	@ReactMethod
	fun setAlarmSoundUri(uri: String?, promise: Promise) {
	try {
		reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
		.edit()
		.putString(KEY_SOUND_URI, uri)
		.apply()
		promise.resolve(true)
	} catch (exception: Exception) {
		promise.reject("E_SET_ALARM_SOUND_URI", "Unable to store alarm sound uri", exception)
		}
	}

	@ReactMethod // This method will be called from JavaScript to schedule an alarm
	fun scheduleAlarm(triggerAtMillis: Double, promise: Promise) {
		try {
			val requestCode = DEFAULT_REQUEST_CODE
			val triggerAt = triggerAtMillis.toLong()

			reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
				.edit()
				.putLong(KEY_TRIGGER_AT_MILLIS, triggerAt)
				.putInt(KEY_REQUEST_CODE, requestCode)
				.apply()

			scheduleAlarmInternal(reactContext, triggerAt, requestCode)
			promise.resolve(true) // Resolve the promise with true if the alarm was scheduled successfully
		} catch (exception: Exception) {
			promise.reject("ALARM_SCHEDULE_ERROR", "Failed to schedule alarm", exception)
		}
	}

	@ReactMethod // This method will be called from JavaScript to cancel a scheduled alarm
	fun cancelAlarm(promise: Promise) {
		try {
			val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
			val requestCode = prefs.getInt(KEY_REQUEST_CODE, DEFAULT_REQUEST_CODE)

			val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
			val alarmIntent = buildAlarmPendingIntent(reactContext, requestCode)
			alarmManager.cancel(alarmIntent)

			clearStoredAlarm(reactContext)
			promise.resolve(true) // Resolve the promise with true if the alarm was cancelled successfully
		} catch (exception: Exception) {
			promise.reject("ALARM_CANCEL_ERROR", "Failed to cancel alarm", exception)
		}
	}

	@ReactMethod // This method will be called from JavaScript to check if an alarm is currently scheduled
	fun canScheduleExactAlarms(promise: Promise) {
		try {
			if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
				promise.resolve(true)
				return
			}

			val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
			promise.resolve(alarmManager.canScheduleExactAlarms())
		} catch (exception: Exception) {
			promise.reject("E_EXACT_ALARM_CHECK", "Unable to check exact alarm permission", exception)
		}
	}

	@ReactMethod // This method will be called from JavaScript to check if an alarm is currently scheduled
	fun openExactAlarmSettings() {
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return

		val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
			data = Uri.parse("package:${reactContext.packageName}")
			addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
		}
		reactContext.startActivity(intent)
	}

	@ReactMethod
	fun stopAlarmSound(promise: Promise) {
	try {
		val intent = Intent(reactContext, AlarmSoundService::class.java).apply {
		action = AlarmSoundService.ACTION_STOP
		}
		reactContext.startService(intent)
		promise.resolve(true)
	} catch (exception: Exception) {
		promise.reject("E_STOP_ALARM_SOUND", "Unable to stop alarm sound", exception)
	}
	}

	companion object {
		const val PREFS_NAME = "alarm_scheduler"
		const val KEY_TRIGGER_AT_MILLIS = "trigger_at_millis"
		const val KEY_REQUEST_CODE = "request_code"
		const val DEFAULT_REQUEST_CODE = 4040
		const val KEY_SOUND_URI = "sound_uri"

		fun scheduleAlarmInternal(context: Context, triggerAtMillis: Long, requestCode: Int) {
			val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
			val alarmIntent = buildAlarmPendingIntent(context, requestCode)
			val showIntent = buildOpenAppPendingIntent(context)
			val alarmClockInfo = AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent)

			try {
				alarmManager.setAlarmClock(alarmClockInfo, alarmIntent)
			} catch (e: SecurityException) {
				// Handle the case where the app doesn't have permission to schedule exact alarms
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
					alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, alarmIntent)
				} else {
					alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, alarmIntent)
				}
			}
		}

		fun clearStoredAlarm(context: Context) {
			context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
				.edit()
				.remove(KEY_TRIGGER_AT_MILLIS)
				.remove(KEY_REQUEST_CODE)
				.apply()
		}

		private fun buildAlarmPendingIntent(context: Context, requestCode: Int): PendingIntent {
			val intent = Intent(context, AlarmReceiver::class.java)
			val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
			return PendingIntent.getBroadcast(context, requestCode, intent, flags)
		}

		private fun buildOpenAppPendingIntent(context: Context): PendingIntent {
			val intent = Intent(context, MainActivity::class.java).apply {
				action = Intent.ACTION_VIEW
				data = Uri.parse("alarmclockai://alarm-ring")
				flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
			}
			val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
			return PendingIntent.getActivity(context, 0, intent, flags)
		}
	}
}