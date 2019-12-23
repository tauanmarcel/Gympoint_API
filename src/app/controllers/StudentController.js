import * as Yup from 'yup';
import Sequelize, { Op } from 'sequelize';

import Student from '../models/Student';

class StudentController {
    async index(req, res) {
        const { name = '' } = req.query;

        const student = await Student.findAll({
            where: Sequelize.where(
                Sequelize.fn('lower', Sequelize.col('name')),
                { [Op.like]: Sequelize.fn('lower', `%${name}%`) }
            ),
            order: [['name', 'ASC']]
        });

        return res.status(200).json(student);
    }

    async show(req, res) {
        const { id } = req.params;

        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(400).json({ error: 'Student not found!' });
        }

        return res.status(200).json(student);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string()
                .email()
                .required(),
            birth: Yup.date().required(),
            weight: Yup.number().required(),
            height: Yup.number().required()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const emailExists = await Student.findOne({
            where: {
                email: req.body.email
            }
        });

        if (emailExists) {
            return res.status(400).json({ error: 'E-mail already exists!' });
        }

        const student = await Student.create(req.body);

        return res.json(student);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            birth: Yup.date(),
            weight: Yup.number(),
            height: Yup.number()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(400).json({ error: 'Studend not found.' });
        }

        const studentUpdated = await student.update(req.body);

        return res.status(200).json(studentUpdated);
    }

    async delete(req, res) {
        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(400).json({ error: 'Student not found!' });
        }

        if (!student.destroy()) {
            return res.json({ error: 'Error deleting student' });
        }

        return res.json({ message: 'Student has deleted successfully!' });
    }
}

export default new StudentController();
