import ItemsComponent from "../components/items.component.js";
import router from "../router.js";
import productsViewStyle from "../styles/views/products.view.style.js";
import productsViewTemplate from "../templates/views/products.view.template.js";
import BaseView from "./base.view.js";

export default class ProductsView extends BaseView {
    constructor () {
        super();
        this.template.append(this.nav);
        this.template.innerHTML += productsViewTemplate() + productsViewStyle();
        this.itemsContainer = null;
        this.itemsTable = new ItemsComponent();

        this.itemsTable.onPrevious = () => {
            console.log('previous');
        };

        this.itemsTable.onNext = () => {
            console.log('next');
        };

        this.template.addEventListener('keypress', (event) => {
            if (event.target.matches('#content-products-input')) {
                if (event.key === 'Enter') {
                    const queryString = `/products?name=${event.target.value}&offset=0`;
                    router.navigateTo(queryString);
                };
            };
        });

        this.template.addEventListener('click', (event) => {
            if (event.target.closest('#content-products-button-search')) {
                const input = document.querySelector('#content-products-input');
                const queryString = `/products?name=${input.value}&offset=0`;
                router.navigateTo(queryString);
            }
        });

        this.meta = { params: {} };
    };

    async init (meta) {
        this.meta = meta;
        this.setTitle('Librería Rubén Dario - Productos');
        this.setView(this.view);

        this.itemsContainer = document.querySelector('#content-products-items-container');
        
        const request = await fetch(`/api/products?${meta.queryString}`, { method: "GET" });
        const response = await request.json();
        
        if (response.data) {
            this.itemsContainer.append(this.itemsTable);

            for (const product of response.data) {
                this.itemsTable.add(product);
            };
        };

        console.log(response);
    };
};