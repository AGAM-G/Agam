import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const requestCount = new Counter('requests');

// Stress test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up to 20 users
    { duration: '2m', target: 20 },   // Stay at 20 users
    { duration: '1m', target: 40 },   // Increase to 40 users
    { duration: '2m', target: 40 },   // Stay at 40 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export default function () {
  requestCount.add(1);
  
  // Test 1: Get all posts
  const allPostsRes = http.get(`${BASE_URL}/posts`);
  check(allPostsRes, {
    'all posts OK': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
  
  // Test 2: Get random post
  const randomId = Math.floor(Math.random() * 100) + 1;
  const singlePostRes = http.get(`${BASE_URL}/posts/${randomId}`);
  check(singlePostRes, {
    'single post OK': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
  
  // Test 3: Get comments for post
  const commentsRes = http.get(`${BASE_URL}/posts/${randomId}/comments`);
  check(commentsRes, {
    'comments OK': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
  
  // Test 4: Create new post
  const payload = JSON.stringify({
    title: `Load Test Post ${Date.now()}`,
    body: 'This is a stress test post',
    userId: Math.floor(Math.random() * 10) + 1,
  });
  
  const createPostRes = http.post(`${BASE_URL}/posts`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(createPostRes, {
    'create post OK': (r) => r.status === 201,
  }) || errorRate.add(1);
  
  sleep(2);
}

export function handleSummary(data) {
  const summary = {
    testType: 'Stress Test',
    duration: data.metrics.iteration_duration.values.avg,
    requests: {
      total: data.metrics.iterations.values.count,
      perSecond: data.metrics.iterations.values.rate,
    },
    responseTime: {
      avg: data.metrics.http_req_duration.values.avg,
      min: data.metrics.http_req_duration.values.min,
      max: data.metrics.http_req_duration.values.max,
      p95: data.metrics.http_req_duration.values['p(95)'],
      p99: data.metrics.http_req_duration.values['p(99)'],
    },
    errors: {
      rate: data.metrics.errors ? data.metrics.errors.values.rate : 0,
      count: data.metrics.errors ? data.metrics.errors.values.count : 0,
    },
    virtualUsers: {
      max: data.metrics.vus_max.values.max,
    },
  };
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
  };
}

