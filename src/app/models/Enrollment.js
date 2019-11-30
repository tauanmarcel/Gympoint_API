import Sequelize, { Model } from 'sequelize';

class Enrollment extends Model {
    static init(sequelize) {
        super.init(
            {
                student_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                plan_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                start_date: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                end_date: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                price: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                active: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true
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

        this.belongsTo(models.Plan, {
            foreignKey: 'plan_id',
            as: 'plan'
        });
    }
}

export default Enrollment;
