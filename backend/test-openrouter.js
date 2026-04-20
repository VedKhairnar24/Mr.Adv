#!/usr/bin/env node
/**
 * Test OpenRouter API integration
 */

require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('❌ OPENROUTER_API_KEY not set');
  process.exit(1);
}

console.log('Testing OpenRouter API...\n');

async function testOpenRouter() {
  try {
    console.log('📍 Endpoint: https://openrouter.ai/api/v1/chat/completions');
    console.log('🔑 API Key: ✓ Loaded');
    console.log('🤖 Model: openrouter/auto (auto-selects best model)\n');

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: 'Explain a legal dispute briefly'
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5177',
          'X-Title': 'Mr.Adv Case System',
        },
        timeout: 30000,
      }
    );

    console.log('✅ SUCCESS (Status', response.status + ')');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('\n✅ OpenRouter API is working correctly!');
  } catch (error) {
    console.error('❌ FAILED');
    console.error('Status:', error.response?.status || 'N/A');
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testOpenRouter();
