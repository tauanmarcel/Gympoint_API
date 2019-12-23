import { Router } from 'express';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';

import authMiddleware from './app/middlewares/auth';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';

const routes = new Router();

/**
 * Cria uma sessão.
 */
routes.post('/sessions', SessionController.store);

/**
 * Busca um aluno.
 */
routes.get('/students/:id', StudentController.show);

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
routes.delete('/students/:id', StudentController.delete);

/**
 * Pedidos de auxílio.
 */
routes.get('/help-orders', HelpOrderController.index);
routes.post('/help-orders/:student_id/answer/:id', HelpOrderController.answer);

/**
 * Rotas para gerenciar os planos.
 */
routes.get('/plans', PlanController.index);
routes.get('/plans/:id', PlanController.show);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

/**
 * Rotas para gerenciar as matrículas.
 */
routes.get('/registrations', RegistrationController.index);
routes.get('/registrations/:id', RegistrationController.show);
routes.post('/registrations', RegistrationController.store);
routes.put('/registrations/:id', RegistrationController.update);
routes.delete('/registrations/:id', RegistrationController.delete);

export default routes;
