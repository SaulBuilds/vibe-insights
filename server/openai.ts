import OpenAI from "openai";
import { 
  generateArchitecturalDocBatched, 
  generateUserStoriesBatched, 
  generateCustomAnalysisBatched, 
  generateCodeStoryBatched 
} from "./utils/batchProcessor";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Get API key from environment variables with fallback
const API_KEY = process.env.OPENAI_API_KEY || '';

const openai = new OpenAI({ apiKey: API_KEY });

/**
 * Generate architectural documentation from repository code
 * Uses batch processing for large repositories
 */
export async function generateArchitecturalDoc(codeContent: string): Promise<string> {
  try {
    // If code content is small enough, process directly
    if (codeContent.length <= 100000) {
      const prompt = `
      Please analyze the following repository code and generate a comprehensive architectural documentation.
      Focus on the overall structure, key components, design patterns, and how different parts of the system interact.
      Format the output as markdown with proper headings, code blocks, and bullet points as needed.
      
      Code:
      ${codeContent}
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are an experienced software architect who specializes in creating clear, detailed architectural documentation." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
      });

      return response.choices[0].message.content || "Failed to generate documentation";
    } 
    // For larger content, use batch processing
    else {
      console.log(`Processing large codebase (${codeContent.length} chars) using batch processing`);
      const result = await generateArchitecturalDocBatched(codeContent, openai);
      console.log(`Batch processing complete: ${result.metrics.totalChunks} chunks, ${result.metrics.processingTimeMs}ms`);
      return result.combinedResult;
    }
  } catch (error: any) {
    console.error("Error generating architectural documentation:", error);
    throw new Error(`Failed to generate architectural documentation: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate user stories from repository code
 * Uses batch processing for large repositories
 */
export async function generateUserStories(codeContent: string): Promise<string> {
  try {
    // If code content is small enough, process directly
    if (codeContent.length <= 100000) {
      const prompt = `
      Please analyze the following repository code and generate user stories that describe the functionality from an end-user perspective.
      Include acceptance criteria for each story when possible.
      Format the output as markdown with proper headings and structure.
      
      Code:
      ${codeContent}
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a product manager who specializes in creating detailed user stories from technical implementations." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
      });

      return response.choices[0].message.content || "Failed to generate user stories";
    } 
    // For larger content, use batch processing
    else {
      console.log(`Processing large codebase (${codeContent.length} chars) using batch processing`);
      const result = await generateUserStoriesBatched(codeContent, openai);
      console.log(`Batch processing complete: ${result.metrics.totalChunks} chunks, ${result.metrics.processingTimeMs}ms`);
      return result.combinedResult;
    }
  } catch (error: any) {
    console.error("Error generating user stories:", error);
    throw new Error(`Failed to generate user stories: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate custom analysis based on specific prompts
 * Uses batch processing for large repositories
 */
export async function generateCustomAnalysis(codeContent: string, customPrompt: string): Promise<string> {
  try {
    // If code content is small enough, process directly
    if (codeContent.length <= 100000) {
      const prompt = `
      Please analyze the following repository code and respond to this specific request:
      
      ${customPrompt}
      
      Code:
      ${codeContent}
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are an AI assistant specialized in code analysis and documentation generation." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
      });

      return response.choices[0].message.content || "Failed to generate custom analysis";
    } 
    // For larger content, use batch processing
    else {
      console.log(`Processing large codebase (${codeContent.length} chars) using batch processing`);
      const result = await generateCustomAnalysisBatched(codeContent, customPrompt, openai);
      console.log(`Batch processing complete: ${result.metrics.totalChunks} chunks, ${result.metrics.processingTimeMs}ms`);
      return result.combinedResult;
    }
  } catch (error: any) {
    console.error("Error generating custom analysis:", error);
    throw new Error(`Failed to generate custom analysis: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Check if API key is valid by making a simple request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const testOpenai = new OpenAI({ apiKey });
    
    // Make a simple request to verify the API key
    const response = await testOpenai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "user", content: "This is a test message to verify the API key." }
      ],
      max_tokens: 10,
    });
    
    return response.choices && response.choices.length > 0;
  } catch (error: any) {
    console.error("API key validation failed:", error);
    return false;
  }
}

/**
 * Generate a narrative story that explains complex code structures
 * Uses batch processing for large repositories
 */
export async function generateCodeStory(codeContent: string, complexity: 'simple' | 'moderate' | 'detailed' = 'moderate'): Promise<string> {
  try {
    // If code content is small enough, process directly
    if (codeContent.length <= 100000) {
      // Customize the prompt based on complexity level
      let detailLevel = '';
      switch(complexity) {
        case 'simple':
          detailLevel = 'Keep explanations simple and beginner-friendly, focusing on high-level concepts rather than implementation details.';
          break;
        case 'moderate':
          detailLevel = 'Balance technical details with narrative storytelling, making the code approachable to intermediate programmers.';
          break;
        case 'detailed':
          detailLevel = 'Include detailed explanations of algorithms, patterns, and technical concepts, suitable for experienced developers.';
          break;
      }

      const prompt = `
      Please analyze the following code and create a narrative "Code Story" that explains the complex structures and logic in an engaging, storytelling format.
      ${detailLevel}
      
      Use analogies, metaphors, and storytelling elements to make the code understandable.
      Focus on the "why" behind design decisions, not just the "what" and "how".
      Format the output as markdown with proper headings, code blocks for key examples, and narrative sections.
      
      Code:
      ${codeContent}
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a master programmer and storyteller who excels at explaining complex code through narrative storytelling." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
      });

      return response.choices[0].message.content || "Failed to generate code story";
    }
    // For larger content, use batch processing
    else {
      console.log(`Processing large codebase (${codeContent.length} chars) using batch processing`);
      const result = await generateCodeStoryBatched(codeContent, complexity, openai);
      console.log(`Batch processing complete: ${result.metrics.totalChunks} chunks, ${result.metrics.processingTimeMs}ms`);
      return result.combinedResult;
    }
  } catch (error: any) {
    console.error("Error generating code story:", error);
    throw new Error(`Failed to generate code story: ${error.message || 'Unknown error'}`);
  }
}

export default {
  generateArchitecturalDoc,
  generateUserStories,
  generateCustomAnalysis,
  generateCodeStory,
  validateApiKey,
};
