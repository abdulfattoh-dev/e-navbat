import { Router } from 'express';

import { PatientController } from '../controllers/patient.controller.js';
import { jwtAuthGuard } from '../middlewares/jwt-auth.guard.js';
import { selfGuard } from '../middlewares/self-admin.guard.js';
import { doctorGuard } from '../middlewares/doctor.guard.js';
import { adminGuard } from '../middlewares/admin.guard.js';

const router = Router();
const controller = new PatientController();

router
    .post('/signUp', controller.signUpPatient)
    .post('/signIn', controller.signInPatient)
    .post('/signOut', controller.signOutPatient)
    .post('/token', controller.accessTokenPatient)
    .get('/', jwtAuthGuard, doctorGuard, controller.getAllPatients)
    .get('/:id', jwtAuthGuard, doctorGuard, controller.getPatientById)
    .patch('/:id', jwtAuthGuard, selfGuard, controller.updatePatientById)
    .delete('/:id', jwtAuthGuard, adminGuard, controller.deletePatientById);

export { router as patientRouter };
