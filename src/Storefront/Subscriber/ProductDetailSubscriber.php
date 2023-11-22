<?php

declare(strict_types=1);

namespace Dolphin\Productfaq\Storefront\Subscriber;

use Dolphin\Productfaq\Core\Content\ProductFaq\ProductFaqCollection;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\ContainsFilter;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Page\Product\ProductPageLoadedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\OrFilter;

class ProductDetailSubscriber implements EventSubscriberInterface
{
    /**
     * @var SystemConfigService
     */
    private $systemConfigService;

    /**
     * @var EntityRepository
     */
    private $productFaqRepository;

    /**
     * ProductDetailSubscriber constructor.
     *
     * @param SystemConfigService $systemConfigService
     * @param EntityRepository $productFaqRepository
     */
    public function __construct(
        SystemConfigService $systemConfigService,
        EntityRepository $productFaqRepository
    ) {
        $this->systemConfigService = $systemConfigService;
        $this->productFaqRepository = $productFaqRepository;
    }

    /**
     * @return array
     */
    public static function getSubscribedEvents()
    {
        return [
            ProductPageLoadedEvent::class => 'onProductPageLoaded'
        ];
    }

    /**
     * @param ProductPageLoadedEvent $event
     */
    public function onProductPageLoaded(ProductPageLoadedEvent $event): void
    {
        $currentProduct = $event->getPage()->getProduct()->getParentId() ?? $event->getPage()->getProduct()->getId();
        $limit = $this->systemConfigService->get('DolphinProductFaq.config.perpage');
        $productFaqs = $this->fetchFaqs($event->getContext(), $currentProduct, $limit);
        $event->getPage()->addExtension('dolphin_product_faq', $productFaqs);
        $event->getPage()->addArrayExtension('faq_flag', $this->showPagination($event->getContext(), $currentProduct, $limit));
    }

    /**
     * Returns product frequently asked question records by certan criteria
     *
     * @param Context $context
     * @param $currentProduct
     *
     * @return ProductFaqCollection
     * @throws \Shopware\Core\Framework\DataAbstractionLayer\Exception\InconsistentCriteriaIdsException
     */
    private function fetchFaqs(Context $context, $currentProduct, $limit): ProductFaqCollection
    {
        $criteria = new Criteria();

        $criteria = new Criteria();

        $criteria->addFilter(new EqualsFilter('active', '1'));
        $criteria->addFilter(new OrFilter([
            new ContainsFilter('product', $currentProduct),
            new EqualsFilter('product', 'all')
        ]));
        $criteria->addSorting(new FieldSorting('createdAt', FieldSorting::DESCENDING));
        $criteria->setLimit($limit);
        $criteria->setOffset(0);

        /** @var  ProductFaqCollection $productFaqCollection */
        $productFaqCollection = $this->productFaqRepository->search($criteria, $context)->getEntities();

        return $productFaqCollection;
    }
    private function showPagination(Context $context, $currentProduct, $limit)
    {
        $number_of_page = 0;
        $criteria = new Criteria();

        $criteria->addFilter(new EqualsFilter('active', '1'));
        $criteria->addFilter(new OrFilter([
            new ContainsFilter('product', $currentProduct),
            new EqualsFilter('product', 'all')
        ]));
        
        $productFaqCollectionCount = $this->productFaqRepository->search($criteria, $context)->getEntities()->count();
        if ($productFaqCollectionCount && $productFaqCollectionCount > $limit) {
            $number_of_page = ceil($productFaqCollectionCount / $limit);
        }
        return  ['limit' => $limit, 'number_of_page' => $number_of_page, 'total' => $productFaqCollectionCount];
    }
}
