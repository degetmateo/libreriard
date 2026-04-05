export default `
    <style>
        .footer {
            position: sticky;
            bottom: 0;
            top: calc(100dvh - 50px);
            height: 50px;
        }

        .footer-content {
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--background-color);
            border-top: 1px solid var(--border-color);
        }

        @media (max-width: 900px) {
            .footer {
                position: initial;
                bottom: unset;
                top: unset;
            }
        }
    </style>
`;