export default `
    <style>
        .content-home {
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
        
        .content-home-info-container {
            width: 100%;
            height:100%;
            display:flex;
            flex-direction: column;
            align-items:center;
        }

        .content-home-info {
            box-sizing:border-box;
            padding:10px;
            border-radius:10px;

            display:flex;
            flex-direction: column;
            justify-content:center;
            gap: 10px;

            // border:1px solid #000;
        }

        .content-home-info-title {
            font-size: 20px;
            font-weight:bold;
        }

        .home-button {
            text-decoration: none;
            color:#000;

            display:flex;
            flex-direction:row;
            align-items:center;
            justify-content:center;
            gap:5px;

            border:1px solid #000;
            font-weight: bold;
            font-size:18px;
            padding: 10px;
            background-color: var(--button-color);
        }

        .home-button:hover {
            background-color: var(--hover-color);
        }
    </style>
`;