import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Download, TrendingUp, ArrowLeft, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const AdminDashboard = () => {
  // ============================================================================
  // HELPER FUNCTION - Fetch with ngrok headers
  // ============================================================================
  const fetchWithHeaders = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [currentView, setCurrentView] = useState('threshold'); // 'threshold', 'groups', 'generate'
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85);

  // Feedback groups state
  const [feedbackGroups, setFeedbackGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Image generation state
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatingGroupId, setGeneratingGroupId] = useState(null);

  // ============================================================================
  // DOWNLOAD IMAGE HELPER
  // ============================================================================
  const downloadImage = async (imageUrl, brandName, version) => {
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!response.ok) throw new Error('Failed to fetch image');

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
      alert('Could not download image. Opening in new tab...');
      window.open(imageUrl, '_blank');
    }
  };

  // ============================================================================
  // FETCH FEEDBACK GROUPS
  // ============================================================================
  const fetchFeedbackGroups = async (brandName) => {
    setLoading(true);

    try {
      console.log(`📊 Fetching groups for: ${brandName} (threshold: ${similarityThreshold})`);

      const response = await fetchWithHeaders(
        `${API_BASE_URL}/api/feedback-groups/${brandName}?similarity_threshold=${similarityThreshold}&include_summary=true`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Groups received:', data);

      setFeedbackGroups(data.groups || []);
      setSelectedBrand(brandName);

      if (!data.groups || data.groups.length === 0) {
        alert('No feedback groups found for this brand. Try collecting some preferences first!');
      } else {
        setCurrentView('groups');
      }
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      alert(`Error loading groups: ${error.message}`);
      setFeedbackGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // GENERATE IMAGES FROM GROUP
  // ============================================================================
  const handleCardClick = async (group) => {
    setGeneratingGroupId(group.group_id);
    setGenerating(true);
    setGeneratedImages([]);
    setSelectedGroup(group);

    try {
      console.log('🎨 Generating images for group:', group.group_id);

      const response = await fetchWithHeaders(`${API_BASE_URL}/api/generate-images`, {
        method: 'POST',
        body: JSON.stringify({
          brand_name: selectedBrand,
          group_id: group.group_id,
          feedback_items: group.items,
          group_summary: group.summary,
          original_input: null,
          n_variations: 2
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Images generated:', data);
        setGeneratedImages(data.images || []);
        setCurrentView('generate');
      } else {
        console.error('❌ Generation failed:', data);
        alert(`Failed to generate images: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      alert(`Error generating images: ${error.message}`);
    } finally {
      setGenerating(false);
      setGeneratingGroupId(null);
    }
  };

  // ============================================================================
  // HELPER: GET RELEVANCE COLOR
  // ============================================================================
  const getRelevanceColor = (relevance) => {
    if (relevance >= 0.9) return 'bg-gradient-to-r from-emerald-400 to-teal-500';
    if (relevance >= 0.8) return 'bg-gradient-to-r from-cyan-400 to-blue-500';
    if (relevance >= 0.7) return 'bg-gradient-to-r from-amber-400 to-orange-500';
    return 'bg-gradient-to-r from-slate-400 to-gray-500';
  };

  // ============================================================================
  // VIEW: IMAGE GENERATION RESULTS
  // ============================================================================
  if (currentView === 'generate') {
    return (
      <div className="min-h-screen bg-[#00303C] p-4 sm:p-8" style={{ fontFamily: "'DIN', 'DIN Bold', 'DIN Alternate', Arial, sans-serif" }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setCurrentView('groups')}
              className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Groups
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="text-cyan-400" size={32} />
              Generated Images
            </h1>
            {selectedGroup && (
              <p className="text-gray-300 mt-2">
                {selectedBrand} • Group {selectedGroup.group_id} • {(selectedGroup.relevance * 100).toFixed(0)}% Relevance
              </p>
            )}
          </div>

          {/* Group Summary Card */}
          {selectedGroup && (
            <div className="bg-[#004454] rounded-xl shadow-2xl p-6 mb-8 border border-cyan-900/30">
              <h2 className="text-xl font-bold text-white mb-3">Enhanced Prompt</h2>
              <p className="text-gray-200 leading-relaxed mb-4">{selectedGroup.summary}</p>
              {selectedGroup.key_themes && (
                <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-800/30">
                  <h4 className="font-semibold text-cyan-400 mb-2">Key Themes:</h4>
                  <p className="text-gray-200 text-sm">{selectedGroup.key_themes}</p>
                </div>
              )}
            </div>
          )}

          {/* Success Banner */}
          {generatedImages.length > 0 && (
            <div className="bg-emerald-900/30 border border-emerald-600/50 rounded-xl p-4 mb-8 flex items-center gap-3">
              <CheckCircle className="text-emerald-400" size={24} />
              <div>
                <p className="font-semibold text-emerald-300">Images Generated Successfully!</p>
                <p className="text-sm text-emerald-400">{generatedImages.length} variations from the same enhanced prompt</p>
              </div>
            </div>
          )}

          {/* Image Grid */}
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {generatedImages.map((image, idx) => (
                <div key={idx} className="bg-[#004454] rounded-xl shadow-2xl overflow-hidden border border-cyan-900/30">
                  <div className="relative aspect-square bg-gray-900">
                    <img
                      src={image.url}
                      alt={`Variation ${image.variation_number}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={() => downloadImage(image.url, selectedBrand, image.variation_number)}
                      className="absolute top-4 right-4 p-3 bg-cyan-500 hover:bg-cyan-600 rounded-full shadow-lg transition-colors"
                      title="Download"
                    >
                      <Download size={20} className="text-white" />
                    </button>
                  </div>

                  <div className="p-6 border-t border-cyan-900/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold text-white">Variation {image.variation_number}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Generated {new Date(image.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadImage(image.url, selectedBrand, image.variation_number)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-all font-medium flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>

                    {image.revised_prompt && (
                      <div className="bg-[#00303C] rounded-lg p-4 border border-cyan-900/30">
                        <p className="text-xs font-semibold text-cyan-400 mb-1">DALL-E Revised:</p>
                        <p className="text-sm text-gray-300">{image.revised_prompt}</p>
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
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 inline-flex items-center gap-2"
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

  // ============================================================================
  // VIEW: GROUPED FEEDBACK CARDS
  // ============================================================================
  if (currentView === 'groups') {
    return (
      <div className="min-h-screen bg-[#00303C] p-4 sm:p-8" style={{ fontFamily: "'DIN', 'DIN Bold', 'DIN Alternate', Arial, sans-serif" }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setCurrentView('threshold')}
              className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Threshold Selection
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Grouped Preferences</h1>
              <p className="text-gray-300 mt-2">
                {selectedBrand} • {feedbackGroups.length} groups • Click any card to generate images
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-400" size={48} />
            </div>
          ) : feedbackGroups.length === 0 ? (
            /* Empty State */
            <div className="bg-[#004454] rounded-xl shadow-2xl p-12 text-center border border-cyan-900/30">
              <Sparkles className="mx-auto text-cyan-400" size={64} />
              <h3 className="mt-4 text-xl font-semibold text-white">No Preferences Yet</h3>
              <p className="mt-2 text-gray-300">Collect some preferences first to see grouped insights.</p>
              <button
                onClick={() => setCurrentView('threshold')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-all font-semibold"
              >
                Try Different Brand
              </button>
            </div>
          ) : (
            /* Groups Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbackGroups.map((group) => (
                <div
                  key={group.group_id}
                  onClick={() => !generating && handleCardClick(group)}
                  className="bg-[#004454] rounded-xl shadow-2xl overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-cyan-500/20 hover:shadow-2xl relative border border-cyan-900/30"
                >
                  {/* Relevance Badge */}
                  <div className={`${getRelevanceColor(group.relevance)} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">Group {group.group_id}</span>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <TrendingUp size={16} />
                        <span className="font-semibold">{(group.relevance * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <p className="text-sm mt-1 opacity-90">{group.item_count} preferences</p>
                  </div>

                  {/* Summary */}
                  <div className="p-6">
                    <p className="text-gray-200 leading-relaxed line-clamp-4 mb-4">
                      {group.summary}
                    </p>

                    {/* Key Themes */}
                    {group.key_themes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-cyan-400 mb-2">Key Themes:</h4>
                        <p className="text-sm text-gray-300 line-clamp-3">{group.key_themes}</p>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      disabled={generating}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

  // ============================================================================
  // VIEW: THRESHOLD SELECTION (ADMIN LANDING PAGE)
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#00303C] p-4 sm:p-8" style={{ fontFamily: "'DIN', 'DIN Bold', 'DIN Alternate', Arial, sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/MF_SquareLogo_White.png" alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-gray-300 mt-2">Analyze feedback and generate brand visualizations</p>
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="bg-[#004454] rounded-2xl shadow-2xl p-8 border border-cyan-900/30">
          <h2 className="text-2xl font-bold text-white mb-2">Feedback Analysis</h2>
          <p className="text-gray-300 mb-6">
            Select a brand and configure grouping sensitivity to analyze collected preferences.
          </p>

          {/* Brand Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">Brand Name *</label>
            <input
              type="text"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              placeholder="Enter brand name to analyze"
              className="w-full px-4 py-3 bg-[#00303C] border border-cyan-800 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500 text-lg"
            />
          </div>

          {/* Similarity Threshold Slider */}
          <div className="mb-6 p-6 bg-[#00303C] rounded-lg border border-cyan-900/30">
            <label className="block text-lg font-medium text-white mb-3">
              Grouping Sensitivity: {(similarityThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={similarityThreshold * 100}
              onChange={(e) => setSimilarityThreshold(parseInt(e.target.value) / 100)}
              className="w-full h-3 bg-cyan-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-3">
              <span>60% (More groups)</span>
              <span>95% (Fewer groups)</span>
            </div>
            <div className="mt-4 p-4 bg-cyan-900/20 rounded-lg border border-cyan-800/30">
              <p className="text-sm text-gray-300">
                {similarityThreshold >= 0.9 ? (
                  <>
                    <span className="text-cyan-400 font-bold">🔹 Very Strict</span>
                    <br />
                    Creates many small, highly specific groups. Best for detailed segmentation.
                  </>
                ) : similarityThreshold >= 0.8 ? (
                  <>
                    <span className="text-cyan-400 font-bold">🔷 Balanced (Recommended)</span>
                    <br />
                    Moderate grouping that balances specificity with consolidation.
                  </>
                ) : (
                  <>
                    <span className="text-cyan-400 font-bold">🔶 Loose</span>
                    <br />
                    Combines similar preferences into broader themes. Fewer, larger groups.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={() => {
              if (selectedBrand.trim()) {
                fetchFeedbackGroups(selectedBrand);
              } else {
                alert('Please enter a brand name');
              }
            }}
            disabled={loading || !selectedBrand.trim()}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg font-bold text-lg hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Analyzing Feedback...
              </>
            ) : (
              <>
                <TrendingUp size={24} />
                Analyze & View Grouped Preferences
              </>
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-cyan-900/20 border border-cyan-800/50 rounded-xl p-6">
          <h4 className="font-semibold text-cyan-300 mb-3 text-lg">Admin Workflow:</h4>
          <ol className="text-sm text-gray-300 space-y-3">
            <li className="flex gap-3">
              <span className="font-bold text-cyan-400 text-lg">1.</span>
              <div>
                <strong className="text-white">Select Brand & Threshold:</strong> Choose the brand to analyze and set how strictly preferences should be grouped
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-cyan-400 text-lg">2.</span>
              <div>
                <strong className="text-white">Review Groups:</strong> View AI-generated summaries showing common themes and preferences
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-cyan-400 text-lg">3.</span>
              <div>
                <strong className="text-white">Generate Images:</strong> Click any group to create 2 DALL-E variations based on collective insights
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-cyan-400 text-lg">4.</span>
              <div>
                <strong className="text-white">Download & Share:</strong> Save generated designs and share with clients
              </div>
            </li>
          </ol>
        </div>

        {/* Quick Stats Card (Optional - can be populated with real data) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#004454] rounded-xl p-4 border border-cyan-900/30 text-center">
            <div className="text-3xl font-bold text-cyan-400">---</div>
            <div className="text-sm text-gray-300 mt-1">Total Brands</div>
          </div>
          <div className="bg-[#004454] rounded-xl p-4 border border-cyan-900/30 text-center">
            <div className="text-3xl font-bold text-cyan-400">---</div>
            <div className="text-sm text-gray-300 mt-1">Preferences Collected</div>
          </div>
          <div className="bg-[#004454] rounded-xl p-4 border border-cyan-900/30 text-center">
            <div className="text-3xl font-bold text-cyan-400">---</div>
            <div className="text-sm text-gray-300 mt-1">Images Generated</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;