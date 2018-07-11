define([
  'app',
  'helper/util',
  'markdown-it',
  'helper/mdconf',
  'text!wikimod/adi/html/paracraft.html'
], function(app, util, markdown_it, mdconf, htmlContent) {
  var initObj

  function registerController(wikiblock) {
    app.registerController('paracraftWorldController', [
      '$scope',
      '$sce',
      function($scope, $sce) {
        $scope.imgsPath = config.wikiModPath + 'adi/assets/imgs/'
        $scope.showModal = false
        $scope.editorMode = wikiblock.editorMode
        $scope.downloadImg = $scope.imgsPath + 'down.png'

        var token = localStorage.getItem('satellizer_token')

        initObj = {
          scope: $scope,
          styles: [
            {
              design: {
                text: 'style1',
                cover: '/wiki/js/mod/adi/assets/images/paracraft1.png'
              }
            },
            {
              design: {
                text: 'style2',
                cover: '/wiki/js/mod/adi/assets/images/paracraft2.png'
              }
            },
            {
              design: {
                text: 'style3',
                cover: '/wiki/js/mod/adi/assets/images/paracraft3.png'
              }
            }
          ],
          params_template: {
            design: {
              is_leaf: true,
              type: 'text',
              editable: false,
              is_show: false,
              name: '样式',
              text: 'style1',
              require: true
            },
            media_logo: {
              is_leaf: true,
              type: 'media',
              mediaType: 'image',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: 'LOGO',
              text: '',
              require: true
            },
            link_version: {
              is_leaf: true,
              type: 'link',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '版本',
              text: '',
              require: true,
              href: ''
            },
            link_opus_id: {
              is_leaf: true,
              type: 'link',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '世界ID',
              text: '',
              require: true,
              href: ''
            },
            multiText_desc: {
              is_leaf: true,
              type: 'multiText',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '描述',
              text:
                '从来都记忆模糊，记不得都去了哪些地方，看了哪些风景，遇到哪些人。尽管同学说，去旅行不在于记忆，而在于当时餐，午餐，晚餐。或许吃得不好，可是却依旧为对方擦去嘴角的油渍。风景如何，其实并不重要。',
              require: true,
              href: ''
            },
            link_world_url: {
              is_leaf: true,
              type: 'link',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '世界下载地址',
              text: '',
              require: true,
              href: ''
            },
            link_files_totals: {
              is_leaf: true,
              type: 'link',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '文件大小',
              text: '',
              require: true,
              href: ''
            },
            link_username: {
              is_leaf: true,
              type: 'link',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '用户名',
              text: '',
              require: true,
              href: ''
            },
            link_update_date: {
              is_leaf: true,
              type: 'link',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '更新时间',
              text: '',
              require: true,
              href: ''
            },
            link_world_name: {
              is_leaf: true,
              type: 'link',
              editable: true,
              is_card_show: true,
              is_mod_hide: false,
              name: '世界名称',
              text: '',
              require: true,
              href: ''
            }
          }
        }

        wikiblock.init(initObj)
        convert()

        if (
          $scope.params.media_logo.is_mod_hide &&
          $scope.params.link_version.is_mod_hide &&
          $scope.params.link_opus_id.is_mod_hide &&
          $scope.params.multiText_desc.is_mod_hide &&
          $scope.params.link_world_url.is_mod_hide &&
          $scope.params.link_files_totals.is_mod_hide &&
          $scope.params.link_username.is_mod_hide &&
          $scope.params.link_update_date.is_mod_hide &&
          $scope.params.link_world_name.is_mod_hide
        ) {
          $scope.params.viewTimes.is_mod_hide = true
        }

        $scope.viewTimes = 0
        var viewTimesUrl = '/api/mod/worldshare/models/worlds/getOneOpus'
        var params = { link_opus_id: $scope.params.link_opus_id.text }

        util.http(
          'POST',
          viewTimesUrl,
          params,
          function(response) {
            $scope.viewTimes = response.viewTimes
          },
          function(response) {}
        )

        $scope.checkEngine = function() {
          var protocol = 'paracraft'
          var paramA = ''
          var paramB = ''
          var urlprotocol = $scope.params.urlprotocol

          if(urlprotocol && urlprotocol.protocol) {
            protocol = urlprotocol.protocol
          }

          if(urlprotocol && urlprotocol.paramA) {
            if(typeof(urlprotocol.paramA) == 'object') {
              paramA = JSON.stringify(urlprotocol.paramA)
            } else if (typeof(urlprotocol.paramA) == 'string') {
              paramA = urlprotocol.paramA
            }
          }

          if(urlprotocol && urlprotocol.paramB) {
            if(typeof(urlprotocol.paramB) == 'object') {
              paramB = JSON.stringify(urlprotocol.paramB)
            } else if (typeof(urlprotocol.paramB) == 'string') {
              paramB = urlprotocol.paramB
            } 
          }

          $scope.showModal = true

          window.open(
            protocol + ':// protocol="' + protocol + '" paramA="' + paramA + '" paramB="' + paramB + '" usertoken="' +
            token + '" cmd/loadworld ' + $scope.params.link_world_url.text
          )
        }

        $scope.clickDownload = function() {
          $scope.showModal = false
          var url =
            $scope.params.paracraft_info &&
            $scope.params.paracraft_info.client_url
              ? $scope.params.paracraft_info.client_url
              : 'http://www.paracraft.cn'

          window.open(url)
        }

        $scope.closeModal = function() {
          $scope.showModal = false
        }

        $scope.getSize = function(size) {
          if (size <= 1048576) {
            return parseInt(size / 1024) + 'KB'
          } else {
            return parseInt(size / 1024 / 1024) + 'M'
          }
        }

        $scope.onParamsChange = function() {
          wikiblock.init(initObj)
          util.$apply()
        }

        $scope.subMarkdownRender = util.subMarkdownRender

        function convert() {
          var params_text = wikiblock.blockCache.block.content.replace(
            /```@paracraft/,
            ''
          )
          params_text = params_text.replace(/```/, '')

          var isJSON = true

          try {
            JSON.parse(params_text)
          } catch (error) {
            isJSON = false
          }

          if (isJSON) {
            var oldParams = JSON.parse(params_text)
            var newParams = {}

            newParams['design'] = { text: 'style1' }

            for (key in oldParams) {
              if (key == 'logoUrl') {
                var logoUrl = JSON.parse(oldParams.logoUrl)

                for (x in logoUrl) {
                  newParams[key] = { text: {} }

                  for (y in logoUrl[x]) {
                    newParams[key].text[x] = {
                      id: Date.now(),
                      name: y,
                      url: logoUrl[x][y]
                    }
                  }
                }
              } else {
                newParams[key] = { text: oldParams[key] }
              }
            }

            $scope.params = newParams
            wikiblock.applyModParams(mdconf.jsonToMd(newParams))
          }
        }
      }
    ])
  }

  return {
    render: function(wikiblock) {
      registerController(wikiblock)
      return htmlContent
    },
    initObj: function() {
      return initObj
    }
  }
})
