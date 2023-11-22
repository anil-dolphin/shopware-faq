// Import all necessary Storefront plugins
import Productfaq from './productfaq/productfaq';

// Register your plugin via the existing PluginManager
const PluginManager = window.PluginManager;
PluginManager.register('Productfaq', Productfaq, '[data-productfaq]');