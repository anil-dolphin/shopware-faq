import template from './dolphin-faq.html.twig';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('dolphin-faq', {
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
            total: 0,
            faqCollection: null,
            repository: null,
            isLoading: false,
            processSuccess: false
        };
    },
    metaInfo() {
        return {
            title: this.$t("dolphin-faq.title.list"),
        };
    },
    computed: {
        columns() {
            return [
                {
                    property: 'active',
                    dataIndex: 'active',
                    label: this.$t('dolphin-faq.field.active'),
                    allowResize: true,
                    align: 'center',
                    sortable: true,
                },
                {
                    property: 'question',
                    dataIndex: 'question',
                    label: this.$t('dolphin-faq.field.question'),
                    allowResize: true,
                    align: 'center',
                    sortable: false,
                },
                {
                    property: 'answer',
                    dataIndex: 'answer',
                    label: this.$t("dolphin-faq.field.answer"),
                    allowResize: true,
                    align: 'center',
                    sortable: false,
                }
            ];
        }
    },

    methods: {
        getList() {
            const criteria = new Criteria();
            this.repository = this.repositoryFactory.create('dolphin_product_faq');
            this.repository.search(criteria, Shopware.Context.api).then((result) => {
                this.faqCollection = result;
                this.total = result.total;
            })
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
