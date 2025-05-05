import { Appointment } from '../models/appointment.model.js';
import { appointmentValidator } from '../validations/appointment.validation.js';
import { catchError } from '../utils/error-response.js';

export class AppointmentController {
    async createAppointment(req, res) {
        try {
            const { error, value } = appointmentValidator(req.body);

            if (error) {
                return catchError(res, 400, error);
            }

            const appointment = new Appointment.create(value);

            return res.status(201).json({
                statusCode: 201,
                message: 'success',
                data: appointment
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async getAllAppointments(_, res) {
        try {
            const appointments = await Appointment.find().populate('patient_id').populate('graph_id');

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: appointments
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async getAppointmentById(req, res) {
        try {
            const appointment = await AppointmentController.findAppointmentById(res, req.params.id);

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: appointment
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async updateAppointmentById(req, res) {
        try {
            const id = req.params.id;

            await AppointmentController.findAppointmentById(res, id);

            const updatedAppointment = await Patient.findByIdAndUpdate(id, req.body, { new: true });

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: updatedAppointment
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async deleteAppointmentById(req, res) {
        try {
            const id = req.params.id;

            await AppointmentController.findAppointmentById(res, id);
            await Appointment.findByIdAndDelete(id);

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {}
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    static async findAppointmentById(res, id) {
        try {
            const appointment = await Appointment.findById(id).populate('patient_id').populate('graph_id');

            if (!appointment) {
                return catchError(res, 404, 'Appointment not fount');
            }

            return appointment;
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }
}
