"use strict";

module.exports = {
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized();
    }

    const userWithRole = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        populate: { role: true },
      });

    return {
      id: userWithRole.id,
      username: userWithRole.username,
      email: userWithRole.email,
      role: userWithRole.role.name,
    };
  },
};
