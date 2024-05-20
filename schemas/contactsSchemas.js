import Joi from "joi";

const createContactSchema = Joi.object({
  name: Joi.string().required().min(5),
  email: Joi.string().required().email(),
  phone: Joi.string().required().min(9),
  favorite: Joi.boolean(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(5),
  email: Joi.string().email(),
  phone: Joi.string().min(9),
  favorite: Joi.boolean(),
});

const updateContactStatusSchema = Joi.object({
  favorite: Joi.boolean(),
});

export default {
  createContactSchema,
  updateContactSchema,
  updateContactStatusSchema,
};
