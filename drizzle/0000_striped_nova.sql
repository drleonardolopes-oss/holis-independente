CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`patient` text NOT NULL,
	`created` text NOT NULL,
	`payload` text NOT NULL
);
