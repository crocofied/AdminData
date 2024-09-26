// .vitepress/config.js
export default {
    title: "AdminData",
    description: "A secure and modern self hosted Database Client",
    themeConfig: {
        logo: "/logo.png",
        siteTitle: "AdminData",
        nav: [
            { text: "Home", link: "/" },
            { text: "Docs", link: "/install" },
        ],
        socialLinks: [
            { icon: "github", link: "https://github.com/crocofied/AdminData" },
        ],
        // .vitepress/config.js
        footer: {
            message: "Released under the MIT License.",
            copyright: "Copyright © 2024-present AdminData",
        },
        search: {
            provider: "local",
        },
        sidebar: [
            {
                text: "Documentation",
                items: [
                    { text: "Installation", link: "/install" },
                    { text: "Update", link: "/update" },
                    { text: "Migrate", link: "/migrate" },
                    { text: "Reverse Proxy", link: "/reverse-proxy" },
                ],
            },
        ],

    },
};