import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { subjectPerformances, studyTimeLogs, examResults, stats, focusSessions } = await req.json();

    // Prepare analysis prompt
    const analysisPrompt = `Sen bir YKS danışmanısın. Öğrencinin verilerini analiz edip kişiselleştirilmiş bir çalışma planı oluştur.

ÖĞRENCİ VERİLERİ:

KONU PERFORMANSLARI:
${subjectPerformances.map((s: any) => `- ${s.name}: %${s.successRate.toFixed(1)} başarı (${s.correct} doğru, ${s.wrong} yanlış, ${s.empty} boş)`).join('\n')}

ÇALIŞMA SAATİ VERİMLİLİĞİ:
${studyTimeLogs.map((log: any) => `- ${log.hour}:00 saati: ${log.productivity}/10 verimlilik`).join('\n')}

DENEME SONUÇLARI:
${examResults.map((exam: any) => `- ${exam.date}: Toplam ${exam.totalNet} net (${exam.subjects.map((s: any) => `${s.name}: ${s.net}`).join(', ')})`).join('\n')}

İSTATİSTİKLER:
- Disiplin: ${stats.discipline}
- Odaklanma: ${stats.focus}
- Enerji: ${stats.energy}
- Bilgi: ${stats.knowledge}
- Toplam odaklanma oturumu: ${focusSessions.total}
- Toplam çalışma dakikası: ${focusSessions.totalMinutes}

GÖREV:
1. Güçlü ve zayıf konuları belirle
2. En verimli çalışma saatlerini tespit et
3. Haftalık kişisel çalışma programı oluştur (hangi gün, hangi saat, hangi konu)
4. Deneme sınavı performans tahmini yap (gelecek 3 ay için)
5. Özel öneriler sun (konu tekrar stratejisi, mola düzeni, motivasyon taktikleri)

ÇIKTI FORMATI:
Detaylı, motive edici ve uygulanabilir bir plan sun. Emoji kullan, pozitif dil kullan.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Sen deneyimli bir YKS danışmanı ve eğitim uzmanısın. Öğrencilere kişiselleştirilmiş, bilimsel ve motive edici çalışma planları hazırlıyorsun.' },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const plan = data.choices[0].message.content;

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-study-plan function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
