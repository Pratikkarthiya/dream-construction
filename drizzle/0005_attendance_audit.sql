CREATE TABLE `attendance_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`attendance_id` text NOT NULL,
	`worker` text NOT NULL,
	`date` text NOT NULL,
	`site` text,
	`units` integer NOT NULL,
	`rate` integer NOT NULL,
	`ot_hours` integer DEFAULT 0 NOT NULL,
	`marked_by` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`changed_at` integer NOT NULL
);
CREATE INDEX `attendance_audit_date` ON `attendance_audit` (`date`);
CREATE INDEX `attendance_audit_worker` ON `attendance_audit` (`worker`);
