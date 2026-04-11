export default () => {
    return `
        <style>
            .content-products {
                display:flex;
                flex-direction:column;
                gap:20px;
            }

            .content-products-input-container {
                width:100%;
                display:flex;
                flex-direction:row;
                align-items:center;
                justify-content:center;
                gap:15px;
            }

            .content-products-input {
                border:none;
                outline:none;

                height: 40px;
                padding: 0 12px;
                font-size: 18px;
                border: 1px solid var(--border-color);
            }

            .content-products-input:focus {
                outline: 2px solid var(--hover-color);
            }

            .content-products-icon {
                width: 40px;
                height: 40px;

                display:flex;
                align-items:center;
                justify-content:center;
                font-size:24px;
                font-weight:bold;
                background-color:var(--button-color);
                border:1px solid var(--border-color);
                cursor:pointer;
            }

            .content-products-icon:hover {
                background-color:var(--hover-color);
            }
        </style>
    `;
};