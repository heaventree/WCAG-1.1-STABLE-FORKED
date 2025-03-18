import React, { useState } from 'react';
import { ChevronDown, ChevronUp, PenTool as Tool, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import type { AccessibilityIssue } from '../types';
import { Modal } from './Modal';
import { AIRecommendations } from './AIRecommendations';
import { getWCAGInfo } from '../utils/wcagHelper';

interface IssuesListProps {
  issues: AccessibilityIssue[];
  type?: 'issues' | 'passes' | 'warnings';
}

export function IssuesList({ issues, type = 'issues' }: IssuesListProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [selectedIssue, setSelectedIssue] = useState<AccessibilityIssue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImpactColor = (impact: AccessibilityIssue['impact']) => {
    if (type === 'passes') return 'bg-emerald-50 border-emerald-200';
    if (type === 'warnings') return 'bg-amber-50 border-amber-200';
    
    switch (impact) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'serious': return 'bg-orange-50 border-orange-200';
      case 'moderate': return 'bg-yellow-50 border-yellow-200';
      case 'minor': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const toggleIssue = (id: string) => {
    const newExpanded = new Set(expandedIssues);
    if (expandedIssues.has(id)) {
      newExpanded.delete(id);
    } else {
      // Close all other accordions before opening the new one
      newExpanded.clear();
      newExpanded.add(id);
    }
    setExpandedIssues(newExpanded);
  };

  const toggleAllIssues = (shouldExpand: boolean) => {
    if (shouldExpand) {
      setExpandedIssues(new Set(issues.map(issue => issue.id)));
    } else {
      setExpandedIssues(new Set());
    }
  };

  const openIssueDetails = (issue: AccessibilityIssue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No {type} found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => toggleAllIssues(true)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Expand all sections"
        >
          <Maximize2 className="w-4 h-4 mr-2" aria-hidden="true" />
          Open All
        </button>
        <button
          onClick={() => toggleAllIssues(false)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Collapse all sections"
        >
          <Minimize2 className="w-4 h-4 mr-2" aria-hidden="true" />
          Close All
        </button>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => {
          const isExpanded = expandedIssues.has(issue.id);
          const wcagInfo = issue.wcagCriteria?.length > 0 
            ? getWCAGInfo(issue.wcagCriteria[0])
            : undefined;
          
          return (
            <div
              key={issue.id}
              className={`p-4 rounded-lg border ${getImpactColor(issue.impact)}`}
            >
              <div className="flex justify-between items-start">
                <button 
                  className="flex-1 text-left flex items-center"
                  onClick={() => toggleIssue(issue.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`issue-content-${issue.id}`}
                >
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {issue.description}
                    </h3>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 ml-2 text-gray-500" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5 ml-2 text-gray-500" aria-hidden="true" />
                    )}
                  </div>
                </button>
                {type !== 'passes' && (
                  <span className="capitalize px-3 py-1 rounded-full text-sm font-medium bg-white ml-4">
                    {issue.impact}
                  </span>
                )}
              </div>
              
              {isExpanded && (
                <div id={`issue-content-${issue.id}`} className="mt-4">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700">Affected Elements:</h4>
                    <ul className="mt-2 space-y-1">
                      {issue.nodes.map((node, index) => (
                        <li key={index} className="text-sm text-gray-600 font-mono bg-white p-2 rounded">
                          {node}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {issue.wcagCriteria && issue.wcagCriteria.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700">WCAG Criteria:</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {issue.wcagCriteria.map((criteria, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white rounded-full text-sm text-gray-600"
                          >
                            {criteria}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {type !== 'passes' && (
                    <>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openIssueDetails(issue)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          aria-label={`Learn more about ${issue.description}`}
                        >
                          <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                          Learn More
                        </button>
                        <button
                          onClick={() => openIssueDetails(issue)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          aria-label={`View fix for ${issue.description}`}
                        >
                          <Tool className="w-4 h-4 mr-2" aria-hidden="true" />
                          View Fix
                        </button>
                      </div>
                      
                      <AIRecommendations issue={issue} />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedIssue?.description || ''}
      >
        {selectedIssue && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">
                {getWCAGInfo(selectedIssue.wcagCriteria?.[0])?.description || 
                 'Additional information not available for this criterion.'}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Success Criteria</h4>
              <p className="text-gray-600">
                {getWCAGInfo(selectedIssue.wcagCriteria?.[0])?.successCriteria || 
                 'Please refer to the WCAG documentation for this criterion.'}
              </p>
            </div>

            {type !== 'passes' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Suggested Fix</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    {getWCAGInfo(selectedIssue.wcagCriteria?.[0])?.suggestedFix || 
                     'Review the specific issue and apply appropriate accessibility fixes.'}
                  </p>
                  {getWCAGInfo(selectedIssue.wcagCriteria?.[0])?.codeExample && (
                    <pre className="mt-2 p-3 bg-gray-800 text-white rounded-md overflow-x-auto">
                      <code>{getWCAGInfo(selectedIssue.wcagCriteria[0])?.codeExample}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}