import { EigenDAAdapter } from "@layr-labs/agentkit-eigenda";
import { EthStorageAdapter } from "./ethStorage.js";
// @ts-ignore
import { OpacityAdapter } from "@layr-labs/agentkit-opacity";
import dotenv from "dotenv";

dotenv.config();

export interface VerifiableResponse {
  content: string;
  proof: any;
}

const systemPrompt = `
You are a helpful and efficient assistant that facilitates transactions and social connections. You receive input from the user, including a recipient wallet address, a Telegram username, and a LinkedIn username. Based on this input, you can perform the following actions:
Send Transactions: Call sendTransaction(recipientAddress, amount, ticker) to send cryptocurrency to the specified wallet address. Ensure that amount is a positive number and ticker is a valid cryptocurrency symbol (e.g., ETH, USDT).
Connect on Telegram: Call connectOnTelegram(username) to initiate a connection with the given Telegram username.
Connect on LinkedIn: Call connectOnLinkedin(username) to initiate a connection request with the specified LinkedIn username.
Connect on Twitter: Call connectOnTwitter(username) to initiate a connection request with the specified Twitter username.

Respond in the following JSON format:
{
    "text": "string // AI agent response",
    "functionCall": {
      "functionName": "string // Relevant function name, if applicable",
      "args": { "string": "string // Key-value pairs of arguments" }
    }
  }

Maximum of one function call per request.
`;

export class Agent {
  private opacity: OpacityAdapter;
  private ethStorage: EthStorageAdapter;
  // private eigenDA: EigenDAAdapter;

  // Track the last used sequence number for each user address
  private userSequenceMap: Map<string, number> = new Map();

  constructor() {
    // Initialize Opacity adapter for verifiable AI inference
    this.opacity = new OpacityAdapter({
      apiKey: process.env.OPACITY_OPENAI_KEY!,
      teamId: process.env.OPACITY_TEAM_ID!,
      teamName: process.env.OPACITY_TEAM_NAME!,
      opacityProverUrl: process.env.OPACITY_PROVER_URL!,
    });

    // Initialize EthStorage adapter
    this.ethStorage = new EthStorageAdapter({
      privateKey: process.env.ETHSTORAGE_PRIVATE_KEY!,
      rpcUrl:
        process.env.ETHSTORAGE_RPC_URL ||
        "https://rpc.beta.testnet.l2.quarkchain.io:8545",
      directoryAddress:
        process.env.ETHSTORAGE_DIRECTORY_ADDRESS ||
        "0xA460C70b474cA4125c35dFaFfC1e83B0122efcaB",
      ethStorageRpc:
        process.env.ETHSTORAGE_RPC_URL ||
        "https://rpc.beta.testnet.l2.ethstorage.io:9596",
    });

    // Initialize EigenDA adapter for data availability logging
    // this.eigenDA = new EigenDAAdapter({
    //   privateKey: process.env.EIGENDA_PRIVATE_KEY!,
    //   apiUrl: process.env.EIGENDA_API_URL!,
    //   rpcUrl: process.env.EIGENDA_BASE_RPC_URL!,
    //   creditsContractAddress: process.env.EIGENDA_CREDITS_CONTRACT!,
    //   flushInterval: 5000, // Flush logs every 5 seconds
    //   maxBufferSize: 100, // Maximum number of logs to buffer
    // });
  }

  /**
   * Initialize all adapters
   */
  async initialize() {
    try {
      console.log("Initializing Opacity adapter...");
      await this.opacity.initialize();

      console.log("Initializing EthStorage adapter...");
      await this.ethStorage.initialize();

      console.log("Initializing EigenDA adapter...");
      // await this.eigenDA.initialize();

      console.log("All adapters initialized successfully");
    } catch (error) {
      console.error("Error initializing adapters:", error);
      throw error;
    }
  }

