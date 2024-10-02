### sqlite-many-get-test

A quick benchmark to compare different ways to get multiple rows from a Sqlite database by primary key. This script compares:

- "separate" - making many single row queries with a `WHERE id = ?` condition
- "combined" - making a single query with a `WHERE id IN (?, ?, ...)` condition
- "or" - making a single query with a `WHERE id = ? OR id = ? OR id = ? OR ...` condition

Each test creates 1,000,000 rows in a table with a single column `id` of type `TEXT PRIMARY KEY`. Each id is a unique string generated using `nanoid`. A number of random samples of the primary keys are chosen (100 samples). It then uses one of the three above strategies to run a `SELECT` query on the table to retrieve all of the rows with the sample primary keys. The below table shows the mean and median amount of time it took to run those select queries, written as "mean/median".

| Sample size | separate        | combined        | or              |
| ----------- | --------------- | --------------- | --------------- |
| 10          | 0.509ms/0.039ms | 0.042ms/0.041ms | 0.035ms/0.031ms |
| 20          | 0.046ms/0.044ms | 0.048ms/0.045ms | 0.059ms/0.055ms |
| 50          | 0.409ms/0.267ms | 0.486ms/0.148ms | 0.465ms/0.143ms |
| 100         | 0.564ms/0.192ms | 0.200ms/0.181ms | 0.270ms/0.256ms |
| 1000        | 1.467ms/1.416ms | 1.670ms/1.603ms | N/A             |

The "or" strategy cannot run for a sample with 1000 items because the resulting expression tree is too large (the maximum depth is 1000).

<details>
<summary>Error message</summary>

```
/Users/bob/code/work/canvas/sqlite-many-get-test/node_modules/.pnpm/better-sqlite3@11.3.0/node_modules/better-sqlite3/lib/methods/wrappers.js:5
	return this[cppdb].prepare(sql, this, false);
	                   ^
SqliteError: Expression tree is too large (maximum depth 1000)
    at Database.prepare (/Users/bob/code/work/canvas/sqlite-many-get-test/node_modules/.pnpm/better-sqlite3@11.3.0/node_modules/better-sqlite3/lib/methods/wrappers.js:5:21)
    at file:///Users/bob/code/work/canvas/sqlite-many-get-test/benchmark.js:49:18
    at ModuleJob.run (node:internal/modules/esm/module_job:218:25)
    at async ModuleLoader.import (node:internal/modules/esm/loader:329:24)
    at async loadESM (node:internal/process/esm_loader:28:7)
    at async handleMainPromise (node:internal/modules/run_main:120:12) {
  code: 'SQLITE_ERROR'
}
```

</details>
