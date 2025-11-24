#!/usr/bin/env node
/**
 * Test script to verify authentication fixes
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testAuthFixes() {
  console.log('🧪 Testing Authentication Fixes...\n');
  
  try {
    // Test 1: Create account without password
    console.log('1. Testing account creation without password...');
    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User'
    });
    
    if (registerResponse.status === 201) {
      console.log('✅ Account creation without password: SUCCESS');
      console.log(`   Message: ${registerResponse.data.message}`);
    }
    
    // Test 2: Create account with password
    console.log('\n2. Testing account creation with password...');
    const registerWithPasswordResponse = await axios.post(`${API_URL}/api/auth/register`, {
      email: `test-pwd-${Date.now()}@example.com`,
      name: 'Test User With Password',
      password: 'testpass123'
    });
    
    if (registerWithPasswordResponse.status === 201) {
      console.log('✅ Account creation with password: SUCCESS');
      console.log(`   Message: ${registerWithPasswordResponse.data.message}`);
    }
    
    // Test 3: Try to login with non-existent user
    console.log('\n3. Testing login with non-existent user...');
    try {
      await axios.post(`${API_URL}/api/auth/login`, {
        email: 'nonexistent@example.com',
        password: 'somepassword'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Login rejection for non-existent user: SUCCESS');
        console.log(`   Message: ${error.response.data.error}`);
      }
    }
    
    // Test 4: Demo account login
    console.log('\n4. Testing demo account login...');
    const demoResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'demo@smarttaskplanner.com'
    });
    
    if (demoResponse.status === 200) {
      console.log('✅ Demo account login: SUCCESS');
      console.log(`   Message: ${demoResponse.data.message}`);
    }
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testAuthFixes();
}

module.exports = testAuthFixes;