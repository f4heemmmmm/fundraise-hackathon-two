# Testing Guide for Meeting Routes

This guide explains how to test the Meeting API endpoints.

## 📋 Available Tests

### 1. **Integration Test Script** (`test-meeting-routes.ts`)

A comprehensive end-to-end test that makes real API calls to test all meeting endpoints.

### 2. **Unit Tests** (`__tests__/meetingController.test.ts`)

Jest unit tests that mock the service layer to test controller logic in isolation.

---

## 🚀 Running Tests

### Prerequisites

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

   The server should be running on `http://localhost:4000`

2. **Ensure MongoDB is running** and connected

3. **Set environment variables** in `backend/.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL_SUMMARY=gpt-4o-mini
   ```

---

## 🧪 Integration Tests (End-to-End)

### Run the integration test script:

```bash
cd backend
npx ts-node src/test-meeting-routes.ts
```

### What it tests:

1. ✅ **Create Meeting** - `POST /api/meetings`
2. ✅ **Get All Meetings** - `GET /api/meetings`
3. ✅ **Get Meeting by ID** - `GET /api/meetings/:id`
4. ✅ **Get Meeting Statistics** - `GET /api/meetings/stats`
5. ✅ **Update Meeting** - `PATCH /api/meetings/:id`
6. ✅ **Process Meeting** - `POST /api/meetings/:id/process` (AI summary & action items)
7. ✅ **Get Filtered Meetings** - `GET /api/meetings?status=completed`
8. ✅ **Error Handling** - Invalid IDs, missing fields, invalid filters
9. ✅ **Delete Meeting** - `DELETE /api/meetings/:id`

### Expected Output:

```
🚀 Starting Meeting Routes Tests
📍 API Base URL: http://localhost:4000

🔌 Connecting to database...
✅ Database connected

========================================
TEST 1: Create Meeting
========================================
📡 POST /api/meetings
📊 Status: 201
✅ Meeting created successfully
   Meeting ID: 67a1b2c3d4e5f6g7h8i9j0k1

========================================
TEST 2: Get All Meetings
========================================
📡 GET /api/meetings
📊 Status: 200
✅ Retrieved 1 meetings

... (more tests)

========================================
✅ ALL TESTS COMPLETED SUCCESSFULLY
========================================
```

---

## 🔬 Unit Tests (Jest)

### Run all unit tests:

```bash
cd backend
npm test
```

### Run specific test file:

```bash
npm test -- meetingController.test.ts
```

### Run tests with coverage:

```bash
npm test -- --coverage
```

### What it tests:

- ✅ Controller input validation
- ✅ Service method calls with correct parameters
- ✅ Response formatting (success/error)
- ✅ HTTP status codes
- ✅ Error handling for various scenarios
- ✅ Edge cases (missing fields, invalid data, etc.)

### Expected Output:

```
PASS  src/__tests__/meetingController.test.ts
  Meeting Controller
    getMeetings
      ✓ should return all meetings successfully (5 ms)
      ✓ should filter meetings by status (3 ms)
      ✓ should return 400 for invalid status (2 ms)
      ✓ should handle errors (2 ms)
    getMeeting
      ✓ should return a single meeting (2 ms)
      ✓ should return 404 when meeting not found (2 ms)
    createMeeting
      ✓ should create a meeting successfully (3 ms)
      ✓ should return 400 when required fields are missing (2 ms)
      ✓ should return 400 when duration is invalid (2 ms)
    processMeeting
      ✓ should process a meeting successfully (2 ms)
      ✓ should return 400 when no transcript available (2 ms)
    updateMeeting
      ✓ should update a meeting successfully (2 ms)
      ✓ should return 400 when no updates provided (2 ms)
    deleteMeeting
      ✓ should delete a meeting successfully (2 ms)
    getMeetingStats
      ✓ should return meeting statistics (2 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

---

## 🔍 Manual Testing with cURL

### Create a meeting:

```bash
curl -X POST http://localhost:4000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Standup",
    "date": "2025-01-20T10:00:00Z",
    "duration": 30,
    "transcriptText": "Meeting transcript here..."
  }'
```

### Get all meetings:

```bash
curl http://localhost:4000/api/meetings
```

### Get meeting by ID:

```bash
curl http://localhost:4000/api/meetings/YOUR_MEETING_ID
```

### Process meeting (AI):

```bash
curl -X POST http://localhost:4000/api/meetings/YOUR_MEETING_ID/process
```

### Update meeting:

```bash
curl -X PATCH http://localhost:4000/api/meetings/YOUR_MEETING_ID \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "duration": 45}'
```

### Delete meeting:

```bash
curl -X DELETE http://localhost:4000/api/meetings/YOUR_MEETING_ID
```

### Get statistics:

```bash
curl http://localhost:4000/api/meetings/stats
```

### Filter by status:

```bash
curl http://localhost:4000/api/meetings?status=completed
```

---

## 📊 API Endpoints Summary

| Method   | Endpoint                    | Description                              |
| -------- | --------------------------- | ---------------------------------------- |
| `GET`    | `/api/meetings`             | Get all meetings (with optional filters) |
| `GET`    | `/api/meetings/stats`       | Get meeting statistics                   |
| `GET`    | `/api/meetings/:id`         | Get single meeting by ID                 |
| `POST`   | `/api/meetings`             | Create new meeting                       |
| `POST`   | `/api/meetings/:id/process` | Process meeting with AI                  |
| `PATCH`  | `/api/meetings/:id`         | Update meeting                           |
| `DELETE` | `/api/meetings/:id`         | Delete meeting                           |

---

## 🐛 Troubleshooting

### Test fails with "Connection refused"

- Make sure the backend server is running on port 5001
- Check `API_BASE_URL` in the test script

### Test fails with "Database error"

- Ensure MongoDB is running and accessible
- Check `MONGODB_URI` in `.env`

### Process meeting test fails

- Verify `OPENAI_API_KEY` is set in `.env`
- Check OpenAI API quota/limits
- Ensure the meeting has a transcript

### Unit tests fail with module errors

- Run `npm install` to ensure all dependencies are installed
- Check that `ts-jest` is installed

---

## 📝 Next Steps

After testing the meeting routes, you can:

1. **Test Action Item routes** (once implemented)
2. **Add more test cases** for edge cases
3. **Set up CI/CD** to run tests automatically
4. **Add integration tests** for the full workflow (notetaker → transcript → meeting → action items)

---

## 💡 Tips

- Run integration tests **after** making changes to ensure everything works end-to-end
- Run unit tests **during development** for quick feedback
- Use `--watch` mode for unit tests during development: `npm test -- --watch`
- Check test coverage to identify untested code: `npm test -- --coverage`
