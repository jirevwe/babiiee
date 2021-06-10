export interface WorkerResponse {
  status: string;
  timing?: number;
  message?: string;
  parentUrl?: string;
  currentUrl: string;
  childrenUrls?: string[];
}

export interface WorkerRequest {
  timeout: number;
  rootUrl: string;
  parentUrl: string;
  currentUrl: string;
}
