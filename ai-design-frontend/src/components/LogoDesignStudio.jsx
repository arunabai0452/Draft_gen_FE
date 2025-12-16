import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, Download, TrendingUp, ArrowLeft, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://difficile-convalescently-edelmira.ngrok-free.dev';

const LogoDesignStudio = () => {
  const [currentPage, setCurrentPage] = useState('collect'); // 'collect', 'groups', 'generate'
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Preference collection state
  const [preferenceText, setPreferenceText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85);

  // Form data for detailed preferences
  const [formData, setFormData] = useState({
    tone: 'modern',
    colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
    visual_style: 'minimalist',
    dislikes: ''
  });

  // Feedback groups state
  const [feedbackGroups, setFeedbackGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Image generation state
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatingGroupId, setGeneratingGroupId] = useState(null);

  // Download image helper
  const downloadImage = async (imageUrl, brandName, version) => {
    try {
      const response = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error('Failed to fetch');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandName.replace(/\s+/g, '_')}_v${version}.png`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error downloading:', error);
      window.open(imageUrl, '_blank');
    }
  };

  // Submit preference to Vector DB
  const handleSubmitPreference = async (e) => {
    e.preventDefault();
    
    if (!preferenceText.trim() || !selectedBrand.trim()) {
      alert('Please enter both brand name and preference description');
      return;
    }

    setSubmitting(true);

    try {
      // Create detailed preference object
      const preferenceData = {
        brand_name: selectedBrand,
        description: preferenceText,
        tone: formData.tone,
        colors: formData.colors,
        visual_style: formData.visual_style,
        dislikes: formData.dislikes
      };

      // Store preference with all details in Vector DB
      const feedbackText = `Brand: ${selectedBrand}. Preference: ${preferenceText}. Tone: ${formData.tone}. Style: ${formData.visual_style}. Colors: ${formData.colors.join(', ')}. ${formData.dislikes ? 'Avoid: ' + formData.dislikes : ''}`;

      const response = await fetch(`${API_BASE_URL}/api/feedback/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_text: feedbackText,
          brand_name: selectedBrand,
          moodboard_id: 'preference_collection',
          metadata: preferenceData // Store structured data in metadata
        })
      });

      if (response.ok) {
        alert('Preference stored successfully!');
        setPreferenceText('');
        // Reset form but keep brand name
        setFormData({
          tone: 'modern',
          colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
          visual_style: 'minimalist',
          dislikes: ''
        });
      } else {
        alert('Failed to store preference');
      }
    } catch (error) {
      console.error('Error submitting preference:', error);
      alert('Error storing preference');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch and group preferences
  const fetchFeedbackGroups = async (brandName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/feedback-groups/${brandName}?similarity_threshold=${similarityThreshold}&include_summary=true`
      );
      const data = await response.json();
      setFeedbackGroups(data.groups || []);
      setSelectedBrand(brandName);
    } catch (error) {
      console.error('Error fetching feedback groups:', error);
      setFeedbackGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate 2 images when card is clicked
  const handleCardClick = async (group) => {
    setGeneratingGroupId(group.group_id);
    setGenerating(true);
    setGeneratedImages([]);
    setSelectedGroup(group);
    
    try {
      // Generate 2 images from this group
      const response = await fetch(`${API_BASE_URL}/api/generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: selectedBrand,
          group_id: group.group_id,
          feedback_items: group.items,
          group_summary: group.summary,
          original_input: null, // No original moodboard
          n_variations: 2
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(data.images || []);
        setCurrentPage('generate');
      } else {
        alert('Failed to generate images');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Error generating images');
    } finally {
      setGenerating(false);
      setGeneratingGroupId(null);
    }
  };

  // Get relevance color
  const getRelevanceColor = (relevance) => {
    if (relevance >= 0.9) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (relevance >= 0.8) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (relevance >= 0.7) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-gray-500 to-slate-500';
  };

  // Grouped Feedback Cards Page
  if (currentPage === 'groups') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setCurrentPage('collect')}
              className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Collect Preferences
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Grouped Preferences</h1>
              <p className="text-gray-600 mt-2">
                {selectedBrand} • {feedbackGroups.length} groups • Click any card to generate images
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
          ) : feedbackGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Sparkles className="mx-auto text-gray-400" size={64} />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">No Preferences Yet</h3>
              <p className="mt-2 text-gray-600">Collect some preferences first to see grouped insights.</p>
              <button
                onClick={() => setCurrentPage('collect')}
                className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Collect Preferences
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbackGroups.map((group) => (
                <div
                  key={group.group_id}
                  onClick={() => !generating && handleCardClick(group)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl relative"
                >
                  {/* Relevance Badge */}
                  <div className={`${getRelevanceColor(group.relevance)} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">Group {group.group_id}</span>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        <TrendingUp size={16} />
                        <span className="font-semibold">{(group.relevance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <p className="text-sm mt-1 opacity-90">{group.item_count} preferences</p>
                  </div>

                  {/* Summary */}
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed line-clamp-4 mb-4">
                      {group.summary}
                    </p>

                    {/* Key Themes */}
                    {group.key_themes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Key Themes:</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">{group.key_themes}</p>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      disabled={generating}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating && generatingGroupId === group.group_id ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Generate 2 Images
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Image Generation Results Page
  if (currentPage === 'generate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setCurrentPage('groups')}
              className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Groups
            </button>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Sparkles className="text-purple-600" size={32} />
              Generated Images
            </h1>
            {selectedGroup && (
              <p className="text-gray-600 mt-2">
                {selectedBrand} • Group {selectedGroup.group_id} • {(selectedGroup.relevance * 100).toFixed(0)}% Relevance
              </p>
            )}
          </div>

          {/* Group Summary Card */}
          {selectedGroup && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Enhanced Prompt</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{selectedGroup.summary}</p>
              {selectedGroup.key_themes && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Key Themes:</h4>
                  <p className="text-gray-700 text-sm">{selectedGroup.key_themes}</p>
                </div>
              )}
            </div>
          )}

          {/* Success Banner */}
          {generatedImages.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-900">Images Generated Successfully!</p>
                <p className="text-sm text-green-700">{generatedImages.length} variations from the same enhanced prompt</p>
              </div>
            </div>
          )}

          {/* Image Grid */}
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {generatedImages.map((image, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={image.url}
                      alt={`Variation ${image.variation_number}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={() => downloadImage(image.url, selectedBrand, image.variation_number)}
                      className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download size={20} className="text-gray-700" />
                    </button>
                  </div>
                  
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold text-gray-800">Variation {image.variation_number}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Generated {new Date(image.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadImage(image.url, selectedBrand, image.variation_number)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                    
                    {image.revised_prompt && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-gray-600 mb-1">DALL-E Revised:</p>
                        <p className="text-sm text-gray-700">{image.revised_prompt}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Generate More Button */}
          {generatedImages.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => selectedGroup && handleCardClick(selectedGroup)}
                disabled={generating}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Sparkles size={20} />
                {generating ? 'Generating...' : 'Generate 2 More Variations'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Collect Preferences Page (Main Page)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="text-purple-600" size={40} />
              <h1 className="text-4xl font-bold text-gray-800">Brand Preference Studio</h1>
            </div>
            <p className="text-gray-600">Collect preferences → Group by relevance → Generate AI images</p>
          </div>
        </div>

        {/* Collect Preference Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Collect User Preference</h2>
          <p className="text-gray-600 mb-6">Enter brand details and user preferences. We'll store it in Vector DB and group with similar preferences.</p>
          
          <form onSubmit={handleSubmitPreference} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
              <input
                type="text"
                required
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                placeholder="e.g., Nescafe, Nike, Coca-Cola"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Preference/Description *</label>
              <textarea
                required
                value={preferenceText}
                onChange={(e) => setPreferenceText(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Modern coffee brand with vibrant energy..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Describe what the user wants for this brand's design
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="modern">Modern</option>
                  <option value="luxury">Luxury</option>
                  <option value="playful">Playful</option>
                  <option value="professional">Professional</option>
                  <option value="vintage">Vintage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visual Style</label>
                <select
                  value={formData.visual_style}
                  onChange={(e) => setFormData({...formData, visual_style: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="minimalist">Minimalist</option>
                  <option value="retro">Retro</option>
                  <option value="corporate">Corporate</option>
                  <option value="organic">Organic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Colors</label>
              <div className="flex gap-3">
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...formData.colors];
                        newColors[index] = e.target.value;
                        setFormData({...formData, colors: newColors});
                      }}
                      className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <span className="text-xs text-gray-500">Color {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dislikes (Optional)</label>
              <input
                type="text"
                value={formData.dislikes}
                onChange={(e) => setFormData({...formData, dislikes: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., No serif fonts, avoid dark colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Storing...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Store Preference in Vector DB
                </>
              )}
            </button>
          </form>
        </div>

        {/* View Groups Button */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Ready to Analyze?</h3>
          <p className="text-gray-600 mb-4">
            After collecting multiple preferences, view them grouped by relevance with AI-generated summaries.
          </p>

          {/* Similarity Threshold Slider */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grouping Sensitivity: {(similarityThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={similarityThreshold * 100}
              onChange={(e) => setSimilarityThreshold(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>60% (More groups)</span>
              <span>95% (Fewer groups)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {similarityThreshold >= 0.9 ? '🔹 Very Strict - Creates many small groups' :
               similarityThreshold >= 0.8 ? '🔷 Balanced - Recommended setting' :
               '🔶 Loose - Combines similar preferences'}
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedBrand.trim()) {
              fetchFeedbackGroups(selectedBrand);
              setCurrentPage('groups');
            } else {
              alert('Please enter a brand name');
            }
          }} className="flex gap-2">
            <input
              type="text"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              placeholder="Enter brand name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
            >
              <TrendingUp size={20} />
              View Grouped Preferences
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-2">How It Works:</h4>
          <ol className="text-sm text-blue-800 space-y-2">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Collect detailed preferences from users (brand, colors, tone, style) and store in Vector DB</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>View grouped preferences by semantic similarity with GPT-enhanced summaries and relevance scores</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Click any group card to generate 2 DALL-E image variations based on grouped preferences</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Download and share the generated designs</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LogoDesignStudio;