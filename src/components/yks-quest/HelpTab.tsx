import { Card } from '@/components/ui/card';

export const HelpTab = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">📖 YKS Quest Nedir?</h3>
        <div className="space-y-3 text-sm">
          <p>
            YKS Quest, YKS sınavına hazırlanan öğrenciler için DEHB dostu bir oyunlaştırma sistemidir. Çalışmalarınızı
            eğlenceli hale getirerek motivasyonunuzu artırmayı amaçlar.
          </p>
          <p>
            Görevler tamamlayarak XP kazanın, seviye atlayın ve özel rozetler kazanarak ilerlemenizi takip edin.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">🎮 Nasıl Oynanır?</h3>
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-bold mb-1">1. Görevler Tamamlayın</h4>
            <p className="text-muted-foreground">
              Günlük, haftalık ve özel görevleri tamamlayarak XP kazanın.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-1">2. Seviye Atlayın</h4>
            <p className="text-muted-foreground">
              Kazandığınız XP ile seviye atlayın ve yetenek puanları kazanın.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-1">3. Başarımları Açın</h4>
            <p className="text-muted-foreground">
              Özel başarımları açarak koleksiyonunuzu genişletin.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 md:col-span-2">
        <h3 className="text-2xl font-bold mb-4">💡 İpuçları</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">🔥 Seri Oluşturun</h4>
            <p className="text-sm">
              Her gün en az bir görev tamamlayarak serinizi koruyun. Uzun seriler ekstra ödüller getirir!
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">⏱️ Odaklanma Kullanın</h4>
            <p className="text-sm">
              Pomodoro tekniği ile çalışın. Her tamamlanan seans 25 XP kazandırır!
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">✅ Alışkanlıklar Ekleyin</h4>
            <p className="text-sm">
              Günlük alışkanlıklar oluşturarak düzenli ilerleme kaydedin ve ekstra XP kazanın.
            </p>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-lg">
            <h4 className="font-bold mb-2">📝 Günlük Tutun</h4>
            <p className="text-sm">
              Ruh halinizi ve enerjinizi kaydedin. Bu sayede hangi günlerde daha verimli olduğunuzu görebilirsiniz.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
