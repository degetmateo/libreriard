import router from "../router.js";
import headerComponentStyle from "../styles/components/header.component.style.js";
import headerComponentTemplate from "../templates/components/header.component.template.js";

class HeaderComponent extends HTMLElement {
    constructor () {
        super();
        this.classList.add('header');
        this.innerHTML = headerComponentTemplate + headerComponentStyle;
        this.addEventListener('click', this.onClick);
    };

    static Render () {
        return new HeaderComponent().outerHTML;
    };

    onClick (event) {
        if (event.target.matches('.header-button')) {
            router.goBack();
        };
    };
};

customElements.define('header-component', HeaderComponent);
export default HeaderComponent;