import CartView from "./views/cart.view.js";
import ErrorView from "./views/error.view.js";
import HomeView from "./views/home.view.js";
import ProductsView from "./views/products.view.js";

class Router {
    constructor () {
        this.router = new Navigo("/", { hash: true });
        this.event = new Event('pathnamechange');

        this.views = {
            error: new ErrorView(),
            home: new HomeView(),
            products: new ProductsView(),
            cart: new CartView()
        };

        this.router
            .on("/", () => this.views.home.init())
            .on('/products', (meta) => this.views.products.init(meta))
            .on('/cart', () => this.views.cart.init())
            // .on("/scanner", () => this.views.scanner.init())
            // .on('/database', () => this.views.database.init())
            // .on('/new-product', () => this.views.productsCreate.init())
            // .on('/price-lists', () => this.views.priceLists.init())
            // .on('/products', (data) => this.views.products.init(data))
            // .on('/products/:id', (data) => this.views.product.init(data))
            // .on('/new-customer', () => this.views.customers_create.init())
            // .on('/new-order', (data) => this.views.orders_create.init(data))
            // .on('/orders', (meta) => this.views.orders.init(meta))
            // .on('/orders/:id', ({ data }) => this.views.order.init(data))
            // .on('/customers', (data) => this.views.customers.init(data))
            // .on('/customers/:id', (data) => this.views.customer.init(data))
            // .on('/options', (data) => this.views.options.init(data))
            // .on('/reports', (meta) => this.views.reports.init(meta))
            .notFound(() => this.views.error.init());
    };

    resolve = () => {
        this.router.resolve();
    };

    navigateTo = (url) => {
        if (url == window.location.pathname) return;
        window.history.pushState(null, null, url);
        window.dispatchEvent(this.event);
        this.resolve();
    };

    replace = (url) => {
        if (url == window.location.pathname) return;
        window.history.replaceState(null, null, url);
        window.dispatchEvent(this.event);
        this.resolve();
    };

    goBack = () => {
        window.history.back();
    };

    goForward = () => {
        window.history.forward();
    };

    getPathname = () => {
        return window.location.pathname;
    };

    reload = () => {
        window.location.reload();
    };
};

export default new Router();