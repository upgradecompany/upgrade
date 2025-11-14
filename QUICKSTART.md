# Quick Start - UpGrade Website

## Start the Website (30 seconds)

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

That's it! Your website is now running.

## What You'll See

### Landing Page (http://localhost:3000)
- Beautiful hero section
- Interactive card showcase with Tom Brady
- "Get Started Free" button
- Feature highlights
- Professional footer

### Card Search Page (http://localhost:3000/card)
- Search form for any player
- Real-time results
- Raw vs PSA 10 price comparison
- ROI analysis

## Try It Out

### Test with Pre-loaded Data
Search for any of these players:
- **Tom Brady** - Shows $2,500 → $25,000 (PSA 10)
- **LeBron James** - Shows $5,000 → $75,000
- **Michael Jordan** - Shows $3,000 → $150,000
- **Patrick Mahomes** - Shows $1,500 → $15,000

### Test with Any Other Player
Search for any name - it will generate estimated values to show how the system works.

## Making Changes

The website auto-reloads when you edit files. Try changing:

### Update Colors
Edit `app/globals.css`:
```css
--primary-blue: #2563eb;  /* Change to your color */
```

### Change the Showcase Card
Edit `components/CardShowcase.js`:
```javascript
const sampleCard = {
  name: 'Your Player',
  year: '2020',
  brand: 'Panini',
  cardNumber: '1',
  rawPrice: 100.00,
  psa10Price: 1000.00,
}
```

### Customize Landing Page Text
Edit `app/page.js` - change the hero text, features, etc.

## Deploy to Production (5 minutes)

### Option 1: Vercel (Easiest)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Follow prompts (just press Enter for defaults)
```

Your site will be live at: `https://upgrade-cards.vercel.app` (or your custom domain)

**Cost: FREE** (no credit card required)

### Option 2: Netlify
1. Push code to GitHub
2. Go to netlify.com
3. Click "Import from Git"
4. Select your repo
5. Deploy

**Cost: FREE**

## Add Real Data

Currently using mock data. To add real card prices:

### Quick Option: eBay API (FREE)
See `DATA_INTEGRATION.md` for step-by-step guide.
- Takes 15 minutes
- Free up to 5,000 searches/day
- Real market prices

## What's Next?

1. **Customize the design** - Change colors, text, images
2. **Add your branding** - Logo, custom domain
3. **Deploy for free** - Vercel or Netlify
4. **Get feedback** - Share with friends/potential users
5. **Add real data** - Integrate eBay API or other sources
6. **Add features** - User accounts, saved cards, price alerts

## Project Structure

```
app/page.js           ← Landing page
app/card/page.js      ← Card search page
components/           ← Reusable components
lib/CardService.js    ← Data fetching (add real APIs here)
```

## Need Help?

- **Server won't start**: Run `npm install` first
- **Port 3000 in use**: The site will auto-open on port 3001
- **Styling broken**: Make sure Tailwind installed: `npm install`

## Cost Summary

- **Development**: $0
- **Hosting (Vercel/Netlify)**: $0
- **Custom domain** (optional): $12/year
- **Total to launch**: $0

---

You now have a professional trading card comparison website! 🎉
