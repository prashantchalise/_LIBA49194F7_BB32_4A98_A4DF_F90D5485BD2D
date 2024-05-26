
rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For SVY_Survey 
; (function () {
    'use strict';
    rolpo_app.factory('PostService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var PostServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "Report",
                FilterList: filterList
            };
        };

        //Script Empty Filter 
        var _scriptContentEmptyFilter = function (id) {
            return _fltr["scr_"+id+"_filter"];
        };

        // Get DDL List by Filter
        var _getDDLList = function (ddlFilter) {
            return $http({
                url: serviceBase + 'api/Home/LoadDDLs',
                method: "post",
                data: ddlFilter
            });
        };


        // Get data
        var _getScriptContent = function (valuesJSON) {
            return $http({
                url: serviceBase + 'api/Page/content/GetBNAZ_ScriptContent',
                method: "post",
                data: valuesJSON
            });
        };


      

        PostServiceFactory.getScriptContent = _getScriptContent;
        PostServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        PostServiceFactory.GetDDLByFilter = _getDDLList;

        PostServiceFactory.ContentEmptyFilter = _scriptContentEmptyFilter;


        return PostServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('PostController', ['$scope', '$rootScope', 'PostService', 'modalService', 'localService', '$uibModal', '$uibModalStack', '$filter', '$timeout', function ($scope, $rootScope, PostService, modalService, localService, $uibModal, $uibModalStack, $filter, $timeout) {

        // Variables and declarations  
        $scope.loading = false;
        $scope.AllNames = allNames;
        $scope.pgfilter = _fltr;
        $scope.PageInfo = _PageInfo;
        $scope.rs = _rs;


        //Populate DDLs
        if (filterList.length > 0) {

            var ddlFilter = PostService.DDLDefaultFilter();
            PostService.GetDDLByFilter(ddlFilter).then(function (results) {
                $scope.ddLItems = angular.fromJson(results.data.DDLItems);

                angular.forEach(filterList, function (item) {
                    item.Items = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === item.DDLName })[0].Items;
                });


                //Once ddls are ready; load data for the first time;
                for (var key in $scope.rs) {
                    $scope.LoadContent($scope.rs[key].Id);
                }

            });

        }

        //Get Items
        $scope.GetItems = function (id) {
            var items = $filter('filter')(filterList, function (d) { return d.Id === id })[0].Items;
            return items;
        }

        //Add Love reaction;

        $scope.localloading = function () { return localService.loading(); }
        $scope.localmsg = function () { return localService.msg(); }
        $scope.IsLoading = function () {
            return $scope.localloading();
        };

        $scope.current_reaction = "";

        $scope.addReaction = function (type) {
            $scope.current_reaction = type;
            localService.AddPostReaction(postId, type);
        }

        $scope.LikeUnlike = function (BabyName) {
            localService.AddLoveReactionToBabyName(BabyName);
            $scope.AddRemoveCSS(BabyName);
        }


        $scope.AddRemoveCSS = function (babyName) {

            var css = localService.IsLoved(babyName) ? "loved" : "love";
            $("[data-babyname='" + babyName + "']").removeClass("love loved").addClass(css);
            var val = parseInt($("[data-babynameval='" + babyName + "']").text());
            val = (css == 'loved' ? val + 1 : (val > 0 ? val - 1 : 0));
            $("[data-babynameval='" + babyName + "']").text(val);
        };


        $timeout(function () {
            angular.forEach($scope.AllNames, function (name) {
                if (localService.IsLoved(name)) {
                    $("[data-babyname='" + name + "']").removeClass("love loved").addClass('loved');
                }
            });
        });

        $scope.LoadAllNamesAgain = function () {

            $timeout(function () {
                const names = document.querySelectorAll('a[data-babyname]');
                [...names].forEach(btn => allNames.push(btn.getAttribute('data-babyname')));
                $scope.AllNames = allNames;
                angular.forEach($scope.AllNames, function (name) {
                    if (localService.IsLoved(name)) {
                        $("[data-babyname='" + name + "']").removeClass("love loved").addClass('loved');
                    }
                });
            });
        }


        //Name Suggest
        // Open Window for Saving new BabyName
        $scope.OpenBabyNameSuggestDialog = function (NameId) {
            $scope.loading = true;
            $scope.tmpId = NameId;
            localService.getBabyNamesById(NameId).then(function (results) {
                $scope.tmpId = 0;
                if (results.data == null) {
                    $scope.loading = false;
                    console.log("Name loading error");
                    return;
                }
                $scope.babyname_suggest = results.data;
                //temp only for Postr changes
                $scope.babyname_suggest.Gender = ((results.data.Gender == 'GIRL') ? 'G' : ((results.data.Gender == 'BOY') ? 'B' : 'U'));

                $scope.babyname_suggest.Tags = angular.fromJson($scope.babyname_suggest.TagsJSON);

                $scope.babyname_suggest_updates = '"' + results.data.BabyName + '" Suggest new meaning';
                MSG({}); //Init
                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'customNameSuggest',
                    windowClass: "modal-custom-extension",
                    backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: ''
                });
                $scope.loading = false;
            }, function (error) {
                console.log(error.data);
                $scope.loading = false;
            });

        };


        //Update BabyName Function 
        $scope.AddUserSuggestionForBabyName = function (frm) {
            if (frm.$invalid) { return; }
            $scope.babyname_suggest.TagsJSON = angular.toJson($scope.babyname_suggest.Tags);
            $scope.babyname_suggest_loading = true;

            localService.suggestEditBabyName($scope.babyname_suggest).then(function (results) {
                $scope.babyname_suggest_loading = false;
                MSG({ 'elm': "BabyName_alert", "MsgType": "OK", "MsgText": "Thank-you for your suggestion.we appreciate your continued support and look forward to growing." });
                $uibModalStack.dismissAll();
            }, function (error) {
                MSG({ 'elm': "BabyName_alert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding suggestion!', 'MsgAsModel': error.data });
                $scope.babyname_loading = false;
                $uibModalStack.dismissAll();
            });
        };

        //Suppor Functions
        //GET JSON
        $scope.GETJ = function (obj) {
            try {
                return angular.toJson(obj);
            } catch (e) {
                console.log(e,obj);
            }
        }

        //GET Object
        $scope.GETO = function (json) {
            console.log(json);
            var obj = [];
            try {
                obj =  angular.fromJson(json);
            } catch (e) {
                console.log(e, json);
            }
            return obj;
        }


        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };


        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };
        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        };


        // Get Report by Filter

        $scope.GetByFilter = function (id) {
            $scope.LoadContent(id);
        };


        //Load Content Data
        $scope.LoadContent = function (id) {
            var tcfilter = $scope.pgfilter["scr_" + id + "_filter"];




            var filterFixed = angular.copy(tcfilter);
            var _thisDateFilters = _datefilter["scr_" + id + "_datefilters"];

            if (_thisDateFilters) {
                angular.forEach(_thisDateFilters, function (item) {

                    if (!(filterFixed[item] == '' || filterFixed[item] == null)) {
                        filterFixed[item] = formatDate(new Date(filterFixed[item]));
                    }
                });
            } 
            $scope.loading = true;

            PostService.getScriptContent(filterFixed).then(function (results) {
                $scope.rs["scr_" + id + "_data"].data = angular.copy(results.data.Table1);
                delete results.data.Table1;
                $scope.rs["scr_" + id + "_data"].others = results.data;

                var tmp_page_start = ((tcfilter.PageNumber - 1) * (tcfilter.PageSize) + 1), tmp_page_end = (tcfilter.PageNumber) * (tcfilter.PageSize);
                if ($scope.rs["scr_" + id + "_data"].data.length > 0) {
                    $scope.PageInfo["scr_" + id + "_Info"] = {
                        Has_record: true,
                        TotalItems: $scope.rs["scr_" + id + "_data"].data[0]["TotalCount"],
                        PageStart: ($scope.rs["scr_" + id + "_data"].data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < $scope.rs["scr_" + id + "_data"].data[0]["TotalCount"] ? tmp_page_end : $scope.rs["scr_" + id + "_data"].data[0]["TotalCount"],
                        MaxSize: 5
                    };
                    $scope.LoadAllNamesAgain();

                } else { $scope.PageInfo["scr_" + id + "_Info"] = {}; }

                $scope.loading = false;
            }, function (error) {
                MSG1({ 'elm': "Report_alert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while loading report!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        }


        $scope.OnPageChange = function (id) {
            $scope.LoadContent(id);
        }

        //Format Date
        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

    }]);
}());

