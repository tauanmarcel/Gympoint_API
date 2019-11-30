import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Mail from '../../lib/Mail';

class ConfirmationMail {
    get key() {
        return 'AnswerMail';
    }

    async handle({ data }) {
        const { student, help_order } = data;

        await Mail.sendMail({
            to: `${student.name} <${student.email}>`,
            subject: 'Gympoint - Solicitação de Auxilio',
            template: 'answer',
            context: {
                student: student.name,
                question: help_order.question,
                answer: help_order.answer,
                date: format(
                    parseISO(help_order.answer_at),
                    "dd 'de' MMMM 'de' Y",
                    {
                        locale: ptBR
                    }
                )
            }
        });
    }
}

export default new ConfirmationMail();
