/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable("employees", (table) => {
            table.increments("id").primary();
        })
        .createTable("job_groups", (table) => {
            table.string("job_group").primary();
            table.decimal("hourly_rate", 10, 2).notNullable();
        })
        .createTable("time_reports", (table) => {
            table.increments("id").primary();
            table.string("report_name").unique().notNullable();
            table.timestamp("uploaded_at").defaultTo(knex.fn.now());
        })
        .createTable("worked_hours", (table) => {
            table.increments("id").primary();
            table
                .integer("report_id")
                .unsigned()
                .references("time_reports.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
            table
                .integer("employee_id")
                .unsigned()
                .references("employees.id")
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
            table.date("work_date").notNullable();
            table.decimal("hours_worked", 5, 2).notNullable();
            table
                .string("job_group")
                .references("job_groups.job_group")
                .onUpdate("CASCADE")
                .onDelete("CASCADE");
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("worked_hours")
        .dropTableIfExists("time_reports")
        .dropTableIfExists("job_groups")
        .dropTableIfExists("employees");
};
