## Backend Endpoints

### 1. Get Event Recommendations (User-Specific)

- **Endpoint:** `GET /api/users/{userUuid}/events/recommendations`
- **Description:** Returns event recommendations for the user.
- **Path Parameter:** `userUuid`
- **Response:**
```json
[
  {
    "id": "event123",
    "title": "Hackathon 2025",
    "date": "2025-05-10",
    "location": "University of Denver",
    "image": "https://example.com/images/hackathon.png",
    "description": "Join us for a 48-hour coding challenge."
  }
]
```

### 2. Get All Events

- **Endpoint:** `GET /api/events`
- **Description:** Returns a general list of events.
- **Response:**
```json
[
  {
    "id": "event124",
    "title": "Startup Networking Night",
    "date": "2025-05-12",
    "location": "MSU Denver",
    "image": "https://example.com/images/networking.png",
    "description": "Meet startup founders and investors."
  }
]
```

### 3. Get Forums a User is In

- **Endpoint:** `GET /api/users/{userUuid}/forums`
- **Description:** Returns forums the user is a member of.
- **Path Parameter:** `userUuid`
- **Response:**
```json
[
  {
    "id": "forum001",
    "name": "Computer Science Club",
    "description": "Talk about coding, AI, algorithms, and more.",
    "image": "https://example.com/images/csclub.png",
    "memberCount": 120
  }
]
```

### 4. Get Posts in a Forum

- **Endpoint:** `GET /api/forums/{forumId}/posts`
- **Description:** Returns all posts in a forum.
- **Path Parameter:** `forumId`
- **Response:**
```json
[
  {
    "id": "post001",
    "author": "Jane Doe",
    "content": "Looking for study partners for CS 101.",
    "createdAt": "2025-04-25T14:30:00Z"
  }
]
```

---

**Summary:**

| Endpoint | UUID Needed |
|:---------|:------------|
| `/api/users/{userUuid}/events/recommendations` | Yes |
| `/api/events` | No |
| `/api/users/{userUuid}/forums` | Yes |
| `/api/forums/{forumId}/posts` | No (unless user-specific customization needed) |
