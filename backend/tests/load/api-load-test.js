import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'],              // Error rate should be less than 10%
  },
};

export default function () {
  // Test JSONPlaceholder API
  const postsResponse = http.get('https://jsonplaceholder.typicode.com/posts');
  
  const postsCheck = check(postsResponse, {
    'posts status is 200': (r) => r.status === 200,
    'posts response time < 500ms': (r) => r.timings.duration < 500,
    'posts has data': (r) => JSON.parse(r.body).length > 0,
  });
  
  errorRate.add(!postsCheck);
  
  sleep(1);
  
  // Test single post
  const singlePostResponse = http.get('https://jsonplaceholder.typicode.com/posts/1');
  
  const singlePostCheck = check(singlePostResponse, {
    'single post status is 200': (r) => r.status === 200,
    'single post has id': (r) => JSON.parse(r.body).id === 1,
  });
  
  errorRate.add(!singlePostCheck);
  
  sleep(1);
  
  // Test users endpoint
  const usersResponse = http.get('https://jsonplaceholder.typicode.com/users');
  
  const usersCheck = check(usersResponse, {
    'users status is 200': (r) => r.status === 200,
    'users has 10 items': (r) => JSON.parse(r.body).length === 10,
  });
  
  errorRate.add(!usersCheck);
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}

