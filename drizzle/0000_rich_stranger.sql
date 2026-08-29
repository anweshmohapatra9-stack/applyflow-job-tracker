CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'applied' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`applied_on` text,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_applications_user_status` ON `applications` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_applications_user_updated` ON `applications` (`user_id`,`updated_at`);