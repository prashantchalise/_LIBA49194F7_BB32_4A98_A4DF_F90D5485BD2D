rolpo_app.requires.push('ngStorage');


rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

; (function () {
    'use strict';
    rolpo_app.factory('baseService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var baseServiceFfactory = {};

        var _defaultDDLFilter = function () {
            return {
                PageName: "AddEditCategory",
                FilterList: [

                ]
            };
        };

        var _updateUserSession = function (_session) {
            var request = $http({
                method: "post",
                url: serviceBase + "api/UserSession/UpdateUserSession",
                data: _session
            });
            return request;
        };

        baseServiceFfactory.UpdateUserSession = _updateUserSession;
        baseServiceFfactory.DDLDefaultFilter = _defaultDDLFilter;

        return baseServiceFfactory;
    }]);
}());


; (function () {
    'use strict';
    rolpo_app.factory('localService', ['$http', '$filter', '$localStorage', function ($http, $filter, $localStorage) {

        var baseServiceFfactory = {};
        var syncing = false;
        var msg = { MsgType: "", MsgText: "" };

        var __localwsusersession = {
            USessionId: BaseHelper.generateGUID()
            , UserName: BaseHelper.getRName().Name
            , Location: ''
            , NEWWS: null
            , PostReacted: []
            , _Current: {}
        };

        if (typeof ($localStorage.__localwsusersession) != 'undefined') {
            __localwsusersession = $localStorage.__localwsusersession;
        }
        $localStorage.__localwsusersession = __localwsusersession;

        var _save = function () {
            $localStorage.__localwsusersession = angular.copy(__localwsusersession);
        }

        var _getInfo = function () {
            return __localwsusersession;
        }

        var _getCurrentGame = function () {
            if (typeof (__localwsusersession._Current) === 'undefined') { __localwsusersession._Current = {}; }
            return __localwsusersession._Current;
        }

        var _saveCurrentGame = function (ws) {
            __localwsusersession._Current = ws;
            _save();

        }

        var _updateWordSearch = function (ws) {
            __localwsusersession.NEWWS = ws;
            $localStorage.__localwsusersession = angular.copy(__localwsusersession);
        }

        var _updateSession = function (session) {
            __localwsusersession = session;
            _save();
        }

        var _createPostreactions = function (postreactions) {
            var request = $http({
                method: 'post',
                url: serviceBase + 'api/Postreactions/AddReaction',
                data: postreactions
            });
            return request;
        };

        var _addPostReaction = function (postId, reaction_type) {
           msg = { MsgType: "", MsgText: "" };
            console.log(postId, reaction_type);

            if (typeof (__localwsusersession.PostReacted) === 'undefined') { __localwsusersession.PostReacted = []; }
            var postbyid = $filter('filter')(__localwsusersession.PostReacted, function (d) { return d.PostId === postId }); 
            if (postbyid != null) {
                if (postbyid.length > 0) {
                    msg.MsgType = "ERROR";
                    msg.MsgText = "Oops! You already submitted your reaction.";
                    return;
                }
            }

            var postreaction = { PostId: postId, Like_Count: false, Love_Count: false, Laugh_Count: false, Shocked_Count: false, Sad_Count: false, Angry_Count: false };

            switch (reaction_type) {
                case 'LIKE':
                    postreaction.Like_Count = true;
                    break;
                case 'LOVE':
                    postreaction.Love_Count = true;
                    break;
                case 'LAUGH':
                    postreaction.Laugh_Count = true;
                    break;
                case 'SHOCKED':
                    postreaction.Shocked_Count = true;
                    break;
                case 'SAD':
                    postreaction.Sad_Count = true;
                    break;
                case 'ANGRY':
                    postreaction.Angry_Count = true;
                    break;
            }


            syncing = true;

            _createPostreactions(postreaction).then(function (results) {
                msg.MsgType = "OK";
                msg.MsgText = results.data + ' Please refresh if needed.'; 
                __localwsusersession.PostReacted.push(postreaction);
                _save();

                syncing = false;

            }, function (error) {
                syncing = false;
                msg = { MsgType: "ERROR", MsgText: "Oops! something went wrong." };
            });
        };

        baseServiceFfactory.loading = function () { return syncing; };
        baseServiceFfactory.msg = function () { return msg; };

        baseServiceFfactory.__GET = _getInfo;
        baseServiceFfactory.__UPDATE = _updateSession;

        baseServiceFfactory.GETGAME = _getCurrentGame;
        baseServiceFfactory.SAVEGAME = _saveCurrentGame;

        baseServiceFfactory.__UPDATEWS = _updateWordSearch;
        baseServiceFfactory.AddPostReaction = _addPostReaction;

        return baseServiceFfactory;
    }]);
}());

; (function () {
    'use strict';
    rolpo_app.controller('baseController', ['$scope', '$rootScope', 'localService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, localService, modalService, $uibModal, $uibModalStack, $filter) {
 
        $scope.OpenLoginForm = function () { 
            MSG({}); 
            $scope.userloginsignupTitle = "Login";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension",
                templateUrl: 'Rolpo_Login',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

        };

        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        $scope.dateOptions = {
            'year-format': "'yy'",
            'show-weeks': false
        };

        $scope.OpenDate = function (obj, prop) {
            obj[prop] = true;
        };

        

    }]);
}());

class BaseHelper {

    static getRName() {
        var index = Math.floor(Math.random() * 50);
        var names = [
            { "Id": 1, "Name": "Wordwhiz" },
            { "Id": 2, "Name": "Scrabbleguru" },
            { "Id": 3, "Name": "Texttangle" },
            { "Id": 4, "Name": "Alphawizard" },
            { "Id": 5, "Name": "Crosswordninja" },
            { "Id": 6, "Name": "Anagramace" },
            { "Id": 7, "Name": "Letterlover" },
            { "Id": 8, "Name": "Wordwanderer" },
            { "Id": 9, "Name": "Puzzleperfect" },
            { "Id": 10, "Name": "Wordwonder" },
            { "Id": 11, "Name": "Lexicobeat" },
            { "Id": 12, "Name": "Grammarmaster" },
            { "Id": 13, "Name": "Wordweaver" },
            { "Id": 14, "Name": "Typetangle" },
            { "Id": 15, "Name": "Spellingbee" },
            { "Id": 16, "Name": "Scribblesaurus" },
            { "Id": 17, "Name": "Penmanshippro" },
            { "Id": 18, "Name": "Linguisticlegend" },
            { "Id": 19, "Name": "Wordsmithy" },
            { "Id": 20, "Name": "Typographytangle" },
            { "Id": 21, "Name": "Orthographyogre" },
            { "Id": 22, "Name": "Calligraphycat" },
            { "Id": 23, "Name": "Phonetician" },
            { "Id": 24, "Name": "Cryptocrafter" },
            { "Id": 25, "Name": "Etymologician" },
            { "Id": 26, "Name": "Semanticstalker" },
            { "Id": 27, "Name": "Syntacticninja" },
            { "Id": 28, "Name": "Vocabularaptor" },
            { "Id": 29, "Name": "Graphemist" },
            { "Id": 30, "Name": "Grammarghost" },
            { "Id": 31, "Name": "Lexicographer" },
            { "Id": 32, "Name": "Linguisticlion" },
            { "Id": 33, "Name": "Orthologyoctopus" },
            { "Id": 34, "Name": "Phonologyphoenix" },
            { "Id": 35, "Name": "Semioticyeti" },
            { "Id": 36, "Name": "Symbolist" },
            { "Id": 37, "Name": "Lexologylizard" },
            { "Id": 38, "Name": "Linguister" },
            { "Id": 39, "Name": "Semasiologysiren" },
            { "Id": 40, "Name": "Vocabularist" },
            { "Id": 41, "Name": "Glossologygorgon" },
            { "Id": 42, "Name": "Glottologygolem" },
            { "Id": 43, "Name": "Lexicologyleprechaun" },
            { "Id": 44, "Name": "Linguasphere" },
            { "Id": 45, "Name": "Logographer" },
            { "Id": 46, "Name": "Orthologos" },
            { "Id": 47, "Name": "Phonologer" },
            { "Id": 48, "Name": "Semasiology" },
            { "Id": 49, "Name": "Glossary" },
            { "Id": 50, "Name": "Wordwise" }];

        return names[index];
    }

    static generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
};

const WS_STATUS = {
    INIT: 0,
    START: 1,
    COMPLETE: 2
};

