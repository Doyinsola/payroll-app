## Project Description

Prototyping a new payroll system API. A front end (that hasn't been developed yet, but will likely be a single page application) is going to use our API to achieve two goals:

1. Upload a CSV file containing data on the number of hours worked per day per employee
2. Retrieve a report detailing how much each employee should be paid in each _pay period_

All employees are paid by the hour (there are no salaried employees.) Employees belong to one of two _job groups_ which determine their wages; job group A is paid $20/hr, and job group B is paid $30/hr. Each employee is identified by a string called an "employee id" that is globally unique in our system.

Hours are tracked per employee, per day in comma-separated value files (CSV).
Each individual CSV file is known as a "time report", and will contain:

1. A header, denoting the columns in the sheet (`date`, `hours worked`, `employee id`, `job group`)
2. 0 or more data rows

In addition, the file name should be of the format `time-report-x.csv`,
where `x` is the ID of the time report represented as an integer. For example, `time-report-42.csv` would represent a report with an ID of `42`.

Assumptions:

1. Columns will always be in that order.
2. There will always be data in each column and the number of hours worked will always be greater than 0.
3. There will always be a well-formed header line.
4. There will always be a well-formed file name.

A sample input file named `time-report-42.csv` is included in this repo.

### What API does:

API will have the following endpoints to serve HTTP requests:

1. An endpoint for uploading a file.

   - This file will conform to the CSV specifications outlined in the previous section.
   - Upon upload, the timekeeping information within the file must be stored to a database for archival purposes.
   - If an attempt is made to upload a file with the same report ID as a previously uploaded file, this upload should fail with an error message indicating that this is not allowed.

2. An endpoint for retrieving a payroll report structured in the following way:

   _NOTE:_ It is not the responsibility of the API to return HTML, as we will delegate the visual layout and redering to the front end. The expectation is that this API will only return JSON data.

   - Return a JSON object `payrollReport`.
   - `payrollReport` will have a single field, `employeeReports`, containing a list of objects with fields `employeeId`, `payPeriod`, and `amountPaid`.
   - The `payPeriod` field is an object containing a date interval that is roughly biweekly. Each month has two pay periods; the _first half_ is from the 1st to the 15th inclusive, and the _second half_ is from the 16th to the end of the month, inclusive. `payPeriod` will have two fields to represent this interval: `startDate` and `endDate`.
   - Each employee should have a single object in `employeeReports` for each pay period that they have recorded hours worked. The `amountPaid` field should contain the sum of the hours worked in that pay period multiplied by the hourly rate for their job group.
   - If an employee was not paid in a specific pay period, there should not be an object in `employeeReports` for that employee + pay period combination.
   - The report should be sorted in some sensical order (e.g. sorted by employee id and then pay period start.)
   - The report should be based on all _of the data_ across _all of the uploaded time reports_, for all time.

## Installation Instructions

- Git clone the repo to get it locally
- Run `npm install` to install dependencies
- In MySQL, create database CREATE DATABASE <DB_NAME>
- Set up .env file, include:

  ```js
  PORT=8080
  DB_HOST=127.0.0.1
  DB_NAME=<YOUR_DB_NAME>
  DB_USER=<YOUR_DB_USER>
  DB_PASSWORD=<YOUR_DB_PASSWORD>
  SECRET_KEY=""
  ```

- To generate a secret key you can run this line of code in the Terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"`
- Run `npm run dev` to start the app
- With these configs the server URL will be `http://localhost:8080`
- Migrations and seeds are included, to run them:

  - npm run migrate
  - npm run seed

- Data should be populated in the database and can be accessed using the corresponding method for the endpoint using Postman
- Endpoints are:

  [POST] /uploads - to upload files

  ```
  {
      "message": "File time-report-42.csv uploaded and processed successfully"
  }
  ```

  [GET] /reports - to generate reports

  ```
  Sample output
  {
      "payrollReport": {
          "employeeReports": [
              {
                  "employeeID": 1,
                  "payPeriod": {
                      "startDate": "2023-11-01",
                      "endDate": "2023-11-15"
                  },
                  "amountPaid": 150
              },
              {
                  "employeeID": 1,
                  "payPeriod": {
                      "startDate": "2023-11-16",
                      "endDate": "2023-11-30"
                  },
                  "amountPaid": 220
              },
          ]
      }
  }
  ```

### Database Schema:

- Worked_hours

  - id(PK): unique identifier of each record in the table
  - report_id (FK): unique identifier for each file
  - employee_id(FK): to uniquely identify users
  - work_date: to store the date(s) the employee worked
  - hours_worked: to store the number of hours worked by each employee
  - job_group(FK): to store the employee's Job category
  - Date: to store the date on which the employee worked

- Time_reports:

  - report_id(PK): unique identifier for each file
  - report_name: name of the file uploaded
  - uploaded_at: timestamp when the file was uploaded

- Employee

  - employee_id(PK): to uniquely store users in the system

- Job_group

  - category(PK): to store the job class(e.g. "A", "B")
  - hourly_rate: to store the job pay (e.g. 20.00, 30.00)

## Tests

- Validated data in MySQL workbench
- Tested endpoints in postman
- Verified error is returned when no file is uploaded.
- Verified the same file can't be uploaded more than once.
- Verified the JSON structure produced by the code matched the exact format specified in the requirements, including field names, data types, and nesting.

## Improvements to make this app production ready

- **Comprehensive Testing:**

  - **Unit Tests:** testing individual functions (`parseFile`, database interaction functions, `getPayPeriod`, report generation logic)
  - **Integration Tests:** verifying the interaction between the file upload endpoint, the database, and the report generation endpoint. These tests would involve uploading test files and checking the database and API response.
  - **End-to-End Tests:** Would test the entire flow, from file upload to report retrieval, simulating real user interactions.

- **Robust Input Validation:**

  - **File Upload Validation:** Check file is correct type
  - **CSV Data Validation:** Validating the format and content of the CSV data (column order, date format, numeric values, required fields, well-formed header line). Use a schema validation library.
  - **Report ID Validation:** Ensuring report IDs are in the correct format.

- **Enhanced Error Handling:**

  - More specific error messages to the client.
  - Detailed logging (using a logging library like Winston or Bunyan) to track errors and debug issues.
  - Centralized error handling middleware.

- **Security:**

  - **Authentication and Authorization:** Implement user authentication and authorization to protect the API endpoints.
  - **File Storage:** storing uploaded files in cloud storage (AWS S3, Google Cloud Storage) or a dedicated file server instead of directly on the server's file system. This also improves scalability and resilience.

- **Performance Optimization:**

  - **Database Indexing:** Ensure appropriate indexes are in place on the database tables for efficient queries.
  - **Caching:** Cache frequently accessed data (e.g., employee data) to reduce database load.

## Compromises made due to the time constraint

- **Limited Testing:** performed manual checks and example simulations, but did not write formal unit, integration, or end-to-end tests. Thorough testing is crucial for production-ready code.
- **Error Handling:** The error handling is basic, with generic messages being logged to the console. In a production environment, more detailed error handling and logging should be implemented to track issues over time.
