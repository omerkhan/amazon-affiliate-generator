'use client';

import React, { useState } from 'react';

export default function AmazonAffiliateLinkGenerator() {
  const [amazonUrl, setAmazonUrl] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [error, setError] = useState('');

  const extractASIN = (url) => {
    // Match different Amazon URL patterns
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
      /\/o\/ASIN\/([A-Z0-9]{10})/i,
      /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      // Check if it's an Amazon domain
      if (!urlObj.hostname.includes('amazon.')) {
        return 'Please enter a valid Amazon URL';
      }
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const validateAffiliateCode = (code) => {
    if (!code.trim()) {
      return 'Please enter an affiliate code';
    }
    if (code.includes(' ')) {
      return 'Affiliate code cannot contain spaces';
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(code)) {
      return 'Affiliate code can only contain letters, numbers, hyphens, and underscores';
    }
    return null;
  };

  const generateLink = () => {
    setError('');
    setGeneratedLink('');

    // Validate URL
    const urlError = validateUrl(amazonUrl);
    if (urlError) {
      setError(urlError);
      return;
    }

    // Validate affiliate code
    const codeError = validateAffiliateCode(affiliateCode);
    if (codeError) {
      setError(codeError);
      return;
    }

    // Extract ASIN
    const asin = extractASIN(amazonUrl);
    if (!asin) {
      setError('Could not extract product ID from the Amazon URL. Please make sure it\'s a valid product URL.');
      return;
    }

    // Generate simplified affiliate link
    const affiliateLink = `https://www.amazon.com/dp/${asin}/?tag=${affiliateCode.trim()}`;
    setGeneratedLink(affiliateLink);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Amazon Affiliate Link Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Convert any Amazon product URL into a clean affiliate link
          </p>

          <div className="space-y-6">
            {/* Amazon URL Input */}
            <div>
              <label htmlFor="amazon-url" className="block text-sm font-medium text-gray-700 mb-2">
                Amazon Product URL
              </label>
              <input
                id="amazon-url"
                type="text"
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                placeholder="https://www.amazon.com/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Affiliate Code Input */}
            <div>
              <label htmlFor="affiliate-code" className="block text-sm font-medium text-gray-700 mb-2">
                Affiliate Code
              </label>
              <input
                id="affiliate-code"
                type="text"
                value={affiliateCode}
                onChange={(e) => setAffiliateCode(e.target.value)}
                placeholder="your-affiliate-code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateLink}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 transform hover:scale-[1.02]"
            >
              Generate Link
            </button>

            {/* Generated Link */}
            {generatedLink && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Your Affiliate Link:</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">How it works:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Paste any Amazon product URL (books, electronics, etc.)
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Enter your Amazon affiliate code (no spaces allowed)
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Get a clean, simplified affiliate link ready to share
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}