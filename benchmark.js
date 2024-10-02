import process from "process";
import { nanoid } from "nanoid";
import Database from "better-sqlite3";

const n = 1000000;
const nToSelect = 100;

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

console.time();
if (process.argv[2] === "combined") {
  const qs = `SELECT * FROM test WHERE id IN (${idsToSelect
    .map(() => "?")
    .join(", ")})`;
  const get = db.prepare(qs);
  get.all(idsToSelect);
} else if (process.argv[2] === "separate") {
  const get = db.prepare("SELECT * FROM test WHERE id = ?", 1);
  for (const i of idsToSelect) {
    get.all([i]);
  }
} else {
  console.log("please provide either 'combined' or 'separate' as an argument");
}

console.timeEnd();
