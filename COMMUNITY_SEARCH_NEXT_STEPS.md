# Community Search - Next Steps

## Current Implementation
- ✅ **Enhanced Fallback Data**: Currently using realistic Charlotte, NC hospital and specialist data
- ✅ **Support Organizations**: Database-driven IBD support organizations working
- ✅ **Location Services**: iOS location permissions and coordinates working
- ✅ **UI Integration**: Community tab displaying all data correctly

## Next Steps: Implement Google Places API

### Why Google Places API?
- **Real-time data**: Actual hospitals and specialists in user's area
- **Accurate information**: Real addresses, phone numbers, ratings, websites
- **Dynamic search**: Works anywhere user travels
- **Cost-effective**: ~$0.017 per 1000 requests (very cheap)

### Setup Instructions

#### 1. Get Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated key

#### 2. Set Up Billing (Required)
- Google will prompt for billing setup
- Credit card required
- $200 free credit provided
- Very low cost (~$0.017 per 1000 requests)

#### 3. Add API Key to Environment
Update both environment files:

**Local Development** (`config.env`):
```
GOOGLE_PLACES_API_KEY=AIzaSyC...your_actual_key_here
```

**Railway Production** (`railway.env`):
```
GOOGLE_PLACES_API_KEY=AIzaSyC...your_actual_key_here
```

#### 4. Deploy Changes
```bash
git add .
git commit -m "Add Google Places API key for real community search"
git push
```

### What You'll Get
- **Real Hospitals**: Actual medical centers in user's area
- **Real Specialists**: Gastroenterologists and IBD specialists
- **Accurate Data**: Real addresses, phone numbers, ratings
- **Dynamic Results**: Changes based on user location

### Current Fallback Data
Until Google Places API is implemented, users see:
- **Atrium Health Carolinas Medical Center** (Charlotte, NC)
- **Novant Health Presbyterian Medical Center** (Charlotte, NC)
- **Dr. Sarah Johnson** (Gastroenterologist)
- **Dr. Michael Chen** (Gastroenterologist)

### Code Structure
- `services/webSearchService.js`: Main search service
- `routes/community.js`: API endpoints
- `SearchView.swift`: iOS frontend integration

### Testing
After implementation, test with:
```bash
curl "https://your-railway-url/api/community/hospitals?latitude=35.2271&longitude=-80.8431&radius=80.5"
```

### Priority: Medium
- ✅ Current implementation works well
- 🔄 Google Places API will provide real-time data
- 📍 Recommended for production deployment 