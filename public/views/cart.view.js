import cartViewTemplate from "../templates/views/cart.view.template.js";
import BaseView from "./base.view.js";

export default class CartView extends BaseView {
    constructor () {
        super();
        this.template.append(this.nav);
        this.template.innerHTML += cartViewTemplate();
    };

    async init () {
        this.setTitle('Librería Rubén Dario - Carrito');
        this.setView(this.view);
    };
}; 