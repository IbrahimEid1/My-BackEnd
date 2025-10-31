"use strict";

const { sanitize } = require('@strapi/utils');
const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

module.exports = {
  /**
   * إنشاء حساب إداري جديد
   * @param {Object} ctx - سياق الطلب
   * @returns {Object} بيانات المستخدم المنشأ
   */
  async createAdmin(ctx) {
    // التحقق من أن المستخدم الحالي هو مدير رئيسي (Super Admin)
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور المدير الرئيسي
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    if (userWithRole.role.name !== "Super Admin") {
      return ctx.forbidden("يجب أن تكون مديرًا رئيسيًا لإنشاء حسابات الإداريين");
    }

    // الحصول على بيانات الإداري الجديد من الطلب
    const { username, email, password } = ctx.request.body;

    if (!username || !email || !password) {
      return ctx.badRequest("يرجى توفير اسم المستخدم والبريد الإلكتروني وكلمة المرور");
    }

    try {
      // الحصول على دور الإداري
      const adminRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { name: "Admin" } });

      if (!adminRole) {
        return ctx.badRequest("دور الإداري غير موجود");
      }

      // إنشاء المستخدم الجديد
      const newUser = await strapi.plugins["users-permissions"].services.user.add({
        username,
        email,
        password,
        role: adminRole.id,
        confirmed: true,
      });

      // إرجاع البيانات بدون كلمة المرور
      const sanitizedUser = await sanitize.contentAPI.output(newUser, 
        strapi.getModel("plugin::users-permissions.user"));

      return sanitizedUser;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * إنشاء حساب موظف جديد
   * @param {Object} ctx - سياق الطلب
   * @returns {Object} بيانات المستخدم المنشأ
   */
  async createStaff(ctx) {
    // التحقق من أن المستخدم الحالي هو مدير
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور المدير
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    if (userWithRole.role.name !== "Admin" && userWithRole.role.name !== "Super Admin") {
      return ctx.forbidden("يجب أن تكون مديرًا لإنشاء حسابات الموظفين");
    }

    // الحصول على بيانات الموظف الجديد من الطلب
    const { username, email, password } = ctx.request.body;

    if (!username || !email || !password) {
      return ctx.badRequest("يرجى توفير اسم المستخدم والبريد الإلكتروني وكلمة المرور");
    }

    try {
      // الحصول على دور الموظف
      const staffRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { name: "Staff" } });

      if (!staffRole) {
        return ctx.badRequest("دور الموظف غير موجود");
      }

      // إنشاء المستخدم الجديد
      const newUser = await strapi.plugins["users-permissions"].services.user.add({
        username,
        email,
        password,
        role: staffRole.id,
        confirmed: true,
      });

      // إرجاع البيانات بدون كلمة المرور
      const sanitizedUser = await sanitize.contentAPI.output(newUser, 
        strapi.getModel("plugin::users-permissions.user"));

      return sanitizedUser;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * تحديث بيانات مستخدم
   * @param {Object} ctx - سياق الطلب
   * @returns {Object} بيانات المستخدم المحدثة
   */
  async updateUser(ctx) {
    // التحقق من أن المستخدم الحالي هو مدير
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور المدير
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    const isAdmin = userWithRole.role.name === "Admin";
    const isSuperAdmin = userWithRole.role.name === "Super Admin";

    if (!isAdmin && !isSuperAdmin) {
      return ctx.forbidden("يجب أن تكون مديرًا لتحديث حسابات المستخدمين");
    }

    // الحصول على معرف المستخدم المراد تحديثه
    const { id } = ctx.params;
    if (!id) {
      return ctx.badRequest("يرجى توفير معرف المستخدم");
    }

    // التحقق من وجود المستخدم
    const userToUpdate = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id },
        populate: { role: true },
      });

    if (!userToUpdate) {
      return ctx.notFound("المستخدم غير موجود");
    }

    // التحقق من الصلاحيات (المدير العادي لا يمكنه تعديل بيانات المدراء)
    if (isAdmin && userToUpdate.role.name === "Admin") {
      return ctx.forbidden("لا يمكن للمدير العادي تعديل بيانات المدراء الآخرين");
    }

    // الحصول على البيانات المراد تحديثها
    const { username, email, password } = ctx.request.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    try {
      // تحديث بيانات المستخدم
      const updatedUser = await strapi.plugins["users-permissions"].services.user.edit(
        { id },
        updateData
      );

      // إرجاع البيانات بدون كلمة المرور
      const sanitizedUser = await sanitize.contentAPI.output(updatedUser, 
        strapi.getModel("plugin::users-permissions.user"));

      return sanitizedUser;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * حذف حساب مستخدم
   * @param {Object} ctx - سياق الطلب
   * @returns {Object} رسالة نجاح
   */
  async deleteUser(ctx) {
    // التحقق من أن المستخدم الحالي هو مدير
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور المدير
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    const isAdmin = userWithRole.role.name === "Admin";
    const isSuperAdmin = userWithRole.role.name === "Super Admin";

    if (!isAdmin && !isSuperAdmin) {
      return ctx.forbidden("يجب أن تكون مديرًا لحذف حسابات المستخدمين");
    }

    // الحصول على معرف المستخدم المراد حذفه
    const { id } = ctx.params;
    if (!id) {
      return ctx.badRequest("يرجى توفير معرف المستخدم");
    }

    // التحقق من وجود المستخدم
    const userToDelete = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id },
        populate: { role: true },
      });

    if (!userToDelete) {
      return ctx.notFound("المستخدم غير موجود");
    }

    // التحقق من الصلاحيات (المدير العادي لا يمكنه حذف المدراء)
    if (isAdmin && userToDelete.role.name === "Admin") {
      return ctx.forbidden("لا يمكن للمدير العادي حذف المدراء الآخرين");
    }

    try {
      // حذف المستخدم
      await strapi.plugins["users-permissions"].services.user.remove({ id });

      return { message: "تم حذف المستخدم بنجاح" };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * الحصول على قائمة المستخدمين
   * @param {Object} ctx - سياق الطلب
   * @returns {Array} قائمة المستخدمين
   */
  async getUsers(ctx) {
    // التحقق من أن المستخدم الحالي هو مدير
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور المدير
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    const isAdmin = userWithRole.role.name === "Admin";
    const isSuperAdmin = userWithRole.role.name === "Super Admin";

    if (!isAdmin && !isSuperAdmin) {
      return ctx.forbidden("يجب أن تكون مديرًا للوصول إلى قائمة المستخدمين");
    }

    try {
      // الحصول على معايير البحث
      const { role, _limit, _start, _sort } = ctx.query;
      const filters = {};

      // إذا تم تحديد دور معين
      if (role) {
        const roleRecord = await strapi
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: role } });

        if (roleRecord) {
          filters.role = roleRecord.id;
        }
      }

      // إذا كان المستخدم مديرًا عاديًا، فلا يمكنه رؤية المدراء الآخرين
      if (isAdmin && !role) {
        const adminRole = await strapi
          .query("plugin::users-permissions.role")
          .findOne({ where: { name: "Admin" } });

        if (adminRole) {
          filters.role = { $ne: adminRole.id };
        }
      }

      // إعداد خيارات الاستعلام
      const options = {};
      if (_limit) options.limit = parseInt(_limit);
      if (_start) options.offset = parseInt(_start);
      if (_sort) options.orderBy = _sort;

      // الحصول على قائمة المستخدمين
      const users = await strapi.db
        .query("plugin::users-permissions.user")
        .findMany({
          where: filters,
          select: ["id", "username", "email", "createdAt", "updatedAt"],
          populate: { role: true },
          ...options,
        });

      // تنسيق البيانات للإرجاع
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return formattedUsers;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * الحصول على تفاصيل مستخدم محدد
   * @param {Object} ctx - سياق الطلب
   * @returns {Object} بيانات المستخدم
   */
  async getUserDetails(ctx) {
    // التحقق من أن المستخدم الحالي هو مدير
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور المدير
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    const isAdmin = userWithRole.role.name === "Admin";
    const isSuperAdmin = userWithRole.role.name === "Super Admin";

    if (!isAdmin && !isSuperAdmin) {
      return ctx.forbidden("يجب أن تكون مديرًا للوصول إلى تفاصيل المستخدمين");
    }

    // الحصول على معرف المستخدم
    const { id } = ctx.params;
    if (!id) {
      return ctx.badRequest("يرجى توفير معرف المستخدم");
    }

    try {
      // الحصول على بيانات المستخدم
      const targetUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id },
          populate: { role: true },
          select: ["id", "username", "email", "createdAt", "updatedAt"],
        });

      if (!targetUser) {
        return ctx.notFound("المستخدم غير موجود");
      }

      // التحقق من الصلاحيات (المدير العادي لا يمكنه رؤية تفاصيل المدراء الآخرين)
      if (isAdmin && targetUser.role.name === "Admin" && targetUser.id !== user.id) {
        return ctx.forbidden("لا يمكن للمدير العادي الوصول إلى تفاصيل المدراء الآخرين");
      }

      // تنسيق البيانات للإرجاع
      return {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role.name,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};
