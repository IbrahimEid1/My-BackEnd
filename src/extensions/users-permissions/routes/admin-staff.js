"use strict";

module.exports = {
  routes: [
    // إنشاء إداري جديد
    {
      method: "POST",
      path: "/admin/create-admin",
      handler: "admin-staff.createAdmin",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // إنشاء موظف جديد
    {
      method: "POST",
      path: "/admin/create-staff",
      handler: "admin-staff.createStaff",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // تحديث بيانات مستخدم
    {
      method: "PUT",
      path: "/admin/users/:id",
      handler: "admin-staff.updateUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // حذف مستخدم
    {
      method: "DELETE",
      path: "/admin/users/:id",
      handler: "admin-staff.deleteUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // الحصول على قائمة المستخدمين
    {
      method: "GET",
      path: "/admin/users",
      handler: "admin-staff.getUsers",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // الحصول على تفاصيل مستخدم محدد
    {
      method: "GET",
      path: "/admin/users/:id",
      handler: "admin-staff.getUserDetails",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};