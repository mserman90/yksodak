import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Bildirimler Desteklenmiyor',
        description: 'Tarayıcınız bildirimleri desteklemiyor.',
        variant: 'destructive',
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast({
        title: '✅ Bildirimler Aktif',
        description: 'Artık önemli hatırlatmalar alacaksınız!',
      });
      return true;
    } else {
      toast({
        title: 'Bildirimler Reddedildi',
        description: 'Bildirimleri ayarlardan açabilirsiniz.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const sendNotification = (title: string, body: string, icon?: string) => {
    if (permission !== 'granted') return;

    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: icon || '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'yks-quest',
          requireInteraction: false,
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: icon || '/icon-192.png',
      });
    }
  };

  const scheduleMedicationReminders = (medications: Array<{ name: string; time: string; takenToday: boolean }>) => {
    medications.forEach((med) => {
      if (med.takenToday) return;

      const [hours, minutes] = med.time.split(':').map(Number);
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      if (reminderTime > now) {
        const timeUntil = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          sendNotification(
            '💊 İlaç Hatırlatması',
            `${med.name} alma zamanı geldi!`,
            '💊'
          );
        }, timeUntil);
      }
    });
  };

  const scheduleDeadlineReminders = (todos: Array<{ text: string; deadline: string | null; completed: boolean }>) => {
    const now = new Date();
    
    todos.forEach((todo) => {
      if (todo.completed || !todo.deadline) return;

      const deadline = new Date(todo.deadline);
      const oneHourBefore = new Date(deadline.getTime() - 60 * 60 * 1000);
      const oneDayBefore = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);

      if (oneDayBefore > now) {
        const timeUntil = oneDayBefore.getTime() - now.getTime();
        setTimeout(() => {
          sendNotification(
            '⏰ Görev Hatırlatması',
            `"${todo.text}" için 1 gün kaldı!`,
            '⏰'
          );
        }, timeUntil);
      }

      if (oneHourBefore > now) {
        const timeUntil = oneHourBefore.getTime() - now.getTime();
        setTimeout(() => {
          sendNotification(
            '🚨 Acil Görev Hatırlatması',
            `"${todo.text}" için 1 saat kaldı!`,
            '🚨'
          );
        }, timeUntil);
      }
    });
  };

  const sendMotivationMessage = () => {
    const messages = [
      'Harika gidiyorsun! 💪 Bir adım daha atmalısın!',
      'Bugün bir şeyler başarmak için harika bir gün! 🌟',
      'Odaklan ve devam et! Başarı yakın! 🎯',
      'Her küçük adım büyük bir hedefe götürür! 🚀',
      'Sen bunu yapabilirsin! İnan ve devam et! ⭐',
      'Başarı sabır ve çalışmayla gelir! 📚',
      'Bugünkü çaban yarının başarısı! 🏆',
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    sendNotification('💫 Motivasyon', randomMessage, '💫');
  };

  const scheduleMotivationMessages = () => {
    // Her 2 saatte bir motivasyon mesajı
    const interval = setInterval(() => {
      sendMotivationMessage();
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleMedicationReminders,
    scheduleDeadlineReminders,
    sendMotivationMessage,
    scheduleMotivationMessages,
  };
};
