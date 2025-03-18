import React, { useState } from 'react';
import { Brain, Code, BookOpen, ExternalLink } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { AccessibilityIssue } from '../types';
import { getAIRecommendations } from '../utils/aiRecommendations';
import { getWCAGInfo } from '../utils/wcagHelper';

interface AIRecommendationsProps {
  issue: AccessibilityIssue;
}

const loadingMessages = [
  "One moment my friend, I'm just putting my thoughts together on this.",
  "Thinking cap is on… Almost there!",
  "Hold tight, I'm making sure this makes sense for you.",
  "Just connecting the dots—won't be long!",
  "Let me just double-check my thoughts are correct on this.",
  "One sec, let me clarify the best method to fix the issue here.",
  "Ooh, interesting one! Let me think this through for a second."
];

export function AIRecommendations({ issue }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingMessage] = React.useState(() => 
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
  );
  const [useWCAGFallback, setUseWCAGFallback] = React.useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const aiRecommendations = await getAIRecommendations(issue);
      
      // If AI recommendations are not meaningful, use WCAG fallback
      if (!aiRecommendations.explanation || aiRecommendations.explanation === 'No explanation available.') {
        setUseWCAGFallback(true);
        const wcagInfo = getWCAGInfo(issue.wcagCriteria[0]);
        if (wcagInfo) {
          setRecommendations({
            explanation: wcagInfo.description,
            suggestedFix: wcagInfo.successCriteria,
            codeExample: wcagInfo.codeExample,
            additionalResources: [
              `https://www.w3.org/WAI/WCAG21/quickref/#${issue.wcagCriteria[0].toLowerCase()}`,
              'https://www.w3.org/WAI/tips/',
              issue.helpUrl
            ].filter(Boolean)
          });
        }
      } else {
        setRecommendations(aiRecommendations);
      }
    } catch (err) {
      setError('Failed to load recommendations. Using WCAG guidelines instead.');
      setUseWCAGFallback(true);
      const wcagInfo = getWCAGInfo(issue.wcagCriteria[0]);
      if (wcagInfo) {
        setRecommendations({
          explanation: wcagInfo.description,
          suggestedFix: wcagInfo.successCriteria,
          codeExample: wcagInfo.codeExample,
          additionalResources: [
            `https://www.w3.org/WAI/WCAG21/quickref/#${issue.wcagCriteria[0].toLowerCase()}`,
            'https://www.w3.org/WAI/tips/',
            issue.helpUrl
          ].filter(Boolean)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {!recommendations && !loading && (
        <button
          onClick={loadRecommendations}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Brain className="w-4 h-4 mr-2" />
          Get AI Suggestions
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">{loadingMessage}</span>
        </div>
      )}

      {error && !recommendations && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {recommendations && (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              {useWCAGFallback ? (
                <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
              ) : (
                <Brain className="w-5 h-5 text-purple-600 mr-2" />
              )}
              {useWCAGFallback ? 'WCAG Guidelines' : 'AI Analysis'}
            </h4>
            <p className="text-gray-700">{recommendations.explanation}</p>
          </div>

          <div>
            <h4 className="flex items-center text-lg font-medium text-gray-900 mb-3">
              <Code className="w-5 h-5 text-purple-600 mr-2" />
              Suggested Fix
            </h4>
            <p className="text-gray-700 mb-4">{recommendations.suggestedFix}</p>
            
            {recommendations.codeExample && (
              <div className="relative">
                <SyntaxHighlighter
                  language="html"
                  style={tomorrow}
                  className="rounded-lg text-sm"
                >
                  {recommendations.codeExample}
                </SyntaxHighlighter>
              </div>
            )}
          </div>

          {recommendations.additionalResources?.length > 0 && (
            <div>
              <h4 className="flex items-center text-lg font-medium text-gray-900 mb-3">
                <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
                Additional Resources
              </h4>
              <ul className="space-y-2">
                {recommendations.additionalResources.map((resource: string, index: number) => (
                  <li key={index} className="flex items-center text-blue-600 hover:text-blue-800">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <a
                      href={resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm"
                    >
                      {resource}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}