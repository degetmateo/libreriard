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
            gap: 10px;

            align-items: center;

            font-size: 20px;
            font-weight: bold;

            border: 4px solid var(--border-color);
            border-radius: 10px;
            background-color: var(--button-color);

            width: 200px;
        }

        .nav-button:hover {
            background-color: var(--hover-color);
        }

        .nav-button-cart {
            display: none;
        }
    </style>
`;