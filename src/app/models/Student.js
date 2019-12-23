import Sequelize, { Model } from 'sequelize';

class Student extends Model {
    static init(sequelize) {
        super.init(
            {
                name: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                birth: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                weight: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                height: {
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

export default Student;
