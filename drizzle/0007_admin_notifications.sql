CREATE TABLE `admin_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`attendance_date` text,
	`supervisor` text,
	`created_at` integer NOT NULL,
	`read_at` integer
);
CREATE INDEX `admin_notifications_created` ON `admin_notifications` (`created_at`);
