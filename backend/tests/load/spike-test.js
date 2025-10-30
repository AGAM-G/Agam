import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Spike test configuration
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Ramp up to 5 users
    { duration: '30s', target: 50 },  // Spike to 50 users
    { duration: '10s', target: 5 },   // Scale back down
    { duration: '10s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    errors: ['rate<0.15'],              // Less than 15% errors
  },
};

export default function () {
  // Test HTTPBin under spike load
  const getResponse = http.get('https://httpbin.org/get');
  
  const getCheck = check(getResponse, {
    'GET status is 200': (r) => r.status === 200,
    'GET has headers': (r) => JSON.parse(r.body).headers !== undefined,
  });
  
  errorRate.add(!getCheck);
  
  sleep(0.5);
  
  // Test POST under load
  const postData = JSON.stringify({
    name: `User-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
  
  const postResponse = http.post('https://httpbin.org/post', postData, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const postCheck = check(postResponse, {
    'POST status is 200': (r) => r.status === 200,
    'POST echoes data': (r) => JSON.parse(r.body).json !== undefined,
  });
  
  errorRate.add(!postCheck);
  
  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}

