import { OpenAI } from 'openai';
import { marked } from 'marked';
import type { AccessibilityIssue } from '../types';

// Initialize OpenAI with proper configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface AIRecommendation {
  explanation: string;
  suggestedFix: string;
  codeExample: string;
  additionalResources: string[];
}

export async function getAIRecommendations(issue: AccessibilityIssue): Promise<AIRecommendation> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Log the API key format (first few characters) for debugging
    console.log('API Key format check:', import.meta.env.VITE_OPENAI_API_KEY.substring(0, 6));

    // Optimize the prompt to reduce token usage
    const prompt = `
      WCAG Issue Analysis:
      - Description: ${issue.description}
      - Impact: ${issue.impact}
      - WCAG: ${issue.wcagCriteria[0] || 'N/A'}

      Provide:
      1. Brief issue explanation (2-3 sentences)
      2. Concise fix solution (2-3 steps)
      3. Simple code example
      4. One key resource URL
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5 for faster responses and lower token usage
      messages: [
        {
          role: "system",
          content: "You are a WCAG expert. Provide brief, practical accessibility fixes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300 // Further reduced token limit
    });

    const response = completion.choices[0].message.content || '';
    const parsedResponse = parseAIResponse(response);

    return {
      explanation: parsedResponse.explanation || 'No explanation available.',
      suggestedFix: parsedResponse.suggestedFix || 'No fix suggestion available.',
      codeExample: parsedResponse.codeExample || '',
      additionalResources: parsedResponse.additionalResources.length > 0 
        ? parsedResponse.additionalResources 
        : [issue.helpUrl || 'https://www.w3.org/WAI/WCAG21/quickref/']
    };
  } catch (error: any) {
    console.error('Error getting AI recommendations:', error);

    // Provide more specific error messages
    let errorMessage = "Unable to generate AI recommendations at this time.";
    if (error.code === 'context_length_exceeded') {
      errorMessage = "The issue description is too long for AI analysis. Please try with a simpler description.";
    } else if (error.code === 'invalid_api_key') {
      errorMessage = "OpenAI API key is invalid or not properly configured.";
    }

    return {
      explanation: errorMessage,
      suggestedFix: "Please refer to the WCAG documentation for guidance.",
      codeExample: "",
      additionalResources: [
        issue.helpUrl || 'https://www.w3.org/WAI/WCAG21/quickref/',
        'https://www.w3.org/WAI/tips/'
      ]
    };
  }
}

function parseAIResponse(markdown: string): AIRecommendation {
  const html = marked(markdown);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const sections = {
    explanation: '',
    suggestedFix: '',
    codeExample: '',
    additionalResources: [] as string[]
  };

  let currentSection = '';
  let inCodeBlock = false;

  // Process each line of the response
  markdown.split('\n').forEach(line => {
    const trimmedLine = line.trim();

    // Check for section headers
    if (trimmedLine.match(/^#+\s/)) {
      currentSection = determineSection(trimmedLine);
      return;
    }

    // Check for numbered list items
    if (trimmedLine.match(/^\d+\./)) {
      currentSection = determineSection(trimmedLine);
      return;
    }

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        currentSection = 'codeExample';
      }
      return;
    }

    // Add content to appropriate section
    if (currentSection && trimmedLine) {
      if (currentSection === 'additionalResources') {
        const urls = trimmedLine.match(/https?:\/\/[^\s)]+/g);
        if (urls) {
          sections.additionalResources.push(...urls);
        }
      } else if (currentSection === 'codeExample' && inCodeBlock) {
        sections.codeExample += trimmedLine + '\n';
      } else {
        sections[currentSection as keyof typeof sections] += 
          (sections[currentSection as keyof typeof sections] ? '\n' : '') + trimmedLine;
      }
    }
  });

  return {
    explanation: sections.explanation.trim(),
    suggestedFix: sections.suggestedFix.trim(),
    codeExample: sections.codeExample.trim(),
    additionalResources: sections.additionalResources
  };
}

function determineSection(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('explanation') || lowerText.includes('why') || lowerText.includes('issue')) {
    return 'explanation';
  }
  if (lowerText.includes('fix') || lowerText.includes('solution') || lowerText.includes('steps')) {
    return 'suggestedFix';
  }
  if (lowerText.includes('code') || lowerText.includes('example')) {
    return 'codeExample';
  }
  if (lowerText.includes('resource') || lowerText.includes('reference') || lowerText.includes('url')) {
    return 'additionalResources';
  }
  return '';
}