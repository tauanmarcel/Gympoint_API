import User from '../models/User';

export default async (req, res, next) => {
    const { admin } = await User.findByPk(req.userId);

    if (!admin) {
        return res.status(400).json({ error: 'You is not a admin user.' });
    }

    return next();
};
