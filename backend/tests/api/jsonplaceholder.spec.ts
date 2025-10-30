import axios from 'axios';

describe('JSONPlaceholder API - Posts', () => {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';
  
  test('GET /posts - should return list of posts', async () => {
    const response = await axios.get(`${BASE_URL}/posts`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('userId');
    expect(response.data[0]).toHaveProperty('id');
    expect(response.data[0]).toHaveProperty('title');
    expect(response.data[0]).toHaveProperty('body');
  });

  test('GET /posts/1 - should return a single post', async () => {
    const response = await axios.get(`${BASE_URL}/posts/1`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', 1);
    expect(response.data).toHaveProperty('userId');
    expect(response.data).toHaveProperty('title');
    expect(response.data).toHaveProperty('body');
  });

  test('POST /posts - should create a new post', async () => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post body',
      userId: 1,
    };
    
    const response = await axios.post(`${BASE_URL}/posts`, newPost);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.title).toBe(newPost.title);
    expect(response.data.body).toBe(newPost.body);
    expect(response.data.userId).toBe(newPost.userId);
  });

  test('PUT /posts/1 - should update a post', async () => {
    const updatedPost = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1,
    };
    
    const response = await axios.put(`${BASE_URL}/posts/1`, updatedPost);
    
    expect(response.status).toBe(200);
    expect(response.data.title).toBe(updatedPost.title);
    expect(response.data.body).toBe(updatedPost.body);
  });

  test('DELETE /posts/1 - should delete a post', async () => {
    const response = await axios.delete(`${BASE_URL}/posts/1`);
    
    expect(response.status).toBe(200);
  });
});

describe('JSONPlaceholder API - Users', () => {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';
  
  test('GET /users - should return list of users', async () => {
    const response = await axios.get(`${BASE_URL}/users`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBe(10);
  });

  test('GET /users/1 - should return user details', async () => {
    const response = await axios.get(`${BASE_URL}/users/1`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', 1);
    expect(response.data).toHaveProperty('name');
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('address');
    expect(response.data).toHaveProperty('company');
  });

  test('GET /users/1/posts - should return posts by user', async () => {
    const response = await axios.get(`${BASE_URL}/users/1/posts`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('userId', 1);
  });
});

describe('JSONPlaceholder API - Comments', () => {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';
  
  test('GET /comments - should return list of comments', async () => {
    const response = await axios.get(`${BASE_URL}/comments`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });

  test('GET /posts/1/comments - should return comments for a post', async () => {
    const response = await axios.get(`${BASE_URL}/posts/1/comments`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('postId', 1);
    expect(response.data[0]).toHaveProperty('email');
    expect(response.data[0]).toHaveProperty('body');
  });
});

