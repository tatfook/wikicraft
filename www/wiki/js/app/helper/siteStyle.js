/**
 * Created by wuxiangan on 2017/5/5.
 */

define([], function () {
    var siteStyle = [
        // 个人网站分类
        {
            name:"个 人",
            classify:"personal",
            templates:[
                {
                    name:"空模板",
                    logoUrl:"wiki_blank_template.png",
					previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_blank",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_blank_template.png",
							previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_blank",
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
                {
                    name:"基本模板",
                    logoUrl:"wiki_basic_template.png",
					previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_basic",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_basic_template.png",
							previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_basic",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/basic.md"
                                },
                                {
                                    pagepath:"_theme",
                                    contentUrl:"templates/basic_theme.md"
                                },
                            ]
                        }
                    ],
                },
                // 个人网站wiki模板
                {
                    name:"简历模板",
                    logoUrl:"wiki_resume_site_template.png",
					previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_wiki",
                    styles:[
                        // 默认样式
                        {
                            name:"默认样式",
                            logoUrl:"wiki_resume_site_template.png",
							previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_wiki",
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
                /*
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
                */
            ],
        },

        // 企业网站分类
        {
            name:"企 业",
            classify:"company",
            templates:[
                {
                    name:"企业模板1",
                    logoUrl:"wiki_company1_template.jpg",
					previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_company1",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_company1_template.jpg",
							previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_company1",
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
					previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_company2",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_company2_template.png",
							previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_company2",
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
            classify:"organization",
            templates: [
                {
                    name:"组织模板",
                    logoUrl:"wiki_organization_template.png",
					previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_organization",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_organization_template.png",
							previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_organization",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/organization.md"
                                },
                                {
                                    pagepath:"more",
                                    contentUrl:"templates/more.md"
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
            classify:"game",
            templates: [
                {
                    name:"大赛模板",
                    logoUrl:"wiki_game_template.jpg",
					previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_game",
                    styles:[
                        {
                            name:"默认样式",
                            logoUrl:"wiki_game_template.jpg",
							previewUrl:config.httpProto+"://keepwork.com/keepwork/sitetemplate/tpl_game",
                            contents:[
                                {
                                    pagepath:"index",
                                    contentUrl:"templates/game.md"
                                },
                                {
                                    pagepath:"more",
                                    contentUrl:"templates/more.md"
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
