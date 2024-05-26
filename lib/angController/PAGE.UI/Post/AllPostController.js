

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For SVY_Survey 
; (function () {
    'use strict';
    rolpo_app.factory('allPostService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var allPostServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AllPostr",
                FilterList: []
            };
        };

        //SVY_Survey Empty Filter 
        var allPostEmptyFilter = function () {
            return input_model;
        };


        // Get DDL List by Filter
        var _getDDLList = function (ddlFilter) {
            return $http({
                url: serviceBase + 'api/Home/LoadDDLs',
                method: "post",
                data: ddlFilter
            });
        };


        allPostServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        allPostServiceFactory.GetDDLByFilter = _getDDLList;
        allPostServiceFactory.AllPostEmptyFilter = allPostEmptyFilter;

        return allPostServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('AllPostController', ['$scope', '$rootScope', 'allPostService', 'modalService', 'localService', '$uibModal', '$uibModalStack', '$filter', '$timeout', function ($scope, $rootScope, allPostService, modalService, localService, $uibModal, $uibModalStack, $filter, $timeout) {

        // Variables and declarations  
        $scope.loading = true;
 
        //Populate DDLs

        //var ddlFilter = allPostService.DDLDefaultFilter();
        //allPostService.GetDDLByFilter(ddlFilter).then(function (results) {
        //    $scope.ddLItems = angular.fromJson(results.data.DDLItems);
 
        //});

        $scope.input = allPostService.AllPostEmptyFilter(); 
        $scope.AllPostPageInfo = pageInfo;

        //On Page Changed
        $scope.OnPageChange = function () {
            PageClicked($scope.input.pn);

            //GetGameCategorys($scope.tbfilter);
        };

        // Change Gender
        $scope.OnGenderChange = function (item) {
            $("#g").val(item.Value);
        };

        // Change Category
        $scope.OnCategoryChange = function (item) {
            $("#cid").val(item.Value);
        }; 

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };


    }]);
}());

