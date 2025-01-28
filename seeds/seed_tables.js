/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

const employeesData = require('../seed-data/employees');
const jobGroupsData = require('../seed-data/job_groups');

exports.seed = async function (knex) {
  await knex('employees').del();
  await knex('job_groups').del();
  await knex('employees').insert(employeesData);
  await knex('job_groups').insert(jobGroupsData);
};