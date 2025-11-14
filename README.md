# UpGrade - Trading Card Grading Value Comparison Website

A clean, modern desktop website for comparing raw trading card values with PSA 10 graded values.

## Features

- **Beautiful Landing Page** with hero section and call-to-action
- **Card Showcase** displaying a clean trading card with pricing data
- **Search Functionality** to look up any sports card
- **Real-time Comparison** between raw and PSA 10 graded values
- **ROI Analysis** showing potential value increase
- **Desktop-First Design** optimized for web browsers

## Tech Stack

- **Next.js 16** - React framework for production
- **React 19** - Latest React features
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

## Quick Start

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
UpGrade/
├── app/
│   ├── page.js           # Landing page
│   ├── card/
│   │   └── page.js       # Card search page
│   ├── layout.js         # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── CardShowcase.js   # Card display component
├── lib/
│   └── CardService.js    # Data fetching service
└── public/               # Static assets
```

## Current Features

### Landing Page
- Hero section with compelling value proposition
- Interactive card showcase with Tom Brady example
- Feature highlights
- Call-to-action button to demo
- Professional footer

### Card Search Page
- Search form with player name, year, brand, card number
- Real-time results display
- Raw card value vs PSA 10 value comparison
- Percentage increase calculation
- ROI analysis

### Mock Data

Currently using mock data for testing with pre-loaded cards:
- Tom Brady (2000 Topps Chrome)
- LeBron James (2003 Topps Chrome)
- Michael Jordan (1986 Fleer)
- Patrick Mahomes (2017 Panini Prizm)

For unknown players, it generates estimated values.

## Deploying to Production

### Option 1: Vercel (Recommended - FREE)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy (automatic)

**Cost: $0/month** for hobby projects

### Option 2: Netlify (Also FREE)

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import and deploy

**Cost: $0/month** for personal projects

### Option 3: AWS Amplify

1. Connect GitHub repository
2. Configure build settings
3. Deploy

**Cost: $0-5/month** depending on traffic

## Adding Real Data Sources

### eBay API (Recommended - FREE)

See `DATA_INTEGRATION.md` for detailed instructions on integrating:
- eBay API (free tier: 5,000 calls/day)
- Firebase for custom database
- CardLadder API (paid)
- Other data sources

## Customization

### Change Colors

Edit `app/globals.css`:
```css
:root {
  --primary-blue: #2563eb;
  --secondary-green: #16a34a;
}
```

Or edit Tailwind classes in components:
- `bg-blue-600` → your color
- `text-blue-600` → your color

### Add Your Logo

1. Create logo image
2. Place in `public/logo.png`
3. Update header in `app/page.js` and `app/card/page.js`

### Customize Card Showcase

Edit `components/CardShowcase.js`:
- Change player/card
- Modify card design
- Update colors and styling

## Next Steps

### Immediate Improvements
- [ ] Add user authentication (Auth0, Clerk, or NextAuth)
- [ ] Create user dashboard
- [ ] Add favorites/save cards feature
- [ ] Integrate real pricing data (eBay API)
- [ ] Add email newsletter signup
- [ ] Analytics (Google Analytics, Plausible)

### Future Features
- [ ] Price history charts
- [ ] Multiple grading companies (BGS, SGC)
- [ ] Grading cost calculator
- [ ] Collection management
- [ ] Price alerts
- [ ] Mobile app version (React Native)
- [ ] Barcode scanning
- [ ] Image recognition for card lookup

## Cost Breakdown

### Development: $0
- Next.js: Free
- Tailwind CSS: Free
- Development: Free

### Hosting: $0-5/month
- Vercel/Netlify free tier: $0
- Custom domain: $12/year (optional)

### Total to Launch: $0
### With domain: $12/year

## Performance

Next.js provides:
- ⚡ Instant page loads
- 🔍 SEO optimized
- 📱 Responsive design
- 🚀 Production-ready out of the box

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## License

ISC - Free to use for your business

---

Built with Next.js + Tailwind CSS for a fast, modern web experience
