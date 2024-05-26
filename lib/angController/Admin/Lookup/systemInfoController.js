//Created By: Prashant 
//Created On: 07/01/2019 
// Controller for SystemInfo 
// Initialization for SystemInfo 

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
}); 

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For SystemInfo 
; (function () {
    'use strict';
    rolpo_app.factory('systeminfoService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var systeminfoServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditSystemInfo",
                FilterList: [
                ]
            };
        };

        //SystemInfo Empty Filter 
        var _systeminfoEmptyFilter = function () {
            return {
                Id: 0,
                InfoName: "",
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

        // Get SystemInfos by Filter
        var _getSystemInfos = function (tbfilter) {
            return $http({
                url: serviceBase + 'api/Lookup/SystemInfo/GetSystemInfosList',
                method: "post",
                data: tbfilter
            });
        };

        //Get system info by Id
        var _getSystemInfobyId = function (id) {
            return $http({
                url: serviceBase + 'api/Lookup/SystemInfo/GetSystemInfoById',
                method: "get",
                params: { id: id }
            });
        }

        //Create New SystemInfo
        var _createSystemInfo = function (systeminfo) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/Lookup/SystemInfo/SaveSystemInfo',
                data: systeminfo
            });
            return request;
        };

        //Update SystemInfo 
        var _updateSystemInfo = function (systeminfo) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/Lookup/SystemInfo/UpdateSystemInfo",
                data: systeminfo
            });
            return request;
        };

        //Delete SystemInfo
        var _deleteSystemInfo = function (infoid) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/Lookup/SystemInfo/DeleteSystemInfo/" + infoid
            });
            return request;
        };

        systeminfoServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        systeminfoServiceFactory.GetDDLByFilter = _getDDLList;
        systeminfoServiceFactory.getSystemInfos = _getSystemInfos;
        systeminfoServiceFactory.getSystemInfobyId = _getSystemInfobyId;
        systeminfoServiceFactory.createSystemInfo = _createSystemInfo;
        systeminfoServiceFactory.updateSystemInfo = _updateSystemInfo;
        systeminfoServiceFactory.deleteSystemInfo = _deleteSystemInfo;
        systeminfoServiceFactory.SystemInfoEmptyFilter = _systeminfoEmptyFilter;

        return systeminfoServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('systeminfoController', ['$scope', '$rootScope', 'systeminfoService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, systeminfoService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = true;
        $scope.systeminfos = [];
        $scope.systeminfo = {};
        $scope.SystemInfoPageInfo = {};

        //Populate DDLs
        var ddlFilter = systeminfoService.DDLDefaultFilter();
        systeminfoService.GetDDLByFilter(ddlFilter).then(function (results) {
            $scope.ddLItems = angular.fromJson(results.data.DDLItems);

        });

        // Methods

        // Get SystemInfo by Filter

        $scope.GetSystemInfoByFilter = function () {
            GetSystemInfos($scope.tbfilter);
        };

        // Reset SystemInfo Filter
        $scope.ResetSystemInfoFilter = function () {
            var pageSize = $scope.tbfilter.PageSize;

            $scope.tbfilter = systeminfoService.SystemInfoEmptyFilter();
            $scope.tbfilter.PageSize = pageSize;

            GetSystemInfos($scope.tbfilter);
        };

        //On SystemInfo Page Changed
        $scope.OnSystemInfoPageChanged = function () {
            GetSystemInfos($scope.tbfilter);
        };

        //On Page Size Changed
        $scope.OnSystemInfoPageSizeChanged = function () {
            GetSystemInfos($scope.tbfilter);
        };

        // Open Window for Saving new SystemInfo
        $scope.OpenSystemInfoSaveDialog = function () {
            $scope.systeminfo = { Id: 0 };
            MSG({}); //Init
            $scope.systeminfoActionTitle = "Add New SystemInfo";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension", 
                templateUrl: 'customUpdateSystemInfo',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        // Open Window for updating SystemInfo
        $scope.OpenSystemInfoUpdateDialog = function (Id) {

            $scope.loading = true;
            MSG({}); //Init
            console.log(Id);
            systeminfoService.getSystemInfobyId(Id).then(function (results) {
                if (results.data == null) {
                    $scope.loading = false;
                    MSG({ 'elm': "SystemInfo_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading systeminfos!'});
                    return;
                }
                $scope.systeminfo = results.data;
                $scope.systeminfoActionTitle = "Update SystemInfo";

                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'customUpdateSystemInfo',
                    windowClass: "modal-custom-extension", 
                    backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: ''
                });
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "SystemInfo_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading systeminfos!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });

        };

        //Update SystemInfo
        $scope.CreateUpdateSystemInfo = function (frm, Id) {
            if (frm.$invalid) { return; }
            if (Id == 0) { CreateNewSystemInfo($scope.systeminfo); } else { UpdateSystemInfo($scope.systeminfo); }
        };

        //Delete SystemInfo
        $scope.DeleteSystemInfo = function (Id) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete SystemInfo',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                systeminfoService.deleteSystemInfo(Id).then(function (results) {
                    angular.forEach($scope.systeminfos, function (value, key) {
                        if ($scope.systeminfos[key].Id === Id) {
                            $scope.systeminfos.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': "SystemInfo_alert", "MsgType": "OK", "MsgText": "SystemInfo deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "SystemInfo_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting systeminfos!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 

        // Function to Get SystemInfo
        function GetSystemInfos(tbfilter) {
            $scope.loading = true;
            $scope.HasTB_Records = false;
            systeminfoService.getSystemInfos(tbfilter).then(function (results) {
                $scope.systeminfos = results.data;
                var tmp_page_start = (($scope.tbfilter.PageNumber - 1) * ($scope.tbfilter.PageSize) + 1), tmp_page_end = ($scope.tbfilter.PageNumber) * ($scope.tbfilter.PageSize);
                if (results.data.length > 0) {
                    $scope.SystemInfoPageInfo = {
                        Has_record: true,
                        TotalItems: results.data[0]["TotalCount"],
                        PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
                    };
                } else { $scope.SystemInfoPageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "SystemInfo_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading systeminfos!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };

        // Create New SystemInfo Function 
        function CreateNewSystemInfo(systeminfo) {
            $scope.systeminfo_loading = true;
            systeminfoService.createSystemInfo(systeminfo).then(function (results) {
                $scope.systeminfos.push(results.data);
                $scope.systeminfo_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "SystemInfo_alert", "MsgType": "OK", "MsgText": "SystemInfo added successfully." });
            }, function (error) {
                MSG({ 'elm': "SystemInfo_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding systeminfo!', 'MsgAsModel': error.data });
                $scope.systeminfo_loading = false;
            });
        }

        //Update SystemInfo Function 
        function UpdateSystemInfo(systeminfo) {
            $scope.systeminfo_loading = true;
            systeminfoService.updateSystemInfo(systeminfo).then(function (results) {
                angular.forEach($scope.systeminfos, function (value, key) {
                    if ($scope.systeminfos[key].Id === systeminfo.Id) {
                        $scope.systeminfos[key] = systeminfo;
                        return false;
                    }
                });
                $scope.systeminfo_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "SystemInfo_alert", "MsgType": "OK", "MsgText": "SystemInfo updated successfully." });
            }, function (error) {
                MSG({ 'elm': "SystemInfo_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating systeminfo!', 'MsgAsModel': error.data });
                $scope.systeminfo_loading = false;
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

        // Call SystemInfo for first time
        $scope.SystemInfoPageInfo = {};
        $scope.tbfilter = systeminfoService.SystemInfoEmptyFilter();
        $scope.tbfilter.PageNumber = 1;
        $scope.tbfilter.PageSize = '20';

        GetSystemInfos($scope.tbfilter);

    }]);
}());

