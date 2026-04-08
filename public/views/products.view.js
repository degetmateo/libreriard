import productsViewTemplate from "../templates/views/products.view.template.js";
import BaseView from "./base.view.js";

export default class ProductsView extends BaseView {
    constructor () {
        super();
        this.template.append(this.nav);
        this.template.innerHTML += productsViewTemplate();
    };

    async init () {
        this.setTitle('Librería Rubén Dario - Productos');
        this.setView(this.view);
    };
};