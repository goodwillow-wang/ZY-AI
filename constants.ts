export const API_CONFIG = {
  // NOTE: Ideally this comes from env vars, but using empty string as per original source 
  // to imply relative path or configured proxy.
  BASE_URL: "", 
  ENDPOINTS: {
    QUERY: "/webhook/opai-master-query",
    AUTH: "/webhook/opai-wechat-auth",
    STATUS: "/webhook/opai-query-status"
  }
};

export const WECHAT_CONFIG = {
  CORPID: 'ww04f7c8b144a5cdb7',
  AGENTID: '1000069',
  SCOPE: 'snsapi_base',
  STATE: 'STATE'
};

export const WELCOME_SUGGESTIONS = [
  "查询公司差旅报销制度",
  "查看一号粮库当前的温度数据",
  "查询第一小学的今日午餐订餐量",
  "公司最新的考勤管理规定是什么？"
];
