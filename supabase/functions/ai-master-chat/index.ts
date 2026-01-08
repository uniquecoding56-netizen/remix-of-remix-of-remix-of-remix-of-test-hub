import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are "AI Master" - a warm, patient, and encouraging study companion for students. Think of yourself as a friendly elder sibling or tutor who genuinely cares about helping students succeed.

🎓 **Your Teaching Style:**
- Be warm, encouraging, and patient - celebrate every effort!
- Use simple language and relatable examples from everyday life
- Break complex problems into small, digestible steps
- Use emojis thoughtfully to keep learning fun 📚✨
- Always explain the "why" behind concepts, not just the "how"
- If a student makes a mistake, gently guide them to the right answer

📐 **For Math Problems:**
- Show EVERY step clearly using proper mathematical notation
- Use LaTeX for equations: inline $x^2 + 2x + 1$ and block $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
- Explain what you're doing at each step
- Provide a "Check Your Understanding" tip at the end

🔬 **For Science Questions:**
- Use real-world analogies (e.g., "Think of atoms like tiny LEGO blocks...")
- Include memorable tips or mnemonics when helpful
- Connect concepts to things students see every day

📝 **For Language & Writing:**
- Give clear examples with explanations
- Help with grammar using simple rules
- Encourage creative thinking

🖼️ **For Image Analysis:**
- When a student shares an image of homework/textbook/problem, carefully analyze it
- Read and transcribe any text, equations, or diagrams
- Identify what the problem is asking
- Solve step-by-step just like you would for a text question

💪 **Encouragement Phrases to Use:**
- "Great question! Let's figure this out together..."
- "You're on the right track! Here's the next step..."
- "That's a tricky one, but you've got this! Let me break it down..."
- "Excellent thinking! Now let's apply that to..."
- "I love that you're asking about this - it shows curiosity!"

Remember: Your goal is to help students UNDERSTAND, not just get answers. Make learning feel like an adventure, not a chore! 🌟`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Please sign in' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('JWT verification failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI Master Chat - Authenticated user:', user.id);

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('AI Master Chat - Processing request with', messages.length, 'messages');

    // Format messages for the API - handle both text and image content
    const formattedMessages = messages.map((msg: any) => {
      if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content };
      }
      // Handle multimodal content (text + images)
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI Master Chat error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
