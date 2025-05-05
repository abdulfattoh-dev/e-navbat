import { Router } from 'express';

import { GraphController } from '../controllers/graph.controller.js';
import { jwtAuthGuard } from '../middlewares/jwt-auth.guard.js';
import { selfGuard } from '../middlewares/self-admin.guard.js';
import { doctorGuard } from '../middlewares/doctor.guard.js';

const router = Router();
const controller = new GraphController();

router
    .post('/', jwtAuthGuard, doctorGuard, controller.createGraph)
    .get('/', controller.getAllGraphs)
    .get('/:id', controller.getGraphById)
    .patch('/:id', jwtAuthGuard, selfGuard, controller.updateGraphById)
    .delete('/:id', jwtAuthGuard, doctorGuard, selfGuard, controller.deleteGraphById);

export { router as graphRouter };
