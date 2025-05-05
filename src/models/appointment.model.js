import { Schema, model } from 'mongoose';

const appointmentSchema = new Schema(
    {
        patient_id: {
            type: Schema.Types.ObjectId,
            ref: 'Patient'
        },
        complaint: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'rejected']
        },
        graph_id: {
            type: Schema.Types.ObjectId,
            ref: 'Graph'
        }
    },
    {
        timestamps: true
    }
);

export const Appointment = model('Appointment', appointmentSchema);
