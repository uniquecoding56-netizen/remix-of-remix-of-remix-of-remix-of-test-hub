import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateTestRequest {
  classStandard: number;
  subject: string;
  chapters?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  questionCount?: number;
  isDaily?: boolean;
}

const SYSTEM_PROMPT = `You are an expert CBSE curriculum test generator. Generate high-quality multiple choice questions following the latest CBSE syllabus and pattern.

Guidelines:
- Questions should be clear, unambiguous, and appropriate for the specified class level
- Each question must have exactly 4 options with only 1 correct answer
- Include a mix of conceptual, application-based, and analytical questions
- For numerical subjects (Math, Physics), include calculation-based questions
- Questions should test understanding, not just memorization
- Options should be plausible but with only one clearly correct answer
- Difficulty should match the specified level:
  - Easy: Basic concepts, direct questions
  - Medium: Application of concepts, moderate complexity
  - Hard: Higher-order thinking, complex problems, multi-step solutions

You MUST respond with a valid JSON object in this exact format:
{
  "title": "Test title including subject and topic",
  "description": "Brief description of what the test covers",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

The correctAnswer is the index (0-3) of the correct option.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase credentials not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { classStandard, subject, chapters, difficulty, topic, questionCount = 10, isDaily = false }: GenerateTestRequest = await req.json();

    console.log('Generate AI Test - Request:', { classStandard, subject, chapters, difficulty, topic, questionCount, isDaily });

    // Check if daily test already exists for today
    if (isDaily) {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingDaily } = await supabase
        .from('daily_ai_tests')
        .select('test_id')
        .eq('generated_date', today)
        .maybeSingle();

      if (existingDaily) {
        console.log('Daily test already exists for today');
        return new Response(JSON.stringify({ 
          success: true, 
          testId: existingDaily.test_id,
          message: 'Daily test already generated' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Build the prompt
    const chaptersInfo = chapters && chapters.length > 0 
      ? `Chapters to cover: ${chapters.join(', ')}`
      : topic ? `Topic: ${topic}` : 'Cover the most important concepts from the syllabus';

    const userPrompt = `Generate a ${difficulty} difficulty test for Class ${classStandard} ${subject}.
${chaptersInfo}
Number of questions: ${questionCount}

Create questions that are appropriate for CBSE Class ${classStandard} students studying ${subject}.
Make sure all questions follow the CBSE curriculum and are exam-relevant.`;

    console.log('Calling AI Gateway to generate test...');

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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI Response received, parsing...');

    // Parse the JSON response
    let testData;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      testData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse test data from AI response');
    }

    // Add IDs to questions
    const questionsWithIds = testData.questions.map((q: any, index: number) => ({
      ...q,
      id: `q-${index}-${Date.now()}`,
    }));

    // Map subject to category
    const categoryMap: Record<string, string> = {
      'Mathematics': 'math',
      'Science': 'science',
      'Physics': 'science',
      'Chemistry': 'science',
      'Biology': 'science',
      'English': 'english',
      'Hindi': 'languages',
      'Social Science': 'history',
      'History': 'history',
      'Geography': 'geography',
      'Political Science': 'other',
      'Economics': 'other',
      'Computer Science': 'computer_science',
      'Information Technology': 'computer_science',
      'Accountancy': 'other',
      'Business Studies': 'other',
    };

    const category = categoryMap[subject] || 'other';

    // Insert the test (user_id is null for AI-generated tests)
    const { data: newTest, error: insertError } = await supabase
      .from('tests')
      .insert({
        user_id: null,
        title: testData.title || `Class ${classStandard} ${subject} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Test`,
        description: testData.description || `AI-generated ${difficulty} test for Class ${classStandard} ${subject}`,
        category,
        questions: questionsWithIds,
        class_standard: classStandard,
        subject,
        topic: topic || (chapters ? chapters.join(', ') : null),
        difficulty,
        is_ai_generated: true,
        timer_seconds: questionCount * 60, // 1 minute per question
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert test:', insertError);
      throw new Error('Failed to save test');
    }

    console.log('Test created successfully:', newTest.id);

    // If this is a daily test, record it
    if (isDaily) {
      const { error: dailyError } = await supabase
        .from('daily_ai_tests')
        .insert({
          test_id: newTest.id,
          generated_date: new Date().toISOString().split('T')[0],
        });

      if (dailyError) {
        console.error('Failed to record daily test:', dailyError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      testId: newTest.id,
      message: 'Test generated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate AI Test error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate test' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
