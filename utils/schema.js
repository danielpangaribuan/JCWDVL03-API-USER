// Joi schema, lihat di npm joi ada di internet
const Joi = require("joi");

const schema = Joi.object({
  username: Joi.string().alphanum().min(6).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  fullname: Joi.string().required(),
  date_of_birth: Joi.string().required(),
  gender: Joi.string().required(),
});

module.exports = schema;
