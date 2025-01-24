# UK Politics Mobile App - Project Summary

## Overview
A mobile-first web application using Next.js 14 designed to make UK parliamentary data more accessible and engaging. Currently being developed as a prototype for funding applications to organizations interested in advancing transparency in UK democracy.

## Tech Stack
- Frontend: Next.js 14 with TypeScript and React 18
- Styling: Tailwind CSS + shadcn/ui components
- Data Visualization: Recharts
- API Integration: Native fetch with custom rate limiting and caching
- Storage: Browser localStorage with chunked caching (temporary solution)

## Integrated APIs
- Parliament Bills API
- Parliament Members API
- Register of Interests API
- Commons Votes API

## Completed Components

### Core Infrastructure
- Base layout system with mobile-optimized components
- API integration layer with rate limiting and caching
- Type-safe API clients for Parliamentary data
- Error handling and loading state management
- Chunked storage management for large datasets

### Bills Feature
- Bills listing page with:
  - Title and current stage display
  - House location indicator
  - Timestamp updates
  - Loading skeletons
  - Error handling
- Bill detail page with:
  - Comprehensive bill information
  - Stage progress tracking
  - Sponsor details
  - Related publications
  - Mobile-optimized layout

### Members Directory
- Basic member search functionality
- Member profiles with basic info
- Party affiliation display
- Constituency details

### Financial Interests
- Top 10 leaderboard showing highest value declared interests
- Direct links to official declarations on parliament.uk
- Monetary value extraction from interest descriptions
- Comprehensive member interest processing
- Batch processing with rate limiting

### Data Management
- Client-side caching with chunk storage
- Rate limit handling for API calls with exponential backoff
- Error recovery mechanisms
- Session-based filtering
- Progress tracking for long-running operations

## Infrastructure Limitations & AWS Migration Need
Current client-side implementation faces several challenges:
1. CORS restrictions when accessing Parliament APIs directly
2. Browser storage limitations affecting caching
3. Rate limiting constraints
4. Client-side processing limitations

Proposed AWS migration would provide:
- Server-side API proxying through API Gateway
- Proper data storage in DynamoDB/Redis
- More efficient rate limiting and caching
- Better parallel processing capabilities
- Improved error handling and recovery

## Next Development Priorities
1. Migrate to AWS infrastructure:
   - Set up API Gateway and Lambda functions
   - Implement proper database storage
   - Move API calls server-side
2. Enhance members directory with:
   - Advanced search and filtering
   - Integration with financial interests
3. Add economic data dashboard
4. Implement council-level data integration
5. Develop donation network visualization

## Goals for Prototype
1. Demonstrate clear accessibility of parliamentary data
2. Show potential for increasing transparency
3. Provide example user journeys for grant applications
4. Highlight technical feasibility and scalability

## API Access Strategy
- Current: Client-side calls with caching and rate limiting
- Planned: Server-side proxying through AWS infrastructure
- Multi-layered caching strategy
- Rate limiting with exponential backoff
- Optimized data fetching patterns

## Technical Considerations
- Mobile-first responsive design
- Type-safe API interactions
- Component-based architecture
- Performance optimization using React hooks
- Accessibility compliance
- Scalability through cloud infrastructure