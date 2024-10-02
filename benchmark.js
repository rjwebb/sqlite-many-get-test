import process from "process";
import { nanoid } from "nanoid";
import Database from "better-sqlite3";

const n = 1000000;
const nToSelect = parseInt(process.argv[2]);

console.log("generating random data...");
const allIds = Array(n)
  .fill(0)
  .map(() => nanoid());

const idsToSelect = [];

for (let i = 0; i < nToSelect; i++) {
  const i = Math.floor(Math.random() * n);
  idsToSelect.push(allIds[i]);
}

idsToSelect.sort();

console.log("creating database...");
const db = new Database(":memory:");

db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");

console.log("populating values...");
for (const i of allIds) {
  db.prepare("INSERT INTO test (name) VALUES (?)").run(`name${i}`);
}

console.log("performing queries...");

const strategy = process.argv[3];

console.time("time");
if (strategy === "combined") {
  const qs = `SELECT * FROM test WHERE id IN (${idsToSelect
    .map(() => "?")
    .join(", ")})`;
  const get = db.prepare(qs);
  get.all(idsToSelect);
} else if (strategy === "separate") {
  const get = db.prepare("SELECT * FROM test WHERE id = ?");
  for (const i of idsToSelect) {
    get.all([i]);
  }
} else if (strategy === "or") {
  const whereClauses = idsToSelect.map(() => "id = ?");

  const get = db.prepare(
    `SELECT * FROM test WHERE ${whereClauses.join(" OR ")}`
  );
  get.all(idsToSelect);
} else {
  console.log("please provide either 'combined' or 'separate' as an argument");
}

console.timeEnd("time");
