import { API_CONFIG, WECHAT_CONFIG } from '../constants';
import { User, WebhookResponse } from '../types';

class ApiService {
  private getFullUrl(path: string): string {
    return `${API_CONFIG.BASE_URL}${path}`;
  }

  /**
   * Basic fetch wrapper with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 120000): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('请求超时')), timeout)
      )
    ]);
  }

  /**
   * Handle Enterprise WeChat SSO
   */
  async authenticate(code: string): Promise<User | null> {
    try {
      const response = await fetch(this.getFullUrl(API_CONFIG.ENDPOINTS.AUTH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          corpid: WECHAT_CONFIG.CORPID,
          agentid: WECHAT_CONFIG.AGENTID
        })
      });

      if (!response.ok) throw new Error('Auth failed');
      const data: WebhookResponse = await response.json();
      
      if (data && data.user) {
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('SSO Error:', error);
      return null;
    }
  }

  /**
   * Submit Query and Handle Polling for N8N Webhooks
   */
  async submitQuery(question: string, user: User | null, onStatusUpdate?: (status: string) => void): Promise<string> {
    const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Build URL Params
    const params = new URLSearchParams();
    params.append('question', question);
    params.append('requestId', requestId);
    
    if (user) {
      if (user.name) params.append('name', user.name);
      if (user.company) params.append('company', user.company);
      if (user.department) params.append('department', user.department);
      if (user.position) params.append('position', user.position);
      if (user.role) params.append('role', user.role);
      if (user.gender) params.append('gender', user.gender);
    }

    const queryUrl = `${this.getFullUrl(API_CONFIG.ENDPOINTS.QUERY)}?${params.toString()}`;

    // Initial Request
    if (onStatusUpdate) onStatusUpdate("正在连接服务器...");
    
    const initialResponse = await this.fetchWithTimeout(queryUrl, { method: 'GET' });

    if (initialResponse.status === 200) {
      // Immediate response
      return await initialResponse.text();
    } else if (initialResponse.status === 202) {
      // Async processing needed - Start Polling
      if (onStatusUpdate) onStatusUpdate("服务器正在思考中...");
      return this.pollForResult(requestId, onStatusUpdate);
    } else {
      throw new Error(`Request failed with status ${initialResponse.status}`);
    }
  }

  /**
   * Polling Logic
   */
  private async pollForResult(requestId: string, onStatusUpdate?: (status: string) => void): Promise<string> {
    const pollUrl = `${this.getFullUrl(API_CONFIG.ENDPOINTS.STATUS)}?requestId=${requestId}`;
    const maxAttempts = 48; // Approx 4 minutes (48 * 5s)
    const delay = 5000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.fetchWithTimeout(pollUrl, {}, 10000);
        
        if (response.status === 200) {
          return await response.text();
        } else if (response.status === 202) {
           if (onStatusUpdate) {
             const seconds = Math.floor((attempt + 1) * delay / 1000);
             onStatusUpdate(`正在处理数据... (${seconds}s)`);
           }
           await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw new Error(`Polling failed: ${response.status}`);
        }
      } catch (e) {
        console.warn(`Polling attempt ${attempt} failed`, e);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('请求处理超时，请稍后重试');
  }

  redirectToWeChatAuth() {
    const currentUrl = window.location.href;
    const redirectUri = encodeURIComponent(currentUrl);
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WECHAT_CONFIG.CORPID}&redirect_uri=${redirectUri}&response_type=code&scope=${WECHAT_CONFIG.SCOPE}&agentid=${WECHAT_CONFIG.AGENTID}&state=${WECHAT_CONFIG.STATE}#wechat_redirect`;
    window.location.href = url;
  }
}

export const apiService = new ApiService();
