import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Palette, Type, Send, Loader2, Download } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const LogoDesignStudio = () => {
  const [currentPage, setCurrentPage] = useState('create');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [moodboards, setMoodboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedMoodboardId, setSelectedMoodboardId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    brand_name: '',
    description: '',
    tone: 'modern',
    colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
    visual_style: 'minimalist',
    dislikes: ''
  });

  // Download moodboard image
  const downloadMoodboard = async (imageUrl, brandName, version) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${brandName}_moodboard_v${version}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading moodboard:', error);
      alert('Failed to download moodboard');
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brands`);
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  // Fetch moodboards for selected brand
  const fetchMoodboards = async (brandName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/moodboards/${brandName}`);
      const data = await response.json();
      setMoodboards(data.moodboards || []);
    } catch (error) {
      console.error('Error fetching moodboards:', error);
    }
  };

  // Create submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Moodboard created successfully!');
        
        // Switch to gallery and show the new moodboard
        setSelectedBrand(formData.brand_name);
        setCurrentPage('gallery');
        await fetchBrands();
        await fetchMoodboards(formData.brand_name);
      } else {
        alert('Failed to create moodboard');
      }
    } catch (error) {
      console.error('Error creating submission:', error);
      alert('Error creating moodboard');
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback
  const handleFeedback = async (moodboardId) => {
    if (!feedback.trim()) {
      alert('Please enter feedback');
      return;
    }

    setFeedbackLoading(true);
    setSelectedMoodboardId(moodboardId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodboard_id: moodboardId,
          feedback_text: feedback,
          brand_name: selectedBrand
        })
      });

      if (response.ok) {
        setFeedback('');
        await fetchMoodboards(selectedBrand);
        alert('New moodboard version created!');
      } else {
        alert('Failed to process feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error processing feedback');
    } finally {
      setFeedbackLoading(false);
      setSelectedMoodboardId(null);
    }
  };

  // Update rating
  const handleRating = async (moodboardId, rating) => {
    try {
      await fetch(`${API_BASE_URL}/api/moodboards/${moodboardId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      
      await fetchMoodboards(selectedBrand);
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  // Get overall moodboard image from moodboard
  const getOverallMoodboard = (moodboard) => {
    const overallItem = moodboard.items?.find(item => item.type === 'overall');
    return overallItem?.content?.image_url || null;
  };

  // Get brand data (colors and typography)
  const getBrandData = (moodboard) => {
    const colorItem = moodboard.items?.find(item => item.type === 'color_palette' && item.metadata?.data_only);
    const typoItem = moodboard.items?.find(item => item.type === 'typography' && item.metadata?.data_only);
    
    return {
      colors: colorItem?.content || null,
      typography: typoItem?.content || null
    };
  };

  useEffect(() => {
    if (currentPage === 'gallery') {
      fetchBrands();
    }
  }, [currentPage]);

  useEffect(() => {
    if (selectedBrand) {
      fetchMoodboards(selectedBrand);
    }
  }, [selectedBrand]);

  // Render star rating
  const StarRating = ({ rating, onRate, moodboardId }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(moodboardId, star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );

  // Create Page
  if (currentPage === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="text-purple-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">AI Brand Moodboard Studio</h1>
            </div>
            <button
              onClick={() => setCurrentPage('gallery')}
              className="px-6 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700 font-medium"
            >
              View Gallery
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Moodboard</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.brand_name}
                  onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., TechNova, Pizza Mania"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your brand..."
                />
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
                    <option value="bold">Bold</option>
                    <option value="elegant">Elegant</option>
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
                    <option value="geometric">Geometric</option>
                    <option value="illustrative">Illustrative</option>
                    <option value="abstract">Abstract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                <div className="flex gap-2">
                  {formData.colors.map((color, index) => (
                    <input
                      key={index}
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...formData.colors];
                        newColors[index] = e.target.value;
                        setFormData({...formData, colors: newColors});
                      }}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
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
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating Moodboard...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate AI Moodboard
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Gallery Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Moodboard Gallery</h1>
          </div>
          <button
            onClick={() => setCurrentPage('create')}
            className="px-6 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700 font-medium"
          >
            Create New
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Choose a brand --</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {selectedBrand && moodboards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
            {moodboards.map((moodboard) => {
              const imageUrl = getOverallMoodboard(moodboard);
              const brandData = getBrandData(moodboard);

              return (
                <div key={moodboard._id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{moodboard.brand_name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Version {moodboard.version} • {new Date(moodboard.created_at).toLocaleDateString()}
                        </p>
                        {moodboard.feedback_text && (
                          <p className="text-sm text-purple-600 mt-2">
                            Feedback: "{moodboard.feedback_text}"
                          </p>
                        )}
                      </div>
                      <StarRating
                        rating={moodboard.rating || 0}
                        onRate={handleRating}
                        moodboardId={moodboard._id}
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Overall Moodboard Image - Compact Size */}
                    {imageUrl && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Sparkles size={20} className="text-purple-600" />
                            Brand Moodboard
                          </h4>
                          <button
                            onClick={() => downloadMoodboard(imageUrl, moodboard.brand_name, moodboard.version)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                        <div className="max-w-lg mx-auto">
                          <img
                            src={imageUrl}
                            alt="Overall Moodboard"
                            className="w-full rounded-lg shadow-lg"
                          />
                        </div>
                      </div>
                    )}

                    
                    {/* Feedback Section */}
                    <div className="border-t border-gray-200 pt-4 max-w-lg mx-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refine Moodboard
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="e.g., Make it more colorful, add more patterns..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => handleFeedback(moodboard._id)}
                          disabled={feedbackLoading && selectedMoodboardId === moodboard._id}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                        >
                          {feedbackLoading && selectedMoodboardId === moodboard._id ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              Refine
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedBrand && moodboards.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-500">No moodboards found for this brand.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoDesignStudio;

