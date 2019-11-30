import Bee from 'bee-queue';
import ConfirmationMail from '../app/jobs/ConfirmationMail';
import AnswerMail from '../app/jobs/AnswerMail';
import redisConfig from '../config/redis';
import Mail from './Mail';

const jobs = [ConfirmationMail, AnswerMail];

class Queue {
    constructor() {
        this.queues = {};

        this.init();
    }

    init() {
        jobs.forEach(({ key, handle }) => {
            this.queues[key] = {
                bee: new Bee(key, {
                    redis: redisConfig
                }),
                handle
            };
        });
    }

    add(queue, job) {
        return this.queues[queue].bee.createJob(job).save();
    }

    processQueue() {
        jobs.forEach(job => {
            const { bee, handle } = this.queues[job.key];

            bee.on('failed', this.handleFailure).process(handle);
        });
    }

    async handleFailure(job, err) {
        console.log('falha ao enviar o e-mail');

        await Mail.sendMail({
            to: 'Tauan Oliveira <admin@gympoint.com>',
            subject: 'Falha no envio do e-mail de confirmação',
            template: 'failure',
            context: {
                queueName: job.queue.name,
                error: err
            }
        });
    }
}

export default new Queue();
