import { GoogleGenAI, Modality } from "@google/genai";
import { Dimensions } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            resolve('');
        }
    };
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const analyzeImageComposition = async (imageFile: File, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "Error: API key not provided. Please enter your key in the input field.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(imageFile);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { 
          parts: [
            imagePart,
            { text: "Analyze the composition of this image. Describe the main subject, its placement (e.g., rule of thirds, centered), and the overall visual flow. Be concise and focus on photographic composition elements." }
          ] 
        }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    return "An error occurred while analyzing the image composition. Please check your API key and network connection.";
  }
};


export const outpaintImage = async (file: File, targetDimensions: Dimensions, customPrompt: string | undefined, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API key not provided.");
    }
    
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = URL.createObjectURL(file);
    });

    const W_o = img.width;
    const H_o = img.height;
    const aspect_o = W_o / H_o;
    const aspect_t = targetDimensions.width / targetDimensions.height;

    // If aspect ratios are very close, no need to outpaint.
    if (Math.abs(aspect_o - aspect_t) < 0.01) {
        // Convert to dataURL for consistency before returning.
        const canvas = document.createElement('canvas');
        canvas.width = W_o;
        canvas.height = H_o;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL(file.type || 'image/png');
    }
    
    let canvasWidth = W_o;
    let canvasHeight = H_o;
    
    if (aspect_o > aspect_t) { // original is wider, add padding top/bottom
        canvasHeight = W_o / aspect_t;
    } else { // original is taller, add padding left/right
        canvasWidth = H_o * aspect_t;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Transparent background

    const drawX = (canvasWidth - W_o) / 2;
    const drawY = (canvasHeight - H_o) / 2;
    ctx.drawImage(img, drawX, drawY, W_o, H_o);

    const base64PaddedImage = canvas.toDataURL('image/png').split(',')[1];

    const promptText = customPrompt && customPrompt.trim() !== ''
        ? customPrompt
        : 'You are a professional photo editor. Your task is to seamlessly fill in the transparent areas of this image to extend the scene. Match the existing style, lighting, and content. Do not alter the original, non-transparent parts of the image.';


    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64PaddedImage,
                            mimeType: 'image/png',
                        },
                    },
                    {
                        text: promptText,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            let errorMessage = "AI did not return a valid image response.";
            if (response.promptFeedback?.blockReason) {
                errorMessage = `Request was blocked by the API. Reason: ${response.promptFeedback.blockReason}.`;
                if (response.promptFeedback.blockReason === 'SAFETY' && response.promptFeedback.safetyRatings) {
                    const harmfulCategories = response.promptFeedback.safetyRatings
                        .filter(rating => rating.probability !== 'NEGLIGIBLE' && rating.probability !== 'LOW')
                        .map(rating => rating.category.replace('HARM_CATEGORY_', ''))
                        .join(', ');
                    if (harmfulCategories) {
                        errorMessage += ` Harmful categories detected: ${harmfulCategories}.`;
                    }
                }
            }
            throw new Error(errorMessage);
        }

        const candidate = response.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            throw new Error("AI returned a response with no content parts.");
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }

        throw new Error("AI did not return an image. The response may have contained only text.");

    } catch (error: any) {
        console.error("Gemini API Error in outpaintImage:", error);
        // Re-throw with a more user-friendly message that includes the original error.
        throw new Error(`AI generation failed: ${error.message}`);
    }
};