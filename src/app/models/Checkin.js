import Sequelize, { Model } from 'sequelize';

class Checkin extends Model {
    static init(sequelize) {
        super.init(
            {
                student_id: {
                    type: Sequelize.INTEGER,
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

export default Checkin;
