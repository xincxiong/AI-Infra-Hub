// 测试数据采集流程
require('dotenv').config({ path: '.env.local' });

const { CrawlerService } = require('./src/lib/services/CrawlerService.ts');
const crawlerService = new CrawlerService();

async function testCrawler() {
  console.log('=== 测试数据采集流程 ===\n');
  console.log('TAVILY_API_KEY:', process.env.TAVILY_API_KEY ? '已配置' : '未配置');
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置');
  console.log('UPSTASH_URL:', process.env.UPSTASH_REDIS_REST_URL ? '已配置' : '未配置');
  console.log('');

  const testQuery = {
    query: 'AI artificial intelligence',
    segment: 'Technology',
    date: '2026-04-22',
    maxResults: 5,
  };

  console.log('开始测试搜索...');
  console.log('查询:', testQuery.query);
  console.log('日期:', testQuery.date);
  console.log('分类:', testQuery.segment);
  console.log('');

  try {
    // 测试 Tavily 搜索
    console.log('1. 测试 Tavily 搜索...');
    const results = await crawlerService.searchWithTavily(testQuery);
    console.log('搜索结果数量:', results.length);
    
    if (results.length > 0) {
      console.log('\n第一篇文章:');
      console.log('- 标题:', results[0].title);
      console.log('- URL:', results[0].url);
      console.log('- 日期:', results[0].date);
      console.log('- 摘要:', results[0].summary?.substring(0, 100) + '...');
    } else {
      console.log('⚠️ 没有搜索结果！');
    }
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
  }
}

testCrawler();
