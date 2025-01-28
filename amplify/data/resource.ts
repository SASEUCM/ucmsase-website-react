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