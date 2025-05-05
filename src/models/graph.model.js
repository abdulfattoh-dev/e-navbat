import { Schema, model } from 'mongoose';

const graphSchema = new Schema(
    {
        date: {
            type: Date
        },
        time: {
            type: String
        },
        status: {
            type: String,
            enum: ['busy', 'free'],
            default: 'free'
        },
        doctorId: {
            type: Schema.Types.ObjectId,
            ref: 'Doctor'
        }
    },
    {
        timestamps: true
    }
);

export const Graph = model('Graph', graphSchema);
