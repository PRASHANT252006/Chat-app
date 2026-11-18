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