import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
    async index(_, res) {
        const plans = await Plan.findAll();

        res.status(200).json(plans);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string().required(),
            duration: Yup.number().required(),
            price: Yup.number().required()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const planExists = await Plan.findOne({
            where: {
                title: req.body.title
            }
        });

        if (planExists) {
            return res
                .status(400)
                .json({ error: 'A plan with equal name already exists' });
        }

        const plan = await Plan.create(req.body);

        return res.json(plan);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            title: Yup.string(),
            duration: Yup.number(),
            price: Yup.number()
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const plan = await Plan.findByPk(req.params.id);

        if (!plan) {
            res.status(400).json({ error: 'Plan not found' });
        }

        const updatedPlan = await plan.update(req.body);

        return res.status(200).json(updatedPlan);
    }

    async delete(req, res) {
        const plan = await Plan.findByPk(req.params.id);

        if (!plan) {
            res.status(400).json({ error: 'Plan not found' });
        }

        await Plan.destroy({
            where: { id: req.params.id }
        });

        return res.status(200).json({
            success: `The ${plan.title} plan was successfully deleted`
        });
    }
}

export default new PlanController();
