import AsideComponent from "../../components/aside.component.js";
import FooterComponent from "../../components/footer.component.js";
import HeaderComponent from "../../components/header.component.js";

export default `
    <div class="main">
        ${HeaderComponent.Render()}

        <div class="content content-home">
            <div class="home-title-container">
                <h1 class="home-title">Librería Rubén Dario</h1>
            </div>

            <div class="content-home-info-container">
                <div class="content-home-info">
                    <span class="content-home-info-title">Medios de Contacto</span>

                    <a class="home-button" href="https://wa.me/5491138846058" target="_blank">
                        <i class="fa-brands fa-whatsapp"></i>    
                        <span>WhatsApp (solo mensajes)</span>
                    </a>

                    <a class="home-button" href="https://www.instagram.com/libreria_ruben_dario/" target="_blank">
                        <i class="fa-brands fa-instagram"></i>  
                        <span>Instagram</span>
                    </a>

                    <a class="home-button" href="https://www.facebook.com/libreriard" target="_blank">
                        <i class="fa-brands fa-facebook"></i>
                        <span>Facebook</span>
                    </a>

                    <a class="home-button" href="mailto:libreriard@yahoo.com" target="_blank">
                        <i class="fa-regular fa-envelope"></i>  
                        <span>libreriard@yahoo.com</span>
                    </a>
                </div>
            </div>

            <div class="content-home-info-container">
                <div class="content-home-info">
                    <span class="content-home-info-title">¿Dónde nos encontramos?</span>
                    <a class="home-button" href="https://maps.app.goo.gl/Z56RW6KEhANHCVro8" target="_blank">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>Montevideo 949, B1617 Gral. Pacheco, Provincia de Buenos Aires</span>
                    </a>
                    <span>Lunes a Viernes de 9 a 17hs. Sábados de 9 a 14hs.</span>
                </div>
            </div>
        </div>

        ${FooterComponent.Render()}
    </div>

    ${AsideComponent.Render()}
`;