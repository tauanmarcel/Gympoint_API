import Sequelize, { Model } from 'sequelize';

class Plan extends Model {
    static init(sequelize) {
        super.init(
            {
                title: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                duration: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                price: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                }
            },
            {
                sequelize
            }
        );

        return this;
    }
}

export default Plan;
