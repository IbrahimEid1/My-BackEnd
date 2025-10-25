'use strict';

module.exports = {
  async register(ctx) {
    try {
      const { email, username, password, role = 1 } = ctx.request.body; // role 1 = Super Admin

      // التحقق من البيانات
      if (!email || !username || !password) {
        return ctx.badRequest('Email, username, and password are required');
      }

      // التحقق من أن الإيميل مش مستخدم
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return ctx.badRequest('Email already exists');
      }

      // إنشاء المستخدم كأدمن
      const user = await strapi.plugins['users-permissions'].services.user.add({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
        confirmed: true,
        blocked: false,
        role: role // Super Admin
      });

      // جلب البيانات النهائية
      const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
        populate: ['role']
      });

      // إنشاء JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      ctx.send({
        jwt,
        user: {
          id: userWithRole.id,
          username: userWithRole.username,
          email: userWithRole.email,
          role: userWithRole.role
        }
      });

    } catch (error) {
      console.error('Admin registration error:', error);
      ctx.throw(500, 'Internal server error');
    }
  },

  async login(ctx) {
    try {
      const { identifier, password } = ctx.request.body;

      // البحث عن المستخدم
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: {
          $or: [
            { email: identifier.toLowerCase() },
            { username: identifier.toLowerCase() }
          ]
        },
        populate: ['role']
      });

      if (!user) {
        return ctx.badRequest('Invalid credentials');
      }

      // التحقق من كلمة المرور
      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(password, user.password);

      if (!validPassword) {
        return ctx.badRequest('Invalid credentials');
      }

      // التحقق إذا كان أدمن (Role 1 = Super Admin)
      if (user.role.id !== 1) {
        return ctx.unauthorized('Admin access required');
      }

      // إنشاء token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      ctx.send({
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      ctx.throw(500, 'Internal server error');
    }
  }
};