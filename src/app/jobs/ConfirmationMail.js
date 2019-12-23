import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Mail from '../../lib/Mail';

class ConfirmationMail {
    get key() {
        return 'ConfirmationMail';
    }

    async handle({ data }) {
        const { registration, student, plan } = data;

        await Mail.sendMail({
            to: `${student.name} <${student.email}>`,
            subject: 'Gympoint - Confirmação de Matrícula',
            template: 'welcome',
            context: {
                student: student.name,
                planName: plan.title,
                endDate: format(
                    parseISO(registration.end_date),
                    "dd 'de' MMMM 'de' Y",
                    {
                        locale: ptBR
                    }
                ),
                price: registration.price
            }
        });
    }
}

export default new ConfirmationMail();
