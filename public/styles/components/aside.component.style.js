export default () => {
    return `
        <style>
            .aside {
                position: sticky;
                top: 0;
                left: 0;
                height: 100dvh;
            }

            .aside-container {
                display: flex;
                align-items: center;
                justify-content: center;

                height: 100%;
            }

            @media (max-width: 900px) {
                .aside {
                    display: none;
                }
            }
        </style>
    `;
};