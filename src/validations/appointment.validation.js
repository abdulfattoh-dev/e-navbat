import Joi from 'joi';

export const appointmentValidator = (data) => {
    const appointment = Joi.object({
        patient_id: Joi.string().required(),
        complaint: Joi.string().required(),
        status: Joi.string().valid('pending', 'completed', 'rejected').required(),
        graph_id: Joi.string().required()
    });

    return appointment.validate(data);
};
