import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";

export const UserGuide = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
          <HelpCircle size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Kullanım Kılavuzu
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-foreground">
            {/* Intro */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold gradient-text">Olayı Çözme Rehberi</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vay be, YKS Odak'a gelmişsin! Hoş geldin kanka. Bu app tam senlik; YKS'ye hazırlanırken beynin yanmasın, daha chill takıl ama verimli ol diye yapıldı. Resmen yeni bestie'n olacak! Hadi gel, ne var ne yok bi' bakalım, olayı hemen çözelim.
              </p>
            </div>

            {/* Ana Özellikler */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-primary">🚀 OKEY, BAŞLIYORUZ! ANA OLAYLAR</h3>
              <p className="text-muted-foreground">
                Her şey bi' tık uzağında. Lazım olan ne varsa diye hepsini basit sekmelere böldük, rahat ol.
              </p>
            </div>

            {/* Sekmeler */}
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">1. Sekmelerde Sörf Yap</h4>
              <p className="text-muted-foreground">Yukarıdan tık tık geçiş yapıyosun, easy peasy:</p>
              <ul className="space-y-2 ml-4 text-muted-foreground">
                <li>🍅 <span className="font-semibold">Pomodoro:</span> Beyni yakmadan ders çalış, sonra mola.</li>
                <li>✅ <span className="font-semibold">Görevler:</span> "Şunu yapcam, bunu etcem" listesi.</li>
                <li>🗓️ <span className="font-semibold">Planlayıcı:</span> Haftalık programın, ne zaman ne çalışcan belli olsun.</li>
                <li>✨ <span className="font-semibold">Alışkanlıklar:</span> "Her gün bunu yapcam!" dediğin şeyleri takip et.</li>
                <li>😊 <span className="font-semibold">Ruh Halim:</span> Modun ne? Onu kaydet.</li>
                <li>📊 <span className="font-semibold">İstatistikler:</span> Ne kadar kastın, ne kadar yol aldın, ona bak.</li>
              </ul>
            </div>

            {/* XP Kasma */}
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">2. XP Kasma Zamanı ⭐</h4>
              <p className="text-muted-foreground">
                Ders çalışmak sıkıcı mı? Artık diil! App'i kullandıkça XP kasıyon. Görev bitir, kap puanı! Pomodoro yap, kap puanı! Bu puanlarla gaza gel, motive ol. Ne kadar puanın var, sağ üstte yıldızın yanında yazıyo.
              </p>
            </div>

            {/* Dark Mode */}
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">3. Dark Mode AÇ/KAPA 🌙/☀️</h4>
              <p className="text-muted-foreground">
                Gözler gg olmasın diye! Sağ üstteki ayla güneşe tıkla, modu değiştir. Gececi tayfa için zaten direkt karanlık modda açılıyo, Adamsın app!
              </p>
            </div>

            {/* Pomodoro */}
            <div className="space-y-3 glass p-4 rounded-lg">
              <h3 className="text-lg font-bold text-primary">🍅 POMODORO KİNG</h3>
              <p className="text-muted-foreground">
                Bu olay, ders çalışırken başka dünyalara dalmaman için var. Tam odak modu! Kısaca: 25 dk ders, 5 dk mola. Tam bir canavar gibi çalışıyon, sonra chill. 4 tur atınca da uzun bi' mola verip keyfine bakıyon. GG WP.
              </p>
            </div>

            {/* Görevler */}
            <div className="space-y-3 glass p-4 rounded-lg">
              <h3 className="text-lg font-bold text-primary">✅ YAPILACAKLAR LİSTESİ (AKA To-Do List)</h3>
              <p className="text-muted-foreground">
                Kafandaki "yapılacaklar"ı buraya dök, unutma derdi kalmasın. Görevini yaz, aciliyetini seç, ekle. Bitirince tıkla, üstü çizilsin, kafan rahatlasın. GG.
              </p>
              <div className="text-sm text-muted-foreground space-y-1 ml-4">
                <p>🔴 <span className="font-semibold">Yüksek:</span> Acil işler, bunları kaçırma!</p>
                <p>🟠 <span className="font-semibold">Orta:</span> Önemli ama acele değil.</p>
                <p>🔵 <span className="font-semibold">Düşük:</span> Yapsan iyi olur işler.</p>
              </div>
            </div>

            {/* Planlayıcı */}
            <div className="space-y-3 glass p-4 rounded-lg">
              <h3 className="text-lg font-bold text-primary">🗓️ HAFTALIK PLAN (KAFA RAHAT!)</h3>
              <p className="text-muted-foreground">
                Haftanı baştan planla, "bugün ne çalışsam yaa" derdi bitsin. Planını yaz, gününü seç, ekle. Plan mı değişti? Sil gitsin.
              </p>
            </div>

            {/* Alışkanlıklar */}
            <div className="space-y-3 glass p-4 rounded-lg">
              <h3 className="text-lg font-bold text-primary">✨ ALIŞKANLIK İŞLERİ</h3>
              <p className="text-muted-foreground">
                "Her gün yapacağım!" dediğin şeyleri buraya yaz ki unutmayasın. Disiplin önemli bro. Yaptıkça işaretle ve seriyi bozma, rekor kır! 🔥
              </p>
            </div>

            {/* Ruh Hali */}
            <div className="space-y-3 glass p-4 rounded-lg">
              <h3 className="text-lg font-bold text-primary">😊 MODUN NE?</h3>
              <p className="text-muted-foreground">
                Bu sınav işleri insanı yorar. Burası tam bi' günlük gibi. Nasıl hissettiğini takip et, kendini anla. Emojini seç, istersen not bırak, kaydet.
              </p>
            </div>

            {/* İstatistikler */}
            <div className="space-y-3 glass p-4 rounded-lg">
              <h3 className="text-lg font-bold text-primary">📊 KARNE ZAMANI!</h3>
              <p className="text-muted-foreground">
                Burda ne kadar çalıştın, ne kadar yol aldın hepsi var. Resmen oyun sonu ekranı gibi. Toplam süre, biten görevler, seriler ve kazandığın havalı başarılar... Hepsi burada!
              </p>
            </div>

            {/* Son Söz */}
            <div className="space-y-2 text-center pt-4 border-t border-border/50">
              <p className="text-muted-foreground font-semibold">
                Hadi sen de gaza gel, YKS'yi çak geç! 🚀
              </p>
              <p className="text-sm text-muted-foreground">
                Herhangi bir sorun olursa veya bi' şey anlamadıysan, bu rehbere tekrar göz at. Sen yaparsın! 💪
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
