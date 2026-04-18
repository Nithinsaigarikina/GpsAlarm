import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Turn off default notification ding since we have the custom sound back
    shouldSetBadge: false,
  }),
});

export default function useAlarm(isInsideRadius) {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const hasTriggeredRef = useRef(false);

  // expo-audio modern hook!
  const player = useAudioPlayer(require('../../assets/mixkit-facility-alarm-sound-999.wav'));

  // Request notification permission on mount
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Watch isInsideRadius and trigger alarm
  useEffect(() => {
    if (isInsideRadius && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      triggerAlarm();
    }

    if (!isInsideRadius) {
      hasTriggeredRef.current = false;
    }
  }, [isInsideRadius]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (player) {
        player.pause();
      }
    };
  }, [player]);

  async function triggerAlarm() {
    console.log('[useAlarm] triggerAlarm invoked! isInsideRadius was true.');
    setIsAlarmActive(true);

    try {
      // Vibrate
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (err) {
      console.warn('[useAlarm] Haptics failed:', err);
    }

    try {
      // Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 GPS Alarm',
          body: 'You are approaching your destination!',
        },
        trigger: null, // fires immediately
      });
    } catch (err) {
      console.warn('[useAlarm] Notification failed:', err);
    }

    try {
      if (player) {
         player.loop = true;
         player.seekTo(0);
         player.play();
         console.log('[useAlarm] expo-audio playing custom sound');
      }
    } catch (err) {
      console.warn('[useAlarm] expo-audio failed:', err);
    }
  }

  async function dismissAlarm() {
    setIsAlarmActive(false);
    hasTriggeredRef.current = false;
    
    // Stop custom sound
    if (player) {
       player.pause();
       player.seekTo(0);
    }
  }

  return { isAlarmActive, dismissAlarm };
}