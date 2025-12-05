/**
 * Image Generation Page Component
 * 
 * Generates and displays DALL-E images based on feedback groups
 * 
 * INTEGRATION:
 * 1. Add to your router:
 *    <Route path="/generate-images/:brandName" element={<ImageGenerationPage />} />
 * 
 * 2. Import in your routes file:
 *    import ImageGenerationPage from './pages/ImageGenerationPage';
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  Download,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import { feedbackGroupsAPI, downloadImage } from '../api/feedbackGroups';

const ImageGenerationPage = () => {
  const { brandName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [group, setGroup] = useState(location.state?.group || null);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generationId, setGenerationId] = useState(null);

  useEffect(() => {
    if (!group) {
      // Redirect back if no group data
      navigate(`/feedback-groups/${brandName}`);
    }
  }, [group, brandName, navigate]);

  const handleGenerate = async () => {
    if (!group) return;

    setGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      // Get original brand input if available
      // You may need to fetch this from your existing API
      const originalInput = await fetchOriginalBrandInput(brandName);

      const response = await feedbackGroupsAPI.generateImages({
        brandName,
        groupId: group.group_id,
        feedbackItems: group.items,
        groupSummary: group.summary,
        originalInput: originalInput,
        nVariations: 2
      });

      setGeneratedImages(response.images || []);
      setPrompt(response.prompt || '');
      setGenerationId(response.generation_id);
    } catch (err) {
      console.error('Error generating images:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const fetchOriginalBrandInput = async (brand) => {
    // TODO: Implement this to fetch original brand design input from your API
    // Example:
    // const response = await fetch(`/api/brands/${brand}/original-input`);
    // return response.json();
    
    // For now, return null (will use defaults)
    return null;
  };

  const handleDownload = async (imageUrl, variationNumber) => {
    const filename = `${brandName.replace(/\s+/g, '_')}_group${group.group_id}_v${variationNumber}.png`;
    await downloadImage(imageUrl, filename);
  };

  if (!group) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/feedback-groups/${brandName}`)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Groups
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles className="text-purple-600" size={32} />
            Generate Images
          </h1>
          <p className="text-gray-600 mt-2">
            {brandName} • Group {group.group_id} • {group.item_count} feedback items
          </p>
        </div>

        {/* Group Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Group Summary</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{group.summary}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              {(group.relevance * 100).toFixed(0)}% Relevance
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
              {group.item_count} Items
            </span>
          </div>

          {/* Generate Button */}
          {!generating && generatedImages.length === 0 && (
            <button
              onClick={handleGenerate}
              className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Generate 2 Image Variations
            </button>
          )}
        </div>

        {/* Loading State */}
        {generating && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-purple-600" size={64} />
            <h3 className="mt-6 text-xl font-semibold text-gray-800">
              Generating Images...
            </h3>
            <p className="mt-2 text-gray-600">
              This may take 30-60 seconds per image
            </p>
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Creating variations</span>
                <span>⏱️ ~1-2 minutes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-semibold">Generation Failed</h3>
            </div>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success State - Generated Images */}
        {generatedImages.length > 0 && (
          <div>
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-900">Images Generated Successfully!</p>
                <p className="text-sm text-green-700">
                  {generatedImages.length} variations created
                </p>
              </div>
            </div>

            {/* Generation Prompt */}
            {prompt && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Generation Prompt:</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{prompt}</p>
              </div>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedImages.map((image, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.url}
                      alt={`Variation ${image.variation_number}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Download Button Overlay */}
                    <button
                      onClick={() => handleDownload(image.url, image.variation_number)}
                      className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      title="Download Image"
                    >
                      <Download size={20} className="text-gray-700" />
                    </button>
                  </div>

                  {/* Image Details */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Variation {image.variation_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(image.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(image.url, image.variation_number)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>

                    {/* Revised Prompt */}
                    {image.revised_prompt && image.revised_prompt !== prompt && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          DALL-E Revised:
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {image.revised_prompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Generate More Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Sparkles size={20} />
                Generate More Variations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationPage;