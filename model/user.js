exports.userSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 },
    number: { type: "string", pattern: "^\\+?[0-9]{10,12}$" },
  },
  required: ["name", "email", "password"],
};

exports.loginSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 },
  },
  required: ["email", "password"],
};

exports.updateSchema = {
  type: "object",
  properties: {
    oldPassword: { type: "string", minLength: 6 },
    newPassword: { type: "string", minLength: 6 },
  },
  required: ["oldPassword", "newPassword"],
};
