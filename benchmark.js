import process from "process";
import { nanoid } from "nanoid";
import Database from "better-sqlite3";

const n = 1000000;
const nToSelect = parseInt(process.argv[2]);
const numSamples = 100;

const allIds = Array(n)
  .fill(0)
  .map(() => nanoid());

const db = new Database(":memory:");

db.exec("CREATE TABLE test (id TEXT PRIMARY KEY)");

for (const id of allIds) {
  db.prepare("INSERT INTO test (id) VALUES (?)").run(id);
}

const strategy = process.argv[3];

// timings are in nanoseconds
const timings = [];

for (let t = 0; t < numSamples; t++) {
  const idsToSelect = [];

  for (let i = 0; i < nToSelect; i++) {
    const i = Math.floor(Math.random() * n);
    idsToSelect.push(allIds[i]);
  }

  // const startTime = Date.now();
  const startTime = process.hrtime();
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
    console.log(
      "please provide either 'combined' or 'separate' as an argument"
    );
  }

  const diff = process.hrtime(startTime);

  timings.push(diff[0] * 1e9 + diff[1]);
}

timings.sort();

const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
const meanMs = (mean / 1000000).toFixed(3) + "ms";

const median = timings[Math.floor(timings.length / 2)];
const medianMs = (median / 1000000).toFixed(3) + "ms";

console.log(strategy, nToSelect, meanMs, medianMs);
