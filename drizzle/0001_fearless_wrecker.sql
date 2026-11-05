CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`created` text NOT NULL,
	`payload` text NOT NULL
);
