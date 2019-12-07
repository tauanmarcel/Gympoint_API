import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import AnswerMail from '../jobs/AnswerMail';

class HelpOrderController {
    async index(req, res) {
        const helpOrders = await HelpOrder.findAll({
            where: {
                answer: null
            }
        });

        if (!helpOrders) {
            return res.status(400).json('No Help Orders find!');
        }

        return res.status(200).json(helpOrders);
    }

    async listForStudent(req, res) {
        const { page = 1 } = req.query;
        const limit = 3;

        const { student_id } = req.params;

        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student not found!' });
        }

        const helpOrders = await HelpOrder.findAll({
            where: {
                student_id
            },
            order: [['id', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        if (!helpOrders) {
            return res.status(400).json('No Help Orders find!');
        }

        return res.status(200).json(helpOrders);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            question: Yup.string().required()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { student_id } = req.params;
        const { question } = req.body;

        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student not found!' });
        }

        const helpOrder = await HelpOrder.create({
            student_id,
            question
        });

        return res.status(200).json(helpOrder);
    }

    async answer(req, res) {
        const schema = Yup.object().shape({
            answer: Yup.string().required()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { id, student_id } = req.params;
        const { answer } = req.body;

        const helpOrder = await HelpOrder.findByPk(id);

        if (!helpOrder) {
            return res.status(400).json({ error: 'Help Order not found!' });
        }

        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(400).json({ error: 'Student not found!' });
        }

        const updatedHelpOrder = await helpOrder.update({
            answer,
            answer_at: new Date()
        });

        await Queue.add(AnswerMail.key, {
            student,
            help_order: updatedHelpOrder
        });

        return res.status(200).json(updatedHelpOrder);
    }
}

export default new HelpOrderController();
