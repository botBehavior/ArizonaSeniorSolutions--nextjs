# Google Reviews Integration Setup

The website now fetches real Google Reviews while maintaining the exact same visual styling as your current testimonials.

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Google Places API Configuration for Reviews
# Get your API key from: https://console.cloud.google.com/apis/credentials
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Your Google My Business Place ID
# Find your Place ID at: https://developers.google.com/maps/documentation/places/web-service/place-id
GOOGLE_PLACE_ID=your_google_place_id_here
```

## How to Get Your Place ID

1. **Visit the Place ID Finder**: Go to [https://developers.google.com/maps/documentation/places/web-service/place-id](https://developers.google.com/maps/documentation/places/web-service/place-id)

2. **Search for Your Business**:
   - Enter your business name and address
   - Click the search button

3. **Copy the Place ID**:
   - Look for your business in the results
   - Copy the Place ID (format: `ChIJ...`)

Example Place ID: `ChIJ1234567890abcdef...`

## How to Get Your Google Places API Key

1. **Go to Google Cloud Console**: Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Create or Select a Project**:
   - Create a new project or select an existing one

3. **Enable the Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API" and enable it

4. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Restrict the API Key** (Recommended):
   - Click on your API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain: `yourdomain.com/*`
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API" from the list

## Features

- **Seamless Integration**: Real Google Reviews look identical to your current testimonials
- **Fallback System**: Shows your featured testimonials if Google API fails
- **Automatic Updates**: Reviews refresh every hour
- **5-Star Only**: Only displays 5-star reviews for better UX
- **Smart Categorization**: Automatically determines reviewer relationship (Family Member, Healthcare Professional, etc.)
- **Location Detection**: Extracts location from review content

## Testing

Without API keys, the system will automatically show your fallback testimonials. Once you add the environment variables, real Google Reviews will appear.

## Troubleshooting

- **No Reviews Showing**: Check your Place ID is correct
- **API Errors**: Verify your API key has Places API enabled and proper restrictions
- **Rate Limits**: Google Places API has usage limits - monitor your usage in Google Cloud Console

## Security Note

Never commit your `.env.local` file to version control. The `.env.example` file shows the required structure without sensitive data.
