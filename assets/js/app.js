 
//ADD LIBRARY FOR TOGGLE FULL SCREEN;
/* Get the documentElement (<html>) to display the page in fullscreen */

/* Fullscreen */
$('.toggle-fullscreen').click(function () {
    $(document).toggleFullScreen();
});

function d(c) {
    var b, a; if (!this.length) return this; b = this[0]; b.ownerDocument ? a = b.ownerDocument : (a = b, b = a.documentElement); if (null == c) { if (!a.exitFullscreen && !a.webkitExitFullscreen && !a.webkitCancelFullScreen && !a.msExitFullscreen && !a.mozCancelFullScreen) return null; c = !!a.fullscreenElement || !!a.msFullscreenElement || !!a.webkitIsFullScreen || !!a.mozFullScreen; return !c ? c : a.fullscreenElement || a.webkitFullscreenElement || a.webkitCurrentFullScreenElement || a.msFullscreenElement || a.mozFullScreenElement || c } c ? (c =
        b.requestFullscreen || b.webkitRequestFullscreen || b.webkitRequestFullScreen || b.msRequestFullscreen || b.mozRequestFullScreen) && c.call(b) : (c = a.exitFullscreen || a.webkitExitFullscreen || a.webkitCancelFullScreen || a.msExitFullscreen || a.mozCancelFullScreen) && c.call(a); return this
} jQuery.fn.fullScreen = d; jQuery.fn.toggleFullScreen = function () { return d.call(this, !d.call(this)) }; var e, f, g; e = document;
e.webkitCancelFullScreen ? (f = "webkitfullscreenchange", g = "webkitfullscreenerror") : e.msExitFullscreen ? (f = "MSFullscreenChange", g = "MSFullscreenError") : e.mozCancelFullScreen ? (f = "mozfullscreenchange", g = "mozfullscreenerror") : (f = "fullscreenchange", g = "fullscreenerror"); jQuery(document).bind(f, function () { jQuery(document).trigger(new jQuery.Event("fullscreenchange")) }); jQuery(document).bind(g, function () { jQuery(document).trigger(new jQuery.Event("fullscreenerror")) });

 

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

        var html = '<button class=\'close\' data-dismiss=\'alert\' aria-label=\'Close\'>×</button>';
        html += '<strong>' + O.MsgType + '!</strong> ';

        var listItm = ''; 
        if (O.MsgAsModel != null && O.MsgAsModel != undefined) {

            html += O.MsgAsModel.Message;


            for (var key in O.MsgAsModel.ModelState) {
                for (var i = 0; i < O.MsgAsModel.ModelState[key].length; i++) {
                    listItm += '<li class=\'error\'>' + O.MsgAsModel.ModelState[key][i] + '</li>';
                    //errors.push(response.ModelState[key][i]);
                }
            }
            if (listItm.length > 0) { listItm = '<ul>' + listItm + '</ul>'; }


        } else { listItm = '<ul><li class=\'error\'>' + O.MsgText + '</li></ul>'; }
        html += listItm;
        $elm.empty().append(html).addClass(css).show();
        $elm.find('button').click(function () {
            $elm.hide();
            return false;
        });
        //if ($("element").data('bs.modal') && $("element").data('bs.modal').isShown) {
        //	alert(1);
        //}
        if ($elm.offset() == undefined) return;
        $('html, body').animate({ scrollTop: $elm.offset().top }, 'slow');


    }
};

$(document).ready(function () {
    function onHashChange() {
        var hash = window.location.hash;

        if (hash) {
            // using ES6 template string syntax
            $('[data-toggle="tab"][href="${hash}"]').trigger('click');
        }
    }

    window.addEventListener('hashchange', onHashChange, false);
    onHashChange();
});


function GETJ(str, isobj) { 
    var json = isobj ? {} : [];
    try {
        var stringToJ = str.replace(/\n|\r|\t/g, "");
        json = JSON.parse(stringToJ);
            //angular.fromJson(stringToJ);
    } catch (e) {
        console.log(e,"Error: " + stringToJ);
        return isobj ? {} : [];
    }

    return json;
};

function SETJ(obj) {
    var jsonStr = "";
    try {
        jsonStr = JSON.stringify(obj);

    } catch (ex) {
        console.log(e, obj);
    }
    return jsonStr;
}


var rolpo_app = angular.module('RolpoApp', ['ngSanitize', 'ui.bootstrap', 'ui.bootstrap.modal', 'ui.select']);

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
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
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
            // return if input date is null or undefined
            if (!utcDateString) {
                return;
            }

            // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
            if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
                utcDateString += 'Z';
            }

            // convert and format date using the built in angularjs date filter
            return $filter('date')(utcDateString, format);
        };
    }
})();

(function () {
    'use strict';

    rolpo_app
        .filter('utcToLocal', Filter);

    function Filter($filter) {
        return function (utcDateString, format) {
            // return if input date is null or undefined
            if (!utcDateString) {
                return;
            }

            // append 'Z' to the date string to indicate UTC time if the timezone isn't already specified
            if (utcDateString.indexOf('Z') === -1 && utcDateString.indexOf('+') === -1) {
                utcDateString += 'Z';
            }

            // convert and format date using the built in angularjs date filter
            return $filter('date')(utcDateString, format);
        };
    }
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
                    checkboxClass: 'icheckbox_square-green',
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
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});

//ckEditor
rolpo_app.directive('ckEditor', function () {
    return {
        require: '?ngModel',
        link: function (scope, elm, attr, ngModel) {
            var ck = CKEDITOR.replace(elm[0], {
                allowedContent: true
            });
            if (!ngModel) return;
            ck.on('instanceReady', function () {
                ck.setData(ngModel.$viewValue);
            });
            function updateModel() {
                scope.$apply(function () {
                    ngModel.$setViewValue(ck.getData());
                });
            }
            ck.on('change', updateModel);
            ck.on('key', updateModel);
            ck.on('dataReady', updateModel);

            ngModel.$render = function (value) {
                ck.setData(ngModel.$viewValue);
            };
        }
    };
});


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