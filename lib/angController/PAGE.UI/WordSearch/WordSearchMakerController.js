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
                PageName: "WordSearch",
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





        wordsearchEditServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        wordsearchEditServiceFactory.GetDDLByFilter = _getDDLList;

        return wordsearchEditServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('WSMakerController', ['$scope', 'localService', 'wordsearchEditService', 'modalService', '$uibModal', '$uibModalStack', '$filter', '$localStorage', function ($scope, localService, wordsearchEditService, modalService, $uibModal, $uibModalStack, $filter, $localStorage) {

        // Variables and declarations 

        $scope.loading = true;

        $scope.wordsearch = { WordSearchTitle: "", Description: "", SimpleWords: "Create\nYour\nown\nWord\nSearch", WordsByClues: [], DisableReverseDiagnol: true, EasyMode: false, EnableQuestion: false, SetAsPrivate: false,  WordSearchQuestion: "" };
        $scope.showTab = "GENERAL";
        $scope.wordcluePair = { Word: "", Clue: "" };

        $scope.__localwsusersession = localService.__GET();
        
        if ($scope.__localwsusersession.NEWWS != null) {
            $scope.wordsearch = $scope.__localwsusersession.NEWWS;
        }
 

        //Generate WordSearch
        //INIT and Load
        $scope.GenerateWordSearch = function (is_tmp_loading) {
            MSG({});
            $scope.wordsearch.WORDS = [];
            var title = $('#WordSearchTitle').val();
            if (title == "" && !is_tmp_loading) {
                MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Title is missing! Add a title to your word search." });
                return;
            }
            switch ($scope.showTab) {
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
            $scope.wordsearch_loading = true;

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
            $scope.wordsearch_loading = false;

            if (!hasAllSols) {
                MSG({ 'elm': "WordSearch_AddEditAlert", "MsgType": "ERROR", "MsgText": "Couldn't generate the wordserach puzzle. Max limit reached. Please remove few words and try again." });
                $scope.puzzle = {};
                return;
            }


            $scope.puzzle.HasGrid = true;

            if ($scope.puzzle.HasGrid) {
                $("#COLS").val(cols);
                $("#ROWS").val(rows);
                $("#GridJSON").val(angular.toJson($scope.puzzle.grid));
                $("#WordsJSON").val(angular.toJson($scope.puzzle.words));
                $("#SearchMode").val($scope.showTab);
                $("#SessionId").val($scope.__localwsusersession.USessionId);
                $("#SetAsPrivate").val($scope.wordsearch.SetAsPrivate);
 
                if ($scope.wordsearch.EasyMode) {
                    $("#DirectionMode").val("EASY");
                } else if ($scope.wordsearch.DisableReverseDiagnol) {
                    $("#DirectionMode").val("MEDIUM");
                } else { $("#DirectionMode").val("HARD"); }
            }

            var thisDiv = document.getElementById('thisDiv');
            var width = thisDiv.offsetWidth;
            //var height = width;
            var panel = document.getElementById('panel');
            var cursor = document.getElementById('cursor');

            var panelCtx = panel.getContext('2d');
            var cursorCtx = cursor.getContext('2d');


            $scope.view = new WSView($scope.puzzle, 'Lucida Console', 'normal', panelCtx, cursorCtx, width, pad);
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
            const grid = { puzzle: $scope.puzzle, Title: title, Desc: "", width: canvasWidth, pad: 10, fontName: "Lucida Console", fontWeight: "bold", drawSolution: false, disableWords:$scope.wordsearch.EnableQuestion };

            CreateCanvas(A4, grid);
            if (!is_tmp_loading) {
                localService.__UPDATEWS($scope.wordsearch);
             }
        };

        //set as Private
        $scope.SetAsPrivate_Change = function () {
            $("#SetAsPrivate").val($scope.wordsearch.SetAsPrivate);
        }

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
                if (grid.Title.lenght > 45) {
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
                $("#ImageData").val(dataURL);


                //downloadImage(A4canvas);

            } catch (e) {
                console.log(e);
            }
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
            $scope.GenerateWordSearch(true);
            $("#wordcluePair_Word").focus();

        }

        //remove Words from addWordsByClues
        $scope.RemoveWordFromWordClues = function (obj) {
            var index = $scope.wordsearch.WordsByClues.indexOf(obj);
            if (index >= 0)
                $scope.wordsearch.WordsByClues.splice(index, 1);
            $scope.GenerateWordSearch(true);
        };


        //Datepicker
        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        }; 
 
        //  //Call for the first time
        $scope.GenerateWordSearch(true);
        

    }]);
}());



