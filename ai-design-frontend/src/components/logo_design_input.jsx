import React, { useState, useEffect } from 'react';
import { Upload, X, Plus, Send, Image as ImageIcon, User, MessageSquare } from 'lucide-react';

const LogoDesignInput = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    brandName: '',
    description: '',
    tone: 'modern',
    colors: [],
    visualStyle: 'minimalist',
    dislikes: '',
  });
  
  const [colorInput, setColorInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Available options
  const toneOptions = ['modern', 'luxury', 'playful', 'professional', 'bold', 'elegant', 'vintage'];
  const styleOptions = ['minimalist', 'retro', 'corporate', 'organic', 'geometric', 'illustrative', 'abstract'];

  // Load data from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('logoDesignUsers');
    const savedSubmissions = localStorage.getItem('logoSubmissions');
    
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('logoDesignUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('logoSubmissions', JSON.stringify(submissions));
  }, [submissions]);

  // User management
  const addUser = (userName) => {
    const newUser = {
      id: Date.now().toString(),
      name: userName,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setShowUserModal(false);
  };

  const switchUser = (user) => {
    setCurrentUser(user);
    setShowUserModal(false);
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addColor = () => {
    if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
      setFormData({
        ...formData,
        colors: [...formData.colors, colorInput.trim()]
      });
      setColorInput('');
    }
  };

  const removeColor = (color) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter(c => c !== color)
    });
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          data: event.target.result,
          uploadedAt: new Date().toISOString()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };

  // Submit initial design
  const handleSubmit = () => {
    if (!formData.brandName || !formData.description) {
      alert('Please fill in at least the brand name and description');
      return;
    }

    const submission = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      ...formData,
      images: uploadedImages,
      feedback: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSubmissions([...submissions, submission]);
    
    // Reset form
    setFormData({
      brandName: '',
      description: '',
      tone: 'modern',
      colors: [],
      visualStyle: 'minimalist',
      dislikes: '',
    });
    setUploadedImages([]);
    
    alert('Design request submitted successfully!');
  };

  // Add feedback to submission
  const addFeedback = (submissionId) => {
    if (!feedbackInput.trim()) return;

    setSubmissions(submissions.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          feedback: [
            ...sub.feedback,
            {
              id: Date.now().toString(),
              userId: currentUser.id,
              userName: currentUser.name,
              text: feedbackInput,
              timestamp: new Date().toISOString()
            }
          ],
          updatedAt: new Date().toISOString()
        };
      }
      return sub;
    }));

    setFeedbackInput('');
  };

  // User Modal
  const UserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Select or Create User</h2>
        
        {users.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Existing Users</h3>
            <div className="space-y-2">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => switchUser(user)}
                  className="w-full p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg text-left transition-colors border border-gray-200"
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Create New User</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.username.value;
            if (name.trim()) addUser(name.trim());
          }}>
            <input
              name="username"
              type="text"
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create User
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  if (showUserModal || !currentUser) {
    return <UserModal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Logo Design Studio</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-gray-700">{currentUser.name}</span>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Switch User
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">New Design Request</h2>
            
            {/* Brand Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., TechNova"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none"
                placeholder="Describe what you want in your logo..."
              />
            </div>

            {/* Tone */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map(tone => (
                  <button
                    key={tone}
                    onClick={() => handleInputChange('tone', tone)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.tone === tone
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Colors
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., #3B82F6 or Blue"
                />
                <button
                  onClick={addColor}
                  className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map(color => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                  >
                    {color}
                    <button
                      onClick={() => removeColor(color)}
                      className="hover:text-indigo-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Visual Style */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Visual Style
              </label>
              <div className="flex flex-wrap gap-2">
                {styleOptions.map(style => (
                  <button
                    key={style}
                    onClick={() => handleInputChange('visualStyle', style)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.visualStyle === style
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Dislikes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What to Avoid
              </label>
              <textarea
                value={formData.dislikes}
                onChange={(e) => handleInputChange('dislikes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-20 resize-none"
                placeholder="e.g., No serif fonts, avoid red color..."
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reference Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-1">Click to upload images</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </label>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {uploadedImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.data}
                        alt={img.name}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg"
            >
              Submit Design Request
            </button>
          </div>

          {/* Submissions & Feedback */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Design Requests</h2>
            
            {submissions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No design requests yet. Create your first one!</p>
              </div>
            ) : (
              submissions.map(submission => (
                <div key={submission.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{submission.brandName}</h3>
                      <p className="text-sm text-gray-500">by {submission.userName}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{submission.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                      {submission.tone}
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                      {submission.visualStyle}
                    </span>
                    {submission.colors.map(color => (
                      <span key={color} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {color}
                      </span>
                    ))}
                  </div>

                  {submission.images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {submission.images.map(img => (
                        <img
                          key={img.id}
                          src={img.data}
                          alt={img.name}
                          className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  )}

                  {/* Feedback Section */}
                  {submission.feedback.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Feedback</h4>
                      <div className="space-y-2">
                        {submission.feedback.map(fb => (
                          <div key={fb.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">{fb.userName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(fb.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{fb.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Feedback */}
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFeedback(submission.id)}
                      placeholder="Add feedback..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => addFeedback(submission.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoDesignInput;