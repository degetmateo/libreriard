import router from "../router.js";
import navComponentStyle from "../styles/components/nav.component.style.js";
import navComponentTemplate from "../templates/components/nav.component.template.js";

class NavComponent extends HTMLElement {
    constructor () {
        super();
        this.classList.add('nav');
        this.innerHTML = navComponentTemplate() + navComponentStyle;
        this.addEventListener('click', (event) => {
            const button = event.target.closest('.nav-button');
            if (button) {
                event.preventDefault();
                const href = button.getAttribute('href');
                router.navigateTo(href);
            };
        });
    };
};

customElements.define('nav-component', NavComponent);
export default NavComponent;