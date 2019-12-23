import Sequelize, { Model } from 'sequelize';
import { isBefore, isAfter } from 'date-fns';

class Registration extends Model {
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
                    type: Sequelize.VIRTUAL(Sequelize.BOOLEAN, [
                        'start_date',
                        'end_date'
                    ]),
                    get() {
                        return (
                            isBefore(this.get('start_date'), new Date()) &&
                            isAfter(this.get('end_date'), new Date())
                        );
                    }
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

export default Registration;