  /**
   * Generate verifiable text using Opacity and log to EigenDA
   */
  async generateVerifiableText(
    prompt: string,
    userAddress: string
  ): Promise<VerifiableResponse> {
    let jsonString = "";
    try {
      console.log("Generating text with prompt:", prompt);
      // Generate text with proof using Opacity
      const result = await this.opacity.generateText(
        systemPrompt + ". User Query: " + prompt
      );

      // Extract JSON from markdown code block and parse it
      console.log("Result:", result);

      const content = result.content;
      jsonString = content.replace(/```json\n|\n```/g, "").trim();
      const jsonResult = JSON.parse(jsonString);

      console.log("Parsed JSON result:", jsonResult);

      // Get the next sequence number for this user
      const currentSequence = this.userSequenceMap.get(userAddress) || 0;
      const nextSequence = currentSequence + 1;
      this.userSequenceMap.set(userAddress, nextSequence);

      // Create the key with user address and sequence number
      const logKey = `${userAddress}-${nextSequence}.json`;

      if (process.env.ETHSTORAGE_ENABLED) {
        this.ethStorage.uploadContent(
          logKey,
          JSON.stringify({
            result: jsonResult,
            hasProof: !!result.proof,
            timestamp: new Date().toISOString(),
            userAddress,
            sequence: nextSequence,
          })
        );
      } else {
        console.log(`ETHStorage Skipped. Would have used key: ${logKey}`);
      }

      // Log the generation to EigenDA
      // await this.eigenDA.info('Text Generation', {
      //   prompt,
      //   result: result.content,
      //   hasProof: !!result.proof,
      // });

      return {
        content: jsonResult,
        proof: result.proof,
      };
    } catch (error) {
      console.error("Error in generateVerifiableText:", error);
      return {
        content: jsonString,
        proof: null,
      };
    }
  }

  /**
   * Utility method to log information directly to EigenDA
   */
  async logInfo(
    message: string,
    metadata: any,
    userAddress: string = "anonymous"
  ): Promise<void> {
    // Get the next sequence number for this user
    const currentSequence = this.userSequenceMap.get(userAddress) || 0;
    const nextSequence = currentSequence + 1;
    this.userSequenceMap.set(userAddress, nextSequence);

    // Create the key with user address and sequence number
    const logKey = `${userAddress}-${nextSequence}.json`;
    console.log("Log key:", logKey);

    await this.ethStorage.uploadContent(
      logKey,
      JSON.stringify({
        message,
        metadata,
        timestamp: new Date().toISOString(),
        userAddress,
        sequence: nextSequence,
      })
    );
    // await this.eigenDA.info(message, metadata);
  }

  /**
   * Retrieve all transactions for a specific wallet address
   * @param walletAddress The wallet address to retrieve transactions for
   * @returns Array of transaction data
   */
  async getAllTransactions(walletAddress: string): Promise<any[]> {
    console.log(
      `Retrieving all transactions for wallet address: ${walletAddress}`
    );
    const transactions = [];
    let sequenceNumber = 1;
    let continueReading = true;

    while (continueReading) {
      try {
        const key = `${walletAddress}-${sequenceNumber}.json`;
        console.log(`Attempting to read: ${key}`);

        const content = await this.ethStorage.readContent(key);
        const data = JSON.parse(content);

        transactions.push(data);
        console.log(`Successfully retrieved transaction #${sequenceNumber}`);

        // Move to the next sequence number
        sequenceNumber++;
      } catch (error) {
        // If we get an error, assume we've reached the end of the sequence
        console.log(
          `No more transactions found after sequence #${sequenceNumber - 1}`
        );
        continueReading = false;
      }
    }

    console.log(
      `Retrieved ${transactions.length} transactions for ${walletAddress}`
    );
    return transactions;
  }
}

// Export a factory function to create new agent instances
export const createAgent = async (): Promise<Agent> => {
  const agent = new Agent();
  await agent.initialize();
  return agent;
};
