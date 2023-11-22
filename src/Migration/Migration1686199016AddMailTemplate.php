<?php

declare(strict_types=1);

namespace Dolphin\Productfaq\Migration;

use DateTime;
use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Uuid\Uuid;

class Migration1686199016AddMailTemplate extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1686199016;
    }

    public function update(Connection $connection): void
    {
        $mailTemplateTypeId = $this->createMailTemplateType($connection, 'product_faq_email');
        if ($mailTemplateTypeId) {
            $this->createMailTemplate($connection, $mailTemplateTypeId);
        }
        $emailTemplateTypeId = $this->createMailTemplateType($connection, 'product_faq_email_customer');
        if ($emailTemplateTypeId) {
            $this->createMailTemplateCustomer($connection, $emailTemplateTypeId);
        }
    }
    private function createMailTemplateType(Connection $connection, $technicalName): ?string
    {
        $mailTemplateTypeId = Uuid::randomHex();

        $enGbLangId = $this->getLanguageIdByLocale($connection, 'en-GB');
        $deDeLangId = $this->getLanguageIdByLocale($connection, 'de-DE');

        $englishName = 'Product FAQ Email Template';
        $germanName = 'Produkt-FAQ-E-Mail-Vorlage';

        $connection->executeStatement("
            INSERT IGNORE INTO `mail_template_type`
                (id, technical_name, available_entities, created_at)
            VALUES
                (:id, :technicalName, :availableEntities, :createdAt)
        ", [
            'id' => Uuid::fromHexToBytes($mailTemplateTypeId),
            'technicalName' => $technicalName,
            'availableEntities' => json_encode(['product' => 'product']),
            'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);

        if (!empty($enGbLangId)) {
            $connection->executeStatement("
            INSERT IGNORE INTO `mail_template_type_translation`
                (mail_template_type_id, language_id, name, created_at)
            VALUES
                (:mailTemplateTypeId, :languageId, :name, :createdAt)
            ", [
                'mailTemplateTypeId' => Uuid::fromHexToBytes($mailTemplateTypeId),
                'languageId' => $enGbLangId,
                'name' => $englishName,
                'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        if (!empty($deDeLangId)) {
            $connection->executeStatement("
            INSERT IGNORE INTO `mail_template_type_translation`
                (mail_template_type_id, language_id, name, created_at)
            VALUES
                (:mailTemplateTypeId, :languageId, :name, :createdAt)
            ", [
                'mailTemplateTypeId' => Uuid::fromHexToBytes($mailTemplateTypeId),
                'languageId' => $deDeLangId,
                'name' => $germanName,
                'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        return $mailTemplateTypeId;
    }
    private function getLanguageIdByLocale(Connection $connection, string $locale): ?string
    {

        $languageId = $connection->executeQuery('SELECT `language`.`id` FROM `language` INNER JOIN `locale` ON `locale`.`id` = `language`.`locale_id` WHERE `locale`.`code` = :code', ['code' => $locale])->fetchOne();

        if (empty($languageId)) {
            return null;
        }
        return $languageId;
    }
    private function createMailTemplate(Connection $connection, string $mailTemplateTypeId): void
    {
        $mailTemplateId = Uuid::randomHex();

        $enGbLangId = $this->getLanguageIdByLocale($connection, 'en-GB');
        $deDeLangId = $this->getLanguageIdByLocale($connection, 'de-DE');

        $connection->executeStatement("
        INSERT IGNORE INTO `mail_template`
            (id, mail_template_type_id, system_default, created_at)
        VALUES
            (:id, :mailTemplateTypeId, :systemDefault, :createdAt)
        ", [
            'id' => Uuid::fromHexToBytes($mailTemplateId),
            'mailTemplateTypeId' => Uuid::fromHexToBytes($mailTemplateTypeId),
            'systemDefault' => 0,
            'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);

        if (!empty($enGbLangId)) {
            $connection->executeStatement("
            INSERT IGNORE INTO `mail_template_translation`
                (mail_template_id, language_id, sender_name, subject, description, content_html, content_plain, created_at)
            VALUES
                (:mailTemplateId, :languageId, :senderName, :subject, :description, :contentHtml, :contentPlain, :createdAt)
            ", [
                'mailTemplateId' => Uuid::fromHexToBytes($mailTemplateId),
                'languageId' => $enGbLangId,
                'senderName' => '{{ salesChannel.name }}',
                'subject' => 'Product FAQ Question received',
                'description' => 'Product FAQ Quetions Email',
                'contentHtml' => $this->getContentHtmlEn(),
                'contentPlain' => $this->getContentPlainEn(),
                'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        if (!empty($deDeLangId)) {
            $connection->executeStatement("
            INSERT IGNORE INTO `mail_template_translation`
                (mail_template_id, language_id, sender_name, subject, description, content_html, content_plain, created_at)
            VALUES
                (:mailTemplateId, :languageId, :senderName, :subject, :description, :contentHtml, :contentPlain, :createdAt)
            ", [
                'mailTemplateId' => Uuid::fromHexToBytes($mailTemplateId),
                'languageId' => $deDeLangId,
                'senderName' => '{{ salesChannel.name }}',
                'subject' => 'Produkt-FAQ-Frage erhalten',
                'description' => 'Produkt-FAQ-Fragen per E-Mail',
                'contentHtml' => $this->getContentHtmlDe(),
                'contentPlain' => $this->getContentPlainDe(),
                'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }
    }

    private function getContentHtmlEn(): string
    {
        return '<div style="width: 1024px;margin: auto; border: 1px solid #c0c0c0;"> <table style="border-spacing: 0; max-width: 100%; width: 100%; padding: 10px;"> <tr> <td style="padding: 8px 8px 8px 0px;">Name</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.nickname}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Email</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.email}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Product SKU</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.product}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Product Name</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.product_name}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Question</td> <td style="border: 1px solid #c0c0c0; padding: 8px;">{{data.question}}</td> </tr> </table> <div style="background-color: #c0c0c0; padding: 10px; text-align: center; font-weight: 600;">Thank You</div> </div>';
    }

    private function getContentPlainEn(): string
    {
        return 'Name:{{data.nickname}},Email:{{data.email}},Product:{{data.product_name}},Question:{{data.question}}';
    }

    private function getContentHtmlDe(): string
    {
        return '<div style="width: 1024px;margin: auto; border: 1px solid #c0c0c0;"> <table style="border-spacing: 0; max-width: 100%; width: 100%; padding: 10px;"> <tr> <td style="padding: 8px 8px 8px 0px;">Name</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.nickname}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Email</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.email}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Produktnummer</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.product}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Produktname</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.product_name}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Question</td> <td style="border: 1px solid #c0c0c0; padding: 8px;">{{data.question}}</td> </tr> </table> <div style="background-color: #c0c0c0; padding: 10px; text-align: center; font-weight: 600;">Thank You</div> </div>';
    }

    private function getContentPlainDe(): string
    {
        return 'Name:{{data.nickname}},E-Mail:{{data.email}},Produkt:{{data.product_name}},Frage:{{data.question}}';
    }
    private function createMailTemplateCustomer(Connection $connection, string $mailTemplateTypeId): void
    {
        $mailTemplateId = Uuid::randomHex();

        $enGbLangId = $this->getLanguageIdByLocale($connection, 'en-GB');
        $deDeLangId = $this->getLanguageIdByLocale($connection, 'de-DE');

        $connection->executeStatement("
        INSERT IGNORE INTO `mail_template`
            (id, mail_template_type_id, system_default, created_at)
        VALUES
            (:id, :mailTemplateTypeId, :systemDefault, :createdAt)
        ", [
            'id' => Uuid::fromHexToBytes($mailTemplateId),
            'mailTemplateTypeId' => Uuid::fromHexToBytes($mailTemplateTypeId),
            'systemDefault' => 0,
            'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);

        if (!empty($enGbLangId)) {
            $connection->executeStatement("
            INSERT IGNORE INTO `mail_template_translation`
                (mail_template_id, language_id, sender_name, subject, description, content_html, content_plain, created_at)
            VALUES
                (:mailTemplateId, :languageId, :senderName, :subject, :description, :contentHtml, :contentPlain, :createdAt)
            ", [
                'mailTemplateId' => Uuid::fromHexToBytes($mailTemplateId),
                'languageId' => $enGbLangId,
                'senderName' => '{{ salesChannel.name }}',
                'subject' => 'Product FAQ Question received from Customer',
                'description' => 'Product FAQ Answer Email',
                'contentHtml' => $this->getContentHtmlEnCustomer(),
                'contentPlain' => $this->getContentPlainEnCustomer(),
                'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }

        if (!empty($deDeLangId)) {
            $connection->executeStatement("
            INSERT IGNORE INTO `mail_template_translation`
                (mail_template_id, language_id, sender_name, subject, description, content_html, content_plain, created_at)
            VALUES
                (:mailTemplateId, :languageId, :senderName, :subject, :description, :contentHtml, :contentPlain, :createdAt)
            ", [
                'mailTemplateId' => Uuid::fromHexToBytes($mailTemplateId),
                'languageId' => $deDeLangId,
                'senderName' => '{{ salesChannel.name }}',
                'subject' => 'Vom Kunden erhaltene FAQ zum Produkt',
                'description' => 'Produkt-FAQ-Antwort-E-Mail',
                'contentHtml' => $this->getContentHtmlDeCustomer(),
                'contentPlain' => $this->getContentPlainDeCustomer(),
                'createdAt' => (new DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]);
        }
    }

    private function getContentHtmlEnCustomer(): string
    {
        return '
        <div style="width: 1024px;margin: auto; border: 1px solid #c0c0c0;">
            <table style="border-spacing: 0; max-width: 100%; width: 100%; padding: 10px;">
                <tr>
                    <td style="padding: 8px 8px 8px 0px;">Question</td>
                    <td style="border: 1px solid #c0c0c0; padding: 8px;  border-bottom: 0;">{{data.question}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 8px 8px 0px;">Answer</td>
                    <td style="border: 1px solid #c0c0c0; padding: 8px;">{{data.answer}}</td>
                </tr>
            </table>
            <div style="background-color: #c0c0c0; padding: 10px; text-align: center; font-weight: 600;">Thank You</div>
        </div>
        ';
    }

    private function getContentPlainEnCustomer(): string
    {
        return 'Question:{{data.question}},Answer:{{data.answer}}';
    }

    private function getContentHtmlDeCustomer(): string
    {
        return '<div style="width: 1024px;margin: auto; border: 1px solid #c0c0c0;"> <table style="border-spacing: 0; max-width: 100%; width: 100%; padding: 10px;"> <tr> <td style="padding: 8px 8px 8px 0px;">Question</td> <td style="border: 1px solid #c0c0c0; padding: 8px; border-bottom: 0;">{{data.question}}</td> </tr> <tr> <td style="padding: 8px 8px 8px 0px;">Answer</td> <td style="border: 1px solid #c0c0c0; padding: 8px;">{{data.answer}}</td> </tr> </table> <div style="background-color: #c0c0c0; padding: 10px; text-align: center; font-weight: 600;">Thank You</div> </div>';
    }

    private function getContentPlainDeCustomer(): string
    {
        return 'Frage:{{data.question}},Antworten:{{data.answer}}';
    }
    public function updateDestructive(Connection $connection): void
    {
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
