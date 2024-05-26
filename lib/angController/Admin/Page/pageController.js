rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

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
                FilterList: []
            };
        };

        //Page Empty Filter 
        var _pageEmptyFilter = function () {
            return {
                PageId: 0,
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
        var _getPageById = function (pageid) {
            return $http({
                url: serviceBase + 'api/Page/GetPageById',
                method: "get",
                params: { pageid: pageid}
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

        //Gallery Empty Filter 
        var _galleryEmptyFilter = function () {
            return {
                GalleryId: 0,
                PageNumber: 1,
                PageSize: 20,
                ShowAll: 0
            };
        };

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

         

       
        return pageServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('pageController', ['$scope', '$rootScope', 'pageService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, pageService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = true;
        $scope.pages = [];
        $scope.page = {};
        $scope.PagePageInfo = {}; 
        $scope.page.tags = [];
        $scope.page.categories = [];
        //$scope.menusddl = [];
        
        $scope.pagemetadatas = [];
        $scope.pagemetadata = {};

        $scope.posts = [];

 
 
        // Methods

        // Get Page by Filter

        $scope.GetPageByFilter = function () {
            GetPages($scope.tpfilter);
        };

        // Reset Page Filter
        $scope.ResetPageFilter = function () {
            var pageSize = $scope.tpfilter.PageSize;

            $scope.tpfilter = pageService.PageEmptyFilter();
            $scope.tpfilter.PageSize = pageSize;

            GetPages($scope.tpfilter);
        };


        //On Page Page Changed
        $scope.OnPagePageChanged = function () {
            GetPages($scope.tpfilter);
        };

        //On Page Size Changed
        $scope.OnPagePageSizeChanged = function () {
            GetPages($scope.tpfilter);
        };
         
 

        //Delete Page
        $scope.DeletePage = function (PageId) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Page',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                pageService.deletePage(PageId).then(function (results) {
                    angular.forEach($scope.pages, function (value, key) {
                        if ($scope.pages[key].PageId === PageId) {
                            $scope.pages.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': "Page_alert", "MsgType": "OK", "MsgText": "Page deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "Page_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting pages!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 

        // Function to Get Page
        function GetPages(tpfilter) {
            $scope.loading = true;
            $scope.HasTB_Records = false;
            tpfilter.PageType = 'PAGE';
            pageService.getPages(tpfilter).then(function (results) {
                $scope.pages = results.data;
                var tmp_page_start = (($scope.tpfilter.PageNumber - 1) * ($scope.tpfilter.PageSize) + 1), tmp_page_end = ($scope.tpfilter.PageNumber) * ($scope.tpfilter.PageSize);
                if (results.data.length > 0) {
                    $scope.PagePageInfo = {
                        Has_record: true,
                        TotalItems: results.data[0]["TotalCount"],
                        PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
                    };
                } else { $scope.PagePageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "Page_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading pages!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };
         

        //REGION "PAGEMETADATA"

        $scope.metadata = {};
        $scope.metadatas = [];

        // Open Window for adding/updating metadata
        $scope.AddUpdateMetaData = function (page) {
            $scope.loading = true;
            $scope.metadatas = [];
            $scope.page.Id = page.Id;
            var input = { ShowAll: 1, PageId: page.Id };
            pageService.getPageMetaDatas(input).then(function (results) {
                $scope.metadatas = results.data;
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "PageMetaData_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading pagemetadatas!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });

            MSG({}); //Init

            $scope.pageActionTitle = "Add/Update meta data";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension",
                templateUrl: 'customMetaData',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: 'lg'
            });
             
        };

        //Update Page
        $scope.CreateUpdateMetaData = function (frm) {
            if (frm.$invalid) { return; }
            if ($scope.metadata.PageMetaDataId == 0) { CreateNewMetaData($scope.metadata); } else { UpdateMetaData($scope.metadata); }
        };


        //Add New MetaData
        $scope.AddNewMetaData = function () {
            $scope.metadata = { PageMetaDataId: 0 };
            $scope.EnableAddEditMetaData = true;
        };

        //Add New MetaData
        $scope.UpdateMetadata = function (metadata) {
            $scope.metadata = angular.copy(metadata);
            $scope.EnableAddEditMetaData = true;
        };

        //Delete MetaData
        $scope.DeletePageMetaData = function (metadataid) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Page',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                pageService.deletePageMetaData(metadataid).then(function (results) {
                    angular.forEach($scope.metadatas, function (value, key) {
                        if ($scope.metadatas[key].PageMetaDataId === metadataid) {
                            $scope.metadatas.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': "PageMetaData_alert", "MsgType": "OK", "MsgText": "Page metadata deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "PageMetaData_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting pages!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        }

        //Cancel AddEdit MetaData
        $scope.cancelAddEditMetaData = function () {
            $scope.metadata = {};
            $scope.EnableAddEditMetaData = false;
        }

        //Cancel metadata edition
        $scope.cancelMetaDataEditing = function () {
            if ($scope.EnableAddEditMetaData) {
                $scope.cancelAddEditMetaData();
            } else {
                $scope.cancelEditing();
            }
        }

        function CreateNewMetaData(metadata) {
            metadata.PageId = $scope.page.PageId;
            pageService.createPageMetaData(metadata).then(function (result) {
                var input = { ShowAll: 1, PageId: $scope.page.PageId };
                pageService.getPageMetaDatas(input).then(function (results) {
                    $scope.metadatas = results.data;
                    $scope.loading = false;
                }, function (error) {
                    $scope.loading = false;
                    console.log('Error while getting page meta data', error.data);
                });
                $scope.cancelAddEditMetaData();
                MSG({ 'elm': "PageMetaData_alert", 'MsgType': 'OK', 'MsgText': 'Metadata added successfully' });
            }, function (error) {
                MSG({ 'elm': "PageMetaData_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading pagemetadata!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        }

        function UpdateMetaData(metadata) {
            metadata.PageId = $scope.page.Id;
            pageService.updatePageMetaData(metadata).then(function (results) {
                var input = { ShowAll: 1, PageId: $scope.page.PageId };
                pageService.getPageMetaDatas(input).then(function (results) {
                    $scope.metadatas = results.data;
                    $scope.loading = false;
                }, function (error) {
                    $scope.loading = false;
                    console.log('Error while getting page meta data', error.data);
                });
                $scope.cancelAddEditMetaData();
                MSG({ 'elm': "PageMetaData_alert", 'MsgType': 'OK', 'MsgText': 'Metadata updated successfully' });
            }, function (error) {
                MSG({ 'elm': "PageMetaData_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading pagemetadata!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        }

        //ENDREGION

         

        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        };

        // Call Page for first time
        $scope.PagePageInfo = {};
        $scope.tpfilter = pageService.PageEmptyFilter();
        $scope.tpfilter.PageNumber = 1;
        $scope.tpfilter.PageSize = '20';

        $scope.PagePageInfo = {};
        $scope.tpofilter = pageService.PageEmptyFilter();
        $scope.tpofilter.PageNumber = 1;
        $scope.tpofilter.PageSize = '20';

        GetPages($scope.tpfilter);
 
    }]);
}());
 