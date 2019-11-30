import * as Yup from 'yup';
import {
    parseISO,
    isBefore,
    isToday,
    getHours,
    addMonths,
    startOfDay
} from 'date-fns';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

import ConfirmationMail from '../jobs/ConfirmationMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
    async index(_, res) {
        const enrollment = await Enrollment.findAll({
            where: {
                active: true
            },
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
            ]
        });

        return res.status(200).json(enrollment);
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

        const studentExists = await Enrollment.findOne({
            where: {
                student_id,
                active: true
            }
        });

        if (studentExists) {
            if (
                !isBefore(studentExists.end_date, new Date()) &&
                studentExists.active
            ) {
                return res
                    .status(400)
                    .json({ error: 'The student already has a plan' });
            }
        }

        const price = plan.duration * plan.price;

        const enrollment = await Enrollment.create({
            student_id,
            plan_id,
            start_date,
            end_date,
            price
        });

        await Queue.add(ConfirmationMail.key, {
            enrollment,
            student,
            plan
        });

        return res.status(200).json(enrollment);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            plan_id: Yup.number(),
            start_date: Yup.date()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const enrollment = await Enrollment.findByPk(req.params.id);

        /**
         * As alterações só estarão disponíveis caso o plano ainda não tenha entrado em vigência
         */
        if (isBefore(enrollment.start_date, new Date())) {
            return res.status(400).json({
                error: "The Enrollment is don't disponible for alterations"
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
                    id: enrollment.plan_id
                }
            });

            objUpdate.start_date = start_date;
            objUpdate.end_date = addMonths(start_date, currentPlan.duration);
        } else {
            objUpdate.start_date = enrollment.start_date;
            objUpdate.end_date = enrollment.end_date;
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
                    enrollment.start_date,
                    plan.duration
                );
            }

            objUpdate.plan_id = plan_id;
            objUpdate.price = plan.duration * plan.price;
        } else {
            objUpdate.plan_id = enrollment.plan_id;
            objUpdate.price = enrollment.price;
        }

        const updatedEnrollment = await enrollment.update(objUpdate);

        return res.status(200).json(updatedEnrollment);
    }

    async delete(req, res) {
        const enrollment = await Enrollment.findByPk(req.params.id);

        if (!enrollment) {
            return res.status(200).json({ error: 'Enrollment not found' });
        }

        await enrollment.update({
            active: false
        });

        return res
            .status(200)
            .json({ message: 'The enrollment has been deactivated' });
    }
}

export default new EnrollmentController();
