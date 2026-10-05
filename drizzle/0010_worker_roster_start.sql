CREATE TABLE worker_roster_start (
  worker TEXT PRIMARY KEY REFERENCES workers(id) ON DELETE CASCADE,
  date TEXT NOT NULL
);
INSERT INTO worker_roster_start(worker,date)
SELECT w.id,COALESCE((SELECT MIN(a.date) FROM attendance a WHERE a.worker=w.id),date('now','+5 hours','+30 minutes')) FROM workers w;
