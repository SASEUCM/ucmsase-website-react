## UC Merced SASE Connect Website

## Local development

# in order to install and run locally
```npm install```
```npm run de```

## Production development

# in order to test production ability
```npm run build```

# in order to push to production, either push or merge onto the main branch
```git add .```
```git commit -m "your message"```
```git push```

## Features

### Voting System
The website includes a voting system for Executive Chair candidates:

- Users must be authenticated to vote
- One vote per account
- Votes are stored in AWS Amplify database
- Vote results accessible to admins at `/admin/vote-results`

To enable voting:
1. Initialize the database: `npx ampx sandbox --profile amplify-policy-863518450047`
2. Visit the Executive Chairs page
3. Toggle "Show Voting Interface" to display voting buttons
4. Only authenticated users can vote
5. Users can only vote once
