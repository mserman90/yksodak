import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Geçerli bir email adresi giriniz");
const passwordSchema = z.string().min(6, "Şifre en az 6 karakter olmalıdır");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      redirectTo: `${window.location.origin}/`,
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
            YKS'ye hazırlanırken odaklanmanı ve verimini artırmak için tasarlandı. 
            Pomodoro tekniği, görev yönetimi, alışkanlık takibi ve daha fazlasıyla 
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
                      placeholder="En az 6 karakter"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;