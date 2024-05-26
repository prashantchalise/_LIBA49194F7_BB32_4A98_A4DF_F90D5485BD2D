
rolpo_app.requires.push('thatisuday.dropzone');
rolpo_app.requires.push('summernote');

Dropzone.autoDiscover = false;

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase, 
    clientId: 'foodmandu.com'
});

//service for profile manage
; (function () {
    'use strict';
    rolpo_app.factory('ManageService', ['$http', 'ngAuthSettings', '$filter', function ($http, ngAuthSettings, $filter) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri; 
        var mnFactory = {};


        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "MANAGE",
                FilterList: [
                    
                ]
            };
        }; 

        // REGION "USER PROFILE"

        // Get User Full Profile
        var _getUserProfile = function () {

            var request = $http({
                method: 'get',
                url: serviceBase + "api/Manage/GetUserProfile"
            });

            return request;
        };


        //update user profile
        var _updateProfile = function (proInfo) {
            var request = $http({
                method: 'POST',
                url: serviceBase + 'api/Manage/UpdateUserProfile',
                data: proInfo
            });
            return request;
        };
        // /."USER PROFILE"

        // Get DDL List by Filter
        var _getDDLList = function (ddlFilter) {
            return $http({
                url: serviceBase + 'api/Home/LoadDDLs',
                method: "post",
                data: ddlFilter
            });
        };
         
       

        //Delete Uploaded file
        var _deleteUploadedFile = function (path) {
            var request = $http({
                method: "delete",
                url: serviceBase + "Home/RemoveUploadedFile",
                params: { Filepath: path }
            });
            return request;
        } 

        mnFactory.DDLDefaultFilter = _defaultDDLFilter;
        mnFactory.GetDDLByFilter = _getDDLList;
         
        mnFactory.GetUserProfile = _getUserProfile;
        mnFactory.UpdateProfile = _updateProfile;

        mnFactory.deleteUploadedFile = _deleteUploadedFile; 
        return mnFactory;
    }]);
}());




//Modal controller
; (function () {
    'use strict';
    rolpo_app.controller('ManageController', ['$scope', '$rootScope', '$uibModal', '$window', 'ManageService', '$uibModalStack', '$log', '$filter', '$timeout', function ($scope, $rootScope, $uibModal, $window, ManageService, $uibModalStack, $log, $filter, $timeout) {

        $scope.tab = 'TAB1';

         //REGION "USER PROFILE"

        // Open Window for updating user profile
        $scope.ShowUpdateProfileDialog = function () {

            MSG({}); //Init
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension",
                templateUrl: 'UserInfo_Update',
                backdrop: 'false',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        //Load User Full Profile


        function LoadUserFullProfile() {
            $scope.loading = true;

            ManageService.GetUserProfile().then(function (results) {
                $scope.UserProfile = results.data; 
               
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                MSG({ 'elm': "profile_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading profile.Please try later.' });
            });
        };


        //save user info
        $scope.UpdateUserInfo = function (frm, profile) {
            if (frm.$invalid) { return; }
            $scope.loading = true;
            var userinfo = { FirstName: profile.FirstName, LastName: profile.LastName, PhoneNumber: profile.PhoneNumber };
            ManageService.UpdateProfile(userinfo).then(function (results) {
                 if (results.data.MsgType == "SUCCESS") {
                    MSG({ 'elm': 'profile_alert', 'MsgType': 'SUCCESS', 'MsgText': results.data.MsgText });
                    $uibModalStack.dismissAll();
                    $scope.loading = false;
                } else {
                    MSG({ 'elm': 'profileAddEdit_alert', 'MsgType': 'ERROR', 'MsgText': 'An error occured while updating information.' });
                    $scope.loading = false;
                }
            })
        };

        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };



        //called first time
        LoadUserFullProfile();

          
    }]);


}());


