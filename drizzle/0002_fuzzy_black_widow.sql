CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`record_id` text,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`owner_email` text NOT NULL,
	`primary_color` text DEFAULT '#22513f' NOT NULL,
	`logo` text DEFAULT '' NOT NULL,
	`contact` text NOT NULL,
	`legal_name` text DEFAULT '' NOT NULL,
	`tax_id` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`plan` text DEFAULT 'trial' NOT NULL,
	`plan_until` text,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clinics_slug_unique` ON `clinics` (`slug`);--> statement-breakpoint
CREATE TABLE `clinic_members` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clinic_email` ON `clinic_members` (`clinic_id`,`email`);--> statement-breakpoint
CREATE TABLE `patient_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`expires` text NOT NULL,
	`accepted_at` text NOT NULL,
	`notice_version` text NOT NULL,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `assessments` ADD `clinic_id` text REFERENCES clinics(id);--> statement-breakpoint
ALTER TABLE `submissions` ADD `clinic_id` text REFERENCES clinics(id);