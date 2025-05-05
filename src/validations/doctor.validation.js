import Joi from 'joi';

export const doctorValidator = (data) => {
  const doctor = Joi.object({
    fullName: Joi.string().required(),
    phoneNumber: Joi.string()
      .pattern(/^(\+998|998)(9[0-9]|3[3]|8[8])[0-9]{7}$/)
      .required(),
    special: Joi.string().required(),
  });

  return doctor.validate(data);
};
