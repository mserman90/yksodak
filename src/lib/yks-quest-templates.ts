import { Quest, Achievement } from '@/types/yks-quest';

export const questTemplates: { daily: Quest[]; weekly: Quest[]; special: Quest[] } = {
  daily: [
    { id: 'study_30min', name: '30 Dakika Çalış', description: 'Odaklanma zamanlayıcısı ile en az 30 dakika çalış', xp: 50, icon: '📚', completed: false },
    { id: 'complete_3_habits', name: '3 Alışkanlık Tamamla', description: 'Günlük alışkanlıklarından 3 tanesini tamamla', xp: 30, icon: '✅', completed: false },
    { id: 'daily_journal', name: 'Günlük Yaz', description: 'Bugünkü ruh halini ve enerjini kaydet', xp: 25, icon: '📝', completed: false },
    { id: 'take_meds', name: 'İlaçlarını Al', description: 'Bugünkü tüm ilaçlarını zamanında al', xp: 20, icon: '💊', completed: false },
  ],
  weekly: [
    { id: 'study_10hours', name: '10 Saat Çalışma', description: 'Bu hafta toplam 10 saat çalışma tamamla', xp: 200, icon: '⏰', completed: false, progress: 0, target: 600 },
    { id: 'complete_5_todos', name: '5 Görev Bitir', description: 'Bu hafta 5 görevi zamanında tamamla', xp: 100, icon: '📋', completed: false, progress: 0, target: 5 },
    { id: 'perfect_week', name: 'Mükemmel Hafta', description: 'Bir hafta boyunca kesintisiz seri oluştur', xp: 300, icon: '⭐', completed: false, progress: 0, target: 7 },
  ],
  special: [
    { id: 'level_5', name: 'Seviye 5\'e Ulaş', description: 'Karakterini seviye 5\'e yükselt', xp: 500, icon: '🏆', completed: false },
    { id: 'unlock_all_achievements', name: 'Tüm Başarımlar', description: '15 başarımın tümünü aç', xp: 1000, icon: '🎖️', completed: false },
    { id: 'master_focus', name: 'Odak Ustası', description: '50 odaklanma seansı tamamla', xp: 750, icon: '🎓', completed: false },
  ],
};

export const achievementTemplates: Achievement[] = [
  { id: 'first_steps', name: 'İlk Adımlar', description: 'İlk görevini tamamla', icon: '👣', unlocked: false },
  { id: 'week_warrior', name: 'Hafta Savaşçısı', description: '7 günlük seri oluştur', icon: '🔥', unlocked: false },
  { id: 'focus_master', name: 'Odak Ustası', description: '25 odaklanma seansı tamamla', icon: '🎯', unlocked: false },
  { id: 'level_up_5', name: 'Yükselen Yıldız', description: 'Seviye 5\'e ulaş', icon: '⭐', unlocked: false },
  { id: 'level_up_10', name: 'Efsane', description: 'Seviye 10\'a ulaş', icon: '👑', unlocked: false },
  { id: 'habit_builder', name: 'Alışkanlık Kurucusu', description: '5 farklı alışkanlık oluştur', icon: '🏗️', unlocked: false },
  { id: 'quest_hunter', name: 'Görev Avcısı', description: '50 görev tamamla', icon: '🏹', unlocked: false },
  { id: 'xp_collector', name: 'XP Koleksiyoncusu', description: 'Toplam 5000 XP kazan', icon: '💎', unlocked: false },
  { id: 'perfect_week', name: 'Mükemmel Hafta', description: 'Bir hafta boyunca tüm günlük görevleri tamamla', icon: '💯', unlocked: false },
  { id: 'early_bird', name: 'Erken Kuş', description: 'Sabah 7\'den önce görev tamamla', icon: '🌅', unlocked: false },
  { id: 'night_owl', name: 'Gece Kuşu', description: 'Gece 23\'ten sonra görev tamamla', icon: '🦉', unlocked: false },
  { id: 'stat_master', name: 'Yetenek Ustası', description: 'Bir yeteneği 10\'a çıkar', icon: '💪', unlocked: false },
  { id: 'all_rounder', name: 'Çok Yönlü', description: 'Tüm yetenekleri 5\'e çıkar', icon: '🌟', unlocked: false },
  { id: 'consistency_king', name: 'Tutarlılık Kralı', description: '30 günlük seri oluştur', icon: '👑', unlocked: false },
  { id: 'champion', name: 'Şampiyon', description: 'Seviye 20\'ye ulaş', icon: '🏆', unlocked: false },
];
