import Sequelize, { Model } from 'sequelize';

class Student extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                email: Sequelize.STRING,
                birht: Sequelize.DATE,
                weight: Sequelize.FLOAT,
                height: Sequelize.FLOAT
            },
            {
                sequelize
            }
        );

        return this;
    }
}

export default Student;
