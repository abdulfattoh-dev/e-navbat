import { Schema, model } from 'mongoose';

const patientSchema = new Schema(
    {
        fullName: {
            type: string
        },
        phoneNumber: {
            type: String,
            unique: true
        },
        hashedPassword: {
            type: String
        },
        address: {
            type: String
        },
        age: {
            type: Number
        },
        gender: {
            type: String,
            enum: ['male', 'female']
        }
    },
    {
        timestamps: true
    }
);

export const Patient = model('Patient', patientSchema);
