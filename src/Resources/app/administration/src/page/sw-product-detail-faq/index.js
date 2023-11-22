import template from './sw-product-detail-faq.html.twig';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

Shopware.Component.register('sw-product-detail-faq', {
    template: template,

    inject: ['repositoryFactory', 'acl'],

    mixins: [
        Mixin.getByName('salutation'),
        Mixin.getByName('listing')
    ],

    created() {
        this.getList();
    },

    data() {
        return {
            faqrepository: null,
            total: 0,
            faqCollection: null,
            repository: null,
            isLoading: false,
            processSuccess: false
        };
    },
    metaInfo() {
        return {
            title: 'FAQ'
        };
    },
    computed: {
        columns() {
            return [
                {
                    property: 'active',
                    dataIndex: 'active',
                    label: 'dolphin-faq.field.active',
                    allowResize: true,
                    align: 'center',
                    sortable: true,
                },
                {
                    property: 'question',
                    dataIndex: 'question',
                    label: 'dolphin-faq.field.question',
                    allowResize: true,
                    align: 'center',
                    sortable: false,
                },
                {
                    property: 'answer',
                    dataIndex: 'answer',
                    label: "dolphin-faq.field.answer",
                    allowResize: true,
                    align: 'center',
                    sortable: false,
                }
            ];
        },
        faqCriteria() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.multi('or', [
                Criteria.contains('product', this.$route.params.id),
                Criteria.equals('product', 'all')
            ]));
            return criteria;
        }
    },
    methods: {
        async getList() {
            this.faqrepository = this.repositoryFactory.create('dolphin_product_faq');
            await this.faqrepository.search(this.faqCriteria, Shopware.Context.api).then((result) => {
                this.faqCollection = result;
                this.total = result.total;
            });
        },
        saveFinish() {
            this.processSuccess = false;
        },
        editItem(item) {
            const route = { path: '/dolphin/faq/edit/' + item.id };
            this.$router.push(route);
        },
        addNew() {
            const addRoute = { path: '/dolphin/faq/add' };
            this.$router.push(addRoute);
        },
        allowAddNew() {
            return this.acl.can('dolphin_product_faq:create');
        },
        allowEdit() {
            return this.acl.can('dolphin_product_faq:update');
        },
        allowView() {
            return this.acl.can('dolphin_product_faq:read');
        }
    }
});