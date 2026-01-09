import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { type, tool, content, question, chatHistory, imageData, url, fileType, fileData, fileName } = body;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const callAI = async (messages: any[], model = 'google/gemini-2.5-flash') => {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error('AI API error:', response.status, errText);
        throw new Error(`AI API error: ${response.status}`);
      }
      return response.json();
    };

    // Handle file processing (images, documents, audio, video)
    if (type === 'file-process' && fileData) {
      const prompt = fileType === 'image' 
        ? 'Extract and transcribe ALL text, equations, diagrams from this image. Format clearly for study.'
        : fileType === 'audio' || fileType === 'video'
        ? 'Transcribe this audio/video content completely. Include speaker labels if multiple speakers.'
        : 'Extract all text content from this document. Preserve structure, headings, and formatting.';

      const data = await callAI([{ 
        role: 'user', 
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: fileData } }
        ]
      }]);

      const extractedContent = data.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ content: extractedContent, language: 'auto-detected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    // Check if URL is a YouTube URL
    const isYouTubeUrl = (url: string): boolean => {
      return url.includes('youtube.com/watch') || 
             url.includes('youtu.be/') || 
             url.includes('youtube.com/embed') ||
             url.includes('youtube.com/live/') ||
             url.includes('youtube.com/shorts/');
    };

    // Get YouTube video metadata
    const getYouTubeMetadata = async (videoId: string) => {
      try {
        // Try to get metadata from YouTube oEmbed API
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);
        if (response.ok) {
          const data = await response.json();
          return {
            title: data.title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            author: data.author_name
          };
        }
      } catch (e) {
        console.error('Failed to fetch YouTube metadata:', e);
      }
      return {
        title: 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        author: null
      };
    };

    // Handle YouTube URL with multiple transcript fallback methods
    if (type === 'youtube' && url) {
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return new Response(JSON.stringify({ 
          error: 'Invalid YouTube URL',
          content: 'Please provide a valid YouTube video URL.'
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const metadata = await getYouTubeMetadata(videoId);
      let transcript = '';
      let transcriptMethod = '';

      // Method 1: Try YouTube Transcript API (using a public service)
      try {
        const transcriptApiUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
        const transcriptResponse = await fetch(transcriptApiUrl);
        if (transcriptResponse.ok) {
          const transcriptXml = await transcriptResponse.text();
          // Parse XML transcript
          const textMatches = transcriptXml.match(/<text[^>]*>([^<]+)<\/text>/g);
          if (textMatches && textMatches.length > 0) {
            transcript = textMatches.map(match => {
              const text = match.replace(/<[^>]+>/g, '');
              return text;
            }).join(' ');
            transcriptMethod = 'official_captions';
          }
        }
      } catch (e) {
        console.log('Method 1 failed:', e);
      }

      // Method 2: Try alternative transcript service
      if (!transcript && videoId) {
        try {
          const altApiUrl = `https://youtube-transcript-api.vercel.app/api/transcript?videoId=${videoId}`;
          const altResponse = await fetch(altApiUrl);
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.transcript) {
              transcript = altData.transcript.map((item: any) => item.text).join(' ');
              transcriptMethod = 'auto_generated_captions';
            }
          }
        } catch (e) {
          console.log('Method 2 failed:', e);
        }
      }

      // Method 3: Use AI to analyze video and generate content based on title/description
      if (!transcript) {
        try {
          const aiPrompt = `Analyze this YouTube video URL: ${url}
Video Title: ${metadata.title}

Since I cannot access the video transcript directly, please:
1. Provide educational content related to the video topic based on the title
2. Create a comprehensive study guide that would be useful for someone watching this video
3. Include key concepts, important points, and study tips related to the topic
4. Format it as if it were a transcript summary with timestamps and key sections

Make it educational and useful for studying.`;
          
          const aiData = await callAI([{ role: 'user', content: aiPrompt }]);
          transcript = aiData.choices?.[0]?.message?.content || '';
          transcriptMethod = 'ai_generated';
        } catch (e) {
          console.error('Method 3 failed:', e);
        }
      }

      // If all methods fail, provide helpful guidance
      if (!transcript) {
        transcript = `This YouTube video (${metadata.title}) could not be automatically transcribed. 

To study from this video:
1. Open the video on YouTube and click "Show transcript" in the video menu
2. Copy the transcript and paste it in the "Paste" tab
3. Alternatively, take notes while watching the video

Video URL: ${url}`;
        transcriptMethod = 'manual_guidance';
      }

      return new Response(JSON.stringify({ 
        content: transcript,
        title: metadata.title,
        videoId: videoId,
        videoUrl: url,
        thumbnail: metadata.thumbnail,
        transcriptMethod: transcriptMethod,
        language: 'auto-detected'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Handle website URL with content analysis and filtering
    if (type === 'website' && url) {
      // Check if it's actually a YouTube URL and redirect to YouTube handler
      if (isYouTubeUrl(url)) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          // Redirect to YouTube processing
          const metadata = await getYouTubeMetadata(videoId);
          let transcript = '';
          let transcriptMethod = '';

          // Try multiple methods to get transcript
          try {
            const transcriptApiUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
            const transcriptResponse = await fetch(transcriptApiUrl);
            if (transcriptResponse.ok) {
              const transcriptXml = await transcriptResponse.text();
              const textMatches = transcriptXml.match(/<text[^>]*>([^<]+)<\/text>/g);
              if (textMatches && textMatches.length > 0) {
                transcript = textMatches.map(match => match.replace(/<[^>]+>/g, '')).join(' ');
                transcriptMethod = 'official_captions';
              }
            }
          } catch (e) {
            console.log('YouTube transcript method 1 failed:', e);
          }

          // Use AI to generate content if no transcript
          if (!transcript) {
            try {
              const aiPrompt = `Analyze this YouTube video: ${url}\nVideo Title: ${metadata.title}\n\nSince I cannot access the video transcript directly, please:\n1. Provide educational content related to the video topic based on the title\n2. Create a comprehensive study guide\n3. Include key concepts and study tips\n\nMake it educational and useful for studying.`;
              const aiData = await callAI([{ role: 'user', content: aiPrompt }]);
              transcript = aiData.choices?.[0]?.message?.content || '';
              transcriptMethod = 'ai_generated';
            } catch (e) {
              console.error('AI generation failed:', e);
            }
          }

          if (!transcript) {
            transcript = `This YouTube video (${metadata.title}) could not be automatically transcribed.\n\nTo study from this video:\n1. Open the video on YouTube and click "Show transcript"\n2. Copy the transcript and paste it in the "Paste" tab\n\nVideo URL: ${url}`;
            transcriptMethod = 'manual_guidance';
          }

          return new Response(JSON.stringify({ 
            content: transcript,
            title: metadata.title,
            videoId: videoId,
            videoUrl: url,
            thumbnail: metadata.thumbnail,
            transcriptMethod: transcriptMethod,
            language: 'auto-detected'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
      }

      // First, check if URL is valid and fetch content
      let websiteContent = '';
      let websiteTitle = 'Website Content';
      
      try {
        // Try to fetch the website content
        const fetchResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (fetchResponse.ok) {
          const html = await fetchResponse.text();
          // Extract title
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) websiteTitle = titleMatch[1];
          
          // Extract main content (simplified - remove scripts, styles, etc.)
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyMatch) {
            let bodyText = bodyMatch[1];
            // Remove script and style tags
            bodyText = bodyText.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            bodyText = bodyText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            // Extract text from common content tags
            const contentTags = bodyText.match(/<(p|h1|h2|h3|h4|h5|h6|li|article|section)[^>]*>([^<]+)<\/\1>/gi);
            if (contentTags) {
              websiteContent = contentTags.map(tag => tag.replace(/<[^>]+>/g, ' ').trim()).join('\n\n');
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch website:', e);
      }

      // Use AI to analyze and filter content
      const analysisPrompt = `Analyze this website content for educational purposes:

URL: ${url}
Title: ${websiteTitle}
Content: ${websiteContent.substring(0, 10000)}

IMPORTANT: Only proceed if this content is:
- Educational (academic, technology, documentation, tutorials, research)
- Technology-related (programming, software, hardware, tech news)
- Documentation (API docs, technical docs, guides)
- Professional/Informative content

DO NOT proceed if content contains:
- Adult/sexual content
- Violence or abusive content
- Illegal activities
- Hate speech
- Spam or malicious content

If content is appropriate, analyze it and create a comprehensive study guide with:
1. Main topics and concepts
2. Key points and takeaways
3. Important details
4. Study recommendations

If content is NOT appropriate, respond with: "CONTENT_FILTERED: This website content does not meet our educational content guidelines."

Return JSON:
{
  "isAppropriate": true/false,
  "analysis": "detailed analysis if appropriate",
  "keyTopics": ["topic1", "topic2"],
  "studyGuide": "comprehensive study guide"
}`;

      const analysisData = await callAI([{ role: 'user', content: analysisPrompt }]);
      const analysisText = analysisData.choices?.[0]?.message?.content || '';
      
      // Check if content was filtered
      if (analysisText.includes('CONTENT_FILTERED')) {
        return new Response(JSON.stringify({ 
          error: 'Content filtered',
          content: 'This website content does not meet our educational content guidelines. Please use educational, technology, or documentation websites only.',
          title: websiteTitle
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Parse AI response
      let analysisResult = {
        isAppropriate: true,
        analysis: analysisText,
        keyTopics: [],
        studyGuide: analysisText
      };
      
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = { ...analysisResult, ...JSON.parse(jsonMatch[0]) };
        }
      } catch (e) {
        console.error('Failed to parse analysis:', e);
      }

      if (!analysisResult.isAppropriate) {
        return new Response(JSON.stringify({ 
          error: 'Content filtered',
          content: 'This website content does not meet our educational content guidelines.',
          title: websiteTitle
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ 
        content: analysisResult.studyGuide || analysisResult.analysis || websiteContent,
        title: websiteTitle,
        websiteUrl: url,
        keyTopics: analysisResult.keyTopics || [],
        language: 'auto-detected'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Handle language detection
    if (type === 'detect-language' && content) {
      const data = await callAI([{ 
        role: 'user', 
        content: `Detect the language of this text and respond with ONLY the language name (e.g., "English", "Hindi", "Spanish"): "${content.substring(0, 200)}"`
      }]);
      return new Response(JSON.stringify({ language: data.choices?.[0]?.message?.content?.trim() || 'Unknown' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Advanced flashcard generation
    if (type === 'generate' && tool === 'flashcards-advanced') {
      const prompt = `Create 10-15 comprehensive flashcards from this content. Include hints and categorize by topic.

Content: ${content}

Return JSON array ONLY:
[{"front": "question", "back": "answer", "hint": "helpful hint", "difficulty": "easy|medium|hard", "category": "topic name"}, ...]`;

      const data = await callAI([{ role: 'user', content: prompt }]);
      const text = data.choices?.[0]?.message?.content || '[]';
      let flashcards = [];
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) flashcards = JSON.parse(jsonMatch[0]);
      } catch { flashcards = [{ front: "Error", back: "Please try again", hint: "", difficulty: "medium", category: "Error" }]; }

      return new Response(JSON.stringify({ flashcards }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Advanced notes generation with detailed content
    if (type === 'generate' && tool === 'notes-advanced') {
      const prompt = `You are an expert educator and study material creator. Create EXTREMELY DETAILED and COMPREHENSIVE study notes from this content.

Content to analyze:
${content}

IMPORTANT: Generate thorough, educational notes that would help a student fully understand and master this material.

Return JSON ONLY with this exact structure:
{
  "summary": "Write a DETAILED 4-6 paragraph summary covering ALL major topics. Use markdown formatting with **bold** for key terms, bullet points, and clear sections. Include context, explanations, and connections between concepts. Make it comprehensive enough that someone could understand the topic from this alone.",
  "keyPoints": [
    "Detailed key point 1 with explanation and context",
    "Detailed key point 2 with specific examples or data",
    "Detailed key point 3 explaining the significance",
    "... at least 8-12 key points with substance"
  ],
  "keyConcepts": [
    {
      "term": "Concept name",
      "definition": "Detailed definition with at least 2-3 sentences explaining the concept thoroughly",
      "importance": "Why this concept matters - practical applications, exam relevance, real-world usage",
      "examples": "Specific examples or use cases"
    }
  ],
  "importantQuotes": ["Direct quotes or key statements from the material with context"],
  "actionItems": [
    "Specific study task: What to memorize",
    "Practice exercise: How to apply the concept",
    "Review suggestion: What to revisit"
  ],
  "studyTips": [
    "Memory technique specific to this content",
    "Connection to other topics or subjects",
    "Common mistakes to avoid",
    "Exam preparation strategy for this material"
  ],
  "additionalNotes": "Any other important information, warnings, or advanced insights not covered above"
}

Generate AT LEAST:
- 8-12 key points
- 5-8 key concepts with detailed definitions
- 4-6 study tips
- 3-5 action items`;

      const data = await callAI([{ role: 'user', content: prompt }]);
      const text = data.choices?.[0]?.message?.content || '{}';
      let result = { summary: '', keyPoints: [], keyConcepts: [], importantQuotes: [], actionItems: [], studyTips: [] };
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) result = { ...result, ...JSON.parse(jsonMatch[0]) };
      } catch { result.summary = text; }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Concept Mastery Quiz generation
    if (type === 'generate' && tool === 'concept-quiz') {
      const prompt = `Analyze this content and create 8-10 MCQ questions testing concept understanding.

Content: ${content}

Return JSON array ONLY:
[{
  "question": "the question",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "why the answer is correct",
  "difficulty": "easy|medium|hard",
  "concept": "the concept being tested"
}, ...]`;

      const data = await callAI([{ role: 'user', content: prompt }]);
      const text = data.choices?.[0]?.message?.content || '[]';
      let questions = [];
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      } catch { questions = []; }

      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Active Recall prompts generation
    if (type === 'generate' && tool === 'active-recall') {
      const prompt = `Create 5-6 active recall prompts from this content. These are open-ended questions that require the student to recall and explain concepts from memory.

Content: ${content}

Return JSON array ONLY:
[{
  "question": "open-ended question requiring explanation",
  "keyPoints": ["key point 1 expected in answer", "key point 2", "key point 3"],
  "hint": "a helpful hint without giving away the answer"
}, ...]`;

      const data = await callAI([{ role: 'user', content: prompt }]);
      const text = data.choices?.[0]?.message?.content || '[]';
      let prompts = [];
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) prompts = JSON.parse(jsonMatch[0]);
      } catch { prompts = []; }

      return new Response(JSON.stringify({ prompts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Active Recall evaluation
    if (type === 'evaluate' && tool === 'active-recall') {
      const { question, keyPoints, userAnswer } = body;
      
      const evalPrompt = `Evaluate this student's answer for an active recall exercise.

Question: ${question}
Expected Key Points: ${JSON.stringify(keyPoints)}
Student's Answer: ${userAnswer}

Evaluate how well the student covered the key points. Return JSON ONLY:
{
  "score": 0-100,
  "feedback": "brief encouraging feedback",
  "missedPoints": ["any key points the student missed"],
  "suggestions": ["1-2 suggestions for improvement"]
}`;

      const data = await callAI([{ role: 'user', content: evalPrompt }]);
      const text = data.choices?.[0]?.message?.content || '{}';
      let result = { score: 50, feedback: 'Good effort!', missedPoints: [], suggestions: [] };
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) result = { ...result, ...JSON.parse(jsonMatch[0]) };
      } catch {}

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Original flashcard generation (backward compatibility)
    if (type === 'generate' && tool === 'flashcards') {
      const prompt = `Create 8-12 flashcards from this content:\n\n${content}\n\nReturn JSON array: [{"front": "question", "back": "answer"}, ...]`;
      const data = await callAI([{ role: 'user', content: prompt }]);
      const text = data.choices?.[0]?.message?.content || '[]';
      let flashcards = [];
      try { const m = text.match(/\[[\s\S]*\]/); if (m) flashcards = JSON.parse(m[0]); } catch { flashcards = []; }
      return new Response(JSON.stringify({ flashcards }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Quiz generation
    if (type === 'generate' && tool === 'quiz') {
      const prompt = `Create 5-8 MCQ questions from:\n\n${content}\n\nReturn JSON: [{"question": "text", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "why"}, ...]`;
      const data = await callAI([{ role: 'user', content: prompt }]);
      const text = data.choices?.[0]?.message?.content || '[]';
      let questions = [];
      try { const m = text.match(/\[[\s\S]*\]/); if (m) questions = JSON.parse(m[0]); } catch { questions = []; }
      return new Response(JSON.stringify({ questions }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Summary generation
    if (type === 'generate' && tool === 'summary') {
      const prompt = `Create summary and key points from:\n\n${content}\n\nReturn JSON: {"summary": "text", "keyPoints": ["point 1", ...]}`;
      const data = await callAI([{ role: 'user', content: prompt }]);
      const text = data.choices?.[0]?.message?.content || '{}';
      let result = { summary: '', keyPoints: [] };
      try { const m = text.match(/\{[\s\S]*\}/); if (m) result = JSON.parse(m[0]); } catch { result.summary = text; }
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // AI Master Tutor Q&A
    if ((type === 'qa' || type === 'tutor-qa') && question) {
      const historyMessages = (chatHistory || []).map((msg: any) => ({ role: msg.role, content: msg.content }));
      
      const systemPrompt = `You are an expert, friendly AI tutor. The student has provided this study material:

---
${content.substring(0, 8000)}
---

Your role:
- Answer questions ONLY based on this content
- Explain concepts step-by-step with simple language
- Use analogies and real-world examples
- Be encouraging and patient like a great teacher
- Use bullet points and formatting for clarity
- If asked, create mnemonics or memory tricks
- For math/science, show work step-by-step
- If something isn't in the content, politely say so

Always be helpful, clear, and educational!`;

      const data = await callAI([
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: question }
      ]);

      return new Response(JSON.stringify({ answer: data.choices?.[0]?.message?.content || 'Sorry, I could not generate an answer.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Image analysis (backward compatibility)
    if (type === 'image' && imageData) {
      const data = await callAI([{ 
        role: 'user', 
        content: [
          { type: 'text', text: 'Extract and transcribe all text, equations, diagrams from this image for studying.' },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      }]);
      return new Response(JSON.stringify({ content: data.choices?.[0]?.message?.content || '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save flashcards
    if (type === 'save-flashcards' && body.flashcards) {
      try {
        const { flashcards, title, sourceType, sourceUrl } = body;
        const { data, error } = await supabase
          .from('saved_flashcards')
          .insert({
            user_id: user.id,
            flashcards: flashcards,
            title: title || 'Untitled Flashcards',
            source_type: sourceType || null,
            source_url: sourceUrl || null
          })
          .select()
          .single();

        if (error) {
          console.error('Database error saving flashcards:', error);
          return new Response(JSON.stringify({ 
            error: error.message || 'Failed to save flashcards.',
            details: error.details || error.hint || ''
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('Error saving flashcards:', err);
        return new Response(JSON.stringify({ 
          error: err.message || 'An unexpected error occurred while saving flashcards'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Save notes
    if (type === 'save-notes' && body.notes) {
      try {
        const { notes, title, sourceType, sourceUrl } = body;
        const { data, error } = await supabase
          .from('saved_notes')
          .insert({
            user_id: user.id,
            notes: notes,
            title: title || 'Untitled Notes',
            source_type: sourceType || null,
            source_url: sourceUrl || null
          })
          .select()
          .single();

        if (error) {
          console.error('Database error saving notes:', error);
          return new Response(JSON.stringify({ 
            error: error.message || 'Failed to save notes.',
            details: error.details || error.hint || ''
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('Error saving notes:', err);
        return new Response(JSON.stringify({ 
          error: err.message || 'An unexpected error occurred while saving notes'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Save YouTube video
    if (type === 'save-youtube' && body.videoData) {
      try {
        const { videoData } = body;
        const { data, error } = await supabase
          .from('saved_youtube_videos')
          .insert({
            user_id: user.id,
            video_url: videoData.videoUrl,
            video_id: videoData.videoId,
            video_title: videoData.videoTitle || 'Untitled Video',
            video_thumbnail: videoData.videoThumbnail,
            transcript: videoData.transcript || '',
            generated_notes: videoData.generatedNotes || null
          })
          .select()
          .single();

        if (error) {
          console.error('Database error saving YouTube video:', error);
          return new Response(JSON.stringify({ 
            error: error.message || 'Failed to save YouTube video. Please ensure the database migration has been applied.',
            details: error.details || error.hint || ''
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('Error saving YouTube video:', err);
        return new Response(JSON.stringify({ 
          error: err.message || 'An unexpected error occurred while saving YouTube video'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Save website content
    if (type === 'save-website' && body.websiteData) {
      const { websiteData } = body;
      const { data, error } = await supabase
        .from('saved_website_content')
        .insert({
          user_id: user.id,
          website_url: websiteData.websiteUrl,
          website_title: websiteData.websiteTitle,
          content: websiteData.content,
          generated_content: websiteData.generatedContent || null
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, id: data.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save Q&A conversation
    if (type === 'save-qa' && body.conversationData) {
      try {
        const { conversationData } = body;
        const { data, error } = await supabase
          .from('saved_qa_conversations')
          .insert({
            user_id: user.id,
            content: conversationData.content || '',
            messages: conversationData.messages || [],
            title: conversationData.title || 'Untitled Conversation'
          })
          .select()
          .single();

        if (error) {
          console.error('Database error saving Q&A conversation:', error);
          return new Response(JSON.stringify({ 
            error: error.message || 'Failed to save conversation. Please ensure the database migration has been applied.',
            details: error.details || error.hint || ''
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        console.error('Error saving Q&A conversation:', err);
        return new Response(JSON.stringify({ 
          error: err.message || 'An unexpected error occurred while saving conversation'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate shareable link
    if (type === 'share-content' && body.contentData) {
      const { contentData, contentType } = body;
      
      // Generate unique share token
      const shareToken = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      
      // Get thumbnail for YouTube content
      let thumbnailUrl = null;
      if (contentType === 'youtube' && contentData.videoThumbnail) {
        thumbnailUrl = contentData.videoThumbnail;
      }
      
      const { data, error } = await supabase
        .from('shared_content')
        .insert({
          share_token: shareToken,
          content_type: contentType,
          content_data: contentData,
          user_id: user.id,
          title: contentData.title || null,
          thumbnail_url: thumbnailUrl,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
        })
        .select()
        .single();

      if (error) throw error;
      
      // Get the frontend URL from environment or use default
      const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://pdfstudy.online';
      const shareUrl = `${frontendUrl}/shared/${shareToken}`;
      
      return new Response(JSON.stringify({ 
        success: true, 
        shareToken: shareToken,
        shareUrl: shareUrl,
        thumbnailUrl: thumbnailUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get shared content
    if (type === 'get-shared-content' && body.shareToken) {
      const { shareToken } = body;
      
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Shared content not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'This shared content has expired' }), {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update view count
      await supabase
        .from('shared_content')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return new Response(JSON.stringify({ 
        contentType: data.content_type,
        contentData: data.content_data,
        title: data.title,
        thumbnailUrl: data.thumbnail_url,
        sharedBy: data.user_id,
        viewCount: (data.view_count || 0) + 1
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Link processing (backward compatibility)
    if (type === 'link' && url) {
      const data = await callAI([{ role: 'user', content: `Study guidance for URL: ${url}` }]);
      return new Response(JSON.stringify({ content: data.choices?.[0]?.message?.content || 'Please paste content directly.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid request type' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Study tools error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
