# Trust Lens Backend API

A scalable Node.js + Express + MongoDB backend for the Company/Internship Trust Analyzer platform.

## Features

- Company analysis and trust score calculation
- OCR text extraction from images and PDFs
- File upload handling (images, PDFs)
- External review aggregation (Google, Facebook, Reddit, YouTube)
- RESTful API with comprehensive validation
- Rate limiting and security middleware
- Modular architecture with services and controllers

## Quick Start

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trust-lens
MAX_FILE_SIZE=10485760
```

5. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Analysis

#### POST /api/analyze
Analyze a company for trustworthiness.

**Request Body:**
```json
{
  "companyName": "Example Corp",
  "website": "https://example.com",
  "details": {
    "industry": "Technology",
    "description": "Software development company"
  },
  "extractedText": "Optional OCR text",
  "uploadedFiles": [
    {
      "filename": "file-123.jpg",
      "originalName": "document.jpg",
      "path": "./uploads/file-123.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyName": "Example Corp",
    "trustScore": 75,
    "googleReviews": {
      "averageRating": 4.2,
      "totalReviews": 150,
      "sentiment": "positive",
      "summary": "Generally positive reviews"
    },
    "facebookReviews": {
      "averageRating": 3.8,
      "totalReviews": 45,
      "sentiment": "neutral",
      "summary": "Mixed feedback from employees"
    },
    "redditReviews": {
      "totalMentions": 12,
      "sentiment": "neutral",
      "summary": "Limited discussions on Reddit"
    },
    "youtubeMentions": {
      "totalMentions": 5,
      "sentiment": "positive",
      "summary": "Few positive video mentions"
    },
    "externalLinks": {
      "googleReviewLink": "https://www.google.com/search?q=Example+Corp+reviews",
      "facebookReviewLink": "https://www.facebook.com/search/pages/?q=Example+Corp",
      "redditSearchLink": "https://www.reddit.com/search?q=Example+Corp",
      "youtubeSearchLink": "https://www.youtube.com/results?search_query=Example+Corp"
    }
  }
}
```

#### POST /api/analyze/ocr
Extract text from uploaded files using OCR.

**Request Body:**
```json
{
  "filePath": "./uploads/file-123.jpg"
}
```

#### GET /api/analyze/history/:companyName
Get analysis history for a company.

### Company

#### GET /api/company/:name
Get company information and latest analysis.

#### GET /api/company
List companies with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `search`: Search term
- `minTrustScore`: Minimum trust score filter
- `maxTrustScore`: Maximum trust score filter
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

### File Upload

#### POST /api/upload/single
Upload a single file.

#### POST /api/upload/multiple
Upload multiple files (max 5).

#### POST /api/upload/ocr
Upload file and extract text using OCR.

#### DELETE /api/upload/:filename
Delete an uploaded file.

## Database Models

### Company
- `companyName`: String (required, unique)
- `website`: String
- `trustScore`: Number (0-100, default: 50)
- `scamReportsCount`: Number (default: 0)
- `verifiedRecruiters`: Number (default: 0)
- `domainAge`: Number (default: 0)
- `industry`: String
- `description`: String
- `headquarters`: String
- `employeeCount`: String

### AnalysisResult
- `companyId`: ObjectId (ref: Company)
- `companyName`: String (required)
- `googleReviews`: Object
- `facebookReviews`: Object
- `redditReviews`: Object
- `youtubeMentions`: Object
- `trustScore`: Number (0-100)
- `externalLinks`: Object
- `analysisSource`: String (manual/ocr/api)
- `extractedText`: String
- `uploadedFiles`: Array

### Report
- `companyName`: String (required)
- `reporterEmail`: String
- `reportType`: String (scam/fraud/misleading/spam/other)
- `severity`: String (low/medium/high/critical)
- `description`: String (required)
- `evidence`: String
- `status`: String (pending/under_review/verified/dismissed)

## Trust Score Calculation

The trust score is calculated using:
- Base score: 50
- Scam reports: -5 points each
- Verified recruiters: +2 points each
- Domain age: +2 to +15 points based on age
- Website security: +5 points for HTTPS
- Review scores: Weighted average from external platforms

## External API Integration

Currently uses placeholder functions for:
- Google Places API
- Facebook Graph API
- Reddit API
- YouTube API

Ready for integration with actual APIs in the future.

## Security Features

- Rate limiting (100 requests per 15 minutes)
- File upload validation
- Input sanitization with Joi
- CORS configuration
- Helmet.js security headers
- File size limits (10MB max)

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Development

### Running Tests
```bash
npm test
```

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── middleware/      # Express middleware
├── uploads/         # File upload directory
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## License

MIT
