declare module 'ethstorage-sdk' {
  export class FlatDirectory {
    static create(config: {
      rpc: string;
      privateKey: string;
      address: string;
    }): Promise<FlatDirectory>;
    
    upload(request: {
      key: string;
      content: Buffer;
      type: number;
      callback?: {
        onProgress?: (progress: number, count: number, isChange: boolean) => void;
        onFail?: (err: Error) => void;
        onFinish?: (totalUploadChunks: number, totalUploadSize: number, totalStorageCost: number) => void;
      }
    }): Promise<any>;
    
    download(key: string, callbacks: {
      onProgress?: (progress: number, count: number, chunk: Buffer) => void;
      onFail?: (error: Error) => void;
      onFinish?: () => void;
    }): Promise<void>;
  }
} 