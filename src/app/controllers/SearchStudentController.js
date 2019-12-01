import Student from '../models/Student';

class SearchStudentController {
    async store(req, res) {
        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(400).json({ error: 'Student not found' });
        }

        return res.json({ student });
    }
}

export default new SearchStudentController();
