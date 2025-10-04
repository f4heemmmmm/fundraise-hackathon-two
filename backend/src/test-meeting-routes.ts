/**
 * Test script for Meeting Routes
 * Run with: npx ts-node src/test-meeting-routes.ts
 * 
 * This script tests all meeting endpoints:
 * - POST /api/meetings - Create meeting
 * - GET /api/meetings - Get all meetings
 * - GET /api/meetings/:id - Get single meeting
 * - GET /api/meetings/stats - Get statistics
 * - PATCH /api/meetings/:id - Update meeting
 * - POST /api/meetings/:id/process - Process meeting
 * - DELETE /api/meetings/:id - Delete meeting
 */

import dotenv from 'dotenv';
import connectDB from './config/database';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

// Sample transcript for testing
const SAMPLE_TRANSCRIPT = `
Meeting: Nonprofit Fundraising Strategy Q1 2025
Date: January 15, 2025
Attendees: Sarah (Executive Director), Mike (Development Director), Lisa (Program Manager)

Sarah: Thanks everyone for joining. Let's discuss our Q1 fundraising goals. We need to raise $50,000 by March 31st.

Mike: I've been working on the donor outreach campaign. We should email our top 100 donors by next Friday with personalized asks.

Lisa: Great idea. I'll prepare the impact report showing how last year's donations were used. Can we have that ready by Thursday?

Sarah: Yes, that's critical. Also, we need to schedule the donor appreciation event for February 15th. Mike, can you book the venue this week?

Mike: Absolutely. I'll also follow up with the corporate sponsors who pledged support last quarter.

Sarah: Perfect. Let's reconvene next Monday to review progress. High priority is getting those donor emails out.
`;

// Helper function to make API requests
async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`\n📡 ${method} ${endpoint}`);
  if (body) {
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
  }

  const response = await fetch(url, options);
  const data = await response.json();

  console.log(`📊 Status: ${response.status}`);
  console.log('📥 Response:', JSON.stringify(data, null, 2));

  return { status: response.status, data };
}

// Test functions
async function testCreateMeeting(): Promise<string> {
  console.log('\n========================================');
  console.log('TEST 1: Create Meeting');
  console.log('========================================');

  const meetingData = {
    title: 'Q1 Fundraising Strategy Meeting',
    date: new Date('2025-01-15T10:00:00Z'),
    duration: 45,
    transcriptText: SAMPLE_TRANSCRIPT,
  };

  const { status, data } = await apiRequest('POST', '/api/meetings', meetingData);

  if (status === 201 && data.success) {
    console.log('✅ Meeting created successfully');
    console.log(`   Meeting ID: ${data.data._id}`);
    return data.data._id;
  } else {
    console.log('❌ Failed to create meeting');
    throw new Error('Meeting creation failed');
  }
}

async function testGetAllMeetings(): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 2: Get All Meetings');
  console.log('========================================');

  const { status, data } = await apiRequest('GET', '/api/meetings');

  if (status === 200 && data.success) {
    console.log(`✅ Retrieved ${data.count} meetings`);
  } else {
    console.log('❌ Failed to get meetings');
  }
}

async function testGetMeetingById(meetingId: string): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 3: Get Meeting by ID');
  console.log('========================================');

  const { status, data } = await apiRequest('GET', `/api/meetings/${meetingId}`);

  if (status === 200 && data.success) {
    console.log('✅ Retrieved meeting successfully');
    console.log(`   Title: ${data.data.title}`);
    console.log(`   Status: ${data.data.status}`);
  } else {
    console.log('❌ Failed to get meeting');
  }
}

async function testGetMeetingStats(): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 4: Get Meeting Statistics');
  console.log('========================================');

  const { status, data } = await apiRequest('GET', '/api/meetings/stats');

  if (status === 200 && data.success) {
    console.log('✅ Retrieved statistics successfully');
    console.log(`   Total: ${data.data.total}`);
    console.log(`   Pending: ${data.data.pending}`);
    console.log(`   Completed: ${data.data.completed}`);
  } else {
    console.log('❌ Failed to get statistics');
  }
}

