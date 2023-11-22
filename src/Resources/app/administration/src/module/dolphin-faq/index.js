import './page/dolphin-faq-edit';
import './page/dolphin-faq';
import './page/dolphin-faq-add';

import enGB from './snippet/en-GB';
import deDE from './snippet/de_DE';

Shopware.Module.register('dolphin-faq', {
    type: 'plugin',
    name: 'dolphin-faq.title.list',
    color: '#32EAB5',
    title: 'dolphin-faq.title.list',
    description: 'Frequently Asked Questions about Product.',

    snippets: {
        'en-GB': enGB,
        'de-DE': deDE
    },

    routes: {
        list: {
            component: 'dolphin-faq',
            path: 'list',
            meta: {
                privilege: 'dolphin_product_faq:read'
            }
        },
        edit: {
            title: 'dolphin-faq.title.edit',
            component: 'dolphin-faq-edit',
            path: 'edit/:id',
            meta: {
                parentPath: 'dolphin.faq.list',
                privilege: 'dolphin_product_faq:update'
            }
        },
        add: {
            title: 'dolphin-faq.title.add',
            component: 'dolphin-faq-add',
            path: 'add',
            meta: {
                parentPath: 'dolphin.faq.list',
                privilege: 'dolphin_product_faq:create'
            }
        }
    },

    navigation: [{
        label: 'dolphin-faq.title.list',
        color: '#ff3d58',
        path: 'dolphin.faq.list',
        parent: 'sw-catalogue',
        privilege: 'dolphin_product_faq:read',
        position: 100
    }],

    settingsItem: [{
        group: 'plugin',
        to: 'dolphin.faq.list',
        name: 'dolphin-faq.title.list',
        privilege: 'dolphin_product_faq:read',
    }]
});
