# Executive Chair Voting System

This document explains the voting mechanism for the UC Merced SASE Executive Chair candidates.

## Overview

The voting system allows authenticated users to vote for their preferred Executive Chair candidates. The system ensures one vote per user account and provides an admin dashboard to view vote results.

## Features

- **User Authentication**: Only authenticated users can vote
- **One Vote Per User**: Users can only vote once across all candidates
- **Real-time Status**: Users can see their vote status (if they've voted and for whom)
- **Admin Dashboard**: Admins can view voting results at `/admin/vote-results`

## Technical Implementation

### Database Models

Two main models are used for the voting system:

1. **ExecChairVote**
   - `userEmail`: Email of the user who cast the vote
   - `candidateId`: ID of the candidate who received the vote
   - `timestamp`: When the vote was cast

2. **VoteSummary** (for admin dashboard)
   - `candidateId`: ID of the candidate
   - `voteCount`: Number of votes received
   - `candidateName`: Name of the candidate
   - `lastUpdated`: When the vote count was last updated

### API Endpoints

- `/api/cast-vote`: POST endpoint to cast a vote
- `/api/check-vote-status`: GET endpoint to check a user's vote status

### UI Components

- Toggle button on the Executive Chairs page to show/hide voting interface
- Vote button on each candidate's profile card
- Status indicators showing if the user has already voted
- Admin dashboard showing vote counts for each candidate

## Setup Instructions

1. **Initialize the Database**:
   ```
   npx ampx sandbox --profile amplify-policy-863518450047
   ```

2. **Start the Development Server**:
   ```
   npm run dev
   ```

3. **Access the Voting Interface**:
   - Visit the Executive Chairs page
   - Click the "Show Voting Interface" button
   - Log in to vote (button will be disabled for unauthenticated users)

4. **View Vote Results** (Admin only):
   - Log in as an admin user
   - Navigate to `/admin/vote-results`

## Testing

A test script is provided to verify the basic voting functionality:

```
node scripts/test-voting.js
```

This script tests the API endpoints without authentication to verify that proper authentication checks are in place.

For complete testing:
1. Sign in with a valid account
2. Visit the Executive Chairs page
3. Toggle the voting interface
4. Attempt to vote for a candidate
5. Check that you cannot vote for multiple candidates
6. As an admin, visit the vote results page

## Troubleshooting

- **Cannot see vote button**: Ensure you are logged in and have toggled the voting interface
- **Already voted message**: Users can only vote once. Check the vote results page as an admin
- **Database errors**: Ensure the database is properly initialized with `npx ampx sandbox`
- **Access denied**: Only authenticated users can vote, and only admins can view vote results