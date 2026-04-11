import itemsComponentStyle from "../styles/components/items.component.style.js";
import itemsComponentTemplate from "../templates/components/items.component.template.js";

class ItemsComponent extends HTMLElement {
    constructor () {
        super();
        this.classList.add('items-component');
        this.innerHTML = itemsComponentTemplate() + itemsComponentStyle();
        this.addEventListener('click', (event) => {
            if (event.target.matches('.items-component-button-previous')) {
                return this.onPrevious();
            };

            if (event.target.matches('.items-component-button-next')) {
                return this.onNext();
            };
        });
    };

    add (product) {
        const productsContainer = document.querySelector('#items-component-products');
        if (!productsContainer) return;
        productsContainer.innerHTML += `
            <div class="items-component-products-product">
                <span>${product.name}</span>
            </div>
        `;
    };

    onPrevious () {};
    onNext () {};
};

customElements.define('items-component', ItemsComponent);
export default ItemsComponent;