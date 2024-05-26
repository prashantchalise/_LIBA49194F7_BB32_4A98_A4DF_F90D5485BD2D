//Created By: Prashant
//Created On: 01/04/2023 


rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For Category 
; (function () {
    'use strict';
    rolpo_app.factory('myListService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var myListServiceFfactory = {};

        //WordSearch Empty Filter 
        var _wordsearchEmptyFilter = function () {
            return {
                Id: 0, 
                PageNumber: 1,
                SessionId: '',
                PageSize: 20,
                ShowAll: 0
            };
        };

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "MyWordSearchList",
                FilterList: [
                  
                ]
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


        // Get WordSearch by Filter
        var _getWordSearchByUser = function (woMfilter) {
            return $http({
                url: serviceBase + 'api/WordSearch/GetWordSearchForMaker',
                method: "post",
                data: woMfilter
            });
        }; 


        // Get WordSearch Stat by solution Code
        var _getWordSearchStat= function (id) {
            return $http({
                url: serviceBase + 'api/WordSearch/GetWordSearchStat',
                method: "get",
                params: { id: id }
            });
        };


        //Delete WordSearch
        var _deleteWordSearch = function (id) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/WordSearch/DeleteWordSearch/" + id
            });
            return request;
        };


        myListServiceFfactory.DDLDefaultFilter = _defaultDDLFilter;
        myListServiceFfactory.GetDDLByFilter = _getDDLList;

        myListServiceFfactory.WordSearchEmptyFilter = _wordsearchEmptyFilter; 
        myListServiceFfactory.getWordSearchByUser = _getWordSearchByUser;   
        myListServiceFfactory.deleteWordSearch = _deleteWordSearch; 
        myListServiceFfactory.getWordSearchStat = _getWordSearchStat;

        return myListServiceFfactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('myListController', ['$scope', 'localService', 'myListService', 'modalService', '$uibModal', '$uibModalStack', '$filter', '$timeout', function ($scope, localService, myListService, modalService, $uibModal, $uibModalStack, $filter, $timeout) {

        // Variables and declarations 

        $scope.loading = true;
        $scope.__localwsusersession = localService.__GET();

        $scope.wordsearchMain = [];
        $scope.WordSearchMainPageInfo = {}; 

        $scope.wordsearch = {};

        $scope.wordsearchstat = {};


        // Methods

        // Get WordSearch by Filter

        $scope.GetWordSearchMainByFilter = function () {
            GetWordSearchMain($scope.woMfilter);
        };

        // Reset WordSearchMain Filter
        $scope.ResetWordSearchMainFilter = function () {
            var pageSize = $scope.woMfilter.PageSize;

            $scope.woMfilter = myListService.WordSearchEmptyFilter();
            $scope.woMfilter.SessionId = $scope.__localwsusersession.USessionId;

            $scope.woMfilter.PageSize = pageSize; 
            GetWordSearchMain($scope.woMfilter);
        };

        //On WordSearch Main Page Changed
        $scope.OnWordSearchMainPageChanged = function () {
            GetWordSearchMain($scope.woMfilter);
        };

        //On Page Size Changed
        $scope.OnWordSearchMainPageSizeChanged = function () {
            GetWordSearchMain($scope.woMfilter);
        };

       
        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };


        // Functions 

        // Function to Get WordSearch Main
        function GetWordSearchMain(woMfilter) {
            $scope.loading = true;
            myListService.getWordSearchByUser(woMfilter).then(function (results) {
                $scope.wordsearchMain = results.data;
                var tmp_page_start = (($scope.woMfilter.PageNumber - 1) * ($scope.woMfilter.PageSize) + 1), tmp_page_end = ($scope.woMfilter.PageNumber) * ($scope.woMfilter.PageSize);
                if (results.data.length > 0) {
                    $scope.WordSearchMainPageInfo = {
                        Has_record: true,
                        TotalItems: results.data[0]["TotalCount"],
                        PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
                    };
                } else { $scope.WordSearchMainPageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading word searches!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };

 

        //Delete WordSearch
        $scope.DeleteWordSearch = function (Id) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete Word Search',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                myListService.deleteWordSearch(Id).then(function (results) { 
                    $scope.loading = false; 
                    GetWordSearchMain($scope.woMfilter); 

                    MSG({ 'elm': "WordSearch_alert", "MsgType": "OK", "MsgText": "Word Search deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting word search!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };


        // Open Window for Viewing Stat
        $scope.OpenWordSearchStatDialog = function (ws) {
            $scope.loading = true;
            myListService.getWordSearchStat(ws.SolutionCode).then(function (results) {
                if (results.data == null) {
                    $scope.loading = false;
                    MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading statistics!'});
                    return;
                }
                $scope.wordsearchstat = results.data;
                $scope.wordsearchstat._scoreboard = { PageNumber: 1, PageSize: 10, TotalItems: $scope.wordsearchstat.ScoreBoard.length, data: angular.copy($scope.wordsearchstat.ScoreBoard).slice(0,10) };
                $scope.wordsearchstat._topusers = { PageNumber: 1, PageSize: 10, TotalItems: $scope.wordsearchstat.TopUsers.length, data: angular.copy($scope.wordsearchstat.TopUsers).slice(0, 10) };
                $scope.wordsearchstat.Title = "Summary for '" + $scope.wordsearchstat.WordSearch.WordSearchTitle + "'"; 

                //Change few things; 
                //$scope.wordsearchstat.Summary.LastPlayedDateUTC = new Date($scope.wordsearchstat.Summary.LastPlayedDateUTC + "Z");

                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'customShowStat',
                    windowClass: "modal-custom-extension",
                    backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: 'lg'
                });
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading word search statistics!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });

        };

        //Scoreboard page change
        $scope.OnScoreBoardPageChange = function () {
            var pn = $scope.wordsearchstat._scoreboard.PageNumber;
            var ps = $scope.wordsearchstat._scoreboard.PageSize;
            $scope.wordsearchstat._scoreboard.data = angular.copy($scope.wordsearchstat.ScoreBoard).slice((pn - 1) * ps, ((pn) * ps));
        }

        //Top Users page change
        $scope.OnTopUsersPageChange = function () {
            var pn = $scope.wordsearchstat._topusers.PageNumber;
            var ps = $scope.wordsearchstat._topusers.PageSize;
            $scope.wordsearchstat._topusers.data = angular.copy($scope.wordsearchstat.TopUsers).slice((pn - 1) * ps, ((pn) * ps));
        }

        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        };

         // Call WordSearch for first time

        $scope.WordSearchMainPageInfo = {};
        $scope.woMfilter = myListService.WordSearchEmptyFilter();
        $scope.woMfilter.SessionId = $scope.__localwsusersession.USessionId; 
        $scope.woMfilter.PageNumber = 1;
        $scope.woMfilter.PageSize = '20'; 
        GetWordSearchMain($scope.woMfilter);


    }]);
}());

