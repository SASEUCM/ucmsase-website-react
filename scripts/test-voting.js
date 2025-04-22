// scripts/test-voting.js
// Test script to verify voting functionality

/**
 * To run this test script:
 * 1. Start the development server with: npm run dev
 * 2. Initialize the Amplify sandbox: npx ampx sandbox --profile amplify-policy-863518450047
 * 3. In a new terminal, run: node scripts/test-voting.js
 * 
 * This script provides a basic test of the voting API endpoints. It does not test the UI components.
 */

const fetch = require('node-fetch');

async function testVotingEndpoints() {
  console.log('🧪 Testing voting functionality...');
  
  try {
    // Check if a user is authenticated (this will fail if server isn't running or user not logged in)
    console.log('\n📝 Testing vote status API (without authentication)...');
    const statusResponse = await fetch('http://localhost:3000/api/check-vote-status', {
      method: 'GET',
    });
    
    console.log(`Status check response: ${statusResponse.status} ${statusResponse.statusText}`);
    if (statusResponse.status === 401) {
      console.log('✅ Authentication check working correctly - unauthenticated access rejected');
    } else {
      console.log('❌ Authentication check issue - unauthenticated access not properly rejected');
    }
    
    // Test voting without authentication (should fail)
    console.log('\n📝 Testing voting API (without authentication)...');
    const voteResponse = await fetch('http://localhost:3000/api/cast-vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ candidateId: 'test-candidate' }),
    });
    
    console.log(`Vote API response: ${voteResponse.status} ${voteResponse.statusText}`);
    if (voteResponse.status === 401) {
      console.log('✅ Voting API working correctly - unauthenticated access rejected');
    } else {
      console.log('❌ Voting API issue - unauthenticated access not properly rejected');
    }
    
    console.log('\n📋 Summary:');
    console.log('- Voting system requires authentication to access status and vote');
    console.log('- For complete testing, sign in with a valid account in the app');
    console.log('- Visit the Executive Chairs page and use the voting UI');
    console.log('- Check admin/vote-results page for admin users to verify vote counting');
    
  } catch (error) {
    console.error('🚨 Error running tests:', error.message);
    console.log('Make sure your development server is running on http://localhost:3000');
  }
}

testVotingEndpoints();