import { Router } from 'express';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';

import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';

const routes = new Router();

/**
 * Cria uma sessão.
 */
routes.get('/sessions', SessionController.store);

/**
 * Realiza check-in.
 */
routes.post('/students/:student_id/checkins', CheckinController.store);

/**
 * Cria um pedido de auxílio.
 */
routes.post('/students/:student_id/help-orders', HelpOrderController.store);

/**
 * Esse Middleware permite que apenas usuários Autenticados acessem as rotas seguintes.
 */
routes.use(authMiddleware);

/**
 * Esse Middleware permite que apenas os usuários Administradores acessem as rotas seguintes.
 */
routes.use(adminMiddleware);

/**
 * Rotas para gegrenciar os alunos.
 */
routes.get('/students', StudentController.index);
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

/**
 * Lista check-ins.
 */
routes.get('/students/:student_id/checkins', CheckinController.index);

/**
 * Responde a um pedido de auxílio.
 */
routes.get('/gympoint.com/help-orders', HelpOrderController.index);
routes.get(
    '/gympoint.com/help-orders/:student_id/list-for-student',
    HelpOrderController.listForStudent
);
routes.post(
    '/gympoint.com/help-orders/:student_id/answer/:id',
    HelpOrderController.answer
);

/**
 * Rotas para gerenciar os planos.
 */
routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

/**
 * Rotas para gerenciar as matrículas.
 */
routes.get('/enrollments', EnrollmentController.index);
routes.post('/enrollments', EnrollmentController.store);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.put('/enrollments/:id/disable', EnrollmentController.delete);

export default routes;
