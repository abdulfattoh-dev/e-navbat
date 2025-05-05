import { Patient } from '../models/patient.model.js';
import { patientValidator } from '../validations/patient.validation.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generate-token.js';
import { refTokenWriteToCookie } from '../utils/write-cookie.js';
import { catchError } from '../utils/error-response.js';

export class PatientController {
    async signUpPatient(req, res) {
        try {
            const { error, value } = patientValidator(req.body);

            if (error) {
                return catchError(res, 400, error);
            }

            const { fullName, phoneNumber, password, address, age, gender } = value;
            const existPhone = await Patient.findOne({ phoneNumber });

            if (existPhone) {
                return catchError(res, 409, 'Phone number already exist');
            }

            const hashedPassword = await encode(password, 7);
            const patient = await Patient.create({
                fullName,
                phoneNumber,
                hashedPassword,
                address,
                age,
                gender
            });
            const payload = { id: patient._id, is_patient: true }
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            refTokenWriteToCookie(res, 'refreshTokenPatient', refreshToken);

            return res.status(201).json({
                statusCode: 201,
                message: 'success',
                data: accessToken
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async signInPatient(req, res) {
        try {
            const { phoneNumber, password } = req.body;
            const patient = await Patient.findOne({ phoneNumber });
            const isMatchPass = await decode(password, patient?.hashedPassword);

            if (!patient || !isMatchPass) {
                return catchError(res, 400, 'Phone number or password incorrect');
            }

            const payload = { id: patient._id, is_patient: true }
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            refTokenWriteToCookie(res, 'refreshTokenPatient', refreshToken);

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: accessToken
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async signOutPatient(req, res) {
        try {
            const refreshToken = req.cookies.refreshTokenPatient;

            if (!refreshToken) {
                return catchError(res, 401, 'Refresh token patient not found');
            }

            const decodedToken = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_KEY
            );

            if (!decodedToken) {
                return catchError(res, 401, 'Refresh token patient expired');
            }

            res.clearCookie('refreshTokenPatient');

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {},
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async accessTokenPatient(req, res) {
        try {
            const refreshToken = req.cookies.refreshTokenPatient;

            if (!refreshToken) {
                return catchError(res, 401, 'Refresh token patient not found');
            }

            const decodedToken = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_KEY
            );

            if (!decodedToken) {
                return catchError(res, 401, 'Refresh token patient expired');
            }

            const payload = { id: decodedToken.id, is_patient: true };
            const accessToken = generateAccessToken(payload);

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: accessToken,
            });
        } catch (error) {
            return catchError(req, 500, error.message);
        }
    }

    async getAllPatients(_, res) {
        try {
            const patients = await Patient.find();

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: patients
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async getPatientById(req, res) {
        try {
            const patient = await PatientController.findPatientById(res, req.params.id);

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: patient
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async updatePatientById(req, res) {
        try {
            const id = req.params.id;

            await PatientController.findPatientById(res, id);

            if (req.body.phoneNumber) {
                const existPhone = await Patient.findOne({
                    phoneNumber: req.body.phoneNumber
                });

                if (existPhone && id != existPhone._id) {
                    return catchError(res, 409, 'Phone number already exist');
                }
            }

            let hashedPassword = admin.hashedPassword;

            if (req.body.password) {
                hashedPassword = encode(req.body.password, 7);
                delete req.body.password;
            }

            const updatedPatient = await Patient.findByIdAndUpdate(id, {
                ...req.body,
                hashedPassword
            }, {
                new: true
            });

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: updatedPatient
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    async deletePatientById(req, res) {
        try {
            const id = req.params.id;

            await PatientController.findPatientById(res, id);
            await Patient.findByIdAndDelete(id);

            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {}
            });
        } catch (error) {
            return catchError(res, 500, error.message);
        }
    }

    static async findPatientById(res, id) {
        try {
            const patient = await Patient.findById(id);

            if (!patient) {
                return catchError(res, 404, 'Patient not fount');
            }

            return patient;
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }
}
