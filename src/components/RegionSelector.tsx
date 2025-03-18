import React from 'react';

interface Region {
  id: string;
  name: string;
  standards: string[];
}

const regions: Region[] = [
  {
    id: 'eu',
    name: 'European Union',
    standards: ['WCAG 2.1', 'EN 301 549', 'EEA']
  },
  {
    id: 'global',
    name: 'Global Standards',
    standards: ['WCAG 2.1', 'ISO/IEC 40500']
  },
  {
    id: 'usa',
    name: 'United States',
    standards: ['WCAG 2.1', 'ADA', 'Section 508']
  },
  {
    id: 'canada',
    name: 'Canada',
    standards: ['WCAG 2.1', 'AODA']
  }
];

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export function RegionSelector({ selectedRegion, onRegionChange }: RegionSelectorProps) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="relative text-center mb-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="64"
            height="64"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600/10"
          >
            <g>
              {/* Main circle */}
              <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="2" fill="none" />
              
              {/* Latitude lines */}
              <path d="M2 60h116" stroke="currentColor" strokeWidth="1" />
              <path d="M10 30h100" stroke="currentColor" strokeWidth="1" />
              <path d="M10 90h100" stroke="currentColor" strokeWidth="1" />
              
              {/* Longitude lines */}
              <path d="M60 2v116" stroke="currentColor" strokeWidth="1" />
              <path
                d="M20 15a80 80 0 0 0 0 90"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M100 15a80 80 0 0 1 0 90"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              
              {/* Diagonal lines */}
              <path
                d="M30 20c20 25 40 25 60 0"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M30 100c20-25 40-25 60 0"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </g>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 relative">Select Region for Compliance Check</h2>
        <p className="text-sm text-gray-600 mt-1 relative">
          Choose your region to check compliance with local accessibility standards
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => onRegionChange(region.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left h-full ${
              selectedRegion === region.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <h3 className="text-base font-semibold text-gray-900 mb-2">{region.name}</h3>
            <div className="flex flex-wrap gap-1">
              {region.standards.map((standard) => (
                <span
                  key={standard}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700"
                >
                  {standard}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}