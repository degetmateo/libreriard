import FooterComponent from "../../components/footer.component.js";
import HeaderComponent from "../../components/header.component.js";

export default `
    <div class="main">
        ${HeaderComponent.Render()}

        <div class="content">
            <h3>Main</h3>

            <p>LOREM IMPSUM</p>
        </div>

        ${FooterComponent.Render()}
    </div>

    <aside class="aside">
        <div class="aside-container">
            <h3>ASIDE</h3>
        </div>
    </aside>
`;