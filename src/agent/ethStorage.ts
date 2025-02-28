import { createRequire } from 'module';
import { dirname } from 'path';
// Import ethstorage-sdk in a way compatible with ES modules
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Create a require function that works in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import ethstorage-sdk using the created require function
const { FlatDirectory } = require('ethstorage-sdk');

dotenv.config();

export interface EthStorageConfig {
  privateKey: string;
  rpcUrl: string;
  directoryAddress: string;
  ethStorageRpc?: string;
}

export class EthStorageAdapter {
  private flatDirectory: any;
  private config: EthStorageConfig;

  constructor(config: EthStorageConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      console.log('Initializing EthStorage adapter...');
      this.flatDirectory = await FlatDirectory.create({
        rpc: this.config.rpcUrl,
        privateKey: this.config.privateKey,
        address: this.config.directoryAddress,
        ethStorageRpc: this.config.ethStorageRpc || this.config.rpcUrl,
      });
      console.log('EthStorage adapter initialized successfully');
    } catch (error) {
      console.error('Error initializing EthStorage:', error);
      throw error;
    }
  }

  async uploadContent(key: string, content: string): Promise<any> {
    try {
      console.log('Uploading content to EthStorage...');
      const request = {
        key: key,
        content: Buffer.from(content),
        type: 2, // 1 for calldata and 2 for blob
        callback: {
          onProgress(progress: number, count: number, isChange: boolean) {
            console.log(`Upload progress: ${progress}%`);
          },
          onFail(err: Error) {
            console.error('Upload failed:', err);
          },
          onFinish(totalUploadChunks: number, totalUploadSize: number, totalStorageCost: number) {
            console.log(`Upload finished. Total chunks: ${totalUploadChunks}, Size: ${totalUploadSize}, Cost: ${totalStorageCost}`);
          }
        }
      };
      
      const response = await this.flatDirectory.upload(request);
      console.log('Upload successful:', response);
      return response;
    } catch (error) {
      console.error('Error uploading to EthStorage:', error);
      throw error;
    }
  }

  async readContent(key: string): Promise<string> {
    try {
      console.log(`Reading content from EthStorage with key: ${key}...`);
      
      let contentChunks: Buffer[] = [];
      
      await this.flatDirectory.download(key, {
        onProgress: function(progress: number, count: number, chunk: Buffer) {
          console.log(`Download ${progress} of ${count} chunks`);
          contentChunks.push(chunk);
        },
        onFail: function(error: Error) {
          console.error('Error downloading data:', error);
          throw error;
        },
        onFinish: function() {
          console.log('Download successful.');
        }
      });
      
      // Combine all chunks into a single buffer and convert to string
      const completeContent = Buffer.concat(contentChunks).toString();
      return completeContent;
    } catch (error) {
      console.error('Error reading from EthStorage:', error);
      throw error;
    }
  }
} 