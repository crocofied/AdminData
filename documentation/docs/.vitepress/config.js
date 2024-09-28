// .vitepress/config.js
export default {
    title: "AdminData",
    description: "A secure and modern self hosted Database Client",
    lastUpdated: true,
    head: [
        ["link", { rel: "icon",  type: "image/png", href: "/logo.png" }],
        ["meta", { name: "theme-color", content: "#7482f7" }],
        ["meta", {property: "og:type", content: "website"}],
        ["meta", {property: "og:locale", content: "en"}],
        ["meta", {
            property: "og:title",
            content: "AdminData | A secure and modern self hosted Database Client",
        }],
        ["meta", { property: "og:site_name", content: "AdminData" }],
        ["meta", { property: "og:image", content: "/logo.png" }],
        ["meta", { property: "og:image:type", content: "image/png" }],
        ["meta", { property: "twitter:card", content: "summary_large_image" }],
        ["meta", { property: "twitter:image:src", content: "/thumbnail.png" }],
        ["meta", { property: "og:url", content: "https://admindata.xyz" }],
    ],
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