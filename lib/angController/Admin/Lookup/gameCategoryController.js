//Created By: Prashant 
//Created On: 16/07/2020 
// Controller for GameCategory 
// Initialization for GameCategory 

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For GameCategory 
; (function () {
    'use strict';
    rolpo_app.factory('gamecategoryService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var gamecategoryServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditGameCategory",
                FilterList: []
            };
        };

        //GameCategory Empty Filter 
        var _gamecategoryEmptyFilter = function () {
            return {
                Id: 0,
                CategoryName: "",
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

        // Get GameCategorys by Filter
        var _getGameCategorys = function (tbfilter) {
            return $http({
                url: serviceBase + 'api/Lookup/GameCategory/GetGameCategorysList',
                method: "post",
                data: tbfilter
            });
        };

        // Get GameCategorys by Id
        var _getGameCategorysById = function (id) {
            return $http({
                url: serviceBase + 'api/Lookup/GameCategory/GetGameCategoryById',
                method: "get",
                params: { id: id}
            });
        };

        //Create New GameCategory
        var _createGameCategory = function (gamecategory) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/Lookup/GameCategory/SaveGameCategory',
                data: gamecategory
            });
            return request;
        };

        //Update GameCategory 
        var _updateGameCategory = function (gamecategory) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/Lookup/GameCategory/UpdateGameCategory",
                data: gamecategory
            });
            return request;
        };

        //Delete GameCategory
        var _deleteGameCategory = function (id) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/Lookup/GameCategory/DeleteGameCategory/" + id
            });
            return request;
        };

        gamecategoryServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        gamecategoryServiceFactory.GetDDLByFilter = _getDDLList;
        gamecategoryServiceFactory.getGameCategorys = _getGameCategorys;
        gamecategoryServiceFactory.getGameCategorysById = _getGameCategorysById;
        gamecategoryServiceFactory.createGameCategory = _createGameCategory;
        gamecategoryServiceFactory.updateGameCategory = _updateGameCategory;
        gamecategoryServiceFactory.deleteGameCategory = _deleteGameCategory;
        gamecategoryServiceFactory.GameCategoryEmptyFilter = _gamecategoryEmptyFilter;

        return gamecategoryServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('gamecategoryController', ['$scope', '$rootScope', 'gamecategoryService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, gamecategoryService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = true;
        $scope.gamecategorys = [];
        $scope.gamecategory = {};
        $scope.GameCategoryPageInfo = {};

        ////ddls
        //$scope.gametypesddl = []; //game type ddl
        //$scope.categorygroupsddl = []; //category groups ddl

        ////Populate DDLs
        //var ddlFilter = gamecategoryService.DDLDefaultFilter();
        //gamecategoryService.GetDDLByFilter(ddlFilter).then(function (results) {
        //    $scope.ddLItems = angular.fromJson(results.data.DDLItems);

        //    //Get gametypes ddl
        //    $scope.gametypesddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "GAMETYPE" })[0].Items;

        //    //Get category groups ddl
        //    $scope.categorygroupsddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "CATEGORYGROUP" })[0].Items;

        //});

        // Methods

        // Get GameCategory by Filter

        $scope.GetGameCategoryByFilter = function () {
            GetGameCategorys($scope.tbfilter);
        };

        // Reset GameCategory Filter
        $scope.ResetGameCategoryFilter = function () {
            var pageSize = $scope.tbfilter.PageSize;

            $scope.tbfilter = gamecategoryService.GameCategoryEmptyFilter();
            $scope.tbfilter.PageSize = pageSize;

            GetGameCategorys($scope.tbfilter);
        };

        //On GameCategory Page Changed
        $scope.OnGameCategoryPageChanged = function () {
            GetGameCategorys($scope.tbfilter);
        };

        //On Page Size Changed
        $scope.OnGameCategoryPageSizeChanged = function () {
            GetGameCategorys($scope.tbfilter);
        };

        // Open Window for Saving new GameCategory
        $scope.OpenGameCategorySaveDialog = function () {
            $scope.gamecategory = { Id: 0 };
            MSG({}); //Init
            $scope.gamecategoryActionTitle = "Add New GameCategory";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                //windowClass: "modal-custom-extension", 
                templateUrl: 'customUpdateGameCategory',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        // Open Window for updating GameCategory
        $scope.OpenGameCategoryUpdateDialog = function (Id) {
            $scope.loading = true;
            MSG({}); //Init

            gamecategoryService.getGameCategorysById(Id).then(function (results) {
                if (results.data == null) {
                    $scope.loading = false;
                    MSG({ 'elm': "GameCategory_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading gamecategorys!', 'MsgAsModel': error.data });
                    return;
                }
                $scope.gamecategory = results.data;
                $scope.gamecategoryActionTitle = "Update GameCategory";

                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'customUpdateGameCategory',
                    //windowClass: "modal-custom-extension", 
                    backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: ''
                });
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "GameCategory_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading gamecategorys!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });

        };

        //Update GameCategory
        $scope.CreateUpdateGameCategory = function (frm, Id) {
            if (frm.$invalid) { return; }
            if (Id == 0) { CreateNewGameCategory($scope.gamecategory); } else { UpdateGameCategory($scope.gamecategory); }
        };

        //Delete GameCategory
        $scope.DeleteGameCategory = function (Id) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete GameCategory',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                gamecategoryService.deleteGameCategory(Id).then(function (results) {
                    angular.forEach($scope.gamecategorys, function (value, key) {
                        if ($scope.gamecategorys[key].Id === Id) {
                            $scope.gamecategorys.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': "GameCategory_alert", "MsgType": "OK", "MsgText": "GameCategory deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "GameCategory_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting gamecategorys!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 

        // Function to Get GameCategory
        function GetGameCategorys(tbfilter) {
            $scope.loading = true;
            $scope.HasTB_Records = false;
            gamecategoryService.getGameCategorys(tbfilter).then(function (results) {
                $scope.gamecategorys = results.data;
                var tmp_page_start = (($scope.tbfilter.PageNumber - 1) * ($scope.tbfilter.PageSize) + 1), tmp_page_end = ($scope.tbfilter.PageNumber) * ($scope.tbfilter.PageSize);
                if (results.data.length > 0) {
                    $scope.GameCategoryPageInfo = {
                        Has_record: true,
                        TotalItems: results.data[0]["TotalCount"],
                        PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
                    };
                } else { $scope.GameCategoryPageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "GameCategory_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading gamecategorys!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };

        // Create New GameCategory Function 
        function CreateNewGameCategory(gamecategory) {
            $scope.gamecategory_loading = true;
            gamecategoryService.createGameCategory(gamecategory).then(function (results) {
                $scope.gamecategorys.push(results.data);
                $scope.gamecategory_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "GameCategory_alert", "MsgType": "OK", "MsgText": "GameCategory added successfully." });
            }, function (error) {
                MSG({ 'elm': "GameCategory_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding gamecategory!', 'MsgAsModel': error.data });
                $scope.gamecategory_loading = false;
            });
        }

        //Update GameCategory Function 
        function UpdateGameCategory(gamecategory) {
            $scope.gamecategory_loading = true;
            gamecategoryService.updateGameCategory(gamecategory).then(function (results) {
                angular.forEach($scope.gamecategorys, function (value, key) {
                    if ($scope.gamecategorys[key].Id === gamecategory.Id) {
                        $scope.gamecategorys[key] = results.data;
                        return false;
                    }
                });
                $scope.gamecategory_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "GameCategory_alert", "MsgType": "OK", "MsgText": "GameCategory updated successfully." });
            }, function (error) {
                MSG({ 'elm': "GameCategory_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating gamecategory!', 'MsgAsModel': error.data });
                $scope.gamecategory_loading = false;
            });
        };

        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        };

        // Call GameCategory for first time
        $scope.GameCategoryPageInfo = {};
        $scope.tbfilter = gamecategoryService.GameCategoryEmptyFilter();
        $scope.tbfilter.PageNumber = 1;
        $scope.tbfilter.PageSize = '20';

        GetGameCategorys($scope.tbfilter);

    }]);
}());

