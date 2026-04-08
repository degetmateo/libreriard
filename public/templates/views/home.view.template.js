import AsideComponent from "../../components/aside.component.js";
import FooterComponent from "../../components/footer.component.js";
import HeaderComponent from "../../components/header.component.js";

export default `
    <div class="main">
        ${HeaderComponent.Render()}

        <div class="content">
            <h1>INICIO</h1>
        </div>

        ${FooterComponent.Render()}
    </div>

    ${AsideComponent.Render()}
`;