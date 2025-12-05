/**
 * Feedback Groups Page Component
 * 
 * Displays semantically grouped feedback with summaries and relevance scores
 * 
 * INTEGRATION:
 * 1. Add to your router:
 *    <Route path="/feedback-groups/:brandName" element={<FeedbackGroupsPage />} />
 * 
 * 2. Import in your routes file:
 *    import FeedbackGroupsPage from './pages/FeedbackGroupsPage';
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { feedbackGroupsAPI } from '../api/feedbackGroups';

const FeedbackGroupsPage = () => {
  const { brandName } = useParams();
  const navigate = useNavigate();
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set([1])); // First group expanded by default
  const [totalFeedback, setTotalFeedback] = useState(0);

  useEffect(() => {
    fetchGroups();
  }, [brandName]);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await feedbackGroupsAPI.getGroups(brandName, {
        similarityThreshold: 0.75,
        includeSummary: true
      });

      setGroups(response.groups || []);
      setTotalFeedback(response.total_feedback || 0);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleGenerateImages = (group) => {
    // Navigate to image generation page with group data
    navigate(`/generate-images/${brandName}`, {
      state: { group }
    });
  };

  const getRelevanceColor = (relevance) => {
    if (relevance >= 0.9) return 'text-green-600 bg-green-50';
    if (relevance >= 0.8) return 'text-blue-600 bg-blue-50';
    if (relevance >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-purple-600" size={48} />
          <p className="mt-4 text-gray-600">Analyzing feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h2 className="mt-4 text-xl font-bold text-gray-800">Error Loading Groups</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchGroups}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="text-purple-600" size={32} />
                Feedback Groups
              </h1>
              <p className="text-gray-600 mt-2">
                {brandName} • {totalFeedback} feedback items • {groups.length} groups
              </p>
            </div>
          </div>
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Users className="mx-auto text-gray-400" size={64} />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">No Feedback Groups</h3>
            <p className="mt-2 text-gray-600">
              No feedback found for this brand yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const isExpanded = expandedGroups.has(group.group_id);

              return (
                <div
                  key={group.group_id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                >
                  {/* Group Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleGroup(group.group_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-800">
                            Group {group.group_id}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRelevanceColor(group.relevance)}`}>
                            <TrendingUp size={14} className="inline mr-1" />
                            {(group.relevance * 100).toFixed(0)}% Relevance
                          </span>
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                            {group.item_count} {group.item_count === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        <p className="text-gray-700 leading-relaxed">
                          {group.summary}
                        </p>
                      </div>

                      <button className="ml-4 text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {/* Key Themes */}
                      {group.key_themes && (
                        <div className="p-6 bg-purple-50">
                          <h4 className="font-semibold text-gray-800 mb-2">Key Themes:</h4>
                          <div className="text-gray-700 whitespace-pre-line">
                            {group.key_themes}
                          </div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {group.suggestions && (
                        <div className="p-6 bg-blue-50">
                          <h4 className="font-semibold text-gray-800 mb-2">Suggestions:</h4>
                          <div className="text-gray-700 whitespace-pre-line">
                            {group.suggestions}
                          </div>
                        </div>
                      )}

                      {/* Individual Feedback Items */}
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Individual Feedback ({group.item_count}):
                        </h4>
                        <div className="space-y-2">
                          {group.items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <p className="text-gray-700 text-sm">{item.feedback_text}</p>
                              {item.timestamp && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Generate Images Button */}
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateImages(group);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles size={20} />
                          Generate Images from This Group
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackGroupsPage;