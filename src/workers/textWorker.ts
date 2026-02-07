// src/workers/textWorker.ts
/// <reference lib="webworker" />
import { transformText, type TransformPayload } from '../utils/textUtils';

// Explicitly declare self for TypeScript in Worker context
declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (e: MessageEvent<TransformPayload>) => {
  const start = performance.now();
  
  try {
    const result = transformText(e.data);
    const end = performance.now();
    
    self.postMessage({
      success: true,
      text: result,
      executionTime: end - start,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown worker error',
    });
  }
};
