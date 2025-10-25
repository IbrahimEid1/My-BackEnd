"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/admin/register",
      handler: "admin.register",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/admin/login",
      handler: "admin.login",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
