import type { TestResult, LegislationMapping } from '../types';

// Mapping of WCAG criteria to various legislation requirements
const legislationMappings: Record<string, LegislationMapping> = {
  'color-contrast': {
    criteria: ['1.4.3'],
    standards: {
      ada: ['36 CFR 1194.31(b)'],
      section508: ['502.3.1'],
      aoda: ['WCAG 2.0 Level AA'],
      en301549: ['9.1.4.3'],
      eea: ['EN 301 549 V3.2.1']
    }
  },
  'image-alt': {
    criteria: ['1.1.1'],
    standards: {
      ada: ['36 CFR 1194.22(a)'],
      section508: ['502.2'],
      aoda: ['WCAG 2.0 Level A'],
      en301549: ['9.1.1.1'],
      eea: ['EN 301 549 V3.2.1']
    }
  },
  'html-has-lang': {
    criteria: ['3.1.1'],
    standards: {
      ada: ['36 CFR 1194.22(m)'],
      section508: ['504.2'],
      aoda: ['WCAG 2.0 Level A'],
      en301549: ['9.3.1.1'],
      eea: ['EN 301 549 V3.2.1']
    }
  },
  // Add more mappings for other criteria
};

// Check if all required criteria for a legislation are met
function checkLegislationCompliance(results: TestResult): Record<string, boolean> {
  const violations = new Set(results.issues.map(issue => issue.wcagCriteria).flat());
  
  // Helper function to check if all required criteria for a standard are met
  const meetsStandard = (standard: string): boolean => {
    const requiredCriteria = new Set();
    
    // Collect all required criteria for this standard
    Object.values(legislationMappings).forEach(mapping => {
      if (mapping.standards[standard]) {
        mapping.criteria.forEach(criterion => requiredCriteria.add(criterion));
      }
    });
    
    // Check if any required criteria are violated
    return ![...requiredCriteria].some(criterion => violations.has(criterion));
  };
  
  return {
    ada: meetsStandard('ada'),
    section508: meetsStandard('section508'),
    aoda: meetsStandard('aoda'),
    en301549: meetsStandard('en301549'),
    eea: meetsStandard('eea')
  };
}

// Add legislation references to issues
export function addLegislationRefs(results: TestResult): TestResult {
  const updatedResults = { ...results };
  
  updatedResults.issues = results.issues.map(issue => {
    const refs = new Set<string>();
    
    issue.wcagCriteria.forEach(criterion => {
      const mapping = legislationMappings[criterion];
      if (mapping) {
        Object.entries(mapping.standards).forEach(([standard, requirements]) => {
          requirements.forEach(req => refs.add(`${standard.toUpperCase()}: ${req}`));
        });
      }
    });
    
    return {
      ...issue,
      legislationRefs: Array.from(refs)
    };
  });
  
  updatedResults.legislationCompliance = checkLegislationCompliance(results);
  
  return updatedResults;
}