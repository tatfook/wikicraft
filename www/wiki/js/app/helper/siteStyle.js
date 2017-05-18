/**
 * Created by wuxiangan on 2017/5/5.
 */

define([], function () {
    var siteStyle = [
        // 个人网站分类
        {
            name:"个 人",
            templates:[
                {
                    name:"空模板",
                    logoUrl:"wiki_blank_template.png",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_blank_template.png",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/blank.md"
                                },
                                {
                                    pagepath:"_theme",
                                    contentUrl:"templates/blank_theme.md"
                                },
                            ]
                        }
                    ],
                },
                // 个人网站wiki模板
                {
                    name:"个人简历",
                    logoUrl:"wiki_resume_site_template.png",
                    styles:[
                        // 默认样式
                        {
                            name:"默认样式",
                            logoUrl:"wiki_resume_site_template.png",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/resume.md"
                                },
                                {
                                    pagepath:"_theme",
                                    contentUrl:"templates/resume_theme.md"
                                },
                            ],
                        },
                    ],
                },

                // 个人网站图书模板
                {
                    name:"图书模板",
                    logoUrl:"",
                    styles:[
                        // 默认样式
                        {
                            name:"默认样式",
                            logoUrl:"",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/works.md"
                                },
                            ],
                        },
                    ],
                },
            ],
        },

        // 企业网站分类
        {
            name:"企 业",
            templates:[
                {
                    name:"企业模板1",
                    logoUrl:"wiki_company1_template.jpg",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_company1_template.jpg",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/company1.md"
                                },
                            ]
                        }
                    ],
                },

                {
                    name:"企业模板2",
                    logoUrl:"wiki_company2_template.png",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_company2_template.png",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/company2.md"
                                },
                            ]
                        }
                    ],
                },
            ]
        },

        // 组织网站分类
        {
            name:"组 织",
            templates: [
                {
                    name:"组织模板",
                    logoUrl:"wiki_organization_template.png",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_organization_template.png",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/organization.md"
                                },
                            ],
                        },
                    ],
                },
            ],
        },

        // 组织网站分类
        {
            name:"比 赛",
            templates: [
                {
                    name:"3D大赛模板",
                    logoUrl:"",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/game.md"
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    return siteStyle;
});