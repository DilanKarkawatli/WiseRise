package com.dilank.alarmclockai.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.dilank.alarmclockai.MainActivity
import com.dilank.alarmclockai.R

class AlarmSoundService : Service() {
  private var mediaPlayer: MediaPlayer? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val action = intent?.action ?: ACTION_START

    if (action == ACTION_STOP) {
      stopAlarm()
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
      return START_NOT_STICKY
    }

    createChannelIfNeeded()
    startForeground(NOTIFICATION_ID, buildForegroundNotification())
    startAlarmIfNeeded()
    return START_STICKY
  }

  override fun onDestroy() {
    stopAlarm()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

//   private fun startAlarmIfNeeded() {
//     if (mediaPlayer != null) return

//     val soundUri = Uri.parse("android.resource://$packageName/${R.raw.alarm_voice}")
//     mediaPlayer = MediaPlayer().apply {
//       setAudioAttributes(
//         AudioAttributes.Builder()
//           .setUsage(AudioAttributes.USAGE_ALARM)
//           .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
//           .build()
//       )
//       setDataSource(applicationContext, soundUri)
//       isLooping = true
//       prepare()
//       start()
//     }
//   }
  private fun startAlarmIfNeeded() {
	if (mediaPlayer != null) return

	val prefs = getSharedPreferences(AlarmSchedulerModule.PREFS_NAME, Context.MODE_PRIVATE)
	val customUri = prefs.getString(AlarmSchedulerModule.KEY_SOUND_URI, null)

	android.util.Log.d("AlarmSoundService", "customUri=$customUri")

	val soundUri = if (!customUri.isNullOrBlank()) {
		Uri.parse(customUri)
	} else {
		Uri.parse("android.resource://$packageName/${R.raw.alarm_voice}")
	}

	android.util.Log.d("AlarmSoundService", "customUri=$customUri")

	mediaPlayer = MediaPlayer().apply {
		setAudioAttributes(
		AudioAttributes.Builder()
			.setUsage(AudioAttributes.USAGE_ALARM)
			.setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
			.build()
		)
		setDataSource(applicationContext, soundUri)
		isLooping = true
		prepare()
		start()
	}
	}

  private fun stopAlarm() {
    mediaPlayer?.stop()
    mediaPlayer?.release()
    mediaPlayer = null
  }

  private fun buildForegroundNotification(): Notification {
    val openIntent = Intent(this, MainActivity::class.java).apply {
      action = Intent.ACTION_VIEW
      data = Uri.parse("alarmclockai://alarm-ring")
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }

    val openPendingIntent = PendingIntent.getActivity(
      this, 8181, openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val stopIntent = Intent(this, AlarmSoundService::class.java).apply {
      action = ACTION_STOP
    }

    val stopPendingIntent = PendingIntent.getService(
      this, 8182, stopIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentTitle("Wake up")
      .setContentText("Your alarm is ringing")
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setContentIntent(openPendingIntent)
      .setFullScreenIntent(openPendingIntent, true)
      .addAction(0, "Stop", stopPendingIntent)
      .build()
  }

  private fun createChannelIfNeeded() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val channel = NotificationChannel(
      CHANNEL_ID, "Alarm Sound", NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "Alarm playback"
      lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
      setBypassDnd(true)
      setSound(null, null)
    }

    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.createNotificationChannel(channel)
  }

  companion object {
    const val ACTION_START = "com.dilank.alarmclockai.alarm.START"
    const val ACTION_STOP = "com.dilank.alarmclockai.alarm.STOP"
    private const val CHANNEL_ID = "alarm_sound_service_v1"
    private const val NOTIFICATION_ID = 5050
  }
}