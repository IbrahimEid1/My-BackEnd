"use strict";

const { sanitize } = require('@strapi/utils');
const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

module.exports = {
  async callback(ctx) {
    const provider = ctx.params.provider || 'local';
    const { identifier, password } = ctx.request.body;

    // تحقق من البيانات
    if (!identifier || !password) {
      throw new ApplicationError('Please provide both identifier and password');
    }

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { email: identifier.toLowerCase() },
        populate: { role: true },
      });

    if (!user) {
      throw new ApplicationError('User not found');
    }

    // تحقق من كلمة السر
    const validPassword = await strapi
      .plugin('users-permissions')
      .service('user')
      .validatePassword(password, user.password);

    if (!validPassword) {
      throw new ApplicationError('Invalid password');
    }

    // إنشاء الـ token
    const jwt = strapi
      .plugin('users-permissions')
      .service('jwt')
      .issue({ id: user.id });

    // رجّع الـ user ومعاه role
    return {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role?.name, // 👈 هنا بنضيف الـ role
      },
    };
  },
};
