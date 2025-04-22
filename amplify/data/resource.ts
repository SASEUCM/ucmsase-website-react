// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      owner: a.string(),
    })
    .authorization(authorize => [
      authorize.groups(['admin']).to(['read', 'create', 'update', 'delete']),
      authorize.owner().to(['read', 'create', 'update', 'delete'])
    ]),

  Subscriber: a
    .model({
      email: a.string(),
      name: a.string(),
      subscribeDate: a.datetime(),
      isActive: a.boolean(),
    })
    .authorization(authorize => [
      authorize.groups(['admin']).to(['read', 'create', 'update', 'delete']),
      authorize.publicApiKey().to(['create'])
    ]),
    
  UserPoints: a
    .model({
      userId: a.string(),
      points: a.integer(),
      barcode: a.string(),
      lastUpdated: a.datetime(),
    })
    .authorization(authorize => [
      // Admin can do everything
      authorize.groups(['admin']).to(['read', 'create', 'update', 'delete']),
      // Authenticated users can create their own record and read/update it
      authorize.authenticated().to(['read', 'create']),
      // Public API key for scanning (used by admin scanning interface)
      authorize.publicApiKey().to(['read', 'update'])
    ]),
    
  ExecChairVote: a
    .model({
      userEmail: a.string(), // Email of the user who cast the vote
      candidateId: a.string(), // ID of the candidate (exec chair) who received the vote
      candidateType: a.string(), // Type: 'execchair' or 'sbod'
      position: a.string(), // Position: 'president', 'vp', etc.
      timestamp: a.datetime(), // When the vote was cast
    })
    .authorization(authorize => [
      // Admin can do everything
      authorize.groups(['admin']).to(['read', 'create', 'update', 'delete']),
      // Authenticated users can create and read votes
      authorize.authenticated().to(['read', 'create']),
    ]),
    
  VoteSummary: a
    .model({
      candidateId: a.string(),
      voteCount: a.integer(),
      candidateName: a.string(),
      lastUpdated: a.datetime(),
    })
    .authorization(authorize => [
      // Only admin can read vote totals
      authorize.groups(['admin']).to(['read', 'create', 'update', 'delete']),
    ]),
    
  Schedule: a
    .model({
      title: a.string(),
      start: a.string(),
      end: a.string(),
      type: a.string(),  // 'recurring' or 'temporary'
      username: a.string(),
      isRecurring: a.boolean(),
      selectedDays: a.string(),  // JSON string of selected days
      color: a.string(),  // For differentiating users in admin view
    })
    .authorization(authorize => [
      authorize.groups(['admin']).to(['read', 'create', 'update', 'delete']),
      authorize.owner().to(['read', 'create', 'update', 'delete'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});