CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`worker` text NOT NULL,
	`date` text NOT NULL,
	`site` text,
	`units` integer NOT NULL,
	`rate` integer NOT NULL,
	FOREIGN KEY (`worker`) REFERENCES `workers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`site`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_worker_date` ON `attendance` (`worker`,`date`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`worker` text NOT NULL,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`kind` text NOT NULL,
	FOREIGN KEY (`worker`) REFERENCES `workers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`rate` integer NOT NULL
);
