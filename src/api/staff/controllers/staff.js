'use strict';

module.exports = {
  async register(ctx) {
    try {
      const { email, username, password, role = 3 } = ctx.request.body; // role 3 = Author (Staff)

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

      // إنشاء المستخدم
      const user = await strapi.plugins['users-permissions'].services.user.add({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: password,
        confirmed: true,
        blocked: false,
        role: role // نحدد الـ role هنا
      });

      // جلب البيانات النهائية مع الـ role
      const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: user.id },
        populate: ['role']
      });

      // إنشاء JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      // إرجاع البيانات
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
      console.error('Staff registration error:', error);
      ctx.throw(500, 'Internal server error');
    }
  }
};