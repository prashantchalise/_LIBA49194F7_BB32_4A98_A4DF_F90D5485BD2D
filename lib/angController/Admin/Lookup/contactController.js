//Created By: Prashant 
//Created On: 28/01/2023 
// Controller for Contact 
// Initialization for Contact 

rolpo_app.constant('ngAuthSettings', {
	apiServiceBaseUri: serviceBase,
	clientId: 'rolpo.com'
});

// Service For Contact 
; (function () {
	'use strict';
	rolpo_app.factory('contactService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

		var serviceBase = ngAuthSettings.apiServiceBaseUri;
		var contactServiceFactory = {};

		//Default Filter 
		var _defaultDDLFilter = function () {
			return {
				PageName: "AddEditContact",
				FilterList: [
				]
			};
		};

		//Contact Empty Filter 
		var _contactEmptyFilter = function () {
			return {
				Id: 0,
				Email: "",
				PageNumber: 1,
				PageSize: 20,
				ShowAll: 0
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

		// Get Contacts by Filter
		var _getContacts = function (tbfilter) {
			return $http({
				url: serviceBase + 'api/Lookup/GetContactsList',
				method: "post",
				data: tbfilter
			});
		};

		// Get Contacts by Id
		var _getContactsById = function (contactid) {
			return $http({
				url: serviceBase + 'api/Lookup/GetContactById',
				method: "get",
				params: { contactid: contactid }
			});
		};


		contactServiceFactory.DDLDefaultFilter = _defaultDDLFilter;
		contactServiceFactory.GetDDLByFilter = _getDDLList;
		contactServiceFactory.getContacts = _getContacts;
		contactServiceFactory.getContactsById = _getContactsById;
		contactServiceFactory.ContactEmptyFilter = _contactEmptyFilter;

		return contactServiceFactory;
	}]);
}());


// Controller Starts Here.. 
; (function () {
	'use strict';
	rolpo_app.controller('contactController', ['$scope', '$rootScope', 'contactService', 'modalService', '$uibModal', '$uibModalStack', '$filter', function ($scope, $rootScope, contactService, modalService, $uibModal, $uibModalStack, $filter) {

		// Variables and declarations 

		$scope.loading = true;
		$scope.contacts = [];
		$scope.contact = {};
		$scope.ContactPageInfo = {};

		//Populate DDLs
		var ddlFilter = contactService.DDLDefaultFilter();
		contactService.GetDDLByFilter(ddlFilter).then(function (results) {
			$scope.ddLItems = angular.fromJson(results.data.DDLItems);

		});

		// Methods

		// Get Contact by Filter

		$scope.GetContactByFilter = function () {
			GetContacts($scope.tbfilter);
		};

		// Reset Contact Filter
		$scope.ResetContactFilter = function () {
			var pageSize = $scope.tbfilter.PageSize;

			$scope.tbfilter = contactService.ContactEmptyFilter();
			$scope.tbfilter.PageSize = pageSize;

			GetContacts($scope.tbfilter);
		};

		//On Contact Page Changed
		$scope.OnContactPageChanged = function () {
			GetContacts($scope.tbfilter);
		};

		//On Page Size Changed
		$scope.OnContactPageSizeChanged = function () {
			GetContacts($scope.tbfilter);
		};





		// Functions 

		// Function to Get Contact
		function GetContacts(tbfilter) {
			$scope.loading = true;
			$scope.HasTB_Records = false;
			contactService.getContacts(tbfilter).then(function (results) {
				$scope.contacts = results.data;
				var tmp_page_start = (($scope.tbfilter.PageNumber - 1) * ($scope.tbfilter.PageSize) + 1), tmp_page_end = ($scope.tbfilter.PageNumber) * ($scope.tbfilter.PageSize);
				if (results.data.length > 0) {
					$scope.ContactPageInfo = {
						Has_record: true,
						TotalItems: results.data[0]["TotalCount"],
						PageStart: (results.data[0]["TotalCount"] > 0) ? tmp_page_start : 0,
						PageEnd: tmp_page_end < results.data[0]["TotalCount"] ? tmp_page_end : results.data[0]["TotalCount"]
					};
				} else { $scope.ContactPageInfo = {}; }
				$scope.loading = false;
			}, function (error) {
				MSG({ 'elm': "Contact_alert", 'MsgType': 'ERROR', 'MsgText': 'An Error has occured while loading contacts!', 'MsgAsModel': error.data });
				$scope.loading = false;
			});
		};

		// Create New Contact Function 
		function CreateNewContact(contact) {
			$scope.contact_loading = true;
			contactService.createContact(contact).then(function (results) {
				$scope.contacts.push(results.data);
				$scope.contact_loading = false;
				$uibModalStack.dismissAll();
				MSG({ 'elm': "Contact_alert", "MsgType": "OK", "MsgText": "Contact added successfully." });
			}, function (error) {
				MSG({ 'elm': "Contact_AddEditAlert", 'MsgType': 'ERROR', 'MsgText': 'An error has occured while adding contact!', 'MsgAsModel': error.data });
				$scope.contact_loading = false;
			});
		}


		//Datepicker
		$scope.dateOptions = {
			'year-format': "'yy'",
			'show-weeks': false
		};

		$scope.OpenDate = function (obj, prop) {
			obj[prop] = true;
		};

		// Call Contact for first time
		$scope.ContactPageInfo = {};
		$scope.tbfilter = contactService.ContactEmptyFilter();
		$scope.tbfilter.PageNumber = 1;
		$scope.tbfilter.PageSize = '20';

		GetContacts($scope.tbfilter);

	}]);
}());

