import Sequelize, { Model } from 'sequelize';

class HelpOrder extends Model {
    static init(sequelize) {
        super.init(
            {
                student_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                question: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                answer: {
                    type: Sequelize.STRING,
                    allowNull: true
                },
                answer_at: {
                    type: Sequelize.DATE,
                    allowNull: true
                }
            },
            {
                sequelize
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Student, {
            foreignKey: 'student_id',
            as: 'student'
        });
    }
}

export default HelpOrder;
