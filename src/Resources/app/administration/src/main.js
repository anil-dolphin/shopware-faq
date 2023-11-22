import './module/dolphin-faq';
import './page/sw-product-detail';
import './page/sw-product-detail-faq';

Shopware.Module.register('sw-new-tab-faq', {
    routeMiddleware(next, currentRoute) {
        const customRouteName = 'sw.product.detail.faq';

        if (
            currentRoute.name === 'sw.product.detail'
            && currentRoute.children.every((currentRoute) => currentRoute.name !== customRouteName)
        ) {
            currentRoute.children.push({
                name: customRouteName,
                path: '/sw/product/detail/:id/faq',
                component: 'sw-product-detail-faq',
                meta: {
                    parentPath: 'sw.product.index'
                }
            });
        }
        next(currentRoute);
    }
});

