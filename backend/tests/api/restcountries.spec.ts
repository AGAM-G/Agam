import axios from 'axios';

describe('RestCountries API - Country Information', () => {
  const BASE_URL = 'https://restcountries.com/v3.1';


  test('GET /name/israel - should return Israel country data', async () => {
    const response = await axios.get(`${BASE_URL}/name/israel`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0].name.common).toBe('Israel');
    expect(response.data[0]).toHaveProperty('capital');
    expect(response.data[0]).toHaveProperty('population');
    expect(response.data[0]).toHaveProperty('region');
  });

  test('GET /alpha/usa - should return USA by country code', async () => {
    const response = await axios.get(`${BASE_URL}/alpha/usa`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0].cca3).toBe('USA');
    expect(response.data[0].name.common).toBe('United States');
  });

  test('GET /region/europe - should return European countries', async () => {
    const response = await axios.get(`${BASE_URL}/region/europe`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(30);
    expect(response.data.every((country: any) => country.region === 'Europe')).toBe(true);
  });

  test('GET /currency/usd - should return countries using USD', async () => {
    const response = await axios.get(`${BASE_URL}/currency/usd`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });

  test('GET /lang/spanish - should return Spanish-speaking countries', async () => {
    const response = await axios.get(`${BASE_URL}/lang/spanish`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(15);
  });
});

describe('RestCountries API - Search & Filter', () => {
  const BASE_URL = 'https://restcountries.com/v3.1';
  
  test('GET /name/united states?fullText=true - should return exact match only', async () => {
    const response = await axios.get(`${BASE_URL}/name/united states`, {
      params: { fullText: true }
    });
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBe(1);
    expect(response.data[0].name.common).toBe('United States');
  });

  test('GET /capital/london - should return country by capital', async () => {
    const response = await axios.get(`${BASE_URL}/capital/london`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0].name.common).toBe('United Kingdom');
    expect(response.data[0].capital).toContain('London');
  });

  test('GET /alpha?codes=col,pe,at - should return multiple countries', async () => {
    const response = await axios.get(`${BASE_URL}/alpha`, {
      params: { codes: 'col,pe,at' }
    });
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBe(3);
  });
});

