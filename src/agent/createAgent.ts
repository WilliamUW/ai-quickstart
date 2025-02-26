// @ts-ignore
import { OpacityAdapter } from '@layr-labs/agentkit-opacity';
import dotenv from 'dotenv';

dotenv.config();

export interface VerifiableResponse {
  content: string;
  proof: any;
}

export class Agent {
  private opacity: OpacityAdapter;

  constructor() {
    // Initialize Opacity adapter for verifiable AI inference
    this.opacity = new OpacityAdapter({
      apiKey: process.env.OPACITY_OPENAI_KEY!,
      teamId: process.env.OPACITY_TEAM_ID!,
      teamName: process.env.OPACITY_TEAM_NAME!,
      opacityProverUrl: process.env.OPACITY_PROVER_URL!,
    });


  }

  /**
   * Initialize all adapters
   */
  async initialize() {
    try {
      console.log('Initializing Opacity adapter...');
      await this.opacity.initialize();

      console.log('Initializing EigenDA adapter...');

      console.log('All adapters initialized successfully');
    } catch (error) {
      console.error('Error initializing adapters:', error);
      throw error;
    }
  }

  /**
   * Generate verifiable text using Opacity and log to EigenDA
   */
  async generateVerifiableText(prompt: string): Promise<VerifiableResponse> {
    try {
      console.log('Generating text with prompt:', prompt);
      // Generate text with proof using Opacity
      const result = await this.opacity.generateText(prompt);
      console.log('Generated result:', result);



      return result;
    } catch (error) {
      console.error('Error in generateVerifiableText:', error);
      throw error;
    }
  }

  /**
   * Utility method to log information directly to EigenDA
   */
  async logInfo(message: string, metadata: any): Promise<void> {
  }
}

// Export a factory function to create new agent instances
export const createAgent = async (): Promise<Agent> => {
  const agent = new Agent();
  await agent.initialize();
  return agent;
}; 