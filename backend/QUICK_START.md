# Quick Start: Testing Meeting Routes

## ✅ What's Been Implemented

- **Meeting Controller** with 7 endpoints
- **Meeting Routes** registered at `/api/meetings`
- **Integration Test Script** for end-to-end testing
- **Unit Tests** with Jest (15 test cases)
- **Documentation** and testing guides

---

## 🚀 Quick Test (3 Steps)

### Step 1: Start the Server

```bash
cd backend
npm run dev
```

You should see:

```
🚀 Server running on port 4000
✅ MongoDB connected successfully
```

### Step 2: Run Integration Tests

Open a **new terminal** and run:

```bash
cd backend
npx ts-node src/test-meeting-routes.ts
```

This will:

1. Create a test meeting
2. Retrieve it
3. Process it with AI (generate summary + action items)
4. Update it
5. Delete it

**Expected output:**

```
🚀 Starting Meeting Routes Tests
📍 API Base URL: http://localhost:4000

========================================
TEST 1: Create Meeting
========================================
✅ Meeting created successfully

========================================
TEST 6: Process Meeting (AI Summary & Action Items)
========================================
✅ Meeting processed successfully
   Summary length: 450 characters
   Action items: 4

✅ Action Items:
   1. [High] Email top 100 donors by next Friday
   2. [High] Prepare impact report by Thursday
   3. [High] Book venue for donor appreciation event
   4. [Medium] Follow up with corporate sponsors

========================================
✅ ALL TESTS COMPLETED SUCCESSFULLY
========================================
```

### Step 3: Run Unit Tests (Optional)

```bash
npm test
```

**Expected output:**

```
PASS  src/__tests__/meetingController.test.ts
  Meeting Controller
    ✓ should return all meetings successfully
    ✓ should filter meetings by status
    ✓ should return 400 for invalid status
    ... (15 tests total)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

---

## 📊 Quick Manual Test with cURL

### Create a meeting:

```bash
curl -X POST http://localhost:4000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Standup",
    "date": "2025-01-20T10:00:00Z",
    "duration": 30,
    "transcriptText": "Sarah: We need to finalize the budget by Friday. Mike: I will send the draft today."
  }'
```

### Get all meetings:

```bash
curl http://localhost:4000/api/meetings
```

### Process a meeting (replace MEETING_ID):

```bash
curl -X POST http://localhost:4000/api/meetings/MEETING_ID/process
```

---

## 🎯 API Endpoints Available

| Method   | Endpoint                    | Description        |
| -------- | --------------------------- | ------------------ |
| `POST`   | `/api/meetings`             | Create new meeting |
| `GET`    | `/api/meetings`             | Get all meetings   |
| `GET`    | `/api/meetings/stats`       | Get statistics     |
| `GET`    | `/api/meetings/:id`         | Get single meeting |
| `POST`   | `/api/meetings/:id/process` | Process with AI    |
| `PATCH`  | `/api/meetings/:id`         | Update meeting     |
| `DELETE` | `/api/meetings/:id`         | Delete meeting     |

---

## 🐛 Troubleshooting

### "Connection refused" error

- Make sure the server is running: `npm run dev`
- Check the port is 4000

### "Database error"

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

### "OpenAI API error" during processing

- Verify `OPENAI_API_KEY` in `.env`
- Check your OpenAI API quota

---

## 📚 More Information

- **Full Testing Guide**: See `TESTING.md`
- **Implementation Details**: See `MEETING_ROUTES_IMPLEMENTATION.md`
- **API Documentation**: See endpoint examples in implementation doc

---

## ✨ Next Steps

1. ✅ Test the meeting routes (you are here!)
2. 🔄 Implement Action Item routes (similar pattern)
3. 🎨 Build frontend UI to consume these APIs
4. 🔐 Add authentication/authorization
5. 📊 Add pagination for large datasets

---

## 💡 Pro Tips

- The integration test script is **safe to run multiple times** - it cleans up after itself
- Use `GET /api/meetings/stats` to see overall meeting statistics
- Processing a meeting may take 10-30 seconds due to AI generation
- All responses follow a consistent JSON format with `success`, `data`, and `message` fields

---

**Ready to test? Run the integration tests now!** 🚀

```bash
npx ts-node src/test-meeting-routes.ts
```
