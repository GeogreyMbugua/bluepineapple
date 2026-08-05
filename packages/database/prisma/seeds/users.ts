import { ROLES } from './roles';

export const USERS = [
  {
    email: 'admin@bluepineappleholdings.com',
    firstName: 'Admin',
    lastName: 'User',
    status: 'ACTIVE',
    roles: [ROLES[0].name], // SUPER_ADMIN
  },
];