async function testUpdateMeeting(meetingId: string): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 5: Update Meeting');
  console.log('========================================');

  const updates = {
    title: 'Q1 Fundraising Strategy Meeting (Updated)',
    duration: 60,
  };

  const { status, data } = await apiRequest('PATCH', `/api/meetings/${meetingId}`, updates);

  if (status === 200 && data.success) {
    console.log('✅ Meeting updated successfully');
    console.log(`   New title: ${data.data.title}`);
    console.log(`   New duration: ${data.data.duration} minutes`);
  } else {
    console.log('❌ Failed to update meeting');
  }
}

async function testProcessMeeting(meetingId: string): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 6: Process Meeting (AI Summary & Action Items)');
  console.log('========================================');
  console.log('⚠️  This may take 10-30 seconds...');

  const { status, data } = await apiRequest('POST', `/api/meetings/${meetingId}/process`);

  if (status === 200 && data.success) {
    console.log('✅ Meeting processed successfully');
    console.log(`   Status: ${data.data.status}`);
    console.log(`   Summary length: ${data.data.summary?.length || 0} characters`);
    console.log(`   Action items: ${data.data.actionItems?.length || 0}`);
    
    if (data.data.summary) {
      console.log('\n📝 Summary Preview:');
      console.log(data.data.summary.substring(0, 200) + '...');
    }
    
    if (data.data.actionItems && data.data.actionItems.length > 0) {
      console.log('\n✅ Action Items:');
      data.data.actionItems.forEach((item: any, index: number) => {
        console.log(`   ${index + 1}. [${item.priority}] ${item.text}`);
      });
    }
  } else {
    console.log('❌ Failed to process meeting');
  }
}

async function testGetFilteredMeetings(): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 7: Get Filtered Meetings (status=completed)');
  console.log('========================================');

  const { status, data } = await apiRequest('GET', '/api/meetings?status=completed');

  if (status === 200 && data.success) {
    console.log(`✅ Retrieved ${data.count} completed meetings`);
  } else {
    console.log('❌ Failed to get filtered meetings');
  }
}

async function testDeleteMeeting(meetingId: string): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 8: Delete Meeting');
  console.log('========================================');

  const { status, data } = await apiRequest('DELETE', `/api/meetings/${meetingId}`);

  if (status === 200 && data.success) {
    console.log('✅ Meeting deleted successfully');
  } else {
    console.log('❌ Failed to delete meeting');
  }
}

async function testErrorHandling(): Promise<void> {
  console.log('\n========================================');
  console.log('TEST 9: Error Handling');
  console.log('========================================');

  // Test 1: Invalid meeting ID
  console.log('\n🧪 Test invalid meeting ID...');
  const { status: status1 } = await apiRequest('GET', '/api/meetings/invalid-id-123');
  if (status1 === 404 || status1 === 500) {
    console.log('✅ Correctly handled invalid ID');
  }

  // Test 2: Missing required fields
  console.log('\n🧪 Test missing required fields...');
  const { status: status2 } = await apiRequest('POST', '/api/meetings', { title: 'Test' });
  if (status2 === 400) {
    console.log('✅ Correctly validated required fields');
  }

  // Test 3: Invalid status filter
  console.log('\n🧪 Test invalid status filter...');
  const { status: status3 } = await apiRequest('GET', '/api/meetings?status=invalid');
  if (status3 === 400) {
    console.log('✅ Correctly validated status filter');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Meeting Routes Tests');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  try {
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    let meetingId: string;

    // Run tests in sequence
    meetingId = await testCreateMeeting();
    await testGetAllMeetings();
    await testGetMeetingById(meetingId);
    await testGetMeetingStats();
    await testUpdateMeeting(meetingId);
    await testProcessMeeting(meetingId);
    await testGetFilteredMeetings();
    await testErrorHandling();
    await testDeleteMeeting(meetingId);

    console.log('\n========================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('========================================');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();

