// Expo's virtual/streams.js provides a ReadableStream that breaks axios 1.x.
// At module eval time, axios/lib/adapters/fetch.js calls ReadableStream.cancel
// which throws "already has a reader" in this environment.
// Removing it forces axios to skip the fetch adapter and use http instead.
(global as any).ReadableStream = undefined;
