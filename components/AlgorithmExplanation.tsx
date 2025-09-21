import React, { useState } from 'react';

const AlgorithmExplanation: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full max-w-4xl mx-auto my-8 bg-gray-800 rounded-lg shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-white focus:outline-none"
            >
                <span>How Does Smart Resizing Work?</span>
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
                <div className="px-6 pb-6 text-gray-300 space-y-4">
                    <div>
                        <h3 className="font-semibold text-indigo-400 text-md mb-1">The Goal</h3>
                        <p>We want to resize your image to new dimensions (`target width` x `target height`) without distorting it. Simply stretching or squishing the image would ruin its visual integrity. The key is to maintain the original <strong>aspect ratio</strong>.</p>
                    </div>

                    <h3 className="font-semibold text-indigo-400 text-lg pt-2 mb-2">Two Powerful Resizing Methods</h3>

                    <div className="p-4 border border-gray-700 rounded-lg mb-4">
                        <h4 className="font-semibold text-white text-base mb-1">1. Classic Center-Crop (AI Disabled)</h4>
                        <p className="mb-2">This is the traditional and fastest method. It ensures your image fits the new dimensions without distortion by maintaining the original aspect ratio.</p>
                        <ol className="list-decimal list-inside space-y-1 pl-2 text-gray-400">
                            <li>
                                <strong>Compare Ratios:</strong> We calculate the aspect ratios of your original image and the target dimensions.
                            </li>
                            <li>
                                <strong>Scale to Fit:</strong> We scale your image so it completely covers the target area, avoiding any empty bars. This means the scaled image will be larger than the target in one dimension (either width or height).
                            </li>
                            <li>
                                <strong>Crop Excess:</strong> The parts of the scaled image that extend beyond the target dimensions are cropped away from the center, preserving the main subject.
                            </li>
                        </ol>
                    </div>

                    <div className="p-4 border border-indigo-500/50 rounded-lg bg-indigo-900/20">
                        <h4 className="font-semibold text-white text-base mb-1">✨ 2. AI Smart Fill (AI Enabled)</h4>
                        <p className="mb-2">When you don't want to lose any part of your original image, our AI-powered method comes to the rescue. Instead of cropping, it intelligently generates new pixels to fill the empty space.</p>
                        <ol className="list-decimal list-inside space-y-1 pl-2 text-gray-400">
                            <li>
                                <strong>Create a Canvas:</strong> We place your original image onto a new, larger canvas that matches your target aspect ratio. This leaves transparent, empty areas on the sides or top and bottom.
                            </li>
                            <li>
                                <strong>Gemini Vision:</strong> We send this padded image to the Gemini model with a specific instruction: "Fill in the transparent areas to extend the image naturally."
                            </li>
                            <li>
                                <strong>Generate and Scale:</strong> The AI "outpaints" the image, creating new content that seamlessly blends with the original. This newly generated, full-frame image is then scaled down to your exact target dimensions.
                            </li>
                        </ol>
                         <p className="pt-2 text-indigo-300">This advanced process prevents cropping, preserving your entire original photo while perfectly matching the desired size. It's like magic!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlgorithmExplanation;
