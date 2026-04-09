export default `
    <style>
        .home-content {
            box-sizing: border-box;
            padding: 10px;
        
            display: flex;
            flex-direction:column;
            gap: 10px;
        }

        .home-title-container {
            display:flex;
            align-items:center;
            justify-content:center;
        }

        .title {
            font-size: 32px;
            font-weight: bold;
            color: #000;
        }
        
        .home-button-container {
            display:flex;
            flex-direction:row;
            align-items:center;
            gap:10px;
            font-size:20px;
        }

        .home-button-text {
            font-size:20px;
        }

        .home-button {
            text-decoration: none;
            color:#000;

            display:flex;
            flex-direction:row;
            align-items:center;
            gap:5px;

            border:1px solid #000;
            font-weight: bold;
            padding: 10px;
            background-color: var(--button-color);
        }

        .home-button:hover {
            background-color: var(--hover-color);
        }
    </style>
`;