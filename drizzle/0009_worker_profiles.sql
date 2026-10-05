CREATE TABLE worker_profiles (
 worker TEXT PRIMARY KEY NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
 phone TEXT NOT NULL DEFAULT '',
 account_holder TEXT NOT NULL DEFAULT '',
 bank_name TEXT NOT NULL DEFAULT '',
 account_number TEXT NOT NULL DEFAULT '',
 ifsc TEXT NOT NULL DEFAULT ''
);
CREATE TABLE worker_files (
 id TEXT PRIMARY KEY NOT NULL,
 worker TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 type TEXT NOT NULL,
 kind TEXT NOT NULL,
 data TEXT NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX worker_files_worker ON worker_files(worker);
