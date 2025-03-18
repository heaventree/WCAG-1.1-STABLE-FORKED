import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { URLInput } from '../components/URLInput';
import { ResultsSummary } from '../components/ResultsSummary';
import { IssuesList } from '../components/IssuesList';
import { RegionSelector } from '../components/RegionSelector';
import { EmbedBadge } from '../components/EmbedBadge';
import { testAccessibility } from '../utils/accessibilityTester';
import type { TestResult } from '../types';
import { exportToPDF } from '../utils/pdfExport';
import { 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Scale, 
  Award,
  FileSearch,
  Zap,
  Globe,
  Shield,
  BookOpen,
  ArrowRight
} from 'lucide-react';

type TabType = 'issues' | 'warnings' | 'passes';

export function WCAGCheckerPage() {
  const [selectedRegion, setSelectedRegion] = useState('eu');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('issues');

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const testResults = await testAccessibility(url, selectedRegion);
      setResults(testResults);
      if (testResults.issues.length > 0) {
        setActiveTab('issues');
      } else if (testResults.warnings.length > 0) {
        setActiveTab('warnings');
      } else {
        setActiveTab('passes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while testing the URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results) {
      exportToPDF(results);
    }
  };

  const getTabStyle = (tab: TabType) => {
    const baseStyle = "px-6 py-3 text-sm font-medium rounded-lg transition-colors border";
    if (activeTab === tab) {
      switch (tab) {
        case 'issues':
          return `${baseStyle} border-red-500 text-red-700 bg-red-50`;
        case 'warnings':
          return `${baseStyle} border-amber-500 text-amber-700 bg-amber-50`;
        case 'passes':
          return `${baseStyle} border-emerald-500 text-emerald-700 bg-emerald-50`;
      }
    }
    return `${baseStyle} border-gray-300 text-gray-600 hover:bg-gray-50`;
  };

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white rounded-2xl p-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Free WCAG 2.1 Accessibility Checker
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ensure your website meets WCAG 2.1 standards and provides an inclusive experience for all users. 
              Our AI-powered tool helps you identify and fix accessibility issues instantly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <RegionSelector
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
            <div className="mt-8">
              <URLInput onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Testing URL</h3>
                <p className="mt-1 text-sm text-red-700 whitespace-pre-line">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    <a href={results.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {results.url}
                    </a>
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              </div>

              <ResultsSummary results={results} />

              {results.issues.length === 0 && results.warnings.length === 0 ? (
                <div className="text-center py-12 bg-green-50 rounded-xl mt-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-medium text-gray-900 mb-6">
                    Congratulations! No accessibility issues found
                  </h3>
                  <EmbedBadge url={results.url} timestamp={results.timestamp} />
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    {results.issues.length > 0 && (
                      <button
                        onClick={() => setActiveTab('issues')}
                        className={getTabStyle('issues')}
                      >
                        Issues ({results.issues.length})
                      </button>
                    )}
                    {results.warnings.length > 0 && (
                      <button
                        onClick={() => setActiveTab('warnings')}
                        className={getTabStyle('warnings')}
                      >
                        Warnings ({results.warnings.length})
                      </button>
                    )}
                    {results.passes.length > 0 && (
                      <button
                        onClick={() => setActiveTab('passes')}
                        className={getTabStyle('passes')}
                      >
                        Passed ({results.passes.length})
                      </button>
                    )}
                  </div>

                  <div>
                    {activeTab === 'issues' && results.issues.length > 0 && (
                      <IssuesList issues={results.issues} type="issues" />
                    )}
                    {activeTab === 'warnings' && results.warnings.length > 0 && (
                      <IssuesList issues={results.warnings} type="warnings" />
                    )}
                    {activeTab === 'passes' && results.passes.length > 0 && (
                      <IssuesList issues={results.passes} type="passes" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        {!results && (
          <section className="section">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our WCAG Checker?
              </h2>
              <p className="text-xl text-gray-600">
                Comprehensive accessibility testing with actionable insights
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <FileSearch className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Deep Page Analysis
                </h3>
                <p className="text-gray-600">
                  Thorough scanning of your website's HTML, ARIA attributes, and dynamic content for accessibility issues
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <Zap className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI-Powered Fixes
                </h3>
                <p className="text-gray-600">
                  Get instant, intelligent suggestions to fix accessibility issues with code examples
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <Globe className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Global Compliance
                </h3>
                <p className="text-gray-600">
                  Support for international accessibility standards including ADA, Section 508, and EN 301 549
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <Shield className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Legal Protection
                </h3>
                <p className="text-gray-600">
                  Reduce legal risks by ensuring your website meets accessibility requirements
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Educational Resources
                </h3>
                <p className="text-gray-600">
                  Learn about accessibility best practices with our comprehensive guides
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <Users className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Inclusive Design
                </h3>
                <p className="text-gray-600">
                  Make your website accessible to users with disabilities and improve user experience
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-blue-600 rounded-2xl p-12 text-center mt-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Your Website Accessible?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free accessibility check today and ensure your website is inclusive for all users.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors"
          >
            Check Your Website Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </section>
      </div>
    </div>
  );
}