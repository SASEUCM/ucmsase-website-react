import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      owner: a.string(),
      status: a.enum(['pending', 'completed']),
      priority: a.enum(['low', 'medium', 'high']),
      dueDate: a.date(),
    })
    .authorization(authorize => [
      // Admin group has full access
      authorize.groups(['admin']).to(['read', 'create', 'update', 'delete']),
      // Owner has access to their own items
      authorize.owner().to(['read', 'create', 'update', 'delete'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});