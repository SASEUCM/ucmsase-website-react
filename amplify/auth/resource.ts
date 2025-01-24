import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Define user groups using the correct syntax
  groups: ['admin', 'user']
});