export default `
    <style>
        .header {
            height: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: auto;
            position: sticky;
            top: 0;
            background-color: var(--background-color);
            border-bottom: 1px solid var(--border-color);
        }

        .header-button-container {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding-left: 15px;

            font-size: 25px;
        }

        .header-button {
            cursor: pointer;
        }

        .header-logo-container {
            display: flex;
            align-items: center;
            justify-content: center;  
        }

        .logo {
            width: 40px;
            height: 40px;
        }
    </style>
`;