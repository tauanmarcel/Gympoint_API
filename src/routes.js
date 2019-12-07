import { Router } from 'express';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';

import authMiddleware from './app/middlewares/auth';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import SearchStudentController from './app/controllers/SearchStudentController';

const routes = new Router();

/**
 * Cria uma sessão.
 */
routes.get('/sessions', SessionController.store);

/**
 * Busca um aluno.
 */
routes.get('/search-students/:id', SearchStudentController.store);

/**
 * Check-ins.
 */
routes.get('/students/:student_id/checkins', CheckinController.index);
routes.post('/students/:student_id/checkins', CheckinController.store);

/**
 * Pedido de auxílio.
 */
routes.post('/students/:student_id/help-orders', HelpOrderController.store);
routes.get(
    '/help-orders/:student_id/list-for-student',
    HelpOrderController.listForStudent
);
/**
 * Esse Middleware permite que apenas usuários Autenticados acessem as rotas seguintes.
 */
routes.use(authMiddleware);

/**
 * Rotas para gerenciar os alunos.
 */
routes.get('/students', StudentController.index);
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

/**
 * Pedidos de auxílio.
 */
routes.get('/help-orders', HelpOrderController.index);
routes.post('/help-orders/:student_id/answer/:id', HelpOrderController.answer);

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
