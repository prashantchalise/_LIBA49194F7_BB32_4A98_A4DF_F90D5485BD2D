//Created By: Prashant 
//Created On: 01/06/2016 
// Controller for ASPNETUser 
// Initialization for ASPNETUser 

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

rolpo_app.filter('groupby', function () {
    return function (items, group) {
        return items.filter(function (element, index, array) {
            return element.RoleGroup == group;
        });
    }
})


rolpo_app.directive('icheck', ['$timeout', function ($timeout) {
    return {
        require: 'ngModel',
        link: function ($scope, element, $attrs, ngModel) {
            return $timeout(function () {
                var value = $attrs['value'];

                $scope.$watch($attrs['ngModel'], function (newValue) {
                    $(element).iCheck('update');
                })

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_flat-green',
                }).on('ifChanged', function (event) {
                    if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                        $scope.$apply(function () {
                            return ngModel.$setViewValue(event.target.checked);
                        });
                    }
                    if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                        return $scope.$apply(function () {
                            return ngModel.$setViewValue(value);
                        });
                    }
                });
            });
        }
    };
}]);

// Service For ASPNETUser 
; (function () {
    'use strict';
    rolpo_app.factory('aspnetuserService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var aspnetuserServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditASPNETUser",
                FilterList: [
                    //{
                    //    DDLName: "EMPLOYEES",
                    //    Param1: "",
                    //    Param2: "HIDE_DEFAULT"
                    //},
                    {
                        DDLName: "AGENTS",
                        Param1: "",
                        Param2: ""
                    }
                ]
            };
        };

        //ASPNETUser Empty Filter 
        var _aspnetuserEmptyFilter = function () {
            return {
                Id: "",
                FirstName: "",
                LastName: "",
                Email: "",
                SearchText: "",
                PageNumber: 1,
                PageSize: '50',
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

        // Get ASPNETUsers by Filter
        var _getASPNETUsers = function (tafilter) {
            return $http({
                url: serviceBase + 'api/AccountAdmin/GetSystemUsers',
                method: "post",
                data: tafilter
            });
        };

        //Create New ASPNETUser
        var _createASPNETUser = function (aspnetuser) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/AccountAdmin/SaveASPNETUser',
                data: aspnetuser
            });
            return request;
        };

        //Update ASPNETUser 
        var _updateASPNETUser = function (aspnetuser) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/AccountAdmin/UpdateASPNETUser",
                data: aspnetuser
            });
            return request;
        };

        //Delete ASPNETUser
        var _deleteASPNETUser = function (id) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/AccountAdmin/DeleteASPNETUser/" + id
            });
            return request;
        };



        aspnetuserServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        aspnetuserServiceFactory.GetDDLByFilter = _getDDLList;

        aspnetuserServiceFactory.getASPNETUsers = _getASPNETUsers;
        aspnetuserServiceFactory.createASPNETUser = _createASPNETUser;
        aspnetuserServiceFactory.updateASPNETUser = _updateASPNETUser;
        aspnetuserServiceFactory.deleteASPNETUser = _deleteASPNETUser;
        aspnetuserServiceFactory.ASPNETUserEmptyFilter = _aspnetuserEmptyFilter;

        return aspnetuserServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('aspnetuserController', ['$scope', '$rootScope', 'aspnetuserService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, aspnetuserService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 
        $scope.loading = true;
        $scope.aspnetusers = [];
        $scope.aspnetuser = {};
        $scope.ASPNETUserPageInfo = {};
        $scope.roles = [];
        $scope.rolesFromServer = [];
        $scope.employeesddl = [];
        $scope.ddLItems = {};

        $scope.getRoleGroups = function () {
            var groupArray = [];
            angular.forEach($scope.roles, function (item, idx) {
                if (groupArray.indexOf(item.RoleGroup) == -1)
                    groupArray.push(item.RoleGroup)
            });
            return groupArray;
            //return groupArray.sort();
        };

        // ddls
        $scope.agentsddl = []; // agents ddl

        //Populate DDLs
        var ddlFilter = aspnetuserService.DDLDefaultFilter();
        aspnetuserService.GetDDLByFilter(ddlFilter).then(function (results) {
            $scope.ddLItems = GETJ(results.data.DDLItems);

            //Get agents ddl 
            $scope.agentsddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "AGENTS" })[0].Items;

        });

        // Methods

        // Get ASPNETUser by Filter

        $scope.GetASPNETUserByFilter = function () {
            GetASPNETUsers($scope.tafilter);
        };

        // Reset Filter
        $scope.ResetAspNetUserFilter = function () {
            var pageSize = $scope.tafilter.PageSize;

            $scope.tafilter = aspnetuserService.ASPNETUserEmptyFilter();
            $scope.tafilter.PageSize = pageSize;
            GetASPNETUsers($scope.tafilter);
        };

        //On Page Changed
        $scope.OnPageChanged = function () {
            GetASPNETUsers($scope.tafilter);
        };

        //On Page Size Changed
        $scope.OnPageSizeChanged = function () {
            GetASPNETUsers($scope.tafilter);
        };

        // Open Window for Saving new ASPNETUser
        $scope.OpenASPNETUserSaveDialog = function () {
            $scope.aspnetuser = { Id: 0 };
            $scope.roles = angular.copy($scope.rolesFromServer);

            MSG({}); //Init
            $scope.aspnetuserActionTitle = "Add New User";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                templateUrl: 'customUpdateASPNETUser',
                windowClass: "modal-custom-extension",
                backdrop: 'false',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        // Open Window for updating ASPNETUser
        $scope.OpenASPNETUserUpdateDialog = function (Id) {
            var tafilter = aspnetuserService.ASPNETUserEmptyFilter();
            tafilter.Id = Id;
            $scope.loading = true;
            MSG({}); //Init

            aspnetuserService.getASPNETUsers(tafilter).then(function (results) {

                if (results.data.m_Item1.length != 1) {
                    $scope.loading = false;
                    $scope.error = "An Error has occured while loading user!";
                    return;
                }
                $scope.aspnetuser = results.data.users;
                $scope.roles = GETJ(results.data.roles);
                $scope.aspnetuserActionTitle = "Update User";

                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'customUpdateASPNETUser',
                    windowClass: "modal-custom-extension",
                    backdrop: 'false',
                    keyboard: false,
                    modalFade: true,
                    size: ''
                });
                $scope.loading = false;
            }, function (error) {
                $scope.error = "An Error has occured while loading user!";
                $scope.loading = false;
            });

        };

        //Update ASPNETUser
        $scope.CreateUpdateASPNETUser = function (frm, Id) {
            $scope.invalid = frm.$invalid;
            if (frm.$invalid) { return; }
            $scope.aspnetuser.RolesJSON = angular.toJson($scope.roles);
            if (Id == 0) { CreateNewASPNETUser($scope.aspnetuser); } else { UpdateASPNETUser($scope.aspnetuser); }
        };

        //Delete ASPNETUser
        $scope.DeleteASPNETUser = function (Id) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete User',
                headerText: 'Delete User',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                aspnetuserService.deleteASPNETUser(Id).then(function (results) {
                    angular.forEach($scope.aspnetusers, function (value, key) {
                        if ($scope.aspnetusers[key].Id === Id) {
                            $scope.aspnetusers.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': 'ASPNETUser_alert', "MsgType": "OK", "MsgText": "User deleted successfully." });
                }, function (error) {
                    $scope.error = "An Error has occured while deleting user! " + error;
                    $scope.loading = false;
                });
            });
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 
        // Function to Get ASPNETUser
        function GetASPNETUsers(tafilter) {
            $scope.loading = true;
            $scope.HasTA_Records = false;
            aspnetuserService.getASPNETUsers(tafilter).then(function (results) {
                $scope.rolesFromServer = results.data.roles;
                $scope.aspnetusers = results.data.users;
                angular.forEach($scope.aspnetusers, function (au, key) {
                    au.RolesJSON = GETJ(au.RolesJSON);
                });

                var tmp_page_start = (($scope.tafilter.PageNumber - 1) * ($scope.tafilter.PageSize) + 1), tmp_page_end = ($scope.tafilter.PageNumber) * ($scope.tafilter.PageSize);
                if (results.data.users.length > 0) {
                    $scope.ASPNETUserPageInfo = {
                        Has_record: true,
                        TotalItems: results.data.users[0]["TotalCount"],
                        PageStart: (results.data.users[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data.users[0]["TotalCount"] ? tmp_page_end : results.data.users[0]["TotalCount"]
                    };

                } else { $scope.ASPNETUserPageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                $scope.error = "An Error has occured while loading user!";
                $scope.loading = false;
            });
        };

        // Create New ASPNETUser Function 
        function CreateNewASPNETUser(aspnetuser) {
            $scope.useraddupdateloading = true;
            
            aspnetuserService.createASPNETUser(aspnetuser).then(function (results) {
                var newRecord = results.data;
                newRecord.RolesJSON = GETJ(newRecord.RolesJSON);
                $scope.aspnetusers.push(newRecord);
                $scope.useraddupdateloading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': 'ASPNETUser_alert', "MsgType": "OK", "MsgText": "User added successfully." });
            }, function (error) {
                MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding user!', 'MsgAsModel': error.data });
                $scope.useraddupdateloading = false;
            });
        }

        //Update ASPNETUser Function 
        function UpdateASPNETUser(aspnetuser) {
            $scope.useraddupdateloading = true;
            aspnetuserService.updateASPNETUser(aspnetuser).then(function (results) {
                angular.forEach($scope.aspnetusers, function (value, key) {
                    if ($scope.aspnetusers[key].Id === aspnetuser.Id) {
                        $scope.aspnetusers[key] = results.data;
                        $scope.aspnetusers[key].RolesJSON = GETJ(results.data.RolesJSON);
                        return false;
                    }
                });
                $scope.useraddupdateloading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': 'ASPNETUser_alert', "MsgType": "OK", "MsgText": "User updated successfully." });
            }, function (error) {
                MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating user!', 'MsgAsModel': error.data });
                $scope.useraddupdateloading = false;
            });
        };

        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        // Call ASPNETUser for first time
        $scope.tafilter = aspnetuserService.ASPNETUserEmptyFilter();
        $scope.tafilter.PageNumber = 1;
        $scope.tafilter.PageSize = '50';

        GetASPNETUsers($scope.tafilter);

    }]);
}());

