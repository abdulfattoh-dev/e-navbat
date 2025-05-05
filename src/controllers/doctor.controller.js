import { Doctor } from '../models/doctor.model.js';
import { catchError } from '../utils/error-response.js';
import { doctorValidator } from '../validations/doctor.validation.js';
import { otpGenerator } from '../utils/otp.generator.js';
import { getCache, setCache } from '../utils/cache.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-token.js';
import { refTokenWriteToCookie } from '../utils/write-cookie.js';

export class DoctorController {
  async createDoctor(req, res) {
    try {
      const { error, value } = doctorValidator(req.body);

      if (error) {
        return catchError(res, 400, error);
      }

      const existPhone = await Doctor.findOne({
        phoneNumber: value.phoneNumber,
      });

      if (existPhone) {
        return catchError(res, 409, 'Phone number already exist');
      }

      const doctor = await Doctor.create(value);

      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: doctor,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signInDoctor(req, res) {
    try {
      const { phoneNumber } = req.body;
      const doctor = await Doctor.findOne({ phoneNumber });

      if (!doctor) {
        return catchError(res, 404, 'Doctor not found');
      }

      const otp = otpGenerator();

      setCache(phoneNumber, otp);

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: otp,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async confirmSigninDoctor(req, res) {
    try {
      const { phoneNumber, otp } = req.body;
      const doctor = await Doctor.findOne({ phoneNumber });

      if (!doctor) {
        return catchError(res, 400, 'Wrong phone number');
      }

      const otpCache = getCache(phoneNumber);

      if (!otpCache || otpCache != otp) {
        return catchError(res, 400, 'OTP expored');
      }

      const payload = { id: doctor._id, is_doctor: true };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      refTokenWriteToCookie(res, 'refreshTokenDoctor', refreshToken);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signOutDoctor(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenDoctor;

      if (!refreshToken) {
        return catchError(res, 401, 'Refresh token doctor not found');
      }

      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );

      if (!decodedToken) {
        return catchError(res, 401, 'Refresh token doctor expired');
      }

      res.clearCookie('refreshTokenDoctor');

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async accessToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenDoctor;

      if (!refreshToken) {
        return catchError(res, 401, 'Refresh token doctor not found');
      }

      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );

      if (!decodedToken) {
        return catchError(res, 401, 'Refresh token doctor expired');
      }

      const payload = { id: decodedToken.id, is_doctor: true };
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

  async getAllDoctors(req, res) {
    try {
      const doctors = await Doctor.find().populate('graphs');

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: doctors,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async getDoctorById(req, res) {
    try {
      const doctor = await DoctorController.findDoctorById(res, req.params.id);

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: doctor,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async updateDoctor(req, res) {
    try {
      const id = req.params.id;

      await DoctorController.findDoctorById(res, id);

      if (req.body.phoneNumber) {
        const existPhone = await Doctor.findOne({
          phoneNumber: req.body.phoneNumber,
        });

        if (existPhone && id != existPhone._id) {
          return catchError(res, 409, 'Phone number already exist');
        }
      }

      const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedDoctor,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async deleteDoctor(req, res) {
    try {
      const id = req.body.id;

      await DoctorController.findDoctorById(res, id);
      await Doctor.findByIdAndDelete(id);

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  static async findDoctorById(res, id) {
    try {
      const doctor = await Doctor.findById(id).populate('graphs');

      if (!doctor) {
        return catchError(res, 404, `Doctor not found by ID ${id}`);
      }

      return doctor;
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }
}
