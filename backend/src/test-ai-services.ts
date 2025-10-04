/**
 * Test script for AI services
 * Run with: npx ts-node src/test-ai-services.ts
 */

import dotenv from 'dotenv';
import connectDB from './config/database';
import openaiService from './services/openaiService';
import meetingService from './services/meetingService';
import actionItemService from './services/actionItemService';

dotenv.config();

// Sample meeting transcript for testing
const SAMPLE_TRANSCRIPT = `
Meeting: Nonprofit Fundraising Strategy Q1 2025
Date: January 15, 2025
Attendees: Sarah (Executive Director), Mike (Development Director), Lisa (Program Manager)

Sarah: Thanks everyone for joining. Let's discuss our Q1 fundraising goals. We need to raise $50,000 by March 31st.

Mike: I've been working on the donor database. We have 150 active donors from last year. I think we should email them by January 20th with our new campaign.

Lisa: That sounds good. I can help draft the email. We should also highlight our new youth program that starts in February.

Sarah: Great idea. Mike, can you also reach out to the Johnson Foundation? They funded us last year and might be interested in the youth program.

Mike: Absolutely. I'll call them this week. Their grant deadline is February 1st, so we need to move fast on that proposal.

Lisa: I'll need the budget numbers for the youth program by next Monday to include in the grant proposal.

Sarah: Lisa, can you also schedule a volunteer orientation for the new program? We need at least 10 volunteers trained before launch.

Mike: One concern - our website donation page is outdated. It's not mobile-friendly and we're probably losing donors because of it.

Sarah: That's critical. Let's hire a web developer to fix that ASAP. Can you get quotes by end of this week, Mike?

Lisa: I know someone who does nonprofit websites. I'll send you their contact info today.

Sarah: Perfect. Let's also plan a donor appreciation event in March. Nothing fancy, just coffee and updates on our impact.

Mike: I'll look into venues. Budget around $500?

Sarah: Yes, that works. Okay, let's recap action items before we wrap up.
`;

async function testAIServices() {
  console.log('🧪 Testing AI Services\n');
  console.log('='.repeat(60));

  try {
    // Connect to database
    console.log('\n📊 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to database\n');

    // Test 1: Summarization
    console.log('='.repeat(60));
    console.log('TEST 1: Meeting Summarization');
    console.log('='.repeat(60));
    const summary = await openaiService.summarizeMeeting(SAMPLE_TRANSCRIPT);
    console.log('\n📝 Generated Summary:');
    console.log('-'.repeat(60));
    console.log(summary);
    console.log('-'.repeat(60));

    // Test 2: Action Item Extraction
    console.log('\n' + '='.repeat(60));
    console.log('TEST 2: Action Item Extraction');
    console.log('='.repeat(60));
    const actionItems = await openaiService.extractActionItems(SAMPLE_TRANSCRIPT);
    console.log(`\n✅ Extracted ${actionItems.length} action items:\n`);
    actionItems.forEach((item, index) => {
      console.log(`${index + 1}. [${item.priority}] ${item.text}`);
      if (item.assignee) console.log(`   Assignee: ${item.assignee}`);
      if (item.dueDate) console.log(`   Due: ${item.dueDate}`);
      console.log('');
    });

    // Test 3: Full Meeting Processing
    console.log('='.repeat(60));
    console.log('TEST 3: Full Meeting Processing (End-to-End)');
    console.log('='.repeat(60));

    // Create a test meeting
    console.log('\n📝 Creating test meeting...');
    const meeting = await meetingService.createMeeting({
      title: 'Nonprofit Fundraising Strategy Q1 2025',
      date: new Date('2025-01-15'),
      duration: 45,
      transcriptText: SAMPLE_TRANSCRIPT,
    });
    console.log(`✅ Created meeting: ${meeting._id}`);

    // Process the meeting
    console.log('\n🚀 Processing meeting (AI summarization + action extraction)...');
    const processedMeeting = await meetingService.processMeeting(meeting._id.toString());

    console.log('\n✅ Meeting processed successfully!');
    console.log(`   Status: ${processedMeeting.status}`);
    console.log(`   Summary length: ${processedMeeting.summary?.length || 0} characters`);
    console.log(`   Action items created: ${processedMeeting.actionItems.length}`);

    // Fetch action items
    console.log('\n📋 Action Items from Database:');
    const items = await actionItemService.getActionItemsByMeeting(meeting._id.toString());
    items.forEach((item, index) => {
      console.log(`   ${index + 1}. [${item.priority}] ${item.text} (${item.status})`);
    });

    // Test 4: Action Item Stats
    console.log('\n' + '='.repeat(60));
    console.log('TEST 4: Action Item Statistics');
    console.log('='.repeat(60));
    const stats = await actionItemService.getActionItemStats(meeting._id.toString());
    console.log('\n📊 Stats:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   High Priority: ${stats.high}`);
    console.log(`   Medium Priority: ${stats.medium}`);
    console.log(`   Low Priority: ${stats.low}`);

    // Test 5: Chat Context Building
    console.log('\n' + '='.repeat(60));
    console.log('TEST 5: Chat Context Building');
    console.log('='.repeat(60));
    const context = openaiService.buildMeetingContext(
      processedMeeting.title,
      processedMeeting.date,
      processedMeeting.summary || '',
      items.map((item) => ({
        text: item.text,
        priority: item.priority,
        status: item.status,
      }))
    );
    console.log('\n📝 Chat Context Preview (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(context.substring(0, 500) + '...');
    console.log('-'.repeat(60));

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await meetingService.deleteMeeting(meeting._id.toString());
    console.log('✅ Test meeting deleted');

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n💡 Next steps:');
    console.log('   1. Create API routes for meetings and action items');
    console.log('   2. Build frontend dashboards');
    console.log('   3. Implement chat endpoint with streaming');
    console.log('');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run tests
testAIServices();

