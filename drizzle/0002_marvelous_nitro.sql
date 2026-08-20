CREATE TABLE `leadStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadType` enum('inquiry','partnership') NOT NULL,
	`leadId` int NOT NULL,
	`fromStatus` varchar(40),
	`toStatus` varchar(40) NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `properties` ADD `neighborhood` varchar(160);--> statement-breakpoint
ALTER TABLE `properties` ADD `agentName` varchar(160);--> statement-breakpoint
ALTER TABLE `properties` ADD `agentWhatsapp` varchar(40);--> statement-breakpoint
ALTER TABLE `properties` ADD `developerName` varchar(180);--> statement-breakpoint
ALTER TABLE `properties` ADD `developerWhatsapp` varchar(40);