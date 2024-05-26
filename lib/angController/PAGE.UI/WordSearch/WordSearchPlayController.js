//const { computeStyles } = require("@popperjs/core");

rolpo_app.requires.push('ngStorage');

rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});


rolpo_app.filter('secondsToDateTime', [function () {
    return function (seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);

// Service For WordSearch 
; (function () {
    'use strict';
    rolpo_app.factory('wordsearchPlayService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var wordsearchPlayServiceFactory = {};

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

        //Update User session
        var _updateUserSession = function (_session) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/UserSession/UpdateUserSession",
                data: _session
            });
            return request;
        };

        //Add To score board
        var _addToScoreBoard = function (scoreboard) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/WordSearch/AddToWordSearchScoreBoard",
                data: scoreboard
            });
            return request;
        };

        // Get WordSearch Stat by solution Code
        var _getWordSearchStat = function (id) {
            return $http({
                url: serviceBase + 'api/WordSearch/GetWordSearchStat',
                method: "get",
                params: { id: id }
            });
        };


        wordsearchPlayServiceFactory.AddToScoreBoard = _addToScoreBoard;

        wordsearchPlayServiceFactory.UpdateUserSession = _updateUserSession;

        wordsearchPlayServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        wordsearchPlayServiceFactory.GetDDLByFilter = _getDDLList;
        wordsearchPlayServiceFactory.getWordSearchStat = _getWordSearchStat;


        return wordsearchPlayServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('WSPlayController', ['$scope', '$interval', 'wordsearchPlayService', '$uibModal', 'modalService', 'localService', '$timeout', '$uibModalStack', '$window', '$location', function ($scope, $interval, wordsearchPlayService, $uibModal, modalService, localService, $timeout, $uibModalStack, $window, $location) {

        // Variables and declarations 

        $scope.loading = false;
        $scope.__localwsusersession = localService.__GET();
        $scope.currentTime = "0";
        $scope.currentBoard = { syncing: false, isTopScore: false, status: WS_STATUS.INIT, submit: false, SessionKey: BaseHelper.generateGUID(), scb: scb, isMobile: isMobile(), scoreboard: [], settings: _defaultSettings() };


        $scope.wordsearch = {
            WordSearchTitle: "", Description: "", SimpleWords: "", WordsByClues: []
            , DisableReverseDiagnol: true, EasyMode: false, EnableQuestion: false, WordSearchQuestion: ""
            , showTab: "GENERAL", foundCount: 0
        };
        var saveCount = 0;


        //Generate WordSearch
        //INIT and Load 
        $scope.LoadWordSearch = function () {

            //Init
            $scope.wordsearch.showTab = $("#SearchMode").val();
            $scope.wordsearch.DirectionMode = $("#DirectionMode").val();

            var words = angular.fromJson($("#WordsJSON").val());


            $scope.puzzle = {
                ROWS: $("#ROWS").val(), COLS: $("#COLS").val()
                , grid: angular.fromJson($("#GridJSON").val())
                , words: words
            };
            $scope.wordsearch.EasyMode = (($scope.wordsearch.DirectionMode == "EASY") ? true : false);
            $scope.wordsearch.DisableReverseDiagnol = ((($scope.wordsearch.DirectionMode == "EASY") || ($scope.wordsearch.DirectionMode == "MEDIUM")) ? true : false);
            $scope.wordsearch.SetAsPrivate = $("#SetAsPrivate").val();

            if (true) { $scope.GenerateWordSearch(words); }

            angular.forEach($scope.puzzle.words, function (word) {
                word.found = false;
            });

            drawgrid();

            //Once everything is ready; verify if we have anything in pending or if we are already redirected to continue this new one;

            var absUrl = $location.absUrl();
            var url = new URL(absUrl);
            var _continue = url.searchParams.get("continue");
            var _prev = localService.GETGAME();

            if (_prev != null && _prev.ws != null) {

                if (_continue != null) {

                    $scope.ContinuePreviousGame(false);

                } else {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        scope: $scope,
                        //windowClass: "modal-custom-extension",
                        templateUrl: 'customDisplayPrevious',
                        backdrop: 'static',
                        keyboard: false,
                        modalFade: true,
                        size: ''
                    });
                }

            };
        };


        //Generate WordSearch
        //INIT and Load
        $scope.GenerateWordSearch = function (words) {
            MSG({});
            //$scope.wordsearch.WORDS = angular.copy(words);
            let _words = words.map(item => item.word);

            var hasAllSols = false;
            $scope.loading = true;

            const allowDiagonals = ($scope.wordsearch.EasyMode) ? false : true;
            const allowBackwards = ($scope.wordsearch.EasyMode) ? false : (($scope.wordsearch.DisableReverseDiagnol) ? false : true);

            var gridsize_x = 8;
            var gridsize_y = 8;

            const longestWord = Math.max(...words.map((word) => { return word._word.length}));
            
            if (gridsize_x < longestWord) {
                gridsize_x = longestWord;
                gridsize_y = longestWord;
            }

            if ($scope.currentBoard.isMobile) {
                gridsize_x = 10 + ((longestWord > 13) ? (longestWord - 13) : 0);
                gridsize_y = (gridsize_y > 15) ? gridsize_y : 15;
            }
            const ws = new WS(_words, { height: gridsize_y, width: gridsize_x }, allowBackwards, allowDiagonals);
            const newGame = ws._wsg122422022($scope.currentBoard.isMobile);

            var size = ws.getSize();

            $scope.puzzle = { grid: newGame.grid, COLS: size.width, ROWS: size.height, words: ws.words };

            hasAllSols = true;
            var rows = $scope.puzzle.ROWS, cols = $scope.puzzle.COLS;
            $scope.loading = false;
            if (!hasAllSols) {
                MSG({ 'elm': "WordSearch_alert", "MsgType": "ERROR", "MsgText": "Couldn't generate the wordserach puzzle. Max limit reached. Please remove few words and try again." });
                $scope.puzzle = {};
                return;
            }

            $scope.wordsearch.COLS = cols;
            $scope.wordsearch.ROWS = rows;
            $scope.wordsearch.GridJSON = angular.toJson($scope.puzzle.grid);
            $scope.wordsearch.WordsJSON = angular.toJson($scope.puzzle.words);
            $scope.wordsearch.SearchMode = $scope.wordsearch.showTab;
            $scope.wordsearch.DirectionMode = ($scope.wordsearch.EasyMode) ? "EASY" : (($scope.wordsearch.DisableReverseDiagnol) ? "MEDIUM" : "HARD");
        };

        //TAP FUNCTIONS

        var track = false;
        var startRow = -1;
        var startCol = -1;
        var currentX = -1;
        var currentY = -1;

        $scope.hastimerset = false;
        $scope.hasTapped = false;

        function CursorOnMouseUp(event) {
            var e = event;
            //var ctx = $scope.view.getCursorContext();
            var parentOffset = $('#cursor').offset();
            var x = currentX;
            var y = currentY; 
            //var x = (e.pageX - parentOffset.left);
            //var y = (e.pageY - parentOffset.top);
            //if (isPureMobile()) { 
            //    x = (e.touches[0].pageX - parentOffset.left);
            //    y = (e.touches[0].pageY - parentOffset.top);
            //}
            var row = Math.floor(y / $scope.view.cell);
            var col = Math.floor(x / $scope.view.cell);

            if (track) {   
                var found = HasFound({ "startRow": startRow, "startCol": startCol, "row": row, "col": col });
                track = false;
                startCol = -1;
                startRow = -1;
                currentX = -1;
                currentY = -1;

                if (found == null && $scope.media.NotFound.IsReady && $scope.currentBoard.settings.sound) {
                    $scope.media.NotFound.audio.play();
                }

                $scope.view.drawFound2();
            }
        };

        function CursorOnMouseMove(event) {
            var e = event;
            var parentOffset = $('#cursor').offset();
            var x = (e.pageX - parentOffset.left);
            var y = (e.pageY - parentOffset.top);
            if (isPureMobile()) {
                x = (e.touches[0].pageX - parentOffset.left);
                y = (e.touches[0].pageY - parentOffset.top);
            }
            var row = Math.floor(y / $scope.view.cell);
            var col = Math.floor(x / $scope.view.cell);

            if (track) {
                currentX = x;
                currentY = y;
                var ctx = document.getElementById('cursor').getContext('2d');
                $scope.view.drawFound2();

                var x0 = $scope.view.cell / 2 + startCol * $scope.view.cell;
                var y0 = $scope.view.cell / 2 + startRow * $scope.view.cell;
                var xf = $scope.view.cell / 2 + col * $scope.view.cell;
                var yf = $scope.view.cell / 2 + row * $scope.view.cell;

                ctx.strokeStyle = $scope.view.seekColor;

                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(xf, yf);
                ctx.stroke();

                var found = HasFound({ "startRow": startRow, "startCol": startCol, "row": row, "col": col });
                if (found != null) { 
                    $scope.view.drawFound2();
                }
                
            }

        };

        function CursorOnMouseDown(event) {
            var e = event;

            var ctx = $scope.view.getCursorContext();
            var parentOffset = $('#cursor').offset();
            var x = (e.pageX - parentOffset.left);
            var y = (e.pageY - parentOffset.top);
            
            if (isPureMobile()) {
                x = (e.touches[0].pageX - parentOffset.left);
                y = (e.touches[0].pageY - parentOffset.top);
            }
            var row = Math.floor(y / $scope.view.cell);
            var col = Math.floor(x / $scope.view.cell);


            
            $scope.hasTapped = !$scope.hasTapped;   

            if (!track) {

                track = true;
                startCol = col;
                startRow = row;
                currentX = x;
                currentY = y;
                $scope.view.drawFound2();

                var xf = $scope.view.cell / 2 + col * $scope.view.cell;
                var yf = $scope.view.cell / 2 + row * $scope.view.cell;

                var x0 = xf;
                var y0 = yf;

                //$scope.view.changecolor();
                ctx.strokeStyle = $scope.view.seekColor;

                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(xf, yf);
                ctx.stroke();

            }
        };

        function HasFound(params) {

            var foundWord = null;
            for (var i = 0; i < $scope.puzzle.words.length; i++) {
                var obj = $scope.puzzle.words[i];
                
                if (
                    ((obj.rowi === params.startRow) && (obj.coli === params.startCol) && (obj.rowf === params.row) && (obj.colf === params.col))
                    || ((obj.rowf === params.startRow) && (obj.colf === params.startCol) && (obj.rowi === params.row) && (obj.coli === params.col))
                    && (!obj.found)) {

                    //if ((obj.rowi === startRow) && (obj.coli === startCol) &&
                    //    (obj.rowf === row) && (obj.colf === col) && (!obj.found)) {
                    
                    obj.found = true;
                    obj.strike = true;

                    foundWord = obj;

                    break;
                }
            }
            if (foundWord != null) {
                track = false;
                startCol = -1;
                startRow = -1;
                currentX = -1;
                currentY = -1;

                if ($scope.media.Found.IsReady && $scope.currentBoard.settings.sound) {
                    $scope.media.Found.audio.play();
                }
            }
            return foundWord;

        }

        //Toggle full screen
        $scope.FullScreen_toggle = function () {
            if ($scope.HasFullScreenModeEnabled()) {
                document.exitFullscreen()
                    .then(function () {
                        // element has exited fullscreen mode
                        drawgrid();
                    })
                    .catch(function (error) {
                        // element could not exit fullscreen mode
                        // error message
                        console.log(error.message);
                    });

            } else {

                // DOM element which needs to enter fullscreen mode
                var element = document.querySelector("#this_full_screen");
                element.requestFullscreen()
                    .then(function () {
                        // element has entered fullscreen mode successfully
                        drawgrid();
                    })
                    .catch(function (error) {
                        // element could not enter fullscreen mode
                        // error message
                        console.log(error.message);
                    });
            }
        }

        //Check if full screen mode is on or not.
        $scope.HasFullScreenModeEnabled = function () {

            var full_screen_element = document.fullscreenElement;

            // If no element is in full-screen
            if (full_screen_element !== null)
                return true;
            else
                return false;
        };

        //Start Game
        $scope.StartGame = function (enableFullScreen) {

            $('#overlay').css('z-index', 1).hide();

            if (enableFullScreen && !$scope.HasFullScreenModeEnabled()) {
                $scope.FullScreen_toggle();
            }
            StartTimer();
        }

        //Show Scoreboard
        $scope.ShowScoreBoard = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                templateUrl: 'customScoreBoardPopup',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });
        };

        //Update User Session Details
        $scope.ReUpdateSessionDetails = function () {

            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                //windowClass: "modal-custom-extension",
                templateUrl: 'customUpdateSessionDetails',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });
            $scope.currentBoard.UserDetailsUpdated = false;
        }


        //Update Session Details
        $scope.UpdateUserSessionDetails = function () {
            $scope.currentBoard.syncing = true;
            wordsearchPlayService.UpdateUserSession($scope.__localwsusersession).then(function (results) {
                $scope.currentBoard.syncing = false;
                $scope.currentBoard.UserDetailsUpdated = true;
                localService.__UPDATE($scope.__localwsusersession);
                $scope.__localwsusersession = localService.__GET();

            }, function (error) {
                console.log("Error saving the user information.", error);
                $scope.currentBoard.syncing = false;
                $scope.currentBoard.UserDetailsUpdated = true;
            });
        };


        //Add to scoreboard;
        function AddToScoreBoard() {
            if ($scope.currentBoard.submit) return;
            var scoreboard = {
                Position: 0,
                WordSearchCode: _current.Code,
                WSBId: 0,
                UserName: $scope.__localwsusersession.UserName,
                USessionId: $scope.__localwsusersession.USessionId,
                TimeInSeconds: ($scope.currentBoard.status == WS_STATUS.COMPLETE) ? $scope.currentTime : 0,
                Status: ($scope.currentBoard.status == WS_STATUS.COMPLETE) ? "COMPLETE" : (($scope.currentBoard.status == WS_STATUS.START) ? "START" : "INIT"),
                SessionId: $scope.currentBoard.SessionKey
            };
            if ($scope.currentBoard.status == WS_STATUS.COMPLETE) { $scope.currentBoard.submit = true; }
            //console.log($scope.currentBoard.status, WS_STATUS.COMPLETE);
            $timeout(function () {
                wordsearchPlayService.AddToScoreBoard(scoreboard).then(function (results) {
                    //Get full stat;
                    if ($scope.currentBoard.status == WS_STATUS.COMPLETE) {
                        getStat();
                    }
                }, function (error) {
                    console.log("Error saving the user information.", error);
                    $scope.score_loading = false;
                });

            }, 500);
         }

        //Submit WordSearch
        function SubmitWordSearch() {

            //$interval.cancel($scope.timeInterval); 
            $scope.wordsearchActionTitle = "Game Finished in " + $scope.currentTime + " seconds";
            $scope.currentBoard.status = WS_STATUS.COMPLETE;
            try {
                 if (($scope.currentTime <= $scope.currentBoard.scb.Low) || ($scope.currentBoard.scb.Total < $scope.currentBoard.scb.CutOff)) {
                    $scope.currentBoard.isTopScore = true;
                    $scope.currentBoard.UserDetailsUpdated = false;
                }
                // Call
                AddToScoreBoard();

            } catch (ex) {
                console.log(ex);
            }

            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension",
                templateUrl: 'customShowFinishPopup',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });
 
        };


        //Continue Previous game;
        $scope.ContinuePreviousGame = function (dismiss_n_fullscreen) {
            var _prev = localService.GETGAME();
            if (_prev.ws.WSBId == _current.WSBId) { 
                //Function to load Prev instance;
                LoadPrev(_prev); 

                drawgrid();
                //$scope.view.drawFound2();

                if (dismiss_n_fullscreen) {
                    $uibModalStack.dismissAll();
                    if (!$scope.HasFullScreenModeEnabled()) {
                        $scope.FullScreen_toggle();
                    }
                }
                

            } else {
                //Redirect with success tag;
                //console.log(_prev);
                $window.location.href = _prev.ws.url + '?continue=absolute'; 
            }
        }

        //continue current;
        $scope.ContinueCurrent = function () {
            localService.SAVEGAME(null);
             $scope.cancelEditing();
        }

        //toggle zoom;
        $scope.toggleZoom = function () {
            $scope.currentBoard.settings.zoom = !$scope.currentBoard.settings.zoom;
            drawgrid();
        };

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

        //Load Prev Instance
        function LoadPrev(_prev) {

            //Set the last counter;
            $scope.wordsearch = _prev.wordsearch;
            $scope.puzzle = _prev.puzzle;
            $scope.currentBoard = _prev.currentBoard;

            $scope.hastimerset = true;
            $scope.currentTime = _prev.timer.currentTime;
           
            $('#overlay').css('z-index', 1).hide(); 
            $scope.currentBoard.status = WS_STATUS.START; 
            saveCount = $scope.wordsearch.foundCount;

            $interval.cancel($scope.timeInterval);
            $scope.timeInterval = $interval(function () {
                $scope.currentTime = (+$scope.currentTime + 1) + "";
            }, 1000);
        }


        //Has All words found
        function SubmitIfAllWordsFound() {
            var hasAllFound = true;
            angular.forEach($scope.puzzle.words, function (word) {
                hasAllFound = hasAllFound && word.found;
            });
            //Save instance of current game;

            if ((typeof ($scope.currentTime) != 'undefined') && $scope.currentTime != NaN) {
                if (saveCount < $scope.wordsearch.foundCount) {
                    var timer = { hastimerset: $scope.hastimerset, currentTime: $scope.currentTime };
                    localService.SAVEGAME({ ws: _current, wordsearch: angular.copy($scope.wordsearch), puzzle: angular.copy($scope.puzzle), currentBoard: angular.copy($scope.currentBoard), timer: angular.copy(timer) });
                    saveCount = $scope.wordsearch.foundCount;
                }
                
             }
            if (hasAllFound) {
                $scope.hastimerset = false;
                $interval.cancel($scope.timeInterval);
                //Clear save;
                localService.SAVEGAME(null);

                //const canvas = document.getElementById('cursor')
                //const jsConfetti = new JSConfetti({ canvas })

                if ($scope.HasFullScreenModeEnabled()) { $scope.FullScreen_toggle(); }
                const jsConfetti = new JSConfetti();

                // Promise.then
                jsConfetti.addConfetti()
                    .then(() => {
                        SubmitWordSearch();
                    });
            }
        }

        //Timer function
        function StartTimer() {
            // Call
            AddToScoreBoard();
          
            $scope.hastimerset = true;
            $scope.currentTime = "0"; 
            $interval.cancel($scope.timeInterval);
            $scope.timeInterval = $interval(function () { 
                $scope.currentTime = (+$scope.currentTime + 1) + ""; 
            }, 1000);
            $scope.currentBoard.status = WS_STATUS.START;

           

        }

        //draw grid
        function drawgrid() {

            var thisDiv = document.getElementById('thisDiv');
            var width = thisDiv.offsetWidth;
            var currentHeight = window.innerHeight;
            currentHeight = currentHeight - 50; // the tap|count|full-screen|timer can have 50px of height;
             
            if (width > currentHeight && currentHeight > 650) {
                width = currentHeight;
            }

            var panel = document.getElementById('panel');
            var cursor = document.getElementById('cursor');
           

            var panelCtx = panel.getContext('2d');
            var cursorCtx = cursor.getContext('2d');
            var pad = ($scope.currentBoard.settings.zoom ? 5 : 15);
            $scope.view = new WSView($scope.puzzle, 'Calibri, "Alegreya Sans", "Helvetica Neue", Helvetica, Arial, sans-serif', '700', panelCtx, cursorCtx, width, pad);

            panel.height = $scope.view.getD().height;
            cursor.height = $scope.view.getD().height;

            panel.width = $scope.view.getD().width;
            cursor.width = $scope.view.getD().width;
            
              
            $('#thisDiv').css({
                "min-height": panel.height + 20 + 'px'
            }); 

            $scope.view.drawGrid();
            $scope.view.drawFound2();
            $interval(function () {
                drawSplash();
            }, 300);
            
        }

        function drawSplash() {
            var panel = document.getElementById("panel");
            var overlay = document.getElementById("overlay"); 
            overlay.style.width = panel.offsetWidth + "px";
            overlay.style.height = panel.offsetHeight + "px";
            overlay.style.position = "absolute";
            overlay.style.top = panel.offsetTop + "px";
            overlay.style.left = panel.offsetLeft + "px";
        } 

        //check if mobile or not. 
        function isMobile() {
            var isMobile = false;
            try {
                var isMobile = /(android|iphone|ipad|mobile)/i.test(navigator.userAgent);

                if (false) {
                    //Still need to verify if they are using certain screensize;
                    isMobile = window.matchMedia("(max-width: 767px)").matches;
                    // true: The viewport is less than 767px wide, which means the user is likely accessing the website in mobile view
                    // false: The viewport is 767px wide or wider, which means the user is likely accessing the website in desktop view 
                }
            } catch (e) { }

            return isMobile;
        };
        //check if mobile or not. 
        function isPureMobile() {
            var isMobile = false;
            try {
                var isMobile = /(android|iphone|ipad|mobile)/i.test(navigator.userAgent); 
            } catch (e) { }

            return isMobile;
        };


        //Get Stat
        function getStat() {
            wordsearchPlayService.getWordSearchStat(_current.Code).then(function (results) {
                if (results.data == null) {
                    console.log("results.data is null");
                    return;
                };
                $scope.currentBoard.scoreboard = results.data.ScoreBoard;
            
            }, function (error) {
                //error while fetching stat;
                console.log(error);
            });

            };

        window.addEventListener("resize", function () {
            drawgrid();
        });

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
            if (hasFound && $scope.hastimerset) SubmitIfAllWordsFound();
        }; 

        WSView.prototype.getCursorContext = function () {
            return this.cursorCtx;
        }; 
         
        WS.prototype.getSize = function () {
            return this.size;
        };

        //Call for the first time
        $scope.LoadWordSearch();

        var canvas = document.getElementById("cursor");
        if (isPureMobile()) {

            canvas.addEventListener("touchstart", function (e) {
                e.preventDefault();
                CursorOnMouseDown(e);
            });

            canvas.addEventListener("touchmove", function (e) {
                e.preventDefault();
                CursorOnMouseMove(e);
            });

            canvas.addEventListener("touchend", function (e) {
                e.preventDefault();
                CursorOnMouseUp(e);
            });
             
        } else {
            canvas.addEventListener("mousedown", function (e) {
                e.preventDefault();
                CursorOnMouseDown(e);
            });
            canvas.addEventListener("mousemove", function (e) {
                e.preventDefault();
                CursorOnMouseMove(e);
            });
            canvas.addEventListener("mouseup", function (e) {
                e.preventDefault();
                CursorOnMouseUp(e);
            }); 
        }


        function _defaultSettings() {
            return { sound: true, zoom: false };
        }

        function MEDIA() {
            this.Found = { audio: new Audio("https://wordsearchbox.com/assets/sound/found.wav"), IsReady: false };
            this.NotFound = { audio: new Audio("https://wordsearchbox.com/assets/sound/not-found.wav"), IsReady: false };
        };

        MEDIA.prototype.LOAD = function () {
            var parent = this;
            this.Found.audio.addEventListener("canplaythrough", function () { 
                parent.Found.IsReady = true;
            });

            this.NotFound.audio.addEventListener("canplaythrough", function () {
                parent.NotFound.IsReady = true;
            });
        }

        //Load Media
        $scope.media = new MEDIA();
        $scope.media.LOAD();




    }]);
}());