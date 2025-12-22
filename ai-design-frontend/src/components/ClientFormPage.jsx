import React, { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Container
} from '@mui/material';
import { Send, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const ClientFormPage = () => {
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
  const [selectedBrand, setSelectedBrand] = useState('');
  const [preferenceText, setPreferenceText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form data for detailed preferences
  const [formData, setFormData] = useState({
    tone: 'modern',
    colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
    visual_style: 'minimalist',
    dislikes: ''
  });

  // ============================================================================
  // RESET FORM FOR NEW SUBMISSION
  // ============================================================================
  const handleSubmitAnother = () => {
    setSubmitSuccess(false);
    setSelectedBrand('');
    setPreferenceText('');
    setFormData({
      tone: 'modern',
      colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
      visual_style: 'minimalist',
      dislikes: ''
    });
    setSubmitError('');
  };

  // ============================================================================
  // SUBMIT PREFERENCE TO VECTOR DB
  // ============================================================================
  const handleSubmitPreference = async (e) => {
    e.preventDefault();

    if (!preferenceText.trim() || !selectedBrand.trim()) {
      setSubmitError('Please enter both brand name and preference description');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

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

      // Create comprehensive feedback text
      const feedbackText = `Brand: ${selectedBrand}. Preference: ${preferenceText}. Tone: ${formData.tone}. Style: ${formData.visual_style}. Colors: ${formData.colors.join(', ')}. ${formData.dislikes ? 'Avoid: ' + formData.dislikes : ''}`;

      console.log('📤 Submitting preference:', { brand: selectedBrand, text: feedbackText });

      const response = await fetchWithHeaders(`${API_BASE_URL}/api/feedback/store`, {
        method: 'POST',
        body: JSON.stringify({
          feedback_text: feedbackText,
          brand_name: selectedBrand,
          moodboard_id: 'preference_collection',
          metadata: preferenceData
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Preference stored:', data);
        setSubmitSuccess(true);
      } else {
        console.error('❌ Server error:', data);
        setSubmitError(data.detail || 'Failed to store preference');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setSubmitError(`Error storing preference: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#00303C',
        fontFamily: "'DIN', 'DIN Bold', 'DIN Alternate', Arial, sans-serif",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2 }
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Header - Logo and Title on Same Line */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 },
            mb: 2
          }}>
            <Box
              component="img"
              src="/MF_SquareLogo_White.png"
              alt="Brand Logo"
              sx={{
                width: { xs: 100, sm: 100 },
                height: { xs: 100, sm: 100 },
                objectFit: 'contain'
              }}
            />
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1rem', md: '2rem' },
                textAlign: 'left'
              }}
            >
              Brand Visualization Tool
            </Typography>
          </Box>
        </Box>

        {/* Success Message */}
        {submitSuccess ? (
          <Paper
            elevation={3}
            sx={{
              bgcolor: '#004454',
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 3,
              border: '2px solid #06b6d4',
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <CheckCircle
                size={60}
                style={{
                  color: '#06b6d4',
                  marginRight: '16px'
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                Your response is recorded!
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 4,
                fontSize: { xs: '0.938rem', sm: '1rem' }
              }}
            >
              Thank you for sharing your brand vision with us.
            </Typography>

            <Button
              onClick={handleSubmitAnother}
              variant="contained"
              size="large"
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                px: { xs: 3, sm: 4 },
                background: 'linear-gradient(to right, #06b6d4, #14b8a6)',
                '&:hover': {
                  background: 'linear-gradient(to right, #0891b2, #0d9488)'
                },
                fontWeight: 'bold',
                fontSize: { xs: '0.938rem', sm: '1rem' },
                textTransform: 'none'
              }}
            >
              Submit Another Response
            </Button>
          </Paper>
        ) : (
          // Form Card
          <Paper
            elevation={3}
            sx={{
              bgcolor: '#004454',
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 3,
              border: '2px solid #06b6d4'
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                mb: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Tell us about your brand vision!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
                textAlign: 'center',
                mb: 4,
                fontSize: { xs: '0.813rem', sm: '0.875rem' }
              }}
            >
              "We want you to think from both the perspective of your personal preference as well as what your customers will find value in and allow you to differentiate yourself in your market."
            </Typography>

            {/* Error Alert */}
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmitPreference}>
              <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Brand Name - FULL WIDTH */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Brand Name"
                    placeholder="What is your brand's name?"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        bgcolor: '#00303C',
                        '& fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                        '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.7)' },
                        '&.Mui-focused fieldset': { borderColor: '#06b6d4' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' }
                    }}
                  />
                </Grid>

                {/* User Preference - FULL WIDTH */}
                <Grid item xs={12} py={2}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="Preferences"
                    placeholder="Please use as many adjectives to describe in as much detail as you can the brand vision. You can share things like: image style, image content, existing brands you like, font style, etc. Think about if your brand is more safe, or if your brand is more vibrant and loud."
                    value={preferenceText}
                    onChange={(e) => setPreferenceText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        bgcolor: '#00303C',
                        '& fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                        '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.7)' },
                        '&.Mui-focused fieldset': { borderColor: '#06b6d4' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' }
                    }}
                  />
                </Grid>

                {/* Personality - FULL WIDTH */}
                <Grid item xs={12} py={1}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#06b6d4' } }}>
                      Personality
                    </InputLabel>
                    <Select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      label="Personality"
                      sx={{
                        color: 'white',
                        bgcolor: '#00303C',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(6, 182, 212, 0.7)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#06b6d4' },
                        '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
                      }}
                    >
                      <MenuItem value="modern">Modern</MenuItem>
                      <MenuItem value="luxury">Luxury</MenuItem>
                      <MenuItem value="playful">Playful</MenuItem>
                      <MenuItem value="professional">Professional</MenuItem>
                      <MenuItem value="vintage">Vintage</MenuItem>
                      <MenuItem value="sleek">Sleek</MenuItem>
                      <MenuItem value="futuristic">Futuristic</MenuItem>
                      <MenuItem value="classic">Classic</MenuItem>
                      <MenuItem value="sporty">Sporty</MenuItem>
                      <MenuItem value="bold">Bold</MenuItem>
                      <MenuItem value="loud">Loud</MenuItem>
                      <MenuItem value="holistic">Holistic</MenuItem>
                      <MenuItem value="adventurous">Adventurous</MenuItem>
                      <MenuItem value="wild">Wild</MenuItem>
                      <MenuItem value="quirky">Quirky</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Visual Style - FULL WIDTH */}
                <Grid item xs={12} py={1}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#06b6d4' } }}>
                      Visual Style
                    </InputLabel>
                    <Select
                      value={formData.visual_style}
                      onChange={(e) => setFormData({ ...formData, visual_style: e.target.value })}
                      label="Visual Style"
                      sx={{
                        color: 'white',
                        bgcolor: '#00303C',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(6, 182, 212, 0.7)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#06b6d4' },
                        '& .MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }
                      }}
                    >
                      <MenuItem value="minimalist">Minimalist</MenuItem>
                      <MenuItem value="retro">Retro</MenuItem>
                      <MenuItem value="corporate">Corporate</MenuItem>
                      <MenuItem value="organic">Organic</MenuItem>
                      <MenuItem value="industrial">Industrial</MenuItem>
                      <MenuItem value="rigid">Rigid</MenuItem>
                      <MenuItem value="geometric">Geometric</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="vibrant">Vibrant</MenuItem>
                      <MenuItem value="abstract">Abstract</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Preferred Colors - FULL WIDTH */}
                <Grid item xs={12} py={1}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 2,
                      fontWeight: 500,
                      textAlign: 'center',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Preferred Colors
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: { xs: 2, sm: 3 },
                      flexWrap: 'wrap',
                      justifyContent: 'center',  // <-- centers items horizontally
                    }}
                  >
                    {formData.colors.map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',   // <-- centers input and label vertically in column
                        }}
                      >
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index] = e.target.value;
                            setFormData({ ...formData, colors: newColors });
                          }}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            cursor: 'pointer',
                            border: '2px solid rgba(6, 182, 212, 0.5)',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            mt: 1,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          }}
                        >
                          Color {index + 1}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                </Grid>

                {/* Dislikes - FULL WIDTH */}
                <Grid item xs={12} py={1}>
                  <TextField
                    fullWidth
                    required
                    label="Dislikes"
                    placeholder="e.g., No serif fonts, avoid dark colors"
                    value={formData.dislikes}
                    onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        bgcolor: '#00303C',
                        '& fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                        '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.7)' },
                        '&.Mui-focused fieldset': { borderColor: '#06b6d4' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' }
                    }}
                  />
                </Grid>

                {/* Submit Button - FULL WIDTH */}
                <Grid item xs={12} py={3}>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={submitting}
                    variant="contained"
                    size="large"
                    sx={{
                      py: { xs: 1.25, sm: 1.5 },
                      background: 'linear-gradient(to right, #06b6d4, #14b8a6)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #0891b2, #0d9488)'
                      },
                      fontWeight: 'bold',
                      fontSize: { xs: '0.938rem', sm: '1rem' },
                      textTransform: 'none',
                      '&.Mui-disabled': {
                        opacity: 0.5,
                        color: 'white'
                      }
                    }}
                    startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Send size={20} />}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </Grid>
              </Container>
            </form>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ClientFormPage;