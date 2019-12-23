import * as Yup from 'yup';
import {
    parseISO,
    isBefore,
    isToday,
    getHours,
    addMonths,
    startOfDay
} from 'date-fns';
import { Op } from 'sequelize';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

import ConfirmationMail from '../jobs/ConfirmationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
    async index(_, res) {
        const registrations = await Registration.findAll({
            attributes: ['id', 'price', 'start_date', 'active'],
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['name', 'email']
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: ['title', 'duration']
                }
            ],
            order: [['student', 'name', 'asc']]
        });

        return res.status(200).json(registrations);
    }

    async show(req, res) {
        const { id } = req.params;

        const registration = await Registration.findByPk(id, {
            attributes: ['id', 'price', 'start_date', 'active'],
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Plan,
                    as: 'plan',
                    attributes: ['id', 'title', 'duration', 'price']
                }
            ],
            order: [['end_date', 'asc']]
        });

        if (!registration) {
            return res.status(400).json({ error: 'Registration not found!' });
        }

        return res.status(200).json(registration);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            student_id: Yup.number().required(),
            plan_id: Yup.number().required(),
            start_date: Yup.date().required()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { student_id, plan_id, start_date } = req.body;

        const dayStart = startOfDay(parseISO(start_date));

        if (isBefore(dayStart, new Date()) && !isToday(dayStart, new Date())) {
            return res
                .status(400)
                .json({ error: 'Past dates are not allowed' });
        }

        if (
            isToday(dayStart, new Date()) &&
            getHours(parseISO(start_date)) > 20
        ) {
            return res.status(400).json({ error: 'Time exceeded' });
        }

        const plan = await Plan.findByPk(plan_id);

        if (!plan) {
            return res.status(400).json({ error: 'Plan not found' });
        }

        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student not found' });
        }

        const end_date = addMonths(parseISO(start_date), plan.duration);

        const registrationExists = await Registration.findOne({
            where: {
                student_id,
                end_date: {
                    [Op.gte]: new Date()
                }
            }
        });

        if (registrationExists) {
            return res
                .status(400)
                .json({ error: 'The student already has a plan' });
        }

        const price = plan.duration * plan.price;

        const registration = await Registration.create({
            student_id,
            plan_id,
            start_date,
            end_date,
            price
        });

        await Queue.add(ConfirmationMail.key, {
            registration,
            student,
            plan
        });

        return res.status(200).json(registration);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            plan_id: Yup.number(),
            start_date: Yup.date()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const registration = await Registration.findByPk(req.params.id);

        /**
         * As alterações só estarão disponíveis caso o plano ainda não tenha entrado em vigência
         */
        if (isBefore(registration.start_date, new Date())) {
            return res.status(400).json({
                error: "The registration is don't disponible for alterations"
            });
        }

        const { plan_id, start_date } = req.body;

        const objUpdate = {
            start_date: null,
            end_date: null,
            price: null,
            plan_id: null
        };

        if (start_date) {
            const dayStart = startOfDay(parseISO(start_date));

            if (
                isBefore(dayStart, new Date()) &&
                !isToday(dayStart, new Date())
            ) {
                return res
                    .status(400)
                    .json({ error: 'Past dates are not allowed' });
            }

            if (
                isToday(dayStart, new Date()) &&
                getHours(parseISO(start_date)) > 20
            ) {
                return res.status(400).json({ error: 'Time exceeded' });
            }

            const currentPlan = await Plan.findOne({
                where: {
                    id: registration.plan_id
                }
            });

            objUpdate.start_date = start_date;
            objUpdate.end_date = addMonths(start_date, currentPlan.duration);
        } else {
            objUpdate.start_date = registration.start_date;
            objUpdate.end_date = registration.end_date;
        }

        if (plan_id) {
            const plan = await Plan.findByPk(plan_id);

            if (!plan) {
                return res.status(400).json({ error: 'Plan not found' });
            }

            if (start_date) {
                objUpdate.end_date = addMonths(
                    parseISO(start_date),
                    plan.duration
                );
            } else {
                objUpdate.end_date = addMonths(
                    registration.start_date,
                    plan.duration
                );
            }

            objUpdate.plan_id = plan_id;
            objUpdate.price = plan.duration * plan.price;
        } else {
            objUpdate.plan_id = registration.plan_id;
            objUpdate.price = registration.price;
        }

        const updatedRegistration = await registration.update(objUpdate);

        return res.status(200).json(updatedRegistration);
    }

    async delete(req, res) {
        const registration = await Registration.findByPk(req.params.id);

        if (!registration) {
            return res.status(200).json({ error: 'Registration not found' });
        }

        await registration.destroy();

        return res
            .status(200)
            .json({ message: 'The registration has been deleted' });
    }
}

export default new RegistrationController();
