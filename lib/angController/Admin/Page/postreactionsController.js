

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For Postreactions 
; (function () {
    'use strict';
    rolpo_app.factory('postreactionsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var postreactionsServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditPostreactions",
                FilterList: [
                    {
                        DDLName: "POSTS",
                        Param1: "",
                        Param2: "HIDE_DEFAULT"
                    }
                ]
            };
        };

        //Postreactions Empty Filter 
        var _postreactionsEmptyFilter = function () {
            return {
                ReactionId: 0,
                PostId: 0,
                PageNumber: 1,
                PageSize: 20,
                ShowAll: 0
            };
        };

        // Get DDL List by Filter
        var _getDDLList = function (ddlFilter) {
            return $http({
                url: serviceBase + 'api/Home/LoadDDLs',
                method: "post",
                data: ddlFilter
            });
        };

        // Get Postreactionss by Filter
        var _getPostreactionss = function (tbfilter) {
            return $http({
                url: serviceBase + 'api/Postreactions/GetPostreactionssList',
                method: "post",
                data: tbfilter
            });
        };

        // Get Postreactionss by Id
        var _getPostreactionssById = function (tb) {
            return $http({
                url: serviceBase + 'api/Postreactions/GetPostreactionsById',
                method: "get",
                params: { reactionid: tb }
            });
        };

        //Create New Postreactions
        var _createPostreactions = function (postreactions) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/Postreactions/SavePostreactions',
                data: postreactions
            });
            return request;
        };

        //Update Postreactions 
        var _updatePostreactions = function (postreactions) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/Postreactions/UpdatePostreactions",
                data: postreactions
            });
            return request;
        };

        //Delete Postreactions
        var _deletePostreactions = function (reactionid) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/Postreactions/DeletePostreactions/" + reactionid
            });
            return request;
        };

        postreactionsServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        postreactionsServiceFactory.GetDDLByFilter = _getDDLList;
        postreactionsServiceFactory.getPostreactionss = _getPostreactionss;
        postreactionsServiceFactory.getPostreactionssById = _getPostreactionssById;
        postreactionsServiceFactory.createPostreactions = _createPostreactions;
        postreactionsServiceFactory.updatePostreactions = _updatePostreactions;
        postreactionsServiceFactory.deletePostreactions = _deletePostreactions;
        postreactionsServiceFactory.PostreactionsEmptyFilter = _postreactionsEmptyFilter;

        return postreactionsServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('postreactionsController', ['$scope', '$rootScope', 'postreactionsService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, postreactionsService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = true;
        $scope.postreactionss = [];
        $scope.postreactions = {};
        $scope.PostreactionsPageInfo = {};
        $scope.postsddl = [];
        $scope.limit = 45;

        //Populate DDLs
        var ddlFilter = postreactionsService.DDLDefaultFilter();
        postreactionsService.GetDDLByFilter(ddlFilter).then(function (results) {
            $scope.ddLItems = angular.fromJson(results.data.DDLItems);
            $scope.postsddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "POSTS" })[0].Items;
        });

        // Methods

        // Get Postreactions by Filter

        $scope.GetPostreactionsByFilter = function () {
            GetPostreactionss($scope.tbfilter);
        };

        // Reset Postreactions Filter
        $scope.ResetPostreactionsFilter = function () {
            var pageSize = $scope.tbfilter.PageSize;

            $scope.tbfilter = postreactionsService.PostreactionsEmptyFilter();
            $scope.tbfilter.PageSize = pageSize;

            GetPostreactionss($scope.tbfilter);
        };

        //On Postreactions Page Changed
        $scope.OnPostreactionsPageChanged = function () {
            GetPostreactionss($scope.tbfilter);
        };

        //On Page Size Changed
        $scope.OnPostreactionsPageSizeChanged = function () {
            GetPostreactionss($scope.tbfilter);
        };

        // Open Window for Saving new Postreactions
        $scope.OpenPostreactionsSaveDialog = function () {
            $scope.postreactions = { ReactionId: 0 };
            MSG({}); //Init
            $scope.postreactionsActionTitle = "Add New Post Reactions";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension", 
                templateUrl: 'customUpdatePostreactions',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        // Open Window for updating Postreactions
        $scope.OpenPostreactionsUpdateDialog = function (ReactionId) {
            $scope.loading = true;
            MSG({}); //Init

            postreactionsService.getPostreactionssById(ReactionId).then(function (results) {
                if (results.data == null) {
                    $scope.loading = false;
                    MSG({ 'elm': "Postreactions_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading postreactionss!', 'MsgAsModel': error.data });
                    return;
                }
                $scope.postreactions = results.data;
                $scope.postreactionsActionTitle = "Update Post Reactions";

                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'customUpdatePostreactions',
                    windowClass: "modal-custom-extension", 
                    backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: ''
                });
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "Postreactions_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading postreactionss!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });

        };

        //Update Postreactions
        $scope.CreateUpdatePostreactions = function (frm, ReactionId) {
            if (frm.$invalid) { return; }
            if (ReactionId == 0) { CreateNewPostreactions($scope.postreactions); } else { UpdatePostreactions($scope.postreactions); }
        };

        //Delete Postreactions
        $scope.DeletePostreactions = function (ReactionId) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Postreactions',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                postreactionsService.deletePostreactions(ReactionId).then(function (results) {
                    angular.forEach($scope.postreactionss, function (value, key) {
                        if ($scope.postreactionss[key].ReactionId === ReactionId) {
                            $scope.postreactionss.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': "Postreactions_alert", "MsgType": "OK", "MsgText": "Postreactions deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "Postreactions_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting postreactionss!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 

        // Function to Get Postreactions
        function GetPostreactionss(tbfilter) {
            $scope.loading = true;
            $scope.HasTB_Records = false;
            postreactionsService.getPostreactionss(tbfilter).then(function (results) {
                $scope.postreactionss = results.data;
                var tmp_page_start = (($scope.tbfilter.PageNumber - 1) * ($scope.tbfilter.PageSize) + 1), tmp_page_end = ($scope.tbfilter.PageNumber) * ($scope.tbfilter.PageSize);
                if (results.data.length > 0) {
                    $scope.PostreactionsPageInfo = {
                        Has_record: true,
                        TotalItems: results.data[0]["TotalCount"],
                        PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
                    };
                } else { $scope.PostreactionsPageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "Postreactions_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading postreactionss!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };

        // Create New Postreactions Function 
        function CreateNewPostreactions(postreactions) {
            $scope.postreactions_loading = true;
            postreactionsService.createPostreactions(postreactions).then(function (results) {
                $scope.postreactionss.push(results.data);
                $scope.postreactions_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "Postreactions_alert", "MsgType": "OK", "MsgText": "Postreactions added successfully." });
            }, function (error) {
                MSG({ 'elm': "Postreactions_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding postreactions!', 'MsgAsModel': error.data });
                $scope.postreactions_loading = false;
            });
        }

        //Update Postreactions Function 
        function UpdatePostreactions(postreactions) {
            $scope.postreactions_loading = true;
            postreactionsService.updatePostreactions(postreactions).then(function (results) {
                angular.forEach($scope.postreactionss, function (value, key) {
                    if ($scope.postreactionss[key].ReactionId === postreactions.ReactionId) {
                        $scope.postreactionss[key] = results.data;
                        return false;
                    }
                });
                $scope.postreactions_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "Postreactions_alert", "MsgType": "OK", "MsgText": "Postreactions updated successfully." });
            }, function (error) {
                MSG({ 'elm': "Postreactions_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating postreactions!', 'MsgAsModel': error.data });
                $scope.postreactions_loading = false;
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

        // Call Postreactions for first time
        $scope.PostreactionsPageInfo = {};
        $scope.tbfilter = postreactionsService.PostreactionsEmptyFilter();
        $scope.tbfilter.PageNumber = 1;
        $scope.tbfilter.PageSize = '20';

        GetPostreactionss($scope.tbfilter);

    }]);
}());

