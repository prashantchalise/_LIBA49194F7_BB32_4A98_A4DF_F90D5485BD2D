rolpo_app.requires.push('ngStorage');

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

//rolpo_app.constant('ngAuthSettings', {
//    apiServiceBaseUri: serviceBase,
//    clientId: 'rolpo.com'
//});

// Service For WordSearch 
; (function () {
    'use strict';
    rolpo_app.factory('wordsearchEditService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var wordsearchEditServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "Crossword",
                FilterList: [
                ]
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

        // Get WordSearchs by Code
        var _getWordSearchByCode = function (id) {
            return $http({
                url: serviceBase + 'api/WordSearch/GetWordSearchByCode',
                method: "get",
                params: { id: id }
            });
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
        var _deleteWordSearch = function (id) {
            var request = $http({
                method: "delete",
                url: serviceBase + "api/WordSearch/DeleteWordSearch/" + id
            });
            return request;
        };

        wordsearchEditServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        wordsearchEditServiceFactory.GetDDLByFilter = _getDDLList;


        wordsearchEditServiceFactory.getWordSearchByCode = _getWordSearchByCode;
        wordsearchEditServiceFactory.updateWordSearch = _updateWordSearch;
        wordsearchEditServiceFactory.deleteWordSearch = _deleteWordSearch;

        return wordsearchEditServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('WSEditController', ['$scope', 'localService', 'wordsearchEditService', '$location', 'modalService', '$rootScope', '$filter', '$localStorage', function ($scope, localService, wordsearchEditService, $location, modalService, $rootScope, $filter, $localStorage) {

        // Variables and declarations 

        $scope.loading = true;
        $scope.editmode = "EDIT";


        var absUrl = $location.absUrl();
        var url = new URL(absUrl);
        var mode = url.searchParams.get("Mode");
        if (mode === "VIEW") {
            $scope.editmode = "VIEW";
        }

        $scope.wordsearch = { Code: code };
        $scope.pre_view = {
            puzzle: {}
        }; 

        var thisDiv = document.getElementById('thisDiv');
        $scope.thisdiv_width = thisDiv.offsetWidth;

        $scope.wordcluePair = { Word: "", Clue: "" };


        $scope.__localwsusersession = localService.__GET(); 
        localService.__UPDATEWS(null);

        //Generate WordSearch
        //INIT and Load
        $scope.GenerateWordSearch = function (is_tmp_loading) {
            MSG({});
            $scope.wordsearch.WORDS = [];
            var title = $scope.wordsearch.WordSearchTitle;

            if (title == "") {
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
            $scope.wordsearch.SessionId = $scope.__localwsusersession.USessionId;
            $scope.wordsearch.SetAsPrivate = $scope.wordsearch.SetAsPrivate;
            $scope.wordsearch.DirectionMode = ($scope.wordsearch.EasyMode) ? "EASY" : (($scope.wordsearch.DisableReverseDiagnol) ? "MEDIUM" : "HARD");

            
             
            //var height = width;
            var panel = document.getElementById('panel');
            var cursor = document.getElementById('cursor');

            var panelCtx = panel.getContext('2d');
            var cursorCtx = cursor.getContext('2d');


            $scope.view = new WSView($scope.puzzle, 'Lucida Console', 'normal', panelCtx, cursorCtx, $scope.thisdiv_width, pad);
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
            const grid = { puzzle: $scope.puzzle, Title: title, Desc: $scope.wordsearch.Description, width: canvasWidth, pad: 10, fontName: "Lucida Console", fontWeight: "bold", drawSolution: false, disableWords: $scope.wordsearch.EnableQuestion};
 
            CreateCanvas(A4, grid);
            $scope.submitButtonDisabled = false
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


        //Add Words to AddWordsByClues
        $scope.AddWordsToWordsByClue = function () {
            $scope.wordcluePair.error = "";
            $scope.wordcluePair.Word = $scope.wordcluePair.Word.trim().replace(" ", '').toUpperCase();

            if ($scope.wordcluePair.Word.lenght < 3 || $scope.wordcluePair.Word.lenght > 20) { $scope.wordcluePair.error = "Please provide word with length between 3 to 20"; return; }

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

        //Generate WordSearch
        //INIT and Load

        $scope.LoadWordSearch = function () {


            $scope.wordsearch.UnauthorizedMsg = "";
            if ($scope.wordsearch.Code == "") {
                $scope.wordsearch.UnauthorizedMsg = "Code is empty.";
            }
            if ($scope.wordsearch.UnauthorizedMsg == "") {
                $scope.loading = true;
                MSG({}); //Init 

                wordsearchEditService.getWordSearchByCode($scope.wordsearch.Code).then(function (results) { 

                    if (results.data == null) {
                        $scope.wordsearch.UnauthorizedMsg = "You are not allowed to edit this word search.";
                    } else {
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
                        $scope.wordsearch.SessionId = $scope.__localwsusersession.USessionId;

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

                        var panel = document.getElementById('panel');
                        var cursor = document.getElementById('cursor');

                        var panelCtx = panel.getContext('2d');
                        var cursorCtx = cursor.getContext('2d');

                        var pad = 10;

                        $scope.view = new WSView($scope.puzzle, 'Lucida Console', 'normal', panelCtx, cursorCtx, $scope.thisdiv_width, pad);

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
                        var title = $scope.wordsearch.WordSearchTitle;
                        if ($scope.wordsearch.EnableQuestion) { title = $scope.wordsearch.WordSearchQuestion; canvasWidth = 800; }
                        
                        const grid = { puzzle: $scope.puzzle, Title: title , Desc: $scope.wordsearch.Description, width: canvasWidth, pad: 10, fontName: "Lucida Console", fontWeight: "bold", drawSolution: false, disableWords: $scope.wordsearch.EnableQuestion };

                        CreateCanvas(A4, grid);

                        //Finally if $scope.editmode = "VIEW";
                        if ($scope.editmode == "VIEW") {
                            LoadPreview();
                        }
                    }

                    $scope.loading = false;


                }, function (error) {
                    alert(error);
                    $scope.loading = false;
                    $scope.wordsearch.UnauthorizedMsg = error;
                });
            }


        };


        $scope.enabledisableQuestion = function () {
            if (!$scope.wordsearch.EnableQuestion) {
                $('#WordSearchQuestion').val("");
            }
        };

        //Update Word search
        $scope.UpdateWordSearch = function (frm) { 
            if (frm.$invalid) { return; }

            $scope.loading = true;
            wordsearchEditService.updateWordSearch($scope.wordsearch).then(function (results) {
                $scope.loading = false;
                $scope.LoadWordSearch();
                $scope.editmode = "VIEW";

            }, function (error) {
                MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating word search!', 'MsgAsModel': error.data });
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
                wordsearchEditService.deleteWordSearch(Id).then(function (results) {


                }, function (error) {
                    MSG({ 'elm': "WordSearch_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while deleting word search!', 'MsgAsModel': error.data });
                    $scope.loading = false;
                });
            });
        };

        $scope.$watch("formwordsearch.$dirty", function (newValue, oldValue) {
            $scope.submitButtonDisabled = newValue;
        });


        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        };


        function CreateCanvas(A4, grid) {
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
                    view.drawFound();
                }

                var mergedCanvas = document.createElement("canvas");
                var mergedContext = mergedCanvas.getContext("2d");
                mergedCanvas.width = panel.width;
                mergedCanvas.height = panel.height;

                //Merge panel and cursor;
                mergedContext.drawImage(panel, 0, 0);
                if (grid.drawSolution) {
                    mergedContext.drawImage(cursor, 0, 0);
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

                A4ctx.font = '10px Arial';
                A4ctx.fillStyle = '#000';


                A4ctx.fillText("Powered by WORDSEARCHBOX.COM", 50, A4canvas.height - 20);

                var dataURL = A4canvas.toDataURL();
                $scope.wordsearch.ImageData = dataURL;
                

                //downloadImage(A4canvas);

            } catch (e) {

                console.log(e);
            }
        };

        function downloadImage(canvas) {
            // get the context of the final canvas
            var context = canvas.getContext("2d");

            //// set the background color of the final canvas to white
            //context.fillStyle = "#fff";
            //context.fillRect(0, 0, canvas.width, canvas.height);

            // get the image data of the final canvas
            var imageData = canvas.toDataURL("image/jpeg");

            // create a link element to trigger the download
            var link = document.createElement("a");
            link.download = "image.jpg";
            link.href = imageData;
            link.click();
        }


        function LoadPreview() {

            var thisDiv = document.getElementById('preview_div');
            var width = thisDiv.offsetWidth; 
            var panel = document.getElementById('panel_preview');
            var cursor = document.getElementById('cursor_preview');

            var panelCtx = panel.getContext('2d');
            var cursorCtx = cursor.getContext('2d');

            var pad = 8;

            $scope.pre_view = new WSView(angular.copy($scope.puzzle), 'Lucida Console', '700', panelCtx, cursorCtx, width, pad);

            panel.height = $scope.pre_view.getD().height;
            cursor.height = $scope.pre_view.getD().height;

            panel.width = $scope.pre_view.getD().width;
            cursor.width = $scope.pre_view.getD().width;

            $('#preview_div').css({
                "min-height": panel.height + 20 + 'px'
            });
             $scope.pre_view.drawGrid();
            $scope.pre_view.drawLoopFound(); 
            

        }

     

        //Call for the first time
        $scope.LoadWordSearch();

    }]);
}());



