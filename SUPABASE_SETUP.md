# Supabase Setup Guide for UpGrade

Complete guide to migrate from localStorage to Supabase.

## ✅ Step 1: Create Supabase Account (You're doing this now!)

1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Create new project:
   - Name: **UpGrade**
   - Database Password: **Save this somewhere safe!**
   - Region: Choose closest to you
4. Wait 2-3 minutes for project creation

---

## 📋 Step 2: Get Your API Credentials

Once your project is ready:

1. In Supabase dashboard, click **Settings** (gear icon, bottom left)
2. Click **API** in the left sidebar
3. You'll see two important values:

   **Project URL** (looks like: `https://xxxxx.supabase.co`)
   **anon public** key (long string starting with `eyJ...`)

4. **Copy both values** - you'll need them next!

---

## 🔐 Step 3: Add Credentials to Your Project

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add these lines (replace with your actual values):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Save the file**

**Security Note:** Never commit `.env.local` to git! It should already be in `.gitignore`.

---

## 🗄️ Step 4: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase_schema.sql` in your project
4. **Copy all the SQL** from that file
5. **Paste it into the SQL Editor** in Supabase
6. Click **Run** (bottom right)
7. You should see: "Database schema created successfully! ✅"

**This creates:**
- `profiles` table (user data)
- `watchlist` table (user's watchlist)
- `portfolio` table (user's portfolio)
- All necessary security policies (Row Level Security)

---

## 🔧 Step 5: Configure Authentication

1. In Supabase dashboard, click **Authentication** → **Providers**
2. Make sure **Email** is enabled (should be by default)
3. Scroll down to **Email Auth** settings:
   - ✅ Enable email confirmations: **OFF** (for now, for easier testing)
   - ✅ Enable email signup: **ON**

---

## 🚀 Step 6: Restart Your Dev Server

```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

The app will now use Supabase instead of localStorage!

---

## 🧪 Step 7: Test It Out

1. **Sign up** with a new email (e.g., `test2@test.com`)
2. Check Supabase dashboard:
   - Go to **Authentication** → **Users**
   - You should see your new user!
3. **Add a card to watchlist**
4. Check database:
   - Go to **Table Editor** → `watchlist`
   - You should see your card!
5. **Log out and log back in**
   - Your data persists!

---

## 📊 What Changed?

### Before (localStorage):
- ✅ Fast for testing
- ❌ Only one user
- ❌ Data lost on logout
- ❌ Browser-specific
- ❌ No security

### After (Supabase):
- ✅ Unlimited users
- ✅ Data persists forever
- ✅ Works on any device
- ✅ Secure (Row Level Security)
- ✅ Production-ready
- ✅ Real-time sync
- ✅ Automatic backups

---

## 🎯 Database Structure

### profiles table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User ID (from auth.users) |
| name | TEXT | User's name |
| email | TEXT | User's email |
| signup_date | TIMESTAMPTZ | When they signed up |
| trial_end_date | TIMESTAMPTZ | When trial expires (14 days) |
| is_premium | BOOLEAN | Premium member? |

### watchlist table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Watchlist entry ID |
| user_id | UUID | Who owns this |
| card_id | TEXT | Card identifier |
| card_data | JSONB | Full card details |
| added_date | TIMESTAMPTZ | When added |

### portfolio table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Portfolio entry ID |
| user_id | UUID | Who owns this |
| card_id | TEXT | Card identifier |
| card_data | JSONB | Full card details |
| quantity | INTEGER | How many cards |
| purchase_price | DECIMAL | Price paid per card |
| added_date | TIMESTAMPTZ | When added |

---

## 🔒 Security Features

**Row Level Security (RLS)** is enabled on all tables. This means:
- Users can ONLY see/edit their OWN data
- Even if someone hacks your API key, they can't access other users' data
- Queries are automatically filtered by user ID

---

## 💰 Pricing

**FREE TIER** includes:
- 500 MB database storage
- 50,000 monthly active users
- 2 GB bandwidth
- Unlimited API requests

**This is MORE than enough for your MVP and early growth!**

---

## 🆘 Troubleshooting

### "Supabase credentials not found"
- Check `.env.local` file exists
- Check variable names are exact: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after adding credentials

### "Row Level Security policy violation"
- Make sure you ran the SQL schema
- Check that RLS policies were created
- Try signing up again with a fresh account

### "User already exists"
- Email is already registered
- Use a different email or delete user from Supabase dashboard

### Still using localStorage?
- Check console logs - should see "Using Supabase for auth"
- Make sure credentials are correct
- Restart dev server

---

## 📈 Next Steps After Setup

Once Supabase is working:

1. **Enable email confirmations** (in Auth settings)
2. **Add password reset** functionality
3. **Add Google/GitHub login** (OAuth providers)
4. **Set up Stripe** for premium subscriptions
5. **Deploy to production** (Vercel + Supabase)

---

Need help? Check the Supabase docs: https://supabase.com/docs
