# Vote Vitals

A web application providing transparent access to UK parliamentary data.

## Project Overview

Vote Vitals is a Next.js application that interfaces with the UK Parliament's APIs to provide accessible and transparent parliamentary data. The project uses AWS for backend services and Vercel for frontend deployment.

### Current Status (January 24, 2025)

- ✅ Infrastructure setup complete (AWS)
- ✅ Frontend deployment configured (Vercel)
- ✅ Basic members page implemented
- 🚧 Pagination needs improvement (currently showing 33 pages, may be incomplete)

### Architecture

#### Frontend (Vercel)
- **Framework**: Next.js 14.1.0
- **URL**: https://votevitals.com
- **Repository**: https://github.com/mopd1/vote-vitals
- **Key Dependencies**:
  - React 18.2.0
  - TypeScript
  - Tailwind CSS

#### Backend (AWS)
- **API Gateway Endpoint**: https://lxniao0js0.execute-api.eu-west-2.amazonaws.com/dev
- **Infrastructure**: AWS CDK
- **Services**:
  - Lambda Functions (Node.js 20.x)
  - API Gateway
  - DynamoDB (configured but not yet used)
  - CloudWatch for logging

### Project Structure

```
vote-vitals/
├── src/
│   ├── app/
│   │   ├── members/           # Members page
│   │   │   └── page.tsx      
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css
│   ├── components/
│   │   └── Header.tsx        # Navigation header
│   └── lib/
│       ├── types/
│       │   └── member.ts     # TypeScript interfaces
│       └── api.ts            # API client functions
├── backend/
│   ├── src/
│   │   └── handlers/
│   │       └── api.ts        # Lambda handler
│   ├── package.json
│   └── tsconfig.json
├── infrastructure/           # AWS CDK code
│   ├── lib/
│   │   └── uk-politics-stack.ts
│   ├── bin/
│   └── cdk.json
└── docs/                    # API Documentation
    ├── bills-api-documentation.json
    ├── commons-votes-api-documentation.json
    ├── interests-api-documentation.json
    └── members-api-documentation.json
```

### API Integration

We integrate with several Parliament APIs:
1. Members API: `/api/Members/Search`
   - Currently used for members listing
   - Supports pagination and filtering
2. Register of Interests API (planned)
3. Bills API (planned)
4. Commons Votes API (planned)

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://lxniao0js0.execute-api.eu-west-2.amazonaws.com/dev
PARLIAMENT_API_URL=https://members-api.parliament.uk/api/v1
```

These are configured in:
- Vercel project settings for frontend
- AWS Lambda environment variables for backend

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/mopd1/vote-vitals.git
cd vote-vitals
```

2. Install dependencies:
```bash
npm install                # Frontend dependencies
cd backend && npm install # Backend dependencies
cd ../infrastructure && npm install # Infrastructure dependencies
```

3. Run locally:
```bash
npm run dev # Frontend
```

### Deployment

#### Frontend (Vercel)
- Auto-deploys on push to main branch
- Project: "votevitals.com" in Vercel dashboard
- Custom domain: votevitals.com

#### Backend (AWS)
```bash
cd backend
npm run build
cd ../infrastructure
npm run cdk deploy
```

### Current Features

1. Members Page (`/members`)
   - Lists all current MPs
   - Shows member details:
     - Name
     - Party
     - Constituency
     - Membership start date
   - Pagination (20 members per page)
   - House filter (Commons/Lords)

### Known Issues

1. Pagination
   - Currently only showing 33 pages
   - May need to update totalResults calculation

2. Caching
   - Basic caching implemented but needs enhancement
   - Plan to use DynamoDB for persistent caching

### Future Plans

1. Enhance Members Page
   - Add party filtering
   - Improve pagination
   - Add member details page

2. Bills Integration
   - Add bills listing
   - Bill detail pages
   - Voting history

3. Financial Interests
   - Member financial interests
   - Aggregate statistics

### Technical Decisions

1. API Gateway + Lambda
   - Chosen for scalability and cost-effectiveness
   - Allows rate limiting and caching

2. Vercel Deployment
   - Automatic deployments
   - Edge network for fast delivery
   - Integrated with Next.js

3. TypeScript
   - Type safety for API responses
   - Better development experience

### Parliament API Notes

- Rate limiting: Yes (needs monitoring)
- Authentication: Not required for basic endpoints
- CORS: Handled by our API Gateway
- Data freshness: Real-time from Parliament APIs

### Contact & Support

For questions or issues:
- GitHub Issues: [Repository Issues](https://github.com/mopd1/vote-vitals/issues)

### License

Copyright © 2024 Vote Vitals. All rights reserved.