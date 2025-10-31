"use strict";

const { sanitize } = require('@strapi/utils');
const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

module.exports = {
  /**
   * الحصول على الملف الشخصي للموظف
   * @param {Object} ctx - سياق الطلب
   * @returns {Object} بيانات الملف الشخصي
   */
  async getProfile(ctx) {
    // التحقق من أن المستخدم مسجل الدخول
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور الموظف
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    if (userWithRole.role.name !== "Staff") {
      return ctx.forbidden("هذه الواجهة متاحة للموظفين فقط");
    }

    // إرجاع بيانات الملف الشخصي
    return {
      id: userWithRole.id,
      username: userWithRole.username,
      email: userWithRole.email,
      createdAt: userWithRole.createdAt,
      updatedAt: userWithRole.updatedAt,
    };
  },

  /**
   * تحديث الملف الشخصي للموظف
   * @param {Object} ctx - سياق الطلب
   * @returns {Object} بيانات الملف الشخصي المحدثة
   */
  async updateProfile(ctx) {
    // التحقق من أن المستخدم مسجل الدخول
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("يجب تسجيل الدخول");
    }

    // التحقق من أن المستخدم لديه دور الموظف
    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    if (userWithRole.role.name !== "Staff") {
      return ctx.forbidden("هذه الواجهة متاحة للموظفين فقط");
    }

    // الحصول على البيانات المراد تحديثها
    const { username, email, currentPassword, newPassword } = ctx.request.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // إذا كان المستخدم يريد تغيير كلمة المرور
    if (currentPassword && newPassword) {
      // التحقق من كلمة المرور الحالية
      const validPassword = await strapi
        .plugin("users-permissions")
        .service("user")
        .validatePassword(currentPassword, userWithRole.password);

      if (!validPassword) {
        return ctx.badRequest("كلمة المرور الحالية غير صحيحة");
      }

      updateData.password = newPassword;
    }

    try {
      // تحديث بيانات المستخدم
      const updatedUser = await strapi.plugins["users-permissions"].services.user.edit(
        { id: user.id },
        updateData
      );

      // إرجاع البيانات بدون كلمة المرور
      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};