import template from './dolphin-faq-edit.html.twig';
import './dolphin-faq-edit.scss';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('dolphin-faq-edit', {
    template: template,
    inject: [
        'feature',
        'conditionDataProviderService',
        'repositoryFactory',
        'systemConfigApiService'
    ],
    props: {
        salesChannel: {
            type: Object,
            required: false,
        },

        containerStyle: {
            type: Object,
            required: true,
        }
    },
    mixins: [
        Mixin.getByName('notification')
    ],

    metaInfo() {
        return {
            title: this.$t("dolphin-faq.title.edit")
        };
    },
    created() {
        this.faqrepository = this.repositoryFactory.create('dolphin_product_faq');
        this.productRepository = this.repositoryFactory.create('product');
        this.getList();
        this.getConfigValues();
        this.getProducts();
    },
    computed: {
        productRepository() {
            return this.repositoryFactory.create('product');
        },

        productCriteria() {
            const criteria = new Criteria(this.page, this.limit);

            if (this.searchTerm) {
                criteria.setTerm(this.searchTerm);
            }

            criteria.addAssociation('visibilities.salesChannel');
            criteria.addFilter(Criteria.equals('parentId', null));

            return criteria;
        },

        productColumns() {
            return [
                {
                    property: 'name',
                    label: this.$tc('sw-sales-channel.detail.products.columnProductName'),
                    allowResize: true,
                },
                {
                    property: 'productNumber',
                    label: this.$tc('sw-sales-channel.detail.products.columnProductNumber'),
                    allowResize: true,
                },
            ];
        },
    },
    data() {
        return {
            faqCollection: null,
            isLoading: false,
            processSuccess: false,
            faqrepository: null,
            sendEmail: false,
            config: null,
            showGrid: '0',
            searchTerm: null,
            page: 1,
            limit: 10,
            total: 0,
            products: [],
            selectedProducts: [],
            currentSelection: {}
        };
    },
    methods: {
        async getList() {
            await this.faqrepository.get(this.$route.params.id, Shopware.Context.api).then((entity) => {
                this.faqCollection = entity;
                if (this.faqCollection.product !== 'all') {
                    this.selectedProducts = this.faqCollection.product.split(',');
                }
            });
            this.getPreSelect();
        },
        async getPreSelect() {
            if (this.faqCollection.product !== 'all') {
                const newcriteria = new Criteria();
                newcriteria.addFilter(Criteria.equalsAny('id', this.selectedProducts));
                await this.productRepository.search(newcriteria)
                    .then((products) => {
                        products.map((product) => {
                            this.currentSelection[product.id] = product;
                        });
                        const selection = new Proxy(({ ...this.currentSelection }), {
                            get(target, key) {
                                return target[key];
                            },
                            set(target, key, value) {
                                target[key] = value;
                                return true;
                            },
                        });
                        this.showGrid = '1';
                        return selection;
                    });
                this.showGrid = '1';
                return {};
            }
        },
        onClickSave() {
            this.isLoading = true;
            if (this.showGrid === '1') {
                this.faqCollection.product = this.selectedProducts.length ? this.selectedProducts.join(',') : null;
            } else {
                this.faqCollection.product = 'all';
            }
            if (this.validation()) {
                this.faqrepository
                    .save(this.faqCollection, Shopware.Context.api)
                    .then(() => {
                        if (this.sendEmail) {
                            this.sendEmailToCustomer();
                        }
                        this.isLoading = false;
                        this.processSuccess = true;
                        this.createNotificationSuccess({
                            title: this.$t('Success'),
                            message: this.$t('dolphin-faq.message.validation-add-success')
                        });
                        this.$router.push({ path: '/dolphin/faq/list' });
                    }).catch((exception) => {
                        this.isLoading = false;
                        this.createNotificationError({
                            title: this.$t('Error'),
                            message: exception
                        });
                    });
            } else {
                this.isLoading = false;
            }
        },

        onCancel() {
            this.$router.push({ path: '/dolphin/faq/list' });
        },

        saveFinish() {
            this.processSuccess = false;
        },
        async sendEmailToCustomer() {
            var payload = { 'technicalName': 'product_faq_email_customer', 'question': this.faqCollection.question, 'answer': this.faqCollection.answer, 'nickname': this.faqCollection.nickname, 'email': this.faqCollection.email };
            var requestUrl = this.config['core.app.shopId']["app_url"] + '/productfaq/sent';
            const response = await fetch(requestUrl, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.status === 200) {
                this.createNotificationSuccess({
                    title: this.$t('Success'),
                    message: this.$t('dolphin-faq.message.customer-notify')
                });
            }
        },
        getConfigValues() {
            this.systemConfigApiService.getValues('core.app', null).then((responce) => {
                this.config = responce;
            });
        },
        getProducts() {
            this.isLoading = true;

            return this.productRepository.search(this.productCriteria)
                .then((products) => {
                    this.products = products;
                    this.total = products.total;
                })
                .catch((error) => {
                    this.products = [];
                    this.total = 0;
                    this.createNotificationError({
                        message: error.message,
                    });
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        onChangeSearchTerm(searchTerm) {
            this.searchTerm = searchTerm;
            if (searchTerm) {
                this.page = 1;
            }
            this.getProducts();
        },
        onSelectionChange(selection) {
            this.currentSelection = selection;
            if (Object.keys(selection).length) {
                this.selectedProducts = Object.keys(selection);
            } else {
                this.selectedProducts = [];
            }
        },
        onChangePage(data) {
            this.page = data.page;
            this.limit = data.limit;
            this.products.criteria.sortings.forEach(({ field, naturalSorting, order }) => {
                this.productCriteria.addSorting(
                    Criteria.sort(field, order, naturalSorting),
                );
            });
            this.getProducts();
        },
        validation() {
            if (!this.faqCollection.question || !this.faqCollection.answer || this.faqCollection.question === '' || this.faqCollection.answer === '' || this.faqCollection.product === null) {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('dolphin-faq.message.validation-error')
                });
                return false;
            }
            return true;
        }
    }
});