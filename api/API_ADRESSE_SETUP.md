# API Adresse Integration (French Government)

This application integrates with the official French government address API (`api-adresse.data.gouv.fr`) to provide address search and validation functionality.

## About API Adresse

- **Completely FREE** - No API key required
- **Official French Government API** - Reliable and maintained by the French government
- **High accuracy** - Based on official French address databases
- **No rate limits** - Unlimited usage
- **Open source** - Transparent and trustworthy

## API Endpoints

The following endpoints are available for API Adresse integration:

#### Search Addresses
```
GET /addresses/search/api-adresse?query=75001 Paris&limit=10
```

#### Get Address Details
```
GET /addresses/api-adresse/{id}
```

#### Create Address from API Adresse Data
```
POST /addresses/api-adresse/{id}
```

#### Search by Coordinates (Reverse Geocoding)
```
GET /addresses/search/coordinates?lat=48.8566&lon=2.3522&limit=10
```

## Usage Examples

#### Search for addresses:
```bash
curl "http://localhost:3001/addresses/search/api-adresse?query=75001%20Paris&limit=5"
```

#### Get specific address details:
```bash
curl "http://localhost:3001/addresses/api-adresse/address_id_here"
```

#### Create address in database from API Adresse data:
```bash
curl -X POST "http://localhost:3001/addresses/api-adresse/address_id_here"
```

#### Search by coordinates:
```bash
curl "http://localhost:3001/addresses/search/coordinates?lat=48.8566&lon=2.3522&limit=5"
```

## Response Format

The API Adresse returns addresses in GeoJSON format:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [2.3522, 48.8566] // [longitude, latitude]
  },
  "properties": {
    "label": "8 Boulevard du Port 80000 Amiens",
    "score": 0.9999999999999999,
    "housenumber": "8",
    "id": "80021_0008_00000",
    "name": "Boulevard du Port",
    "postcode": "80000",
    "citycode": "80021",
    "x": 2.3522,
    "y": 48.8566,
    "city": "Amiens",
    "district": "80021",
    "context": "80, Somme, Hauts-de-France",
    "type": "housenumber",
    "importance": 0.9999999999999999,
    "street": "Boulevard du Port"
  }
}
```

## Features

### 1. Address Search
- Search by postal code, city, street name
- Autocomplete suggestions
- Fuzzy matching for typos
- Score-based relevance ranking

### 2. Reverse Geocoding
- Find addresses by coordinates
- Useful for map-based applications
- Returns nearest addresses

### 3. Data Quality
- Official French government data
- Regular updates
- High accuracy and completeness
- Includes INSEE codes and coordinates

## Error Handling

- Network errors are handled gracefully with 500 status codes
- Invalid queries return appropriate error messages
- No results return empty arrays (not errors)

## Rate Limiting

No rate limits are imposed by the API Adresse service. You can make unlimited requests.

## Testing

You can test the integration by:

1. Starting the application
2. Using the search endpoint with a French address query
3. Checking the response format and data accuracy
4. Testing reverse geocoding with coordinates

## Example Queries

- `75001 Paris` - Search in Paris 1st arrondissement
- `Champs-Élysées` - Search for Champs-Élysées street
- `Marseille 13001` - Search in Marseille with postal code
- `Lyon Part-Dieu` - Search in Lyon Part-Dieu area

## Frontend Integration

The frontend includes a ready-to-use `AddressSearch` component that:
- Provides real-time search with debouncing
- Shows address suggestions in a dropdown
- Displays coordinates and INSEE codes
- Handles loading states and errors
- Integrates seamlessly with your forms 