"use strict";

module.exports = {
  routes: [
    // الحصول على الملف الشخصي للموظف
    {
      method: "GET",
      path: "/staff/profile",
      handler: "staff.getProfile",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // تحديث الملف الشخصي للموظف
    {
      method: "PUT",
      path: "/staff/profile",
      handler: "staff.updateProfile",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};