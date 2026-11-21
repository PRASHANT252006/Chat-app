Registration
1. Receive name, email, password and avatar.
2. Upload avatar to Cloudinary.
3. Hash password using bcrypt.
4. Save user in MongoDB.


Login
1. Find user by email.
2. Compare password using bcrypt.
3. Generate access token (15 minutes).
4. Generate refresh token (7 days).
5. Hash refresh token and save it in Session collection.
6. Send original tokens through HTTP-only cookies.

Protected routes
1. Auth middleware extracts access token.
2. JWT verifies the token.
3. Fetch user from MongoDB.
4. Attach user to req.user.
5. Call next().



phase 1:login and registartion,and auth
Phase 2: users and conversations (MongoDB search with ?search=)
Phase 3: messages over REST
Phase 4: real-time with Socket.IO
Phase 5: online status, typing, unread count
Phase 6: Redis (online status store, Socket.IO adapter, rate limiting, caching)
Phase 7: Elasticsearch (message search, then user autocomplete)

Phase 3 is messages over REST: sending a message and loading the messages of a chat