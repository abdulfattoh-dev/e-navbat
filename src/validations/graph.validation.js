import Joi from 'joi';

export const graphValidator = (data) => {
  const graph = Joi.object({
    date: Joi.date().required(),
    time: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/).pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/).required(),
    status: Joi.string().valid('busy', 'free').default('free').required(),
    doctorId: Joi.string().required()
  });

  return graph.validate(data);
};
