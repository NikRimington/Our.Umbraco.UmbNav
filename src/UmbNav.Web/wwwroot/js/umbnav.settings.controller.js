﻿angular.module('umbraco').controller('Our.UmbNav.Settings.Controller', function ($scope, eventsService, entityResource, mediaResource, mediaHelper, udiParser, userService, localizationService, editorService) {
    var vm = this;
    var dialogOptions = $scope.model;
    vm.submit = submit;
    vm.close = close;
    vm.toggleOpenInNewWindow = toggleOpenInNewWindow;
    vm.toggleshowNoopener = toggleshowNoopener;
    vm.toggleshowNoreferrer = toggleshowNoreferrer;
    vm.toggleDisplayLoggedIn = toggleDisplayLoggedIn;
    vm.toggleDisplayLoggedOut = toggleDisplayLoggedOut;
    vm.toggleChildren = toggleChildren;
    vm.toggleDisplayAsLabel = toggleDisplayAsLabel;
    vm.openMediaPicker = openMediaPicker;
    vm.showAdvanced = false;
    vm.labels = {};
    vm.labels.itemTypes = {};
    localizationService.localizeMany(['defaultdialogs_openInNewWindow']).then(function (data) {
        vm.labels.openInNewWindow = data[0];
    });
    localizationService.localizeMany(['umbnav_noopener']).then(function (data) {
        vm.labels.showNoopener = data[0];
    });
    localizationService.localizeMany(['umbnav_noreferrer']).then(function (data) {
        vm.labels.showNoreferrer = data[0];
    });
    localizationService.localizeMany(['umbnav_hideLoggedIn']).then(function (data) {
        vm.labels.hideLoggedIn = data[0];
    });
    localizationService.localizeMany(['umbnav_hideLoggedOut']).then(function (data) {
        vm.labels.hideLoggedOut = data[0];
    });
    localizationService.localizeMany(['umbnav_includeChildNodes']).then(function (data) {
        vm.labels.includeChildNodes = data[0];
    });
    localizationService.localizeMany(['umbnav_CustomClasses']).then(function (data) {
        vm.labels.customClasses = data[0];
    });
    localizationService.localizeMany(['umbnav_ImageIconUrl']).then(function (data) {
        vm.labels.imageIconUrl = data[0];
    });
    localizationService.localizeMany(['umbnav_link']).then(function (data) {
        vm.labels.itemTypes.link = { 'value': 'link', 'label': data[0] };
    });
    localizationService.localizeMany(['umbnav_label']).then(function (data) {
        vm.labels.itemTypes.label = { 'value': 'nolink', 'label': data[0] };
    });
    localizationService.localizeMany(['umbnav_menuItem']).then(function (data) {
        vm.labels.menuItem = data[0];
    });
    localizationService.localizeMany(['umbnav_configuration']).then(function (data) {
        vm.labels.configuration = data[0];
    });
    localizationService.localizeMany(['umbnav_linkTypeDescription']).then(function (data) {
        vm.labels.linkTypeDescription = data[0];
    });
    localizationService.localizeMany(['umbnav_displayAsLabel']).then(function (data) {
        vm.labels.displayAsLabel = data[0];
    });
    if (!$scope.model.title) {
        localizationService.localize('defaultdialogs_selectLink').then(function (value) {
            $scope.model.title = value;
        });
    }
    $scope.customTreeParams = dialogOptions.dataTypeKey ? 'dataTypeKey=' + dialogOptions.dataTypeKey : '';
    $scope.dialogTreeApi = {};
    $scope.model.target = {};
    $scope.searchInfo = {
        searchFromId: null,
        searchFromName: null,
        showSearch: false,
        dataTypeKey: dialogOptions.dataTypeKey,
        results: [],
        selectedSearchResults: []
    };
    $scope.showTarget = $scope.model.hideTarget !== true;
    $scope.showDisplay = $scope.model.allowDisplay === true;
    $scope.showDisplayAsLabel = $scope.model.allowDisplayAsLabel === true;
    $scope.showNoopener = $scope.model.hideNoopener !== true;
    $scope.showNoreferrer = $scope.model.hideNoreferrer !== true;
    $scope.showAnchor = $scope.model.hideAnchor !== true;
    $scope.showIncludeChildren = $scope.model.hideIncludeChildren !== true;
    $scope.showCustomClasses = $scope.model.allowCustomClasses === true;
    $scope.showImageIcon = $scope.model.allowImageIcon === true;
    $scope.allowLabels = $scope.model.allowLabels === true;
    $scope.showAdvancedBlock = showAdvanced();
    if (!$scope.allowLabels) {
        $scope.model.target.itemType = 'link';
    }
    // this ensures that we only sync the tree once and only when it's ready
    var oneTimeTreeSync = {
        executed: false,
        treeReady: false,
        sync: function sync() {
            // don't run this if:
            // - it was already run once
            // - the tree isn't ready yet
            // - the model path hasn't been loaded yet
            if (this.executed || !this.treeReady || !($scope.model.target && $scope.model.target.path)) {
                return;
            }
            this.executed = true;
            // sync the tree to the model path
            $scope.dialogTreeApi.syncTree({
                path: $scope.model.target.path,
                tree: 'content'
            });
        }
    };
    if (dialogOptions.currentTarget) {
        // clone the current target so we don't accidentally update the caller's model while manipulating $scope.model.target
        $scope.model.target = Utilities.copy(dialogOptions.currentTarget);
        if ($scope.model.target.title == (null || "" || undefined)) {
            $scope.model.target.title = $scope.model.target.name;
        }
        // if we have a node ID, we fetch the current node to build the form data
        if ($scope.model.target.udi) {
            // will be a udi
            var id = $scope.model.target.udi;
            if ($scope.model.target.udi) {
                // extract the entity type from the udi and set target.isMedia accordingly
                var udi = udiParser.parse($scope.model.target.udi);
                if (udi && udi.entityType === 'media') {
                    $scope.model.target.isMedia = true;
                } else {
                    delete $scope.model.target.isMedia;
                }
            }
            if ($scope.model.target.isMedia) {
                mediaResource.getById(id).then(function (resp) {
                    $scope.model.target.url = resp.mediaLink;
                });
            } else {
                // get the content path
                entityResource.getPath(id, 'Document').then(function (path) {
                    $scope.model.target.path = path;
                    oneTimeTreeSync.sync();
                });
                entityResource.getUrlAndAnchors(id).then(function (resp) {
                    $scope.anchorValues = resp.anchorValues;
                    $scope.model.target.url = resp.url;
                });
            }
        } else if ($scope.model.target.url && $scope.model.target.url.length) {
            // a url but no id/udi indicates an external link - trim the url to remove the anchor/qs
            // only do the substring if there's a # or a ?
            var indexOfAnchor = $scope.model.target.url.search(/(#|\?)/);
            if (indexOfAnchor > -1) {
                // populate the anchor
                $scope.model.target.anchor = $scope.model.target.url.substring(indexOfAnchor);
                // then rewrite the model and populate the link
                $scope.model.target.url = $scope.model.target.url.substring(0, indexOfAnchor);
            }
        }
        // need to translate the link target ("_blank" or "") into a boolean value for umb-checkbox
        vm.openInNewWindow = $scope.model.target.target === '_blank';
        vm.hideLoggedIn = $scope.model.target.hideLoggedIn;
        vm.hideLoggedOut = $scope.model.target.hideLoggedOut;
        vm.includeChildren = $scope.model.target.includeChildNodes;
        vm.displayAsLabel = $scope.model.target.displayAsLabel;
        vm.showNoopener = $scope.model.target.noopener === 'noopener' && $scope.model.target.udi === undefined;
        vm.showNoreferrer = $scope.model.target.noreferrer === 'noreferrer' && $scope.model.target.udi === undefined;
    } else if (dialogOptions.anchors) {
        $scope.anchorValues = dialogOptions.anchors;
    }
    function treeLoadedHandler(args) {
        oneTimeTreeSync.treeReady = true;
        oneTimeTreeSync.sync();
    }
    function nodeSelectHandler(args) {
        if (args && args.event) {
            args.event.preventDefault();
            args.event.stopPropagation();
        }
        eventsService.emit('dialogs.linkPicker.select', args);
        if ($scope.currentNode) {
            //un-select if there's a current one selected
            $scope.currentNode.selected = false;
        }
        $scope.currentNode = args.node;
        $scope.currentNode.selected = true;
        $scope.model.target.udi = args.node.udi;
        $scope.model.target.name = args.node.name;
        $scope.model.target.title = args.node.name;
        //if (args.node.id < 0) {
        //    $scope.model.target.url = '/';
        //} else {
        //    entityResource.getUrlAndAnchors(args.node.id).then(function (resp) {
        //        $scope.anchorValues = resp.anchorValues;
        //        $scope.model.target.url = resp.url;
        //    });
        //}
        if (!Utilities.isUndefined($scope.model.target.isMedia)) {
            delete $scope.model.target.isMedia;
        }
    }
    function nodeExpandedHandler(args) {
        // open mini list view for list views
        if (args.node.metaData.isContainer) {
            openMiniListView(args.node);
        }
    }
    $scope.switchToMediaPicker = function () {
        userService.getCurrentUser().then(function (userData) {
            var startNodeId, startNodeIsVirtual;
            if (dialogOptions.ignoreUserStartNodes === true) {
                startNodeId = -1;
                startNodeIsVirtual = true;
            } else {
                startNodeId = userData.startMediaIds.length !== 1 ? -1 : userData.startMediaIds[0];
                startNodeIsVirtual = userData.startMediaIds.length !== 1;
            }
            var mediaPicker = {
                startNodeId: startNodeId,
                startNodeIsVirtual: startNodeIsVirtual,
                dataTypeKey: dialogOptions.dataTypeKey,
                submit: function submit(model) {
                    var media = model.selection[0];
                    $scope.model.target.udi = media.udi;
                    $scope.model.target.isMedia = true;
                    $scope.model.target.name = media.name;
                    $scope.model.target.url = media.image;
                    editorService.close();
                    // make sure the content tree has nothing highlighted 
                    $scope.dialogTreeApi.syncTree({
                        path: '-1',
                        tree: 'content'
                    });
                },
                close: function close() {
                    editorService.close();
                }
            };
            editorService.mediaPicker(mediaPicker);
        });
    };
    $scope.hideSearch = function () {
        $scope.searchInfo.showSearch = false;
        $scope.searchInfo.searchFromId = null;
        $scope.searchInfo.searchFromName = null;
        $scope.searchInfo.results = [];
    };
    // method to select a search result
    $scope.selectResult = function (evt, result) {
        result.selected = result.selected === true ? false : true;
        nodeSelectHandler({
            event: evt,
            node: result
        });
    };
    //callback when there are search results
    $scope.onSearchResults = function (results) {
        $scope.searchInfo.results = results;
        $scope.searchInfo.showSearch = true;
    };
    $scope.onTreeInit = function () {
        $scope.dialogTreeApi.callbacks.treeLoaded(treeLoadedHandler);
        $scope.dialogTreeApi.callbacks.treeNodeSelect(nodeSelectHandler);
        $scope.dialogTreeApi.callbacks.treeNodeExpanded(nodeExpandedHandler);
    };
    // Mini list view
    $scope.selectListViewNode = function (node) {
        node.selected = node.selected === true ? false : true;
        nodeSelectHandler({ node: node });
    };
    $scope.closeMiniListView = function () {
        $scope.miniListView = undefined;
    };
    function openMiniListView(node) {
        $scope.miniListView = node;
    }
    function toggleOpenInNewWindow(model, value) {
        $scope.model.target.target = model ? '_blank' : '';
    }
    function toggleshowNoopener(model, value) {
        $scope.model.target.noopener = model ? 'noopener' : '';
    }
    function toggleshowNoreferrer(model, value) {
        $scope.model.target.noreferrer = model ? 'noreferrer' : '';
    }

    function toggleDisplayLoggedIn(model, value) {
        $scope.model.target.hideLoggedIn = model ? true : false;
    }
    function toggleDisplayLoggedOut(model, value) {
        $scope.model.target.hideLoggedOut = model ? true : false;
    }
    function toggleChildren(model, value) {
        $scope.model.target.includeChildren = model ? true : false;
    }
    function toggleDisplayAsLabel(model, value) {
        $scope.model.target.displayAsLabel = model ? true : false;
    }
    function close() {
        if ($scope.model && $scope.model.close) {
            $scope.model.close();
        }
    }
    function submit() {
        if ($scope.model && $scope.model.submit) {
            $scope.model.submit($scope.model);
        }
    }

    $scope.add = function () {
        openMediaPicker(null, function(item) {
            $scope.model.target.image = item;
        });
    };

    $scope.edit = function (item) {
        openMediaPicker(item, function (item) {
            $scope.model.target.image = item;
        });
    };

    $scope.remove = function (index) {
        $scope.model.target.image.splice(index, 1);
    };

    function showAdvanced() {
        var show = false;

        if (($scope.showDisplay ||
            $scope.showDisplayAsLabel ||
            $scope.showDisplayAsLabel ||
            $scope.showIncludeChildren ||
            $scope.showNoopener ||
            $scope.showNoreferrer ||
            $scope.showCustomClasses ||
            $scope.showImageIcon) && show === false)
        {
            show = true;
        }

        return show;
    }

    function openMediaPicker(item, callback) {
        var mediaPickerOptions = {
            multiPicker: false,
            onlyImages: true,
            disableFolderSelect: true,
            disableFocalPoint: true,
            currentTarget: item,
            submit: function (model) {
                callback(model.selection);
                editorService.close();
            },
            close: function () {
                editorService.close();
            }
        };
        editorService.mediaPicker(mediaPickerOptions);
    };
});
'use strict';