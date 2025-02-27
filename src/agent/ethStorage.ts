import { FlatDirectory } from 'ethstorage-sdk';
import dotenv from 'dotenv';

dotenv.config();

export interface EthStorageConfig {
  privateKey: string;
  rpcUrl: string;
  directoryAddress: string;
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
} 