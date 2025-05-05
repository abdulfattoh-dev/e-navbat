import { Admin } from '../models/admin.model.js';
import { catchError } from '../utils/error-response.js';
import { adminValidator } from '../validations/admin.validation.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-token.js';
import jwt from 'jsonwebtoken';
import { transporter } from '../utils/mailer.js';
import { otpGenerator } from '../utils/otp.generator.js';
import { getCache, setCache } from '../utils/cache.js';
import { refTokenWriteToCookie } from '../utils/write-cookie.js';

export class AdminController {
  async createSuperAdmin(req, res) {
    try {
      const { error, value } = adminValidator(req.body);

      if (error) {
        return catchError(res, 400, error);
      }

      const { username, password } = value;
      // const { username, password, role } = value;
      const checkSuperAdmin = await Admin.findOne({ role });

      if (checkSuperAdmin && role === 'superadmin') {
        return catchError(res, 409, 'Super admin already exists');
      }

      const hashedPassword = await encode(password, 7);
      // const newAdmin = await Admin.create({
      //     username, hashedPassword, role
      // });
      const superAdmin = await Admin.create({
        username,
        hashedPassword,
        role: 'superadmin',
      });

      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: superAdmin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async createAdmin(req, res) {
    try {
      const { error, value } = adminValidator(req.body);

      if (error) {
        return catchError(res, 400, error);
      }

      const { username, password } = value;
      const existUsername = await Admin.findOne({ username });

      if (existUsername) {
        return catchError(res, 409, 'Username already exist');
      }

      // const { username, password, role } = value;
      // const checkSuperAdmin = await Admin.findOne({role});

      // if (checkSuperAdmin && role === 'superadmin') {
      //     return res.status(409).json({
      //         statusCode: 409,
      //         message: 'Superadmin already exists'
      //     });
      // }

      const hashedPassword = await encode(password, 7);
      // const newAdmin = await Admin.create({
      //     username, hashedPassword, role
      // });
      const admin = await Admin.create({
        username,
        hashedPassword,
        role: 'admin',
      });

      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: admin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signInAdmin(req, res) {
    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username });

      if (!admin) {
        return catchError(res, 404, 'Admin not found');
      }

      const isMatchPassword = await decode(password, admin.hashedPassword);

      if (!isMatchPassword) {
        return catchError(res, 400, 'Invalid password');
      }

      // const payload = {
      //     id: admin._id,
      //     role: admin.role
      // }

      // const accessToken = generateAccessToken(payload);
      // const refreshToken = generateRefreshToken(payload);

      // res.cookie('refreshToken', refreshToken, {
      //     httpOnly: true,
      //     secure: true,
      //     maxAge: 30 * 24 * 60 * 60 * 1000
      // });

      const otp = otpGenerator();
      const mailMessage = {
        from: process.env.SMTP_USER,
        // to: 'dilshod7861@gmail.com',
        to: 'a6du.xakim0v@gmail.com',
        subject: 'e-navbat',
        text: otp,
      };

      transporter.sendMail(mailMessage, function (err, info) {
        if (err) {
          console.log(err);
          return catchError(res, 400, `Error on sending to mail: ${err}`);
        } else {
          console.log(info);
          setCache(admin.username, otp);
        }
      });

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async confirmSignInAdmin(req, res) {
    try {
      const { username, otp } = req.body;
      const admin = await Admin.findOne({ username });

      if (!admin) {
        return catchError(res, 404, 'Admin not found');
      }

      const otpCache = getCache(username);

      if (!otpCache || otp != otpCache) {
        return catchError(res, 400, 'OTP expored');
      }

      const payload = {
        id: admin._id,
        role: admin.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // res.cookie('refreshToken', refreshToken, {
      //   httpOnly: true,
      //   secure: true,
      //   maxAge: 30 * 24 * 60 * 60 * 1000,
      // });

      refTokenWriteToCookie(res, 'refreshTokenAdmin', refreshToken);

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      console.log(error);
      return catchError(res, 500, error.message);
    }
  }

  async signOutAdmin(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenAdmin;

      if (!refreshToken) {
        return catchError(res, 401, 'Refresh token not found');
      }

      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );

      if (!decodedToken) {
        return catchError(res, 401, 'Refresh token expired');
      }

      res.clearCookie('refreshTokenAdmin');

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
      const refreshToken = req.cookies.refreshTokenAdmin;

      if (!refreshToken) {
        return catchError(res, 401, 'Refresh token not found');
      }

      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );

      if (!decodedToken) {
        return catchError(res, 401, 'Refresh token expired');
      }

      const payload = { id: decodedToken.id, role: decodedToken.role };
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

  async getAllAdmins(_, res) {
    try {
      const admins = await Admin.find();

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: admins,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async getAdminById(req, res) {
    try {
      const admin = await AdminController.findById(res, req.params.id);

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: admin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async updateAdmin(req, res) {
    try {
      const id = req.params.id;
      const admin = await AdminController.findById(res, id);

      await AdminController.findById(res, id);

      if (req.body.username) {
        const existUsername = await Admin.findOne({
          username: req.body.username,
        });

        if (existUsername && id != existUsername._id) {
          return catchError(res, 409, 'Username already exist');
        }
      }

      let hashedPassword = admin.hashedPassword;

      if (req.body.password) {
        hashedPassword = encode(req.body.password, 7);
        delete req.body.password;
      }

      const updatedAdmin = await Admin.findByIdAndUpdate(id, {
        ...req.body,
        hashedPassword
      }, {
        new: true,
      });

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedAdmin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async deleteAdmin(req, res) {
    try {
      const id = req.body.id;
      const admin = await AdminController.findById(res, id);

      if (admin.role === 'superadmin') {
        return catchError(res, 400, "Danggg!\nSuper admin can't be delete");
      }

      await Admin.findByIdAndDelete(id);

      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  static async findById(res, id) {
    try {
      const admin = await Admin.findById(id);

      if (!admin) {
        return catchError(res, 404, `Admin not found by ID ${id}`);
      }

      return admin;
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }
}
