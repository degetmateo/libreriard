import asideComponentStyle from "../styles/components/aside.component.style.js";
import asideComponentTemplate from "../templates/components/aside.component.template.js";

class AsideComponent extends HTMLElement {
    constructor () {
        super();
        this.classList.add('aside');
        this.innerHTML = asideComponentTemplate() + asideComponentStyle();
    };

    static Render () {
        return new AsideComponent().outerHTML;
    };
};

customElements.define('aside-component', AsideComponent);
export default AsideComponent;