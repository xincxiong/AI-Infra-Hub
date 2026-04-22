const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

async function testTavily() {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: 'AI artificial intelligence',
        search_depth: 'advanced',
        max_results: 5,
      }),
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Results count:', data.results?.length || 0);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testTavily();
