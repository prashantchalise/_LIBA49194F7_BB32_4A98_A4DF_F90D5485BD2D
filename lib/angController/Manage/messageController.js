
rolpo_app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'rolpo.com'
});

// Service For Message 
; (function () {
    'use strict';
    rolpo_app.factory('messageService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var messageServiceFactory = {};

        //Default Filter 
        var _defaultDDLFilter = function () {
            return {
                PageName: "UIMessage",
                FilterList: [
                    
                ]
            };
        };

        //Message Empty Filter 
        var _messageEmptyFilter = function () {
            return { 
            };
        };

        //MsgThread Empty Filter 
        var _msgthreadEmptyFilter = function () {
            return {
                MsgThreadId: "",
                Email: "",
                PageNumber: 1,
                PageSize: 20,
                ShowAll: 0
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

        // Get MsgThreads by Filter
        var _getMsgThreads = function (tbfilter) {
            return $http({
                url: serviceBase + 'api/MsgThread/GetMsgThreadsList',
                method: "post",
                data: tbfilter
            });
        }; 

        //Mark msg as Read
        var _markMsgRead = function (msgId) {
            return $http({
                url: serviceBase + 'api/MsgThread/MarkAsRead',
                method: "post",
                data: msgId
            });
        }; 

        //Add msg reply
        var _addMsgReply = function (msg) {
            return $http({
                url: serviceBase + 'api/Message/AddReply',
                method: "post",
                data: msg
            });
        }; 

        messageServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
        messageServiceFactory.GetDDLByFilter = _getDDLList; 
        messageServiceFactory.MessageEmptyFilter = _messageEmptyFilter; 
        messageServiceFactory.MsgThreadEmptyFilter = _msgthreadEmptyFilter; 
        messageServiceFactory.getMsgThreads = _getMsgThreads; 
        messageServiceFactory.markMsgRead = _markMsgRead; 
        messageServiceFactory.addMsgReply = _addMsgReply; 

        return messageServiceFactory;
    }]);
}());


// Controller Starts Here.. 
; (function () {
    'use strict';
    rolpo_app.controller('messageController', ['$scope', '$rootScope', 'messageService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, messageService, modalService, $uibModal, $uibModalStack, $filter) {

        // Variables and declarations 

        $scope.loading = true;
        //$scope.messages = [];
        $scope.message = {};
        $scope.msgthreads = [];
        //$scope.MessagePageInfo = {};
        //$scope.vendorsddl = [];

        ////Populate DDLs
        //var ddlFilter = messageService.DDLDefaultFilter();
        //messageService.GetDDLByFilter(ddlFilter).then(function (results) {
        //    $scope.ddLItems = angular.fromJson(results.data.DDLItems);
        //    $scope.vendorsddl = $filter('filter')($scope.ddLItems, function (d) { return d.DDLName === "VENDOR" })[0].Items;
        //});

        // Methods

        //// Get Message by Filter

        $scope.GetMessageByFilter = function () {
            GetMessages($scope.tbfilter);
        };

        // Reset Message Filter
        $scope.ResetMessageFilter = function () {
            var pageSize = $scope.tbfilter.PageSize;

            $scope.tbfilter = messageService.MessageEmptyFilter();
            $scope.tbfilter.PageSize = pageSize;

            GetMessages($scope.tbfilter);
        };

        //On Message Page Changed
        $scope.OnMessagePageChanged = function () {
            GetMessages($scope.tbfilter);
        };

        //On Page Size Changed
        $scope.OnMessagePageSizeChanged = function () {
            GetMessages($scope.tbfilter);
        };

        // Open Window for Saving new Message
        $scope.OpenMessageDialog = function (msg) { 
            $scope.message = { QuestionId: 0, showhideproduct: true, expandproduct: false, MsgThreadId: msg.MsgThreadId, };
            MSG({}); //Init
            $scope.messageActionTitle = "Add New Message";
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                windowClass: "modal-custom-extension", 
                templateUrl: 'MessagesDialog',
                backdrop: 'static',
                keyboard: false,
                modalFade: true,
                size: ''
            });

            let _filter = { MsgThreadId: msg.MsgThreadId, PageNumber: 1, ShowAll: 1 };
            GetMsgThread(_filter);

            markAsRead(msg);

        };

        $scope.addMessage = function (frm) {
            if (frm.$invalid) { return; } 
           
            $scope.frmloading = true;

            messageService.addMsgReply($scope.message).then(function (result) {
                $scope.msgthreads.push({ Message: $scope.message.Message, reply:true });
                $scope.frmloading = false;
            }, function (error) {
                    console.log('Error: ', error.data);
                    $scope.frmloading = false;
            });
        };

        // Cancel  Editing
        $scope.cancelEditing = function () {
            $uibModalStack.dismissAll();
        };

        // Functions 

         function GetMessages(tbfilter) {
            $scope.loading = true;
            $scope.HasTB_Records = false;
             messageService.getMsgThreads(tbfilter).then(function (results) { 
                 $scope.messages = results.data;
                
                var tmp_page_start = (($scope.tbfilter.PageNumber - 1) * ($scope.tbfilter.PageSize) + 1), tmp_page_end = ($scope.tbfilter.PageNumber) * ($scope.tbfilter.PageSize);
                if (results.data.length > 0) {
                    $scope.MessagePageInfo = {
                        Has_record: true,
                        TotalItems: results.data[0]["TotalCount"],
                        PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
                        PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
                    };
                } else { $scope.MessagePageInfo = {}; }
                $scope.loading = false;
            }, function (error) {
                MSG({ 'elm': "Message_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading messages!', 'MsgAsModel': error.data });
                $scope.loading = false;
            });
        };

        //Get all the thread messages
        function GetMsgThread(tbfilter) {
            $scope.frmloading = true; 
            messageService.getMsgThreads(tbfilter).then(function (results) {
                $scope.msgthreads = results.data;
                angular.forEach($scope.msgthreads, function (v) {
                    if (v.CreatedBy === userId) {
                        v.reply = true;
                    }
                });
                $scope.frmloading = false;
            }, function (error) {
                MSG({ 'elm': "Message_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading message threads!', 'MsgAsModel': error.data });
                    $scope.frmloading = false;
            });
        };


        //function to mark message as read
        function markAsRead(msg) {
            if (!msg.MessageRead) {
                //mark message as read
                messageService.markMsgRead(msg.MsgId).then(function (result) { 
                    msg.MessageRead = true;
                }, function (error) {
                    console.log('Error: ', error.data);
                });
            }
        }

        ////Datepicker
        //$scope.dateOptions = {
        //    'year-format': "'yy'",
        //    'show-weeks': false
        //};

        //$scope.OpenDate = function (obj, prop) {
        //    obj[prop] = true;
        //};

        // Call Message for first time
        $scope.MessagePageInfo = {};
        $scope.tbfilter = messageService.MsgThreadEmptyFilter();
        $scope.tbfilter.VendorId = vendorId;
        $scope.tbfilter.PageNumber = 1;
        $scope.tbfilter.PageSize = '20';

        GetMessages($scope.tbfilter);

    }]);
}());

