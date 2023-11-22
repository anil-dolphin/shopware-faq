import template from './dolphin-faq-add.html.twig';
import './dolphin-faq-add.scss';

const { Component, Mixin } = Shopware;
const { Criteria } = Shopware.Data;


Component.register('dolphin-faq-add', {
    template: template,
    inject: [
        'repositoryFactory',
        'systemConfigApiService'
    ],
    mixins: [
        Mixin.getByName('notification')
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
    metaInfo() {
        return {
            title: this.$t("dolphin-faq.title.add")
        };
    },
    created() {
        this.repository = this.repositoryFactory.create('dolphin_product_faq');
        this.productRepository = this.repositoryFactory.create('product');
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
            faqCollection: {},
            isLoading: false,
            repository: null,
            processSuccess: false,
            config: null,
            showGrid: '0',
            searchTerm: null,
            page: 1,
            limit: 10,
            total: 0,
            products: [],
            selectedProducts: [],
            active: true,
            question: null,
            answer: null,
            selectedProductCollection: [],
            currentUser: Shopware.State.get('session').currentUser
        };
    },
    methods: {
        getConfigValues() {
            this.systemConfigApiService.getValues('core', null).then((responce) => {
                this.config = responce;
            });
        },
        getProducts() {
            this.isLoading = true;

            return this.productRepository.search(this.productCriteria)
                .then((products) => {
                    this.products = products;
                })
                .catch((error) => {
                    this.products = [];
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
        onClickSave() {
            this.faqCollection = this.repository.create();
            this.isLoading = true;
            if (this.showGrid === '1') {
                this.faqCollection.product = this.selectedProducts.length ? this.selectedProducts.join(',') : null;
            } else {
                this.faqCollection.product = 'all';
            }
            if (this.validation()) {
                this.faqCollection.active = this.active;
                this.faqCollection.question = this.question;
                this.faqCollection.answer = this.answer;
                this.faqCollection.email = this.currentUser.email;
                this.faqCollection.nickname = this.currentUser.firstName;
                this.repository
                    .save(this.faqCollection)
                    .then(() => {
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
            if (!this.question || this.question === '' || !this.answer || this.answer === '') {
                this.createNotificationError({
                    title: this.$t('Error'),
                    message: this.$t('dolphin-faq.message.validation-error')
                });
                return false;
            }
            if (this.showGrid === '1' && !this.selectedProducts.length) {
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