export default () => {
    return `
        <div class="nav-buttons">
            <a class="nav-button" href="/">
                <i class="fa-solid fa-house"></i>
                <span class="nav-button-text">Inicio</span>
            </a>

            <a class="nav-button" href="/products">
                <i class="fa-solid fa-list"></i>
                <span class="nav-button-text">Productos</span>
            </a>

            <a class="nav-button nav-button-cart" href="/cart">
                <i class="fa-solid fa-bag-shopping"></i>
                <span class="nav-button-text">Carrito</span>
            </a>
        </div>
    `;
};