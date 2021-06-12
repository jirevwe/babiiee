export interface WorkerResponse {
  status: string;
  timing?: number;
  message?: string;
  currentUrl: string;
  childrenUrls?: string[];
}

export interface WorkerRequest {
  timeout: number;
  rootUrl: string;
  currentUrl: string;
}
