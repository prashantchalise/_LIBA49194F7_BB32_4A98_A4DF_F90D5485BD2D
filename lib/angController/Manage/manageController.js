
rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For ProductVendorReact 
; (function () {
    'use strict';
    rolpo_app.factory('manageService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var manageServiceFactory = {};

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


        manageServiceFactory.GetUserProfile = _getUserProfile;
        manageServiceFactory.UpdateProfile = _updateProfile;


        return manageServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('manageController', ['$scope', '$rootScope', 'manageService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, manageService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        

        // Methods
        //save user info
        $scope.UpdateUserInfo = function (frm, profile) {
            MSG({});
            if (frm.$invalid) { return; }
            $scope.loading = true;
            var userinfo = { FirstName: profile.FirstName, LastName: profile.LastName};
            manageService.UpdateProfile(userinfo).then(function (results) {
                if (results.data.MsgType == "OK") {
                    MSG({ 'elm': 'profile_alert', 'MsgType': 'SUCCESS', 'MsgText': results.data.MsgText });
                    $uibModalStack.dismissAll();
                    $scope.loading = false;
                } else {
                    MSG({ 'elm': 'profile_alert', 'MsgType': 'ERROR', 'MsgText': 'An error occured while updating information.' });
                    $scope.loading = false;
                }
            }, function (error) {
                console.log(error.data);
                MSG({ 'elm': 'profile_alert', 'MsgType': 'ERROR', 'MsgText': 'An error occured while updating organization info.', 'MsgAsModel': error.data  });
                $scope.loading = false;
            });
        };

         
        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 
        function LoadUserFullProfile() {
            $scope.loading = true; 
            manageService.GetUserProfile().then(function (results) {
                $scope.UserProfile = results.data;  
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                MSG({ 'elm': "profile_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading profile.Please try later.' });
            });
        };

    

        // Call for first time 
        LoadUserFullProfile();

    }]);
}());

