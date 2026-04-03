import footerComponentStyle from "../styles/components/footer.component.style.js";
import footerComponentTemplate from "../templates/components/footer.component.template.js";

class FooterComponent extends HTMLElement {
    constructor () {
        super();
        this.classList.add('footer');
        this.innerHTML = footerComponentTemplate + footerComponentStyle;
    };

    static Render () {
        return new FooterComponent().outerHTML;
    };
};

customElements.define('footer-component', FooterComponent);
export default FooterComponent;