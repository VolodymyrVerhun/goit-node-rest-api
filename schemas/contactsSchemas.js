import Joi from "joi";

const createContactSchema = Joi.object({
  name: Joi.string().required().min(5),
  email: Joi.string().required().email(),
  phone: Joi.string().required().min(9),
  favorite: Joi.boolean(),
  owner: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(5),
  email: Joi.string().email(),
  phone: Joi.string().min(9),
  favorite: Joi.boolean(),
});

const updateContactStatusSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});
export default {
  createContactSchema,
  updateContactSchema,
  updateContactStatusSchema,
  updateSubscriptionSchema,
  registerSchema,
  emailSchema,
};
