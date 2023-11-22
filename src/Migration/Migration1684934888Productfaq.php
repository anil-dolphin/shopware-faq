<?php

declare(strict_types=1);

namespace Dolphin\Productfaq\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

class Migration1684934888Productfaq extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1684934888;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement("CREATE TABLE IF NOT EXISTS  `dolphin_product_faq` (
            `id`            BINARY(16) NOT NULL,
            `active`        TINYINT(1) NULL DEFAULT 0,
            `email`         VARCHAR(255) NULL,
            `nickname`      VARCHAR(255) NULL,
            `question`      LONGTEXT NOT NULL,
            `answer`        LONGTEXT NULL,
            `product`      VARCHAR(255) NULL,
            `created_at`    DATETIME(3),
            `updated_at`    DATETIME(3),
            PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    }

    public function updateDestructive(Connection $connection): void
    {
        $connection->executeStatement('DROP TABLE IF EXISTS `dolphin_product_faq`');
    }
}
