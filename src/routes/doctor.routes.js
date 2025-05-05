import { Router } from 'express';

import { DoctorController } from '../controllers/doctor.controller.js';
import { jwtAuthGuard } from '../middlewares/jwt-auth.guard.js';
import { adminGuard } from '../middlewares/admin.guard.js';
import { selfGuard } from '../middlewares/self-admin.guard.js';

const router = Router();
const controller = new DoctorController();

router
  .post('/', jwtAuthGuard, adminGuard, controller.createDoctor)
  .post('/signIn', controller.signInDoctor)
  .post('/confirm-signIn', controller.confirmSigninDoctor)
  .post('/signOut', jwtAuthGuard, controller.signInDoctor)
  .post('/token', controller.accessToken)
  .get('/', controller.getAllDoctors)
  .get('/:id', controller.getDoctorById)
  .patch('/:id', jwtAuthGuard, selfGuard, controller.updateDoctor)
  .delete('/:id', jwtAuthGuard, adminGuard, controller.deleteDoctor);

export { router as doctorRouter };
