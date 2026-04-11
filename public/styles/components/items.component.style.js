export default () => {
    return `
        <style>
            .items-component {
                display:flex;
                flex-direction:column;
                gap:10px;
            }

            .items-component-buttons {
                display:flex;
                flex-direction:row;
                align-items:center;
                justify-content:center;
                gap:10px;
            }

            .items-component-button {
                border:none;
                outline:none;
                text-decoration:none;
                background:none;

                background-color:var(--button-color);
                border: 1px solid var(--border-color);
                font-size: 20px;
                font-weight:bold;
                padding:5px 10px;
                cursor:pointer;
            }

            .items-component-button:hover {
                background-color: var(--hover-color);
            }
        </style>
    `;
};