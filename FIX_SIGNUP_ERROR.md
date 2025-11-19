# Fix Signup Error - Email Confirmations

The error you're seeing is because **email confirmations are enabled** in your Supabase project.

## Quick Fix (Recommended for Development)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your **UpGrade** project
3. Click **Authentication** in the left sidebar
4. Click **Providers**
5. Find **Email** provider and click it
6. Scroll down to **"Confirm email"** setting
7. **Turn it OFF** (toggle to disabled)
8. Click **Save**

## Why This Fixes It

When email confirmations are ON:
- New users must click a link in their email before their account activates
- The database trigger can't create their profile until they confirm
- You get the error you're seeing

When email confirmations are OFF:
- Users are instantly activated on signup
- No email confirmation needed (perfect for testing)
- Profile is created immediately

## For Production Later

Eventually you'll want to turn email confirmations back ON for security. When you do, you'll need to:

1. Create a confirmation page that users land on after clicking the email link
2. Handle the confirmation redirect properly
3. Create the profile AFTER confirmation

But for now, turning it off makes development much easier!

## After Turning It Off

1. Try signing up again with a **new email address**
2. The signup should work instantly this time
3. Check your Supabase dashboard → Authentication → Users to see your account

---

**Note**: If you've already tried signing up, those email addresses are now registered but unconfirmed. Either:
- Delete them from Supabase dashboard (Authentication → Users → click user → Delete)
- Or use a different email for testing
