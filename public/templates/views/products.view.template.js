import AsideComponent from "../../components/aside.component.js";
import FooterComponent from "../../components/footer.component.js";
import HeaderComponent from "../../components/header.component.js";

export default () => {
    return `
        <div class="main">
            ${HeaderComponent.Render()}

            <div class="content content-products">
            
                <div class="content-products-input-container">
                    <input type="text" placeholder="Buscar un producto" class="content-products-input" id="content-products-input" />
                    <div class="content-products-icon" id="content-products-button-search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </div>
                </div>

                <div id="content-products-items-container" class="content-products-items-container"></div>

            </div>

            ${FooterComponent.Render()}
        </div>

        ${AsideComponent.Render()}
    `;
};