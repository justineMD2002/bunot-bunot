# Bunot-Bunot - Zaragoza Family Christmas Party 2025

A mobile-friendly web app for Manito-Manita gift exchange for the Zaragoza Family Christmas Party 2025.

## Features

- **No Login Required**: Straightforward app with no authentication
- **Family Groups**: Members within the same family cannot draw each other
- **No Duplicates**: Ensures no one is drawn twice
- **Wishlist**: Members can add their Christmas wishlist
- **Local Storage**: All data is stored in the browser (no database needed!)
- **Admin Panel**: View all draws and reset the game
- **Mobile-Friendly**: Responsive design optimized for mobile devices

## How to Use

1. Select your name from the list
2. (Optional) Add your wishlist
3. Click "Draw" to get your Manito
4. Keep it secret!

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment Options

### Vercel (Recommended - Easiest & Free)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "New Project" and import your repository
5. Click "Deploy" - that's it!
6. Your app will be live in ~1 minute with a free `.vercel.app` domain

### Netlify (Also Easy & Free)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder after running `npm run build`
3. Done! Your app is live with a free `.netlify.app` domain

### GitHub Pages (Free)
1. Run `npm run build`
2. Push the `dist` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings

## Admin Panel

Click the gear icon (⚙️) in the bottom-right corner to:
- View all draws
- See wishlists
- Reset all draws (use carefully!)

## Database?

No database needed! The app uses browser localStorage to save:
- Who has drawn whom
- Wishlists
- Draw timestamps

This keeps the app simple and fast. However, note that:
- Data is per-browser (different device = different data)
- Clearing browser data will reset everything
- The admin should use one device consistently

## Family Members

### Daugdaug Family
Justine, Jean, John Andrew, Edna, Baby Zia, Baby Aki, Krystel, Mommy Xty, Francis

### Auxtero Family
Shay, Levie Rose, Lilibeth, Junray, Art, Nathan

### Isales Family
Bruce, Vivian, Kuya Shawn

### Macasero Family
Charie, Kevin, Andrei

---

Merry Christmas, Zaragoza Family! 🎄🎁
