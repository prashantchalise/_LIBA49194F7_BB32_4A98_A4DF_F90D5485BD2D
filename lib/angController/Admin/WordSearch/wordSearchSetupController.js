//Created By: Prashant 
//Created On: 11/07/2020 
// Controller for WordSearch 
// Initialization for WordSearch 

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For WordSearch 
; (function () {
    'use strict';
    rolpo_app.factory('wordsearchService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var wordsearchServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditWordSearch",
                FilterList: [
                    {
                        DDLName: "GAME-CATEGORY",
                        Param: { }
                    } 
                ]
            };
        };

        
        //WordSearch Empty Filter 
        var _wordsearchEmptyFilter = function () {
            return {
                WordSearchId: 0,
                WordSearchTitle: "",
                CategoryId: 0,
                DateSearchType: 'CREATED',
                DateFrom: _addDays(new Date(), -7),
                DateTo: new Date(),
                PageNumber: 1,
                PageSize: '50',
                ShowAll: 0
            };
        };

        var _addDays = function (date, days) {
            date.setDate(date.getDate() + parseInt(days));
            return date;
        }

        // Get DDL List by Filter
        var _getDDLList = function (ddlFilter) {
            return $http({
                url: serviceBase + 'api/Lookup/LoadDDLs',
                method: "post",
                data: ddlFilter
            });
        };

        // Get WordSearchs by Filter
        var _getWordSearchs = function (tbfilter) {
            return $http({
                url: serviceBase + 'api/WordSearch/GetWordSearchForAdmin',
                method: "post",
                data: tbfilter
            });
        };

        // Get WordSearchs by Id
        var _getWordSearchsById = function (id) {
            return $http({
                url: serviceBase + 'api/WordSearch/GetWordSearchById',
                method: "get",
                params: { id: id }
            });
        };

        //Create New WordSearch
        var _createWordSearch = function (wordsearch) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/WordSearch/SaveWordSearchForUser',
                data: wordsearch
            });
            return request;
        };

        //Update WordSearch 
        var _updateWordSearch = function (wordsearch) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/WordSearch/UpdateWordSearchForUser",
                data: wordsearch
            });
            return request;
        };

        //Delete WordSearch
        var _deleteWordSearch = function (wordsearchid) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/WordSearch/DeleteWordSearch/" + wordsearchid
            });
            return request;
        };

        wordsearchServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        wordsearchServiceFactory.GetDDLByFilter = _getDDLList;
        wordsearchServiceFactory.getWordSearchs = _getWordSearchs;
        wordsearchServiceFactory.getWordSearchsById = _getWordSearchsById;
        wordsearchServiceFactory.createWordSearch = _createWordSearch;
        wordsearchServiceFactory.updateWordSearch = _updateWordSearch;
        wordsearchServiceFactory.deleteWordSearch = _deleteWordSearch;
        wordsearchServiceFactory.WordSearchEmptyFilter = _wordsearchEmptyFilter;

        return wordsearchServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('wordsearchController', ['$scope', '$rootScope', 'wordsearchService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, wordsearchService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = true;
        $scope.wordsearchs = [];
        $scope.wordsearch = { WordSearchTitle: "", Description: "", showTab: "GENERAL", SimpleWords: "Create\nYour\nown\nWord\nSearch", WordsByClues: [], DisableReverseDiagnol: true, EasyMode: false, EnableQuestion: false, SetAsPrivate: false, WordSearchQuestion: "" };
        $scope.WordSearchPageInfo = {};
        $scope.dateSearchTypesddl = [{ Name: "Created From/To", Value: "CREATED" }, { Name: "Last Played From/To", Value: "LASTPLAYED" }];

        $scope.bulk = {};

        $scope.media = new MEDIA();

        //sorting

        $scope.sort = {
            column: '',
            descending: false
        };

        $scope.changeSorting = function (column) {
            var sort = $scope.sort;

            if (sort.column == column) {
                sort.descending = !sort.descending;
            } else {
                sort.column = column;
                sort.descending = false;
            }
        };


        //Get app by sort order
        $scope.sortorder = function (sortby) {

            var sortdir = '';

            switch (sortby) {
                case 'PlayedCount':
                    sortdir = $scope.playedsort ? 'DESC' : 'ASC';
                    $scope.playedsort = !$scope.playedsort;
                    break;

                case 'Email':
                    sortdir = $scope.emailsort ? 'DESC' : 'ASC';
                    $scope.emailsort = !$scope.emailsort;
                    break;
                case 'CreatedDate':
                    sortdir = $scope.createddate ? 'DESC' : 'ASC';
                    $scope.createddate = !$scope.createddate;
                    break;
                case 'BoardSize':
                    sortdir = $scope.boardsize ? 'DESC' : 'ASC';
                    $scope.boardsize = !$scope.boardsize;
                    break;

            }

            //$scope.tbfilter = taapService.TAAPEmptyFilter();
            $scope.tbfilter.SortBy = sortby;
            $scope.tbfilter.SortDir = sortdir;

            GetWordSearchs($scope.tbfilter);
        };



        //Populate DDLs
        var ddlFilter = wordsearchService.DDLDefaultFilter();
        wordsearchService.GetDDLByFilter(ddlFilter).then(function (results) {
            $scope.ddLItems = angular.fromJson(results.data.DDLItems);
            //Get category ddl
            $scope.categoryddls = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "GAME-CATEGORY" })[0].Items;

        });

        // Methods

        // Get WordSearch by Filter

        $scope.GetWordSearchByFilter = function () {
            GetWordSearchs($scope.tbfilter);
        };

        // Reset WordSearch Filter
        $scope.ResetWordSearchFilter = function () {
            var pageSize = $scope.tbfilter.PageSize;

            $scope.tbfilter = wordsearchService.WordSearchEmptyFilter();
            $scope.tbfilter.PageSize = pageSize;

            GetWordSearchs($scope.tbfilter);
        };

        //On WordSearch Page Changed
        $scope.OnWordSearchPageChanged = function () {
            GetWordSearchs($scope.tbfilter);
        };

        //On Page Size Changed
        $scope.OnWordSearchPageSizeChanged = function () {
            GetWordSearchs($scope.tbfilter);
        };

        // Open Window for Saving new WordSearch
        $scope.OpenWordSearchSaveDialog = function () {
            $scope.wordsearch = { Id: 0, WordSearchTitle: "", Description: "", showTab: "GENERAL", SimpleWords: "Create\nYour\nown\nWord\nSearch", WordsByClues: [], DisableReverseDiagnol: true, EasyMode: false, EnableQuestion: false, SetAsPrivate: false, WordSearchQuestion: "" };

            MSG({}); //Init
            $scope.wordsearchActionTitle = "Add New";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension",
                templateUrl: 'customUpdateWordSearch',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: 'lg'
            });

        };


        /*PROCESS BULK */


        //bulk open dialog
        $scope.OpenWordSearchBulkDialog = function () {

            $scope.bulk = { submit: false, _raw: "", ws: [], index: 0,STEP: "ONE" };

            MSG({}); //Init

            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension",
                templateUrl: 'customBulkAddWordSearch',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: 'lg'
            }); 
        }

        //Process raw data
        $scope.processBulk = function () {
            $scope.bulk._raw = $scope.bulk._raw.replace("\n\n", "\n");
            $scope.bulk._wsListRaw = $scope.bulk._raw.split('\n');
            console.log($scope.bulk._raw);
            angular.forEach($scope.bulk._wsListRaw, function (rawData) {
                console.log(rawData);
                if (rawData.trim() != '') {
                    var obj = { valid: false };
                    var mainParts = rawData.split('#');
                    if (mainParts.length === 2) {
                        var firstPart = mainParts[0].trim();  // Remove any extra spaces around the part
                        obj.remarks = mainParts[1].trim();    // Trim remarks part

                        var titleAndWords = firstPart.split('|');

                        if (titleAndWords.length === 2) {
                            obj.title = titleAndWords[0].trim();  // Trim the title
                            var wordsString = titleAndWords[1].trim(); // Trim the words part

                            // Step 3: Split the words string using ',' to convert it into an array of words
                            var _tmp_words = wordsString.split(',');
                            obj.words = [];
                            obj.invalid_words = [];
                            angular.forEach(_tmp_words, function (word) {
                                if ((word.length < 3) || (word.length > 18)) {
                                    obj.invalid_words.push(word);
                                } else {
                                    obj.words.push(word.trim());
                                }
                            });

                            // Create a new array by filtering the original words
                            var filteredWords = obj.words.filter(function (word, idx, self) {
                                // Check if there is any other word that contains this word
                                return !self.some(function (otherWord) {
                                    return otherWord.includes(word) && otherWord !== word;
                                });
                            });

                            var removedWords = angular.copy(obj.words).filter(word => !filteredWords.includes(word));

                            obj.invalid_words.push(...removedWords);
                            obj.words = filteredWords;

                        }
                    }

                    if (obj.remarks && obj.title && obj.words.length > 5) {
                        obj.valid = true;
                    }
                    $scope.bulk.ws.push(obj);
                }
               
             });

            for (var i = 0; i < $scope.bulk.ws.length; i++) { 
                if (!$scope.bulk.ws[i].valid) {
                    MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Invalid word search. See console " });
                    console.log($scope.bulk.ws[i]);
                    return;
                }
            }
             
            var _obj = $scope.bulk.ws[$scope.bulk.index];
            $scope.wordsearch = { Id: 0, WordSearchTitle: _obj.title, CategoryId: $scope.bulk.CategoryId, Description: _obj.remarks, showTab: "GENERAL", SimpleWords: _obj.words.join('\n'), WordsByClues: [], DisableReverseDiagnol: false, EasyMode: false, EnableQuestion: false, SetAsPrivate: false, WordSearchQuestion: "" };
            $scope.bulk.STEP = "TWO";
            $scope.GenerateWordSearch(false); 
        }
        
        //Save and next
        $scope.SaveandNext = function () {
            if ($scope.bulk.index < $scope.bulk.ws.length - 1) {
                $scope.wordsearch_loading = true;
                wordsearchService.createWordSearch($scope.wordsearch).then(function (results) {
                    $scope.wordsearchs.push(results.data);
                    $scope.wordsearch_loading = false;
                    MSG({ 'elm': "WordSearch_alert", "MsgType": "OK", "MsgText": "WordSearch added successfully." });

                    $scope.bulk.index++;
                    var _obj = $scope.bulk.ws[$scope.bulk.index];
                    $scope.wordsearch = { Id: 0, WordSearchTitle: _obj.title, Description: _obj.remarks, CategoryId: $scope.bulk.CategoryId, showTab: "GENERAL", SimpleWords: _obj.words.join('\n'), WordsByClues: [], DisableReverseDiagnol: false, EasyMode: false, EnableQuestion: false, SetAsPrivate: false, WordSearchQuestion: "" };
                    $scope.bulk.STEP = "TWO";
                    $scope.GenerateWordSearch(false);  
                }, function (error) {
                    MSG({ 'elm': "WordSearch_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding wordsearch!', 'MsgAsModel': error.data });
                    $scope.wordsearch_loading = false;
                });

            } else if ($scope.bulk.index == $scope.bulk.ws.length - 1) {
                CreateNewWordSearch($scope.wordsearch);
            }

  
        }


        // Open Window for updating WordSearch
        $scope.OpenWordSearchUpdateDialog = function (Id) {
            $scope.loading = true;
            MSG({}); //Init

            wordsearchService.getWordSearchsById(Id).then(function (results) {
                if (results.data == null) {
                    $scope.loading = false;
                    MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading wordsearchs!', 'MsgAsModel': error.data });
                    return;
                }

                $scope.wordsearch = results.data;

                //Init
                $scope.wordsearch.showTab = $scope.wordsearch.SearchMode;


                $scope.puzzle = {
                    ROWS: $scope.wordsearch.ROWS, COLS: $scope.wordsearch.COLS
                    , grid: angular.fromJson($scope.wordsearch.GridJSON)
                    , words: angular.fromJson($scope.wordsearch.WordsJSON)
                };



                $scope.wordsearch.EasyMode = (($scope.wordsearch.DirectionMode == "EASY") ? true : false);
                $scope.wordsearch.DisableReverseDiagnol = ((($scope.wordsearch.DirectionMode == "EASY") || ($scope.wordsearch.DirectionMode == "MEDIUM")) ? true : false);
                $scope.wordsearch.SetAsPrivate = $scope.wordsearch.SetAsPrivate;



                $scope.wordsearch.WordsByClues = [];
                $scope.wordsearch.SimpleWords = "";

                var words = angular.copy($scope.puzzle.words);


                switch ($scope.wordsearch.showTab) {
                    case "GENERAL":
                        angular.forEach(words, function (item) {
                            $scope.wordsearch.SimpleWords += item.word.Word.toUpperCase() + "\n";
                        });

                        break;
                    case "BYCLUE":
                        angular.forEach(words, function (item) {
                            $scope.wordsearch.WordsByClues.push(item.word);
                        });
                        $scope.wordsearch.showTab = 'BYCLUE';
                        break;

                }



                $scope.wordsearch.WORDS = [];
                switch ($scope.wordsearch.showTab) {
                    case "GENERAL":
                        var _words = $scope.wordsearch.SimpleWords.split('\n');
                        angular.forEach(_words, function (item) {
                            item = item.trim().replace(" ", '').toUpperCase();
                            if (item != '') {
                                $scope.wordsearch.WORDS.push({ "Word": item, "Clue": '' });
                            }
                        });

                        break;
                    case "BYCLUE":

                        angular.forEach($scope.wordsearch.WordsByClues, function (item) {
                            $scope.wordsearch.WORDS.push(angular.copy(item));
                        });
                        break;
                    default:
                        MSG({ 'elm': "WordSearch_alert", "MsgType": "ERROR", "MsgText": "Words are missing. Can you please recheck." });
                        break;
                };



                var modalInstance = $uibModal.open({
                    animation: true,
                    scope: $scope,
                    templateUrl: 'customUpdateWordSearch',
                    windowClass: "modal-custom-extension",
                    backdrop: 'static',
                    keyboard: false,
                    modalFade: true,
                    size: 'lg'
                });

                //Create Canvas
                const A4 = { width: 900 };

                var maxCharLen = 0;
                for (const word of $scope.puzzle.words) {
                    if (word.word.Word.length > maxCharLen) {
                        maxCharLen = word.word.Word.length;
                    }
                }


                var canvasWidth = 600;
                if (maxCharLen > 15) { canvasWidth = 550; }
                var title = $scope.wordsearch.WordSearchTitle;
                if ($scope.wordsearch.EnableQuestion) { title = $scope.wordsearch.WordSearchQuestion; canvasWidth = 800; }

                const grid = { puzzle: $scope.puzzle, Title: title, Desc: $scope.wordsearch.Description, width: canvasWidth, pad: 10, fontName: "Lucida Console", fontWeight: "bold", drawSolution: false, disableWords: $scope.wordsearch.EnableQuestion };

                var imageData = GetForCanvas(A4, grid);
                $scope.wordsearch.ImageData = imageData;

                //Again get the SEO related Data;
                grid.drawSolution = true;
                var imgData2 = GetForCanvas(A4, grid);
                $scope.wordsearch.SEOImageData = imgData2;



                ////Finally if $scope.editmode = "VIEW";
                //if ($scope.editmode == "VIEW") {
                //    LoadPreview();
                //}
                $scope.wordsearchActionTitle = "Update";


                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading wordsearchs!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });

        };

        //Update WordSearch
        $scope.CreateUpdateWordSearch = function (frm, Id) {

            if (frm.$invalid) { return; }
            //$scope.wordsearch.WordsJSON = angular.toJson($scope.puzzle.words);
            //$scope.wordsearch.GridJSON = angular.toJson($scope.puzzle.grid);
            //$scope.wordsearch.COLS = $scope.puzzle.COLS;
            //$scope.wordsearch.ROWS = $scope.puzzle.ROWS;

            if (Id == 0) { CreateNewWordSearch($scope.wordsearch); } else { UpdateWordSearch($scope.wordsearch); }
        };

        //Delete WordSearch
        $scope.DeleteWordSearch = function (WordSearchId) {
            MSG({}); //Init
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Delete WordSearch',
                headerText: 'Delete Item',
                bodyText: 'Are you sure you want to delete this?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loading = true;
                wordsearchService.deleteWordSearch(WordSearchId).then(function (results) {
                    angular.forEach($scope.wordsearchs, function (value, key) {
                        if ($scope.wordsearchs[key].WordSearchId === WordSearchId) {
                            $scope.wordsearchs.splice(key, 1);
                            return false;
                        }
                    });

                    $scope.loading = false;
                    MSG({ 'elm': "WordSearch_alert", "MsgType": "OK", "MsgText": "WordSearch deleted successfully." });
                }, function (error) {
                    MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting wordsearchs!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };

        //Open Tab
        $scope.openTab = function (tab) {
            switch (tab) {
                case 'GENERAL':
                    $scope.showTab = 'GENERAL';
                    break;
                case 'BYCLUE':
                    $scope.showTab = 'BYCLUE';
                    break;
            }
        };

        $scope.wordcluePair = { Word: "", Clue: "" };

        //Add Words to AddWordsByClues
        $scope.AddWordsToWordsByClue = function () {
            $scope.wordcluePair.error = "";
            $scope.wordcluePair.Word = $scope.wordcluePair.Word.trim().replace(" ", '').toUpperCase();

            if ($scope.wordcluePair.Word.length < 3 || $scope.wordcluePair.Word.length > 20) { $scope.wordcluePair.error = "Please provide word with length between 3 to 20"; return; }

            if (($scope.wordcluePair.Word == '') || ($scope.wordcluePair.Clue == '')) { $scope.wordcluePair.error = "Empty not allowed"; return; }

            $scope.hasPrev = $filter('filter')($scope.wordsearch.WordsByClues, function (d) { return ((d.Word === $scope.wordcluePair.Word) || ((d.Clue === $scope.wordcluePair.Clue))) });
            if ($scope.hasPrev != null) {
                if ($scope.hasPrev.length > 0) {
                    { $scope.wordcluePair.error = "Item already exists of same word or clue"; $("#wordcluePair_Word").focus(); return; }
                }

            }

            $scope.wordsearch.WordsByClues.push(angular.copy($scope.wordcluePair));
            $scope.wordcluePair = { Word: "", Clue: "" };
            $("#wordcluePair_Word").focus();

        }

        //remove Words from addWordsByClues
        $scope.RemoveWordFromWordClues = function (obj) {
            var index = $scope.wordsearch.WordsByClues.indexOf(obj);
            if (index >= 0)
                $scope.wordsearch.WordsByClues.splice(index, 1);
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 

        // Function to Get WordSearch
        function GetWordSearchs(tbfilter) {
            $scope.loading = true;
            $scope.HasTB_Records = false;
            wordsearchService.getWordSearchs(tbfilter).then(function (results) {
                $scope.wordsearchs = results.data;
                var tmp_page_start = (($scope.tbfilter.PageNumber - 1) * ($scope.tbfilter.PageSize) + 1), tmp_page_end = ($scope.tbfilter.PageNumber) * ($scope.tbfilter.PageSize);
                if (results.data.length > 0) {
                    $scope.WordSearchPageInfo = {
                        Has_record: true,
                        TotalItems: results.data[0]["TotalCount"],
                        PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
                    };
                } else { $scope.WordSearchPageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading wordsearchs!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };

        // Create New WordSearch Function 
        function CreateNewWordSearch(wordsearch) {
            $scope.wordsearch_loading = true;
            wordsearchService.createWordSearch(wordsearch).then(function (results) {
                $scope.wordsearchs.push(results.data);
                $scope.wordsearch_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "WordSearch_alert", "MsgType": "OK", "MsgText": "WordSearch added successfully." });
            }, function (error) {
                MSG({ 'elm': "WordSearch_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding wordsearch!', 'MsgAsModel': error.data });
                $scope.wordsearch_loading = false;
            });
        }

        //Update WordSearch Function 
        function UpdateWordSearch(wordsearch) {
            $scope.wordsearch_loading = true;
            wordsearchService.updateWordSearch(wordsearch).then(function (results) {
                angular.forEach($scope.wordsearchs, function (value, key) {
                    if ($scope.wordsearchs[key].WordSearchId === wordsearch.WordSearchId) {
                        $scope.wordsearchs[key] = results.data;
                        return false;
                    }
                });
                $scope.wordsearch_loading = false;
                $uibModalStack.dismissAll();
                MSG({ 'elm': "WordSearch_alert", "MsgType": "OK", "MsgText": "WordSearch updated successfully." });
            }, function (error) {
                MSG({ 'elm': "WordSearch_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating wordsearch!', 'MsgAsModel': error.data });
                $scope.wordsearch_loading = false;
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

        // Call WordSearch for first time


        $scope.WordSearchPageInfo = {};
        $scope.tbfilter = wordsearchService.WordSearchEmptyFilter();
        $scope.tbfilter.PageNumber = 1;
        $scope.tbfilter.PageSize = '50';

        GetWordSearchs($scope.tbfilter);

        $scope.view = {};
        $scope.puzzle = {};



        //Generate WordSearch
        //INIT and Load
        $scope.GenerateWordSearch = function (is_tmp_loading) {

            MSG({});

            var min_width = 240;

            $scope.wordsearch.WORDS = [];
            var title = $scope.wordsearch.WordSearchTitle;

            if (title == "" && !is_tmp_loading) {
                MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Please add title first." });
                return;
            }
            switch ($scope.wordsearch.showTab) {
                case "GENERAL":
                    var _words = $scope.wordsearch.SimpleWords.split('\n');
                    var hasError = false;
                    angular.forEach(_words, function (item) {
                        item = item.trim().replace(" ", '').toUpperCase();
                        if (item != '') {
                            if ((item.length < 3) || (item.length > 20)) {
                                hasError = true;
                            }
                            $scope.wordsearch.WORDS.push({ "Word": item, "Clue": '' });
                        }

                    });
                    if (hasError) {
                        MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Please add words of length between 3 to 20" });
                        return;
                    }
                    if (($scope.wordsearch.WORDS.length) == 0) {
                        MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Add some valid words" });
                        return;
                    }
                    break;
                case "BYCLUE":
                    if ($scope.wordsearch.WordsByClues.length == 0) {
                        MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "You have selected by clue. Please add some valid words" });
                        return;
                    }
                    angular.forEach($scope.wordsearch.WordsByClues, function (item) {
                        $scope.wordsearch.WORDS.push(angular.copy(item));
                    });
                    break;
                default:
                    MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Words are missing. Can you please recheck." });
                    break;
            };


            var hasAllSols = false;
            $scope.loading = true;

            var pad = 10;

            const allowDiagonals = ($scope.wordsearch.EasyMode) ? false : true;
            const allowBackwards = ($scope.wordsearch.EasyMode) ? false : (($scope.wordsearch.DisableReverseDiagnol) ? false : true);

            var gridsize = 12;

            const longestWord = Math.max(...$scope.wordsearch.WORDS.map((word) => word.Word.length));
            if (gridsize < longestWord) {
                gridsize = longestWord;
            }

            const ws = new WS($scope.wordsearch.WORDS, { height: gridsize, width: gridsize }, allowBackwards, allowDiagonals);
            const newGame = ws._wsg122422022();

            $scope.puzzle = { grid: newGame.grid, COLS: newGame.grid.length, ROWS: newGame.grid.length, words: ws.words };

            hasAllSols = true;
            var rows = $scope.puzzle.ROWS, cols = $scope.puzzle.COLS;
            $scope.loading = false;
            if (!hasAllSols) {
                MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Couldn't generate the wordserach puzzle. Max limit reached. Please remove few words and try again." });
                $scope.puzzle = {};
                return;
            }

            $scope.wordsearch.COLS = cols;
            $scope.wordsearch.ROWS = rows;
            $scope.wordsearch.GridJSON = angular.toJson($scope.puzzle.grid);
            $scope.wordsearch.WordsJSON = angular.toJson($scope.puzzle.words);
            $scope.wordsearch.SearchMode = $scope.wordsearch.showTab;
            $scope.wordsearch.SetAsPrivate = $scope.wordsearch.SetAsPrivate;
            $scope.wordsearch.DirectionMode = ($scope.wordsearch.EasyMode) ? "EASY" : (($scope.wordsearch.DisableReverseDiagnol) ? "MEDIUM" : "HARD");

            //var height = width;
            var panel = document.getElementById('panel');
            var cursor = document.getElementById('cursor');

            var panelCtx = panel.getContext('2d');
            var cursorCtx = cursor.getContext('2d');


            $scope.view = new WSView($scope.puzzle, 'Lucida Console', 'normal', panelCtx, cursorCtx, min_width, pad);
            panel.height = $scope.view.getD().height;
            cursor.height = $scope.view.getD().height;

            panel.width = $scope.view.getD().width;
            cursor.width = $scope.view.getD().width;

            $('#thisDiv').css({
                "min-height": panel.height + 20 + 'px'
            });


            $scope.view.draw();


            //Create Canvas
            const A4 = { width: 900 };

            var maxCharLen = 0;
            for (const word of $scope.puzzle.words) {
                if (word.word.Word.length > maxCharLen) {
                    maxCharLen = word.word.Word.length;
                }
            }
            var canvasWidth = 600;
            if (maxCharLen > 15) { canvasWidth = 550; }
            if ($scope.wordsearch.EnableQuestion) { title = $scope.wordsearch.WordSearchQuestion; canvasWidth = 800; }
            const grid = { puzzle: $scope.puzzle, Title: title, Desc: $scope.wordsearch.Description, width: canvasWidth, pad: 10, fontName: "Lucida Console", fontWeight: "bold", drawSolution: false, disableWords: $scope.wordsearch.EnableQuestion };

            var imageData = GetForCanvas(A4, grid);
            $scope.wordsearch.ImageData = imageData;

            grid.drawSolution = true;
            var imgData2 = GetForCanvas(A4, grid);
            $scope.wordsearch.SEOImageData = imgData2;

            $scope.submitButtonDisabled = false
        };

        function GetForCanvas(A4, grid) {
            try {
                //const A4 = { width: 1200, height: 1600 };
                //const grid = { puzzle: puzzle,Title: "", Desc: "", width: 800, pad: 10, fontName: "Lucida Console", fontWeight: "normal",drawSolution: true };

                var panel = document.createElement("canvas");
                var cursor = document.createElement("canvas");

                var view = new WSView(grid.puzzle, grid.fontName, grid.fontWeight, panel.getContext('2d'), cursor.getContext('2d'), grid.width, grid.pad);

                panel.height = view.getD().height;
                cursor.height = view.getD().height;

                panel.width = view.getD().width;
                cursor.width = view.getD().width;
                grid.height = view.getD().height;

                view.drawGrid();
                if (grid.drawSolution) {
                    view.drawFound2();
                }

                var mergedCanvas = document.createElement("canvas");
                var mergedContext = mergedCanvas.getContext("2d");
                mergedCanvas.width = panel.width;
                mergedCanvas.height = panel.height;

                //Merge panel and cursor;
                mergedContext.drawImage(panel, 0, 0);
                if (grid.drawSolution) {
                    mergedContext.drawImage(cursor, 0, 0);
                    if ($scope.media.PlayImg.IsReady) {
                        // Draw the image onto the context
                        var hRatio = panel.width / $scope.media.PlayImg.IMG.width;
                        var vRatio = panel.width / $scope.media.PlayImg.IMG.height;
                        var ratio = Math.min(hRatio, vRatio);
                        var pos = { x: (panel.width / 2) - ($scope.media.PlayImg.IMG.width * ratio) / 2, y: panel.height / 2 - ($scope.media.PlayImg.IMG.height * ratio) / 2 };

                        mergedContext.drawImage($scope.media.PlayImg.IMG, pos.x, pos.y, $scope.media.PlayImg.IMG.width * ratio, $scope.media.PlayImg.IMG.height * ratio);
                    }


                }




                // create the final canvas element
                var A4canvas = document.createElement("canvas");
                A4canvas.width = A4.width;
                A4canvas.height = mergedCanvas.height + 110 + 50;

                if ((140 + (grid.puzzle.words.length * 35)) > A4canvas.height) {
                    A4canvas.height = (140 + (grid.puzzle.words.length * 35));
                }

                const A4ctx = A4canvas.getContext('2d');
                A4ctx.fillStyle = '#fff';
                A4ctx.fillRect(0, 0, A4canvas.width, A4canvas.height);

                //Draw header first
                A4ctx.font = '40px Arial';
                if (grid.Title.length > 45) {
                    A4ctx.font = '30px Arial';
                }

                A4ctx.fillStyle = '#000';
                A4ctx.fillText(grid.Title, 50, 100);

                // draw the merged canvas onto the final canvas
                A4ctx.drawImage(mergedCanvas, 50, 120);


                if (!grid.disableWords) {
                    // add the text to the right of the merged canvas
                    A4ctx.font = '20px Arial';
                    A4ctx.fillStyle = '#000';

                    var _loop = 0;
                    for (const word of grid.puzzle.words) {
                        A4ctx.fillText(word.word.Word, mergedCanvas.width + 50 + 20, 140 + (_loop * 35));
                        _loop += 1;
                    }
                }

                if (grid.drawSolution) {
                    if ($scope.media.LogoImg.IsReady) {
                        var height = 20;
                        var width = ($scope.media.LogoImg.IMG.width / $scope.media.LogoImg.IMG.height) * height;
                        A4ctx.drawImage($scope.media.LogoImg.IMG, (A4.width - 10 - width), 10, width, height);
                    }


                }

                A4ctx.font = '10px Arial';
                A4ctx.fillStyle = '#000';
                A4ctx.fillText("Powered by WORDSEARCHBOX.COM", 50, A4canvas.height - 20);


                var dataURL = A4canvas.toDataURL();

                return dataURL;

                //downloadImage(A4canvas);

            } catch (e) {

                console.log(e);
                return "";
            }
        };


        /*prototype definition */
        WSView.prototype.drawFound2 = function () {
            var ctx = this.cursorCtx;
            ctx.clearRect(0, 0, this.width, this.height);

            ctx.lineWidth = this.lineWidth;
            //ctx.strokeStyle = this.foundColor;
            ctx.lineCap = this.lineCap;
            var hasFound = false;
            $scope.wordsearch.foundCount = 0;
            for (var i = 0; i < this.puzzle.words.length; i++) {
                var obj = this.puzzle.words[i];
                if (obj.found) {
                    var _index = i % this.colors.length;
                    ctx.strokeStyle = this.colors[_index].found;

                    //ctx.strokeStyle = obj.color;
                    hasFound = hasFound || true;
                    var x0 = this.cell / 2 + obj.coli * this.cell;
                    var y0 = this.cell / 2 + obj.rowi * this.cell;
                    var xf = this.cell / 2 + obj.colf * this.cell;
                    var yf = this.cell / 2 + obj.rowf * this.cell;

                    ctx.beginPath();
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(xf, yf);
                    ctx.stroke();
                    $scope.wordsearch.foundCount++;
                }

            }
        };



        function MEDIA() {
            this.LogoImg = { IMG: new Image(), IsReady: false };
            this.PlayImg = { IMG: new Image(), IsReady: false };

            this.LogoImg.IMG.src = serviceBase + "assets/img/logo.svg"
            this.PlayImg.IMG.src = serviceBase + "assets/img/btn-img.png"
        };

        MEDIA.prototype.LOAD = function () {
            this.LogoImg.IMG.onload = () => {
                this.LogoImg.IsReady = true;
            };
            this.PlayImg.IMG.onload = () => {
                this.PlayImg.IsReady = true;
            }
        }

        //Load Media
        $scope.media.LOAD();


    }]);
}());

