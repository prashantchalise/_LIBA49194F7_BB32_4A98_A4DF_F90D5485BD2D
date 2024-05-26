; function MSG(O) {
    var $elm = $('.alert-rolpo').first();
    if (O != undefined) {
        if ($('#' + O.elm).length == 1) {
            $elm = $('#' + O.elm);
        }
    } else { O = {}; }

    //Types of MSG functions
    //MSG({ 'MsgType': 'OK', 'MsgText': 'Hell everything is right!'});
    //MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!'});
    //MSG({ 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!', 'MsgAsModel': error.data });
    //MSG({'elm':'div-id', 'MsgType': 'ERROR', 'MsgText': 'An error has occured while updating staff!', 'MsgAsModel': error.data });

    $('.alert').removeClass('alert-success alert-danger').hide();
    if (O.MsgType != '' && O.MsgType != undefined) {

        var css = (O.MsgType == 'ERROR') ? 'alert-danger' : 'alert-success';
        O.MsgType = (O.MsgType == 'ERROR') ? 'Error' : 'Success';

        var html = '<button type="button" class="btn-close" onclick="MSG({})" aria-label="Close"></button>';
        html += '<strong>' + O.MsgType + '!</strong> ';

        var listItm = '';
        console.log(O.MsgAsModel);
        if (O.MsgAsModel != null && O.MsgAsModel != undefined) {
            html += O.MsgAsModel.Title + "<br/>";
            for (var key in O.MsgAsModel.Errors) {
                for (var i = 0; i < O.MsgAsModel.Errors[key].length; i++) {
                    listItm += '<li class=\'error\'>' + O.MsgAsModel.Errors[key][i] + '</li>';
                }
            }
            if (listItm.length > 0) { listItm = '<ul>' + listItm + '</ul>'; }
        } else { listItm = '<ul><li class=\'error\'>' + O.MsgText + '</li></ul>'; }

        html += listItm;
        $elm.empty().append('<div/>').append(html).addClass(css).show();
        $elm.find('button').click(function () {
            $elm.hide();
            return false;
        });

        if ($elm.offset() == undefined) return;
        $('html, body').animate({ scrollTop: $elm.offset().top - 70 }, 'slow');
    }
};

 

$(document).ready(function () {
    function onHashChange() {
        var hash = window.location.hash;

        if (hash) { 
            $(`[data-toggle="tab"][href="${hash}"]`).trigger('click');
        }
    }

    window.addEventListener('hashchange', onHashChange, false);
    onHashChange();
});


function GETJ(str, isobj) {

    var json = isobj ? {} : [];
    try {
        var stringToJ = str.replace(/\n|\r|\t/g, "");
        json = angular.fromJson(stringToJ);
    } catch (e) {
        console.log("Errorin JSON: " + stringToJ);
        return isobj ? {} : [];
    }

    return json;
};


var rolpo_app = angular.module('RolpoApp', ['ngSanitize', 'ui.bootstrap', 'ui.bootstrap.modal']);

rolpo_app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

rolpo_app.service('modalService', ['$uibModal',

    function ($uibModal) {
        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            size: 'sm',
            templateUrl: 'customModalPopup'
        };

        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?'
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) { 
            var tempModalDefaults = {};
            var tempModalOptions = {};
             
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults); 
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $uibModalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $uibModalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (result) {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            }

            return $uibModal.open(tempModalDefaults).result;
        };

    }]);

(function () {
    'use strict';

    rolpo_app.filter('unsafe', function ($sce) { return $sce.trustAsHtml; });

    rolpo_app
        .filter('utcToLocal', Filter);

    function Filter($filter) {
        return function (utcDateString, format) { 
            if (!utcDateString) {
                return;
            }  
            if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
                utcDateString += 'Z';
            } 
            return $filter('date')(utcDateString, format);
        };
    };
})();
 

rolpo_app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter, { 'event': event });
                });

                event.preventDefault();
            }
        });
    };
});


rolpo_app.directive('icheck', ['$timeout', function ($timeout) {
    return {
        require: 'ngModel',
        link: function ($scope, element, $attrs, ngModel) {
            return $timeout(function () {
                var value = $attrs['value'];

                $scope.$watch($attrs['ngModel'], function (newValue) {
                    $(element).iCheck('update');
                })

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_minimal-blue',
                }).on('ifChanged', function (event) {
                    if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                        $scope.$apply(function () {
                            return ngModel.$setViewValue(event.target.checked);
                        });
                    }
                    if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                        return $scope.$apply(function () {
                            return ngModel.$setViewValue(value);
                        });
                    }
                });
            });
        }
    };
}]);

rolpo_app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];
         if (angular.isArray(items)) {
            var keys = Object.keys(props);
             items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else { 
            out = items;
        }

        return out;
    };
});

 
; $(document).ready(function () {
    try {
        $('#sidebar-collapse').slimScroll({ destroy: true }).slimScroll({
            height: '100%',
            railOpacity: '0.9',
        });
    } catch (e) { }
});

