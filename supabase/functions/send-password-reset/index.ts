import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  try {
    const payload = await req.json();
    console.log("Received email hook payload:", payload);

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = payload;

    const resetUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    console.log("Sending password reset email to:", user.email);

    const { error } = await resend.emails.send({
      from: "YKS Odak <onboarding@resend.dev>",
      to: [user.email],
      subject: "Şifre Sıfırlama",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #9b87f5;">Şifre Sıfırlama</h1>
          <p>Merhaba,</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #9b87f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Şifremi Sıfırla
            </a>
          </div>
          <p>Ya da aşağıdaki kodu kullanabilirsiniz:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <code style="font-size: 16px; color: #333;">${token}</code>
          </div>
          <p style="color: #666; font-size: 14px;">Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">YKS Odak - DEHB Dostu Çalışma Asistanı</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully");

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
