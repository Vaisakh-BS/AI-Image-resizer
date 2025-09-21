import React, { useState, useCallback } from 'react';
import { Dimensions } from './types';
import { useImageResizer } from './hooks/useImageResizer';
import { analyzeImageComposition, outpaintImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import DimensionInput from './components/DimensionInput';
import Button from './components/Button';
import Loader from './components/Loader';
import AlgorithmExplanation from './components/AlgorithmExplanation';
import Switch from './components/Switch';
import Tabs from './components/Tabs';
import Select from './components/Select';

const standardSizes = [
    { value: 'custom', label: 'Custom' },
    { value: '1920x1080', label: '16:9 (HD Video)' },
    { value: '1024x768', label: '4:3 (Standard)' },
    { value: '1080x1080', label: '1:1 (Square)' },
    { value: '1080x1350', label: '4:5 (Portrait)' },
    { value: '1080x1920', label: '9:16 (Story)' },
];

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [originalImage, setOriginalImage] = useState<{ file: File | null; url: string | null }>({ file: null, url: null });
  const [resizedImageUrl, setResizedImageUrl] = useState<string | null>(null);
  const [targetDimensions, setTargetDimensions] = useState<Dimensions>({ width: 1024, height: 768 });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [compositionAnalysis, setCompositionAnalysis] = useState<string | null>(null);
  const [useAIResize, setUseAIResize] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('controls');
  const [selectedSize, setSelectedSize] = useState('1024x768');


  const { resizeImage, scaleImage } = useImageResizer();

  const handleFileSelect = useCallback((file: File) => {
    if (!apiKey) {
        setError("Please enter your Google AI API key before uploading an image.");
        return;
    }
    setError(null);
    setResizedImageUrl(null);
    setCompositionAnalysis(null);

    const imageUrl = URL.createObjectURL(file);
    setOriginalImage({ file, url: imageUrl });

    setIsLoading(true);
    setLoadingMessage('AI is analyzing image composition...');
    analyzeImageComposition(file, apiKey)
      .then(analysis => {
        setCompositionAnalysis(analysis);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to analyze image composition.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [apiKey]);
  
  const handleStandardSizeChange = (value: string) => {
      setSelectedSize(value);
      if (value !== 'custom') {
          const [width, height] = value.split('x').map(Number);
          setTargetDimensions({width, height});
      }
  }

  const handleStandardResize = async () => {
    if (!originalImage.file) return;
    setIsLoading(true);
    setLoadingMessage('Resizing image...');
    try {
      const resizedUrl = await resizeImage(originalImage.file, targetDimensions);
      setResizedImageUrl(resizedUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to resize the image.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAIResize = async () => {
    if (!originalImage.file) return;
    setIsLoading(true);
    try {
        setLoadingMessage('Expanding image with AI to fit new ratio...');
        const outpaintedImageUrl = await outpaintImage(originalImage.file, targetDimensions, customPrompt, apiKey);

        setLoadingMessage('Finalizing image size...');
        const finalImageUrl = await scaleImage(outpaintedImageUrl, targetDimensions);

        setResizedImageUrl(finalImageUrl);
    } catch (err: any) {
        console.error(err);
        let errorMessage = 'Failed to resize with AI. The model may be busy or an error occurred.';
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        
        // Add a helpful hint about API key restrictions, a common deployment issue.
        if (errorMessage.toLowerCase().includes('api key')) {
             errorMessage += ' Please also check that your API key is valid and has no domain restrictions (like HTTP referrers) that would block requests from this website.';
        } else if (errorMessage.toLowerCase().includes('blocked')) {
             errorMessage += ' Try modifying your prompt or using a different image.';
        }

        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleResizeClick = async () => {
    if (!apiKey) {
      setError('Please enter your Google AI API key first.');
      return;
    }
    if (!originalImage.file) {
      setError('Please select an image first.');
      return;
    }
    if (targetDimensions.width <= 0 || targetDimensions.height <= 0) {
      setError('Please enter valid width and height greater than zero.');
      return;
    }

    setError(null);
    setResizedImageUrl(null);

    if (useAIResize) {
      await handleAIResize();
    } else {
      await handleStandardResize();
    }
  };
  
  const ImagePreview: React.FC<{ title: string; imageUrl: string | null; children?: React.ReactNode }> = ({ title, imageUrl, children }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full flex flex-col">
        <h3 className="text-lg font-semibold mb-3 text-indigo-400">{title}</h3>
        <div className="flex-grow flex items-center justify-center bg-black bg-opacity-20 rounded-md min-h-[200px]">
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="max-w-full max-h-96 object-contain rounded" />
            ) : (
                <div className="text-gray-500">Preview</div>
            )}
        </div>
        {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">AI-Powered Smart Resizer</h1>
          <p className="mt-2 text-lg text-gray-400">Resize, crop, or creatively expand images with generative AI.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 bg-gray-800 bg-opacity-50 p-6 rounded-xl shadow-2xl border border-gray-700">
            <div className="space-y-6">
              <div>
                  <h2 className="text-xl font-semibold mb-2">0. Enter Your API Key</h2>
                  <p className="text-sm text-gray-400 mb-3">
                      To use AI features, first enter your Google AI API key. Get one from{' '}
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                          Google AI Studio
                      </a>.
                  </p>
                  <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Paste your Google AI API key here"
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">1. Upload Image</h2>
                <ImageUploader onFileSelect={handleFileSelect} />
              </div>

              <Tabs
                tabs={[
                    { id: 'controls', label: 'Resize Controls' },
                    { id: 'prompt', label: 'AI Prompt', disabled: !useAIResize },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              >
                {/* Resize Controls Tab */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">2. Set Dimensions</h2>
                  <Select 
                    label="Standard Sizes"
                    options={standardSizes}
                    value={selectedSize}
                    onChange={(e) => handleStandardSizeChange(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <DimensionInput
                      label="Width (px)"
                      value={targetDimensions.width}
                      onChange={(width) => { setTargetDimensions(d => ({ ...d, width })); setSelectedSize('custom')}}
                    />
                    <DimensionInput
                      label="Height (px)"
                      value={targetDimensions.height}
                      onChange={(height) => { setTargetDimensions(d => ({ ...d, height })); setSelectedSize('custom')}}
                    />
                  </div>
                </div>

                {/* AI Prompt Tab */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Creative Direction (Optional)</h2>
                    <p className="text-sm text-gray-400">Describe what you want the AI to add. Leave blank for a natural extension.</p>
                    <textarea 
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., 'add a beautiful sunset in the sky' or 'extend the path into a misty forest'"
                        className="w-full h-28 bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        disabled={!useAIResize}
                    />
                </div>
              </Tabs>
              
              <div className="space-y-3 pt-4">
                <h2 className="text-xl font-semibold">3. Choose Method</h2>
                  <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                    <label htmlFor="ai-toggle" className="font-medium text-gray-300 pr-4">
                      ✨ AI Smart Fill (Avoids Cropping)
                    </label>
                    <Switch
                      id="ai-toggle"
                      checked={useAIResize}
                      onChange={(checked) => {
                        setUseAIResize(checked)
                        if (!checked && activeTab === 'prompt') {
                            setActiveTab('controls')
                        }
                      }}
                    />
                  </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">4. Generate</h2>
                <Button
                  onClick={handleResizeClick}
                  disabled={!originalImage.file || isLoading || !apiKey}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : (useAIResize ? 'Smart Resize with AI' : 'Resize Image')}
                </Button>
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImagePreview title="Original Image" imageUrl={originalImage.url} />
              <ImagePreview title="Resized Image" imageUrl={resizedImageUrl}>
                {resizedImageUrl && (
                  <a
                    href={resizedImageUrl}
                    download={`resized-${targetDimensions.width}x${targetDimensions.height}.png`}
                    className="mt-4 w-full text-center bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition-all duration-200"
                  >
                    Download Resized Image
                  </a>
                )}
              </ImagePreview>
            </div>
            
            {/* Main loader for the resize process. Not for analysis. */}
            {isLoading && !loadingMessage.includes('analyzing') && <Loader message={loadingMessage} />}

            {/* The analysis box. Always visible after upload. Has its own loader for the analysis phase. */}
            {originalImage.file &&
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-3 text-indigo-400">Gemini's Composition Analysis</h3>
                    {!compositionAnalysis ? (
                        isLoading ? <Loader message={loadingMessage} /> : <p className="text-gray-500">Analysis will appear here.</p>
                    ) : (
                        <p className="text-gray-300 whitespace-pre-wrap">{compositionAnalysis}</p>
                    )}
                </div>
            }
          </div>
        </div>
        
        <AlgorithmExplanation />

      </main>
    </div>
  );
};

export default App;