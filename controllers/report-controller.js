const knex = require("knex")(require("../knexfile"));

const handleReports = async (req, res) => {
    const payrollReport = { "payrollReport": { "employeeReports": [] } };

    try {
        const data = await knex
            .select('worked_hours.employee_id',
                'worked_hours.work_date',
                'worked_hours.hours_worked',
                'job_groups.hourly_rate',
            )
            .from('worked_hours')
            .join('employees', 'employee_id', 'employees.id')
            .join('job_groups', 'worked_hours.job_group', 'job_groups.job_group');

        console.log(data)
        res.status(200).json(data)

    } catch (error) {
        console.log(error);
        return res.status(500).send('Issue retrieving report');
    }

}

module.exports = {
    handleReports,
}