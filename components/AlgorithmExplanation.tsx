import React, { useState } from 'react';

const AlgorithmExplanation: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full max-w-4xl mx-auto my-8 bg-gray-800 rounded-lg shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-white focus:outline-none"
            >
                <span>How Does It Work? & Troubleshooting</span>
                <svg
                    className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-gray-300 space-y-4 divide-y divide-gray-700">
                    <div className="pt-2 pb-4">
                        <h3 className="font-semibold text-indigo-400 text-lg mb-2">Two Powerful Resizing Methods</h3>

                        <div className="p-4 border border-gray-700 rounded-lg mb-4">
                            <h4 className="font-semibold text-white text-base mb-1">1. Classic Center-Crop (AI Disabled)</h4>
                            <p className="mb-2">This is the traditional and fastest method. It ensures your image fits the new dimensions without distortion by maintaining the original aspect ratio.</p>
                            <ol className="list-decimal list-inside space-y-1 pl-2 text-gray-400">
                                <li>
                                    <strong>Compare Ratios:</strong> We calculate the aspect ratios of your original image and the target dimensions.
                                </li>
                                <li>
                                    <strong>Scale to Fit:</strong> We scale your image so it completely covers the target area, avoiding any empty bars.
                                </li>
                                <li>
                                    <strong>Crop Excess:</strong> The parts of the scaled image that extend beyond the target dimensions are cropped away from the center.
                                </li>
                            </ol>
                        </div>

                        <div className="p-4 border border-indigo-500/50 rounded-lg bg-indigo-900/20">
                            <h4 className="font-semibold text-white text-base mb-1">✨ 2. AI Smart Fill (AI Enabled)</h4>
                            <p className="mb-2">Instead of cropping, this method intelligently generates new pixels to fill the empty space, preserving your entire original image.</p>
                            <ol className="list-decimal list-inside space-y-1 pl-2 text-gray-400">
                                <li>
                                    <strong>Create a Canvas:</strong> We place your image onto a larger canvas matching your target aspect ratio, leaving transparent areas.
                                </li>
                                <li>
                                    <strong>Gemini Vision:</strong> We send this padded image to the Gemini model, asking it to "fill in the transparent areas to extend the image naturally."
                                </li>
                                <li>
                                    <strong>Generate and Scale:</strong> The AI "outpaints" the image, creating new content that seamlessly blends with the original. This new image is then scaled to your exact target dimensions.
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div className="pt-4">
                         <h3 className="font-semibold text-rose-400 text-lg mb-2">Troubleshooting Common Errors</h3>
                         <div className="space-y-3 text-sm">
                            <div>
                                <h4 className="font-semibold text-white">1. AI Fails After Deploying (e.g., on Vercel)</h4>
                                <p className="text-gray-400">This is the most common issue. It's almost always caused by API key security settings. When you create your key, you must authorize the domain where your app is hosted.
                                <br/><strong>Solution:</strong> Go to your Google Cloud Console API credentials page. Select your API key, and under "Application restrictions," make sure your website's domain (e.g., <code className="bg-gray-700 p-1 rounded text-xs">your-app.vercel.app</code>) is added to the list of "Website restrictions." Using no restrictions is also an option for testing, but less secure.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-white">2. "Blocked" or "Safety" Error Message</h4>
                                <p className="text-gray-400">The Gemini API has safety filters. If your uploaded image or custom text prompt contains content that might be sensitive, the API will block the request.
                                <br/><strong>Solution:</strong> Try a different image or modify your text prompt to be more neutral.</p>
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgorithmExplanation;