'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/staff/register',
      handler: 'staff.register',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};