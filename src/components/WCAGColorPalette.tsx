import React, { useState } from 'react';
import { Check, Copy, Info, RefreshCw } from 'lucide-react';

interface ColorCombination {
  background: string;
  text: string;
  name: string;
  ratio: number;
  wcagLevel: 'AAA' | 'AA' | 'Fail';
}

// Color utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(value => {
    value /= 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return rs * 0.2126 + gs * 0.7152 + bs * 0.0722;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWCAGLevel(ratio: number, isLargeText: boolean = false): 'AAA' | 'AA' | 'Fail' {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'Fail';
  }
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

function generateRandomColor(): string {
  // Generate more vibrant colors by using HSL
  const h = Math.random() * 360; // Any hue
  const s = 60 + Math.random() * 40; // 60-100% saturation
  const l = 30 + Math.random() * 40; // 30-70% lightness
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function generateAccessiblePalette(baseColor: string): ColorCombination[] {
  const combinations: ColorCombination[] = [];
  const baseRgb = hexToRgb(baseColor);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

  // Generate complementary colors
  const complementaryHue = (baseHsl.h + 180) % 360;
  
  // Generate analogous colors
  const analogousHue1 = (baseHsl.h + 30) % 360;
  const analogousHue2 = (baseHsl.h - 30 + 360) % 360;
  
  // Generate triadic colors
  const triadicHue1 = (baseHsl.h + 120) % 360;
  const triadicHue2 = (baseHsl.h + 240) % 360;

  // Generate split complementary colors
  const splitComp1 = (baseHsl.h + 150) % 360;
  const splitComp2 = (baseHsl.h + 210) % 360;

  const hues = [
    { h: baseHsl.h, name: 'Base' },
    { h: complementaryHue, name: 'Complementary' },
    { h: analogousHue1, name: 'Analogous 1' },
    { h: analogousHue2, name: 'Analogous 2' },
    { h: triadicHue1, name: 'Triadic 1' },
    { h: triadicHue2, name: 'Triadic 2' },
    { h: splitComp1, name: 'Split Comp 1' },
    { h: splitComp2, name: 'Split Comp 2' }
  ];

  // For each hue, generate variations with different saturations and lightnesses
  hues.forEach(({ h, name }) => {
    // Generate variations
    const variations = [
      { s: 90, l: 20, suffix: 'Dark' },
      { s: 80, l: 40, suffix: 'Deep' },
      { s: 70, l: 60, suffix: 'Medium' },
      { s: 60, l: 80, suffix: 'Light' }
    ];

    variations.forEach(({ s, l, suffix }) => {
      const bgRgb = hslToRgb(h, s, l);
      const bgHex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
      const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

      // Test with white and black text
      const whiteContrast = getContrastRatio(bgLuminance, 1);
      const blackContrast = getContrastRatio(bgLuminance, 0);

      if (whiteContrast >= 4.5 || blackContrast >= 4.5) {
        const textColor = whiteContrast > blackContrast ? '#ffffff' : '#000000';
        const ratio = Math.max(whiteContrast, blackContrast);

        combinations.push({
          background: bgHex,
          text: textColor,
          name: `${name} ${suffix}`,
          ratio,
          wcagLevel: getWCAGLevel(ratio)
        });
      }
    });
  });

  // Sort by contrast ratio
  return combinations.sort((a, b) => b.ratio - a.ratio);
}

export function WCAGColorPalette() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [baseColor, setBaseColor] = useState('#1a365d');
  const [generatedPalette, setGeneratedPalette] = useState<ColorCombination[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const generateNewPalette = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newBaseColor = generateRandomColor();
      setBaseColor(newBaseColor);
      const newPalette = generateAccessiblePalette(newBaseColor);
      setGeneratedPalette(newPalette);
      setIsGenerating(false);
    }, 500);
  };

  const handleBaseColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBaseColor(newColor);
    const newPalette = generateAccessiblePalette(newColor);
    setGeneratedPalette(newPalette);
  };

  const getLevelBadgeColor = (level: 'AAA' | 'AA' | 'Fail') => {
    switch (level) {
      case 'AAA':
        return 'bg-green-100 text-green-800';
      case 'AA':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            WCAG Color Palette Generator
          </h2>
          <p className="text-gray-600">
            Generate accessible color combinations that meet WCAG 2.1 contrast requirements.
            Our algorithm creates diverse palettes using complementary, analogous, and triadic color harmonies.
          </p>
        </div>

        {/* Generator Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Generate Custom Palette
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="baseColor" className="block text-sm font-medium text-gray-700 mb-2">
                Base Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  id="baseColor"
                  value={baseColor}
                  onChange={handleBaseColorChange}
                  className="h-10 w-20 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => {
                    const newColor = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                      setBaseColor(newColor);
                      const newPalette = generateAccessiblePalette(newColor);
                      setGeneratedPalette(newPalette);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
            </div>
            <button
              onClick={generateNewPalette}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Random
            </button>
          </div>
        </div>

        {/* Generated Palette */}
        {generatedPalette.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedPalette.map((combo, index) => (
              <div
                key={`${combo.background}-${combo.text}-${index}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div
                  style={{ backgroundColor: combo.background }}
                  className="h-32 p-4 flex items-center justify-center"
                >
                  <p style={{ color: combo.text }} className="text-lg font-medium">
                    Sample Text
                  </p>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{combo.name}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(
                        combo.wcagLevel
                      )}`}
                    >
                      {combo.wcagLevel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: combo.background }}
                        />
                        <span className="text-sm text-gray-600">Background</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(combo.background)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        {copiedColor === combo.background ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {combo.background}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: combo.text }}
                        />
                        <span className="text-sm text-gray-600">Text</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(combo.text)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        {copiedColor === combo.text ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {combo.text}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Info className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Contrast</span>
                      </div>
                      <span className="text-sm text-gray-900 font-medium">
                        {combo.ratio.toFixed(2)}:1
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Guidelines */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Guidelines
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Color Contrast</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>AAA level requires 7:1 contrast ratio for normal text</li>
                <li>AA level requires 4.5:1 contrast ratio for normal text</li>
                <li>Large text (18pt+) requires 3:1 for AA, 4.5:1 for AAA</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Use sufficient contrast for all text elements</li>
                <li>Test colors under different lighting conditions</li>
                <li>Consider color blindness when choosing combinations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}