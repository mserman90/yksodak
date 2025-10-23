import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Check, Smartphone, Bell, Zap, Wifi, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: 'Offline Çalışma',
      description: 'İnternet olmadan da görevlerine devam et, senkronizasyon otomatik.',
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Bildirimler',
      description: 'İlaç hatırlatmaları, görev deadline\'ları ve motivasyon mesajları.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Hızlı Erişim',
      description: 'Ana ekrandan tek tıkla aç, native uygulama hızında.',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobil Optimize',
      description: 'Telefon ve tablet için optimize edilmiş, pil dostu.',
    },
  ];

  const iosSteps = [
    'Safari ile siteyi aç',
    'Paylaş butonuna bas (⎙)',
    '"Ana Ekrana Ekle" seçeneğini seç',
    'Ekle\'ye bas',
  ];

  const androidSteps = [
    'Chrome ile siteyi aç',
    'Menü butonuna bas (⋮)',
    '"Ana ekrana ekle" veya "Yükle" seçeneğini seç',
    'Yükle\'ye bas',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Ana Sayfaya Dön
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            YKS Quest'i Telefonuna Yükle
          </h1>
          <p className="text-xl text-muted-foreground">
            Offline çalış, bildirim al, daha hızlı erişim sağla!
          </p>
        </div>

        {isInstalled ? (
          <Card className="p-8 text-center mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2 text-green-700 dark:text-green-400">
              ✅ Uygulama Yüklendi!
            </h2>
            <p className="text-green-600 dark:text-green-300">
              YKS Quest artık cihazınızda. Ana ekrandan açabilirsiniz!
            </p>
          </Card>
        ) : deferredPrompt ? (
          <Card className="p-8 text-center mb-8">
            <Download className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h2 className="text-2xl font-bold mb-4">Hemen Yükle</h2>
            <p className="text-muted-foreground mb-6">
              Tek tıkla YKS Quest'i cihazına yükle. Hiçbir uygulama mağazası gerekli değil!
            </p>
            <Button
              onClick={handleInstall}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-8 py-6 text-lg"
            >
              <Download className="w-6 h-6 mr-2" />
              Ana Ekrana Ekle
            </Button>
          </Card>
        ) : null}

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="text-purple-600 dark:text-purple-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🍎</span> iOS (iPhone/iPad)
            </h3>
            <ol className="space-y-3">
              {iosSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🤖</span> Android
            </h3>
            <ol className="space-y-3">
              {androidSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Install;
