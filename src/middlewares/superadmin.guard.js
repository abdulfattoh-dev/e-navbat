import { catchError } from '../utils/error-response.js';

export const superAdminGuard = (req, res, next) => {
  try {
    const user = req?.user;

    if (!user || user.role != 'superadmin') {
      return catchError(res, 403, 'Forbidden user');
    }

    return next();
  } catch (error) {
    return catchError(res, 500, error.message);
  }
};
