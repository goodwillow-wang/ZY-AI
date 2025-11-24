export interface User {
  name: string;
  gender?: string;
  company?: string;
  department?: string;
  position?: string;
  role?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    query: string;
    auth: string;
    status: string;
  };
}

export interface WebhookResponse {
  user?: User;
  [key: string]: any;
}
