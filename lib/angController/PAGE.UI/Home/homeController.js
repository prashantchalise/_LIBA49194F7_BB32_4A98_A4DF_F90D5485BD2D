//Created By: Prashant
//Created On: 01/04/2023 


rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For Category 
; (function () {
    'use strict';
    rolpo_app.factory('homeService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var homeServicefactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditCategory",
                FilterList: [
                  
                ]
            };
        };
         
        homeServicefactory.DDLDefaultFilter = _defaultDDLFilter;
        //homeServicefactory.GetDDLByFilter = _getDDLList; 

        return homeServicefactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('HomeController', ['$scope', '$rootScope', 'homeService', 'modalService', '$uibModal', '$uibModalStack', '$filter', '$timeout', function ($scope, $rootScope, categoryService, modalService, $uibModal, $uibModalStack, $filter, $timeout) {

        // Variables and declarations  
       
        ////Populate DDLs
        //var ddlFilter = categoryService.DDLDefaultFilter();
        //categoryService.GetDDLByFilter(ddlFilter).then(function (results) {
        //    $scope.ddLItems = angular.fromJson(results.data.DDLItems);

        //    //Load ddl 
        //    $scope.categoriesddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "PAGECATEGORIES" })[0].Items;

        //});

        // Methods
   

        // Functions  
      

        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        };

        // Call Category for first time
      

    }]);
}());

