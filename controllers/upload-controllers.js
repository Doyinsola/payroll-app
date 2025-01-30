const knex = require("knex")(require("../knexfile"));
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const { rejects } = require("assert");

function deleteUploads(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
        } else {
            console.log("File deleted successfully.");
        }
    });

}

function parseFile(fileContent) {
    return new Promise((resolve, reject) => {
        let payrollData = [];
        Papa.parse(fileContent, {
            header: true,
            step: (results) => {
                payrollData.push(results.data)
            },
            complete: () => {
                resolve(payrollData);
            },
            error: (err) => {
                reject(err)
            }
        })
    })
}

const handleUploads = async (req, res) => {

    const trx = await knex.transaction();
    const file = req.file;
    const filePath = req.file.path;
    const fileName = file.originalname;
    const reportID = parseInt(fileName.split('-')[2].split('.')[0]);

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {

        const reportExists = await trx('time_reports').where('id', reportID).first();

        if (reportExists) {
            deleteUploads(filePath);
            return res.status(400).send("Report with this ID alread exists")
        }
        else {
            await trx('time_reports')
                .insert({
                    id: reportID,
                    report_name: fileName,
                    uploaded_at: trx.fn.now(),
                })

            const fileContent = fs.createReadStream(filePath);
            let payrollData = await parseFile(fileContent);
            let workedHours = [];

            for (let payEntry of payrollData) {

                const { date, 'hours worked': hours_worked, 'employee id': employee_ID, 'job group': jobGroup } = payEntry;
                const [day, month, year] = date.split('/');
                const workDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                const hoursWorked = parseFloat(hours_worked)
                const employeeID = parseInt(employee_ID)

                let employee = await trx('employees').where('id', employeeID).first();
                if (!employee) {
                    await trx('employees').insert({ id: employeeID });
                }

                workedHours.push({
                    report_id: reportID,
                    employee_id: employeeID,
                    work_date: workDate,
                    hours_worked: hoursWorked,
                    job_group: jobGroup,
                })
            }

            await trx.batchInsert('worked_hours', workedHours);
            await trx.commit();
        }
        deleteUploads(filePath);
        res.status(200).json({ message: `File ${fileName} uploaded and processed successfully` });

    } catch (error) {
        await trx.rollback();
        console.log(error);
        deleteUploads(filePath);
        return res.status(500).send('Issue uploading file');
    }

}

module.exports = {
    handleUploads,
}
