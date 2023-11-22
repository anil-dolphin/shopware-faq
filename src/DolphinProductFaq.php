<?php

declare(strict_types=1);

namespace Dolphin\Productfaq;

use Shopware\Core\Framework\Plugin\Context\UninstallContext;
use Shopware\Core\Framework\Plugin;

class DolphinProductFaq extends Plugin
{
    public function uninstall(UninstallContext $uninstallContext): void
    {
        if (!$uninstallContext->keepUserData()) {
            $this->dropTable();
        }
        parent::uninstall($uninstallContext);
    }
    private function dropTable(): void
    {
        $connection = $this->container->get('Doctrine\DBAL\Connection');

        $query = 'DROP TABLE IF EXISTS dolphin_product_faq';
        $connection->executeQuery($query);

        $sql = "DELETE FROM mail_template
        WHERE mail_template_type_id IN (
            SELECT id
            FROM mail_template_type
            WHERE technical_name IN ('product_faq_email', 'product_faq_email_customer')
        )";

        $connection->executeQuery($sql);

        $sql_mail_template_type = "DELETE FROM mail_template_type
        WHERE technical_name IN ('product_faq_email', 'product_faq_email_customer')";

        $connection->executeQuery($sql_mail_template_type);
    }
}
