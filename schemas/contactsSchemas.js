import Joi from "joi";

const createContactSchema = Joi.object({
  name: Joi.string().required().min(5),
  email: Joi.string().required().email(),
  phone: Joi.number().required().min(9),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(5),
  email: Joi.string().email(),
  phone: Joi.number().min(9),
});

export default { createContactSchema, updateContactSchema };
