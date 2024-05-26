//Created By: Prashant 
//Created On: 5/4/2016 
// Controller for Code Gen
// Service For Code Gen
// Initialization for Code Gen 

console.log(rolpo_app);
rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});


// Services Start Here..
; (function () {
    'use strict';
    rolpo_app.factory('codegenService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        //Init Factory & Service Base
        var codeGenServiceFactory = {};
        var serviceBase = ngAuthSettings.apiServiceBaseUri;

        //Default Filter
        var _defaultDDLFilter = function () {
            return {

                PageName: "CodeGen",
                FilterList: [
                    {
                        DDLName: "TABLE_NAMES",
                        Param1: "test",
                        Param2: "test"
                    },
                    {
                        DDLName: "LookName",
                        Param1: "Value1",
                        Param2: "Value1"
                    }
                ],
            };
        };

       

        // Get DDL List by Filter
        var _getDDLList = function (dFilter) {
            return $http({
                url: serviceBase + 'api/Home/LoadDDLs',
                method: "post",
                //dataType: 'json',
                //contentType: 'application/json',
                data: dFilter
            });
        };

        // Get all columns by filter
        var _getColumnsDetails= function (tableName) {
            return $http({
                url: serviceBase + 'api/Home/CodeGen_LoadColumnsDetails',
                method: "post",
                data: '"'+tableName+'"',
                contentType: 'application/json'
            });
        };


        //Generate Code 
        var _generateCode = function (tableInfo) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/Home/CodeGen_GenerateCode',
                data: tableInfo
            });
            return request;
        };

        //Finally the public variables..
        codeGenServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        codeGenServiceFactory.GetDDLByFilter = _getDDLList;
        codeGenServiceFactory.GetColumnsDetails = _getColumnsDetails;
        codeGenServiceFactory.GenerateCode = _generateCode;

        //Return factory
        return codeGenServiceFactory;
    }]);

}());

// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('codegenController', ['$scope', '$http', '$rootScope', 'codegenService', '$filter', function ($scope, $http, $rootScope, codegenService, $filter) {
        $scope.loading = true;
        // Variables and declarations 
        $scope.ddlList = [];
        $scope.ddlTableNames = [];
        $scope.tblColumns = [];
        $scope.ShowAs = ["Disabled", "Textbox", "Dropdown", "Checkbox", "Radio", "Email", "Date"];
        $scope.CodeResult = {};

        //Populate DDLs
        var dfilter = codegenService.DDLDefaultFilter();
        codegenService.GetDDLByFilter(dfilter).then(function (results) {
            $scope.ddLItems = angular.fromJson(results.data.DDLItems);

            //Get Tables Names
            $scope.ddlTableNames = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "TABLE_NAMES" })[0].Items;
            if ($scope.ddlTableNames.length != 1) {
                //Initialize Dropdown list with first item from Array
                $scope.tableNameId = $scope.ddlTableNames[0].Value;
            }
            $scope.loading = false;
        });

        //Load Table Columns
        $scope.LoadTableColumns = function () {
            GetColumnsByTable($scope.tableNameId);
        };

        // Geneate Code
        $scope.GenerateCode = function () {
            $scope.loading = true;
            var tblInfo = { TableName: $scope.tableNameId, Columns: $scope.displayedCollection }

            codegenService.GenerateCode(tblInfo).then(function (results) {
                $scope.CodeResult = results.data;
                ToogleCollapse("Three");
                $scope.loading = false;
            }, function (error) {
                $scope.errorMsg = "An Error has occured while Adding gullupost! " + error.data;
                $scope.loading = false;
            });
        };


        //FUNCTIONS 
        //-----------------------------------------------------

        // Load Columns By table Name
        function GetColumnsByTable(tableName) {
            $scope.loading = true;
            //$scope.HasGU_Records = false;
            codegenService.GetColumnsDetails(tableName).then(function (results) {
                $scope.tblColumns = results.data;
                $scope.displayedCollection = [].concat($scope.tblColumns);
                if (results.data.length > 0) {
                    ToogleCollapse("Two");
                }
                $scope.loading = false;
                //$scope.HasGU_Records = true;
            }, function (error) {
                $scope.error = "An Error has occured while loading columns!";
                $scope.loading = false;
            });
        };

        // Msg Complimentary Function
        function MSG(newAlert) {
            if (newAlert.MsgType != "" && newAlert.MsgType != undefined) {
                newAlert.CSSType = (newAlert.MsgType == "ERROR") ? "danger" : "success";
                newAlert.MsgType = (newAlert.MsgType == "ERROR") ? "Error" : "Success";
            } else {
                newAlert.MsgType = "";
                newAlert.MsgText = "";
                $scope.errorMsg = "";
            }
            $scope.Alerts = newAlert;
        };

        //Toogle Collapse function for UI
        function ToogleCollapse(item) {
            //$('#collapseOne').collapse("hide");
            //$('#collapseTwo').collapse("hide");
            if (item == "One") {
                $('#collapseOne').collapse("show");
            } else if (item == "Two") {
                $('#collapseTwo').collapse("show");
            } else {
                $('#collapseOne').collapse("hide");
                $('#collapseTwo').collapse("hide");
                $('#collapseThree').collapse("show");
            }
        };

    }]);
}());