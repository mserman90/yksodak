import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, UserX } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Geçerli bir email adresi giriniz");
const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır")
  .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
  .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
  .regex(/[0-9]/, "Şifre en az bir rakam içermelidir")
  .regex(/[^A-Za-z0-9]/, "Şifre en az bir özel karakter içermelidir");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAnonymousWarning, setShowAnonymousWarning] = useState(false);

  // Redirect if already logged in or handle password recovery
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setShowPasswordUpdate(true);
        } else if (session?.user && !showPasswordUpdate) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !showPasswordUpdate) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, showPasswordUpdate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Bu email adresi zaten kayıtlı. Giriş yapmayı deneyin.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.message,
        });
      }
    } else {
      toast({
        title: "Başarılı!",
        description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Email veya şifre hatalı.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.message,
        });
      }
    } else {
      navigate("/");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      emailSchema.parse(resetEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/auth`,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } else {
      toast({
        title: "Email Gönderildi",
        description: "Şifre sıfırlama bağlantısı email adresinize gönderildi.",
      });
      setResetEmail("");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Şifreler eşleşmiyor.",
      });
      return;
    }

    try {
      passwordSchema.parse(newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.errors[0].message,
        });
        return;
      }
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } else {
      toast({
        title: "Başarılı!",
        description: "Şifreniz başarıyla güncellendi.",
      });
      setShowPasswordUpdate(false);
      setNewPassword("");
      setConfirmPassword("");
      navigate("/");
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    } else {
      toast({
        title: "Misafir olarak giriş yaptınız",
        description: "Verileriniz cihazınızda geçici olarak saklanacak.",
      });
      navigate("/");
    }
  };

  // Show password update form when recovery link is clicked
  if (showPasswordUpdate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="glass p-4 rounded-2xl">
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Yeni Şifre Belirle
            </h1>
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Şifre Gereksinimleri</CardTitle>
              <CardDescription className="space-y-1">
                <p>✓ En az 8 karakter</p>
                <p>✓ En az bir büyük harf (A-Z)</p>
                <p>✓ En az bir küçük harf (a-z)</p>
                <p>✓ En az bir rakam (0-9)</p>
                <p>✓ En az bir özel karakter (!@#$%...)</p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Yeni Şifre</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Şifreyi Güncelle
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="glass p-4 rounded-2xl">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            YKS Odak
          </h1>
          <p className="text-muted-foreground">
            YKS'ye hazırlanırken oyunlaştırma ile motivasyonunu artır! 
            Görevler, başarımlar, karakter gelişimi ve daha fazlasıyla 
            başarıya giden yolda yanındayız! 🎯
          </p>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Hoş Geldin!</CardTitle>
            <CardDescription>
              Hesabına giriş yap veya yeni hesap oluştur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Giriş Yap</TabsTrigger>
                <TabsTrigger value="signup">Üye Ol</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Şifre</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Giriş Yap
                  </Button>
                </form>
                
                <div className="text-center">
                  <Tabs defaultValue="main">
                    <TabsList className="inline-flex">
                      <TabsTrigger value="reset" className="text-sm text-muted-foreground hover:text-foreground">
                        Şifremi Unuttum
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="reset" className="mt-4">
                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email Adresiniz</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="ornek@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            disabled={loading}
                          />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Şifre Sıfırlama Linki Gönder
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifre</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="En az 8 karakter, büyük/küçük harf, rakam ve özel karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Hesap Oluştur
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAnonymousWarning(true)}
                disabled={loading}
              >
                <UserX className="mr-2 h-4 w-4" />
                Misafir Olarak Devam Et
              </Button>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showAnonymousWarning} onOpenChange={setShowAnonymousWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-destructive" />
                Misafir Girişi Uyarısı
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 text-left">
                <p className="font-semibold text-foreground">
                  Misafir olarak giriş yapmak istediğinizden emin misiniz?
                </p>
                <div className="space-y-2">
                  <p className="text-destructive font-medium">⚠️ Dezavantajlar:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Verileriniz kalıcı olarak <strong>kaydedilmeyecektir</strong></li>
                    <li>Tarayıcı geçmişi silindiğinde tüm ilerlemeniz <strong>kaybolacaktır</strong></li>
                    <li>Farklı bir cihazdan giriş yaptığınızda verilerinize <strong>ulaşamazsınız</strong></li>
                    <li>Başarımlar, seviye ve istatistikleriniz <strong>silinebilir</strong></li>
                    <li>Yedekleme ve geri yükleme yapma imkanınız <strong>olmayacaktır</strong></li>
                  </ul>
                </div>
                <p className="text-sm mt-4">
                  <strong>Önerimiz:</strong> Verilerinizi güvende tutmak için üye olarak giriş yapmanızı tavsiye ederiz.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAnonymousSignIn}
                className="bg-destructive hover:bg-destructive/90"
              >
                Yine de Devam Et
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Auth;