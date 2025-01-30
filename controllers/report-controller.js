const knex = require("knex")(require("../knexfile"));

function getPayPeriod(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let startDate, endDate;

    if (day <= 15) {
        startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        endDate = `${year}-${month.toString().padStart(2, '0')}-15`;
    } else {
        startDate = `${year}-${month.toString().padStart(2, '0')}-16`;
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
    }

    // if (workDate.getDate() <= 15) {
    //     startDate = new Date(workDate.getFullYear(), workDate.getMonth(), 1)
    //     endDate = new Date(workDate.getFullYear(), workDate.getMonth(), 15)
    // }
    // else {
    //     startDate = new Date(workDate.getFullYear(), workDate.getMonth(), 16)
    //     endDate = new Date(workDate.getFullYear(), workDate.getMonth() + 1, 0)
    // }

    return {
        startDate: startDate,
        endDate: endDate,
    };
}

const handleReports = async (_req, res) => {
    const employeeReports = [];

    try {
        const workedHours = await knex
            .select('worked_hours.employee_id',
                'worked_hours.work_date',
                'worked_hours.hours_worked',
                'job_groups.hourly_rate',
            )
            .from('worked_hours')
            .join('employees', 'employee_id', 'employees.id')
            .join('job_groups', 'worked_hours.job_group', 'job_groups.job_group')
            .orderBy('worked_hours.employee_id', 'worked_hours.work_date');

        for (dataEntry of workedHours) {

            const { employee_id: employeeID, work_date, hours_worked, hourly_rate } = dataEntry;
            const hoursWorked = Number(hours_worked);
            const hourlyRate = Number(hourly_rate);
            const workDate = new Date(work_date);
            const amountPaid = hoursWorked * hourlyRate;
            const payPeriod = getPayPeriod(workDate);

            let existingReport = employeeReports.find(entry =>
                entry.employeeID === employeeID &&
                entry.payPeriod.startDate === payPeriod.startDate &&
                entry.payPeriod.endDate === payPeriod.endDate
            );

            if (existingReport) {
                existingReport.amountPaid += amountPaid;
            }
            else {
                employeeReports.push({
                    employeeID: employeeID,
                    payPeriod: payPeriod,
                    amountPaid: amountPaid,
                })
            }
        }

        employeeReports.sort((a, b) => {
            if (a.employeeID !== b.employeeID) {
                return a.employeeID - b.employeeID;
            }
            return new Date(a.payPeriod.startDate) - new Date(b.payPeriod.startDate);
        });

        res.status(200).json({
            payrollReport: {
                employeeReports: employeeReports,
            },
        });

    } catch (error) {
        console.error("Error generating payroll report:", error);
        res.status(500).json({ error: 'Issue retrieving report' });
    }

}

module.exports = {
    handleReports,
}