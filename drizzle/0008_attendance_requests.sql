CREATE TABLE attendance_requests (
 id TEXT PRIMARY KEY NOT NULL,
 supervisor TEXT NOT NULL,
 date TEXT NOT NULL,
 changes TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending',
 created_at INTEGER NOT NULL,
 reviewed_by TEXT,
 reviewed_at INTEGER
);
CREATE UNIQUE INDEX attendance_request_pending ON attendance_requests(supervisor,date) WHERE status='pending';
