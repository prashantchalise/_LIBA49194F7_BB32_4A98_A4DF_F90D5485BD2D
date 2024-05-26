
rolpo_app.requires.push('summernote');

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

rolpo_app.filter('unsafe', function ($sce) { return $sce.trustAsHtml; });



// Service For Page 
; (function () {
    'use strict';
    rolpo_app.factory('pageService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var pageServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditPage",
                FilterList: [
                    {
                        DDLName: "GAME-CATEGORY",
                        Param: {}
                    },
                    {
                        DDLName: "CONTENTTYPE",
                        Param: {}
                    } 
                    
                ]
            };
        };

        //Page Empty Filter 
        var _pageEmptyFilter = function () {
            return {
                Id: 0,
                PageTitle: "",
                PageType: "",
                PageNumber: 1,
                PageSize: 20,
                ShowAll: 0
            };
        };

        // Get DDL List by Filter
        var _getDDLList = function (ddlFilter) {
            return $http({
                url: serviceBase + 'api/Lookup/LoadDDLs',
                method: "post",
                data: ddlFilter
            });
        };

        // Get Pages by Filter
        var _getPages = function (tpfilter) {
            return $http({
                url: serviceBase + 'api/Page/GetPagesList',
                method: "post",
                data: tpfilter
            });
        };

        // Get Pages by Id
        var _getPageById = function (id) { 

            return $http({
                url: serviceBase + 'api/Page/GetPageById/' + id,
                method: "get" 
            });
        };


        //Create New Page
        var _createPage = function (page) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/Page/SavePage',
                data: page
            });
            return request;
        };

        //Update Page 
        var _updatePage = function (page) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/Page/UpdatePage",
                data: page
            });
            return request;
        };

        //Delete Page
        var _deletePage = function (pageid) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/Page/DeletePage/" + pageid
            });
            return request;
        };

        ////Gallery Empty Filter 
        //var _galleryEmptyFilter = function () {
        //    return {
        //        GalleryId: 0,
        //        PageNumber: 1,
        //        PageSize: 20,
        //        ShowAll: 0
        //    };
        //};

        // Get Gallerys by Filter
        var _getGallerys = function (tbfilter) {
            return $http({
                url: serviceBase + 'api/Lookup/Gallery/GetGallerysList',
                method: "post",
                data: tbfilter
            });
        };

        //REGION "POST"

    
        //ENDREGION

        //REGION "PAGEMETADATA"

        // Get PageMetaDatas by Filter
        var _getPageMetaDatas = function (tbfilter) {
            return $http({
                url: serviceBase + 'api/PageMetaData/GetPageMetaDatasList',
                method: "post",
                data: tbfilter
            });
        };

        //Create New PageMetaData
        var _createPageMetaData = function (pagemetadata) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/PageMetaData/SavePageMetaData',
                data: pagemetadata
            });
            return request;
        };

        //Update PageMetaData 
        var _updatePageMetaData = function (pagemetadata) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/PageMetaData/UpdatePageMetaData",
                data: pagemetadata
            });
            return request;
        };

        //Delete PageMetaData
        var _deletePageMetaData = function (pagemetadataid) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/PageMetaData/DeletePageMetaData/" + pagemetadataid
            });
            return request;
        }; 

        //ENDREGION

        // REGION "Page Content"


        //_PageContent Empty Filter 
        var _pagecontentEmptyFilter = function () {
            return {
                Id: 0,
                PageId: 0,
                PageNumber: 1,
                PageSize: 20,
                ShowAll: 0
            };
        };



        // Get Page Contents by Page Id
        var _getPageContentsByPageId = function (pageId) {
            return $http({
                url: serviceBase + 'api/page/content/GetPageContentByPageId/'+pageId,
                method: "get"
            });
        };

        // Get _PageContent by Id
        var _getPageContentById = function (id) {
            return $http({
                url: serviceBase + 'api/page/content/GetPageContentById/'+id,
                method: "get"
            });
        };

        //Create New _PageContent
        var _create_PageContent = function (_pagecontent) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/Page/content/SavePageContent',
                data: _pagecontent
            });
            return request;
        };

        //Update _PageContent 
        var _update_PageContent = function (pagecontent) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/Page/content/UpdatePageContent",
                data: pagecontent
            });
            return request;
        };

        //Delete PageContent
        var _delete_PageContent = function (contentid) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/page/Content/DeletePageContent/" + contentid
            });
            return request;
        };

        //end region "Page content"
         


        pageServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        pageServiceFactory.GetDDLByFilter = _getDDLList;
        pageServiceFactory.getPages = _getPages;
        pageServiceFactory.getPageById = _getPageById;

        pageServiceFactory.createPage = _createPage;
        pageServiceFactory.updatePage = _updatePage;
        pageServiceFactory.deletePage = _deletePage;
        pageServiceFactory.PageEmptyFilter = _pageEmptyFilter;

        
        pageServiceFactory.getPageMetaDatas = _getPageMetaDatas;
        pageServiceFactory.createPageMetaData = _createPageMetaData;
        pageServiceFactory.updatePageMetaData = _updatePageMetaData;
        pageServiceFactory.deletePageMetaData = _deletePageMetaData; 
       

        pageServiceFactory.getPageContentsByPageId = _getPageContentsByPageId;
        pageServiceFactory.getPageContentById = _getPageContentById;
        pageServiceFactory.create_PageContent = _create_PageContent;
        pageServiceFactory.update_PageContent = _update_PageContent;
        pageServiceFactory.delete_PageContent = _delete_PageContent;
        pageServiceFactory._PageContentEmptyFilter = _pagecontentEmptyFilter;

        return pageServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('pageController', ['$scope', '$window', 'pageService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $window, pageService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = true;

        $scope.pageActionTitle = 'Add New Page';
        $scope.title = "Page Title";
        $scope.url = 'Page Url';
        $scope.contentMode = "VIEW";
        $scope.page = {Id: _pageid};
        $scope.pagecontent = {Id:0}; // Page Content add edit
        $scope.pagecontents = []; //Page contents; 
        //Populate DDLs
        $scope.categoryddl = [];
        //$scope.tagsddl = [];
        $scope.contentsddl = []; // Contents ddl
        $scope.reportfiltertypes = [
            { Name: "TEXTBOX" }, { Name: "DATE" }, { Name: "DROPDOWN" }
        ];

        var ddlFilter = pageService.DDLDefaultFilter();
        pageService.GetDDLByFilter(ddlFilter).then(function (results) {
            $scope.ddLItems = angular.fromJson(results.data.DDLItems); 

            //Load ddl 
            $scope.categoryddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "GAME-CATEGORY" })[0].Items;
            //$scope.tagsddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "TAGS" })[0].Items;
            $scope.contentsddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "CONTENTTYPE" })[0].Items;
             if ($scope.page.Id > 0) {
                LoadPageById();
            } else { $scope.loading = false;}
        });


        //Update Page
        $scope.CreateUpdatePage = function (frm, Id) {
            if (frm.$invalid) { return; }
            if (Id == 0) { CreateNewPage($scope.page); } else { UpdatePage($scope.page); }
        };


        // Create New Page Function 
        function CreateNewPage(page) {
 
            $scope.loading = true;
            pageService.createPage(page).then(function (results) {
                MSG({ 'elm': "Page_AddEditAlert", "MsgType": "OK", "MsgText": "Page added successfully." });
                $window.location.href = "/Page/AddEdit/" + results.data.Id;
            }, function (error) {
                MSG({ 'elm': "Page_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding page!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        }

        // Create New Page Function 
        function UpdatePage(page) {

            $scope.loading = true;
            pageService.updatePage(page).then(function (results) {
                MSG({ 'elm': "Page_AddEditAlert", "MsgType": "OK", "MsgText": "Page added successfully." });
                $scope.loading = false; 
             }, function (error) {
                MSG({ 'elm': "Page_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding page!', 'MsgAsModel': error.data });
                $scope.page_loading = false;
            });
        }

        function LoadPageById() {
            MSG({}); //Init
            pageService.getPageById($scope.page.Id).then(function (results) {
                if (results.data == null) {
                    $scope.loading = false;
                    MSG({ 'elm': "Page_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading page!', 'MsgAsModel': results });
                    return;
                }
                $scope.page = results.data; 
                GetPageContents($scope.page.Id);
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "Page_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading page!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        }

        //REGION PAGE CONTENT

        //Add New Page Content; UI Display only
        $scope.AddNewPageContent = function () {
            $scope.contentMode = "ADDEDIT";
            $scope.pagecontentActionTitle = "Add Page Content";
            $scope.pagecontent = { Id: 0, Filters:[] };
        }

        //Update Page Content; UI Display only
        //get the content first and then render.
        $scope.UpdatePageContent = function (Id) {
            $scope.loading = true;
            MSG({}); //Init

            pageService.getPageContentById(Id).then(function (results) {
                if (results.data == null) {
                    $scope.loading = false;
                    MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading pagecontents!', 'MsgAsModel': error.data });
                    return;
                }

                $scope.pagecontent = results.data;
                $scope.pagecontent.Filters = [];
                if ($scope.pagecontent.FilterJSON !== null) { $scope.pagecontent.Filters = angular.fromJson($scope.pagecontent.FilterJSON); }

                $scope.pagecontentActionTitle = "Update Page Content";
                $scope.contentMode = "ADDEDIT";

                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading pagecontents!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });

         }


        //Cancel Page Content
        $scope.CancelAddEditContent = function () {
            $scope.contentMode = "VIEW";
            $scope.pagecontentActionTitle = "";
            $scope.pagecontent = {};
        }
        //Save Page Content
        $scope.CreateUpdate_PageContent = function (Id) {
            if ($scope.pagecontent.ContentType == "") {
                MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'Content Type is missing' });
                 return;
            }
            if ($scope.pagecontent.Title == "") {
                MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'Title is missing' });
                return;
            }

            if ($scope.pagecontent.ContentVal == "") {
                MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'Content is missing' });
                return;
            } 
            $scope.pagecontent.PageId = _pageid;
            $scope.pagecontent.FilterJSON = angular.toJson($scope.pagecontent.Filters);

            if ($scope.pagecontent.Id == 0) { CreateNew_PageContent($scope.pagecontent); } else { Update_PageContent($scope.pagecontent); }
        }


        // Create New _PageContent Function 
        function CreateNew_PageContent(pagecontent) {
            $scope.loading = true;
            pageService.create_PageContent(pagecontent).then(function (results) {
                $scope.loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "_PageContent_alert", "MsgType": "OK", "MsgText": "Content added successfully." });
                $scope.CancelAddEditContent();
                GetPageContents($scope.page.Id);
            }, function (error) {
                MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding pagecontent!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        }

        //Update _PageContent Function 
        function Update_PageContent(pagecontent) {
            $scope.loading = true;
            pageService.update_PageContent(pagecontent).then(function (results) {
                angular.forEach($scope.pagecontents, function (value, key) {
                    if ($scope.pagecontents[key].Id === pagecontent.Id) {
                        $scope.pagecontents[key] = results.data;
                        return false;
                    }
                });
                $scope.loading = false;

                $scope.CancelAddEditContent($scope.page.Id);
                GetPageContents($scope.page.Id);

                MSG({ 'elm': "_PageContent_alert", "MsgType": "OK", "MsgText": "Content updated successfully." });
            }, function (error) {
                MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating content!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };


        //Delete _PageContent
        $scope.Delete_PageContent = function (Id) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Content',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                pageService.delete_PageContent(Id).then(function (results) {
                    angular.forEach($scope.pagecontents, function (value, key) {
                        if ($scope.pagecontents[key].Id === Id) {
                            $scope.pagecontents.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': "_PageContent_alert", "MsgType": "OK", "MsgText": "_PageContent deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting pagecontents!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };


        // Function to Get _PageContent
        function GetPageContents(PageId) {
            $scope.loading = true;
            pageService.getPageContentsByPageId(PageId).then(function (results) {
                $scope.pagecontents = results.data;
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "_PageContent_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading contents!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };

        // ./PAGE CONTENT 

        //REGION "FILTERS FOR SCRIPTs"

        //Add New Filter
        $scope.AddNewFilter = function () {
            $scope.pagecontent.Filters.push({ Title: "", Model: "", Type: "TEXTBOX", PlaceHolder: "", AllowFilter: true });
        };


        //Remove filter
        $scope.RemoveFilter = function (item) {
            if (confirm('Are you sure to delete this filter?')) {
                var index = $scope.pagecontent.Filters.indexOf(item);
                $scope.pagecontent.Filters.splice(index, 1);
            }
        };

        //.//FILTERS FOr SCRIPTs

    }]);
}());
 