export default `
    <style>
        .nav {
            position: sticky;
            top: 0;
            left: 0;
            height: 100dvh;
        }

        .nav-buttons {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 20px;
        }

        .nav-button {
            box-sizing: border-box;
            padding: 10px;
            cursor: pointer;

            text-decoration: none;
            color: #000;

            display:grid;
            grid-template-columns: 20px 1fr;
            grid-template-rows: auto;
            gap: 15px;

            align-items: center;

            font-size: 22px;
            font-weight: bold;
            text-transform: uppercase;

            // border: 4px solid var(--border-color);
            // border-radius: 10px;
            // background-color: var(--button-color);

            width: 200px;
        }

        .nav-button:hover {
            background-color: var(--hover-color);
        }

        .nav-button-cart {
            display: none;
        }

        @media (max-width: 900px) {
            .nav {

            grid-area: nav;
                position: fixed;
                top: unset;
                left: 0;
                bottom: 0;

                width: 100%;
                height: 50px;
                background-color: var(--background-color);

                z-index: 1;
                padding: 0;
            }

            .nav-buttons {
                border-top: 1px solid var(--border-color);

                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 50px;

                width: 100%;
                height: 50px;
                gap: 0;
                padding: 0;
            }

            .nav-button-cart {
                display: flex;
            }

            .nav-button {
                display: flex;
                gap: 0;
                justify-content: center;
                align-items: center;
                border: none;
                background-color: unset;
                width: auto;
                height: 50px;
                border-radius: 0;
            }

            .nav-button:hover {
                background-color: none;
            }

            .nav-button-text {
                display: none;
            }
        }
    </style>
`;