-- Run after the first Google login creates the user record.
UPDATE "User" SET role = 'ADMIN' WHERE email = 'YOUR_ADMIN_EMAIL@example.com';
