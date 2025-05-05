import { Router } from 'express';

import { AdminController } from '../controllers/admin.controller.js';
import { jwtAuthGuard } from '../middlewares/jwt-auth.guard.js';
import { superAdminGuard } from '../middlewares/superadmin.guard.js';
import { selfGuard } from '../middlewares/self-admin.guard.js';

const router = Router();
const controller = new AdminController();

router
  .post('/superadmin', controller.createSuperAdmin)
  .post('/', jwtAuthGuard, superAdminGuard, controller.createAdmin)
  .post('/signIn', controller.signInAdmin)
  .post('/confirm-signIn', controller.confirmSignInAdmin)
  .post('/signOut', jwtAuthGuard, controller.signOutAdmin)
  .post('/token', controller.accessToken)
  .get('/', jwtAuthGuard, superAdminGuard, controller.getAllAdmins)
  .get('/:id', jwtAuthGuard, selfGuard, controller.getAdminById)
  .patch('/:id', jwtAuthGuard, selfGuard, controller.updateAdmin)
  .delete('/:id', jwtAuthGuard, superAdminGuard, controller.deleteAdmin);

export { router as adminRouter };
