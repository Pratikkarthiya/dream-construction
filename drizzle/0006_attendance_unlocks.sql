CREATE TABLE `attendance_unlocks` (
	`date` text NOT NULL,
	`supervisor` text NOT NULL,
	`unlocked_by` text NOT NULL,
	`unlocked_at` integer NOT NULL,
	PRIMARY KEY(`date`, `supervisor`)
);
