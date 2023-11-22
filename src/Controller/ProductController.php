<?php

declare(strict_types=1);

namespace Dolphin\Productfaq\Controller;

use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Content\Mail\Service\MailService;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Validation\DataBag\DataBag;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\OrFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\ContainsFilter;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class ProductController extends StorefrontController
{
    private $productFaqRepository;
    private $mailService;
    private $systemConfigService;

    public function __construct(
        EntityRepository $productFaqRepository,
        MailService $mailService,
        SystemConfigService $systemConfigService
    ) {
        $this->productFaqRepository = $productFaqRepository;
        $this->mailService = $mailService;
        $this->systemConfigService = $systemConfigService;
    }
    /**
     * @Route ("/productfaq/get", name="frontend.productfaq.get",defaults={"XmlHttpRequest"=true,"_routeScope"={"storefront"},"auth_required"=false}, methods={"POST","GET"})
     */
    public function getProductFaq(Request $request, SalesChannelContext $salesChannelContext): JsonResponse
    {
        try {
            $data = $request->request->all();
            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('active', '1'));
            $criteria->addFilter(new OrFilter([
                new ContainsFilter('product', $data['product']),
                new EqualsFilter('product', 'all')
            ]));
            $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));
            $criteria->setLimit((int)$data['limit']);
            $criteria->setOffset((int)$data['pageNumber'] - 1);

            $responce = [];
            $productFaqCollection = $this->productFaqRepository->search($criteria, $salesChannelContext->getContext())->getEntities();
            foreach ($productFaqCollection as $productfaq) {
                $faq = [];
                $faq['question'] = $productfaq->getQuestion();
                $faq['answer'] = $productfaq->getAnswer();
                $responce[] = $faq;
            }
            return new JsonResponse(['status' => 200, 'data' => $responce]);
        } catch (\Throwable $exception) {
            $this->addFlash('error', $exception->getMessage());
            return new JsonResponse(['status' => $exception->getCode(), 'message' => $exception->getMessage()]);
        }
    }
    /**
     * @Route ("/productfaq/save", name="frontend.productfaq.save",defaults={"XmlHttpRequest"=true,"_routeScope"={"storefront"},"auth_required"=false}, methods={"POST"})
     */
    public function productFaqSave(Request $request, SalesChannelContext $salesChannelContext): JsonResponse
    {
        try {
            $data = $request->request->all();
            $this->productFaqRepository->upsert([$data], $salesChannelContext->getContext());
            $this->sendMailToAdmin($data, $salesChannelContext, 'product_faq_email');
            $this->addFlash('success', $this->trans('dolphin_product_faq.faqSaveSuccess'));
            return new JsonResponse(['status' => 200, 'message' => $this->trans('dolphin_product_faq.faqSaveSuccess')]);
        } catch (\Throwable $exception) {
            $this->addFlash('error', $exception->getMessage());
            return new JsonResponse(['status' => $exception->getCode(), 'message' => $exception->getMessage()]);
        }
    }
    /**
     * @Route ("/productfaq/sent", name="frontend.productfaq.sent",defaults={"XmlHttpRequest"=true,"_routeScope"={"storefront"},"auth_required"=false}, methods={"POST"})
     */
    public function sendEmailToCustomer(Request $request, SalesChannelContext $salesChannelContext): JsonResponse
    {
        try {
            $postData = $request->request->all();
            $data = new DataBag();
            $mailTemplate = $this->getEmailTemplateId($postData['technicalName']);
            if ($mailTemplate) {
                $data->set(
                    'recipients',
                    [
                        $postData['email'] => $postData['nickname']
                    ]
                );
                $data->set('senderName', $salesChannelContext->getSalesChannel()->getName());
                $data->set('contentHtml', $mailTemplate->getContentHtml());
                $data->set('contentPlain', $mailTemplate->getContentPlain());
                $data->set('subject', $mailTemplate->getSubject());
                $data->set('salesChannelId', $salesChannelContext->getSalesChannel()->getId());
                $this->mailService->send(
                    $data->all(),
                    $salesChannelContext->getContext(),
                    ['data' => $postData]
                );
            }
            return new JsonResponse(['status' => 200, 'message' => $this->trans('dolphin_product_faq.emailSuccess')]);
        } catch (\Throwable $exception) {
            $this->addFlash('error', $exception->getMessage());
            return new JsonResponse(['status' => $exception->getCode(), 'message' => $exception->getMessage()]);
        }
    }
    public function sendMailToAdmin($formData, $salesChannelContext, $technicalName)
    {
        $email = $this->systemConfigService->get('DolphinProductFaq.config.emailrecievers');
        if ($email) {
            $data = new DataBag();
            $mailTemplate = $this->getEmailTemplateId($technicalName);
            if ($mailTemplate) {
                $data->set(
                    'recipients',
                    [
                        $email => $salesChannelContext->getSalesChannel()->getName()
                    ]
                );
                $data->set('senderName', $formData['nickname']);
                $data->set('contentHtml', $mailTemplate->getContentHtml());
                $data->set('contentPlain', $mailTemplate->getContentPlain());
                $data->set('subject', $mailTemplate->getSubject());
                $data->set('salesChannelId', $salesChannelContext->getSalesChannel()->getId());
                $this->mailService->send(
                    $data->all(),
                    $salesChannelContext->getContext(),
                    ['data' => $formData]
                );
            }
        }
    }
    public function getEmailTemplateId(string $technicalName)
    {
        $mailTemplateRepository = $this->container->get('mail_template.repository');

        $context = Context::createDefaultContext();

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('mailTemplateType.technicalName', $technicalName));

        $mailTemplates = $mailTemplateRepository->search($criteria, $context);

        if ($mailTemplates->count() > 0) {
            $mailTemplate = $mailTemplates->first();
            return $mailTemplate;
        }

        return false;
    }
}
