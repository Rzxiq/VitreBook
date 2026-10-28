import axios, { AxiosInstance } from 'axios';

export const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

export const httpClient: AxiosInstance = axios.create({
  timeout: 20000,
  headers: {
    'User-Agent': DEFAULT_USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server returned status outside of 2xx
      if (error.response.status === 403 || error.response.status === 503) {
        error.isCloudflare = true;
      }
    } else if (error.request) {
      // Request made but no response received
      error.isNetworkError = true;
    }
    return Promise.reject(error);
  }
);
