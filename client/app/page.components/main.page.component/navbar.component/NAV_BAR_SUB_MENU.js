export default [
  {
    role: ['customer', 'provider'],
    parent: 'Settings',
    text: 'Payments',
    url: 'main.payments'
  },
  {
    role: ['customer', 'provider'],
    parent: 'Settings',
    text: 'Terms',
    url: 'acceptTermsAndConditionsPage'
  },
  {
    role: ['customer', 'provider'],
    parent: 'Settings',
    text: 'Change Password',
    url: 'main.password'
  },
  {
    role: ['customer'],
    parent: 'Settings',
    text: 'Edit profile',
    url: 'main.profile.edit'
  },
  {
    role: ['provider'],
    parent: 'Settings',
    text: 'View profile',
    url: 'main.profile.view'
  },
  {
    role: ['customer', 'provider'],
    parent: 'Settings',
    text: 'Log out',
    isComponent: true,
    component: 'logout'
  }
];
