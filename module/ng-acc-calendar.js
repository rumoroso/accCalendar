var KEYS = {
    "BACKSPACE": 8,
    "TAB": 9,
    "ENTER": 13,
    "ESCAPE": 27,
    "SPACE": 32,
    "END": 35,
    "HOME": 36,
    "LEFT_ARROW": 37,
    "UP_ARROW": 38,
    "RIGHT_ARROW": 39,
    "DOWN_ARROW": 40,
    "DELETE": 46
};

angular.module('ngAccCalendar', [])
    .constant('defaultConfiguration', {
        visible: false,
        initialDate: new Date(),
        yearRange: 20,
        disableCurrentDate: false,
        disableWeekends: false,
        disabledDates: {exceptionDates: [], regularDates: []},
        setDefaultDate: false,
        format: 'd/m/yyyy',
        showWeekNumber: false,
        minDate: false,
        maxDate: false,
        lang: 'es'
    })
    .constant('KEYS', KEYS)
    .constant('translate', {
        headerRow: {
            en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        },
        monthNaming: {
            'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'es': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        },
        year: {
            'en': 'year',
            'es': 'año'
        },
        month: {
            'en': 'month',
            'es': 'mes'
        },
        week: {
            'en': 'week',
            'es': 'semana'
        },
        day: {
            'en': 'day',
            'es': 'día'
        },
        notAvailable: {
            'en': 'not available',
            'es': 'no disponible'
        },
        selectedDate: {
            'en': 'selected date',
            'es': 'fecha seleccionada'
        },
        show: {
            'en': 'show calendar',
            'es': 'mostrar calendario'
        },
        hide: {
            'en': 'hide calendar',
            'es': 'ocultar calendario'
        }
    })
    .factory('accCalendarFormatService', function () {
        return {
            applyFormat: applyFormat
        };

        function applyFormat(day, calendarModel, formato) {
            var fecha_format, inic,
                month = calendarModel.month + 1,
                year = calendarModel.year,
                long_dia = formato.lastIndexOf('d') - formato.indexOf('d') + 1,
                long_mes = formato.lastIndexOf('m') - formato.indexOf('m') + 1,
                long_year = formato.lastIndexOf('y') - formato.indexOf('y') + 1;

            long_year = (long_year === 2 || (long_year !== 2 && long_year < 4)) ? 2 : 4;
            fecha_format = formato;

            day = (day < 10 && long_dia >= 2) ? '0' + day : day;
            fecha_format = fecha_format.replace('d', day);

            month = (month < 10 && long_mes >= 2) ? '0' + month : month;
            fecha_format = fecha_format.replace('m', month);

            inic = long_year === 2 ? 2 : 0;
            fecha_format = fecha_format.replace('y', year.toString().substr(inic, long_year));
            fecha_format = fecha_format.replace(/(m|d|y)/g, '');

            return fecha_format;
        }

    })
    .factory('accCalendarModelService', function () {
        var daysMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return {
            getCalendarModel: getCalendarModel,
            getFirstWeek: getFirstWeek
        };

        function getCalendarModel(year, month, day) {
            var monthModel = {},
                date = new Date(year, month, day);

            monthModel.year = date.getFullYear();
            monthModel.month = date.getMonth();
            monthModel.day = date.getDate();

            monthModel.dataRows = calendarModel(date);

            return monthModel;
        }

        function calendarModel(date) {
            var nDays, starting, total, cont,
                month = date.getMonth(),
                year = date.getFullYear(),
                monthArray = [], daysArray = [];

            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
                daysMonth[1] = 29;
            } else {
                daysMonth[1] = 28;
            }

            nDays = daysMonth[month];

            date.setDate(1);
            starting = (date.getDay() === 0) ? 7 : date.getDay();

            total = starting + nDays;

            for (cont = 0; cont < starting - 1; cont++) {
                daysArray.push('');
            }

            for (cont = starting - 1; cont < total - 1; cont++) {
                daysArray.push(cont - starting + 2);
            }

            while (daysArray.length % 7 > 0) {
                daysArray.push('');
            }

            while (daysArray.length) {
                monthArray.push(daysArray.splice(0, 7));
            }

            return monthArray;
        }

        function getFirstWeek(year, month) {
            var i,
                totalDays = 0,
                date = new Date(year, 0, 1);

            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
                daysMonth[1] = 29;
            } else {
                daysMonth[1] = 28;
            }

            for (i = 0; i < month; i++) {
                totalDays += daysMonth[i];
            }

            return 1 + ((totalDays - totalDays % 7) / 7) + ((totalDays % 7 >= 8 - date.getDay()) ? 1 : 0);
        }
    })
    .controller('accCalendarController', ['$scope', '$timeout', 'accCalendarModelService', 'defaultConfiguration', 'accCalendarFormatService', 'translate', 'KEYS', function ($scope, $timeout, accCalendarModelService, defaultConfiguration, accCalendarFormatService, translate, KEYS) {
        var currentYear, currentMonth, currentDate, selectedYear, selectedMonth, selectedDate, listenInputField,
            minDay, minMonth, minYear, maxMonth, maxDay, maxYear;

        angular.extend($scope, {
            configuration: setInitialConfiguration($scope.configuration, defaultConfiguration),
            currentDate: new Date(),
            selectedDate: $scope.configuration.initialDate,
            year: $scope.configuration.initialDate.getFullYear(),
            month: $scope.configuration.initialDate.getMonth(),
            day: $scope.configuration.initialDate.getDate(),
            showCalendar: $scope.configuration.visible,
            calendarModel: accCalendarModelService.getCalendarModel($scope.year, $scope.month, $scope.day),
            translate: translate,
            disabled: setDisabledDate(),
            availableYears: $scope.configuration.availableYears,
            availableMonths: getAvailableMonths($scope.year)
        });

        currentYear = $scope.currentDate.getFullYear();
        currentMonth = $scope.currentDate.getMonth();
        currentDate = $scope.currentDate.getDate();

        minYear = $scope.configuration.minDate.getFullYear();
        minMonth = $scope.configuration.minDate.getMonth();
        minDay = $scope.configuration.minDate.getDate();
        maxYear = $scope.configuration.maxDate.getFullYear();
        maxMonth = $scope.configuration.maxDate.getMonth();
        maxDay = $scope.configuration.maxDate.getDate();

        selectedYear = $scope.selectedDate.getFullYear();
        selectedMonth = $scope.selectedDate.getMonth();
        selectedDate = $scope.selectedDate.getDate();

        function setInitialConfiguration(customConfiguration, defaultConfiguration) {
            customConfiguration = customConfiguration ? customConfiguration : {};

            angular.extend(customConfiguration, {
                visible: customConfiguration.visible || defaultConfiguration.visible,
                initialDate: customConfiguration.initialDate || defaultConfiguration.initialDate,
                yearRange: customConfiguration.yearRange || defaultConfiguration.yearRange,
                minDate: customConfiguration.minDate || defaultConfiguration.minDate,
                maxDate: customConfiguration.maxDate || defaultConfiguration.maxDate,
                availableYears: getAvailableYears(customConfiguration.yearRange, customConfiguration.initialDate.getFullYear(), customConfiguration.minDate, customConfiguration.maxDate)
            });

            if (!customConfiguration.minDate) {
                customConfiguration.minDate = new Date(customConfiguration.availableYears[0], customConfiguration.initialDate.getMonth(), customConfiguration.initialDate.getDate());
            }

            if (!customConfiguration.maxDate) {
                customConfiguration.maxDate = new Date(customConfiguration.availableYears[customConfiguration.availableYears.length - 1], customConfiguration.initialDate.getMonth(), customConfiguration.initialDate.getDate());
            }

            angular.extend(customConfiguration, {
                disableCurrentDate: customConfiguration.disableCurrentDate || defaultConfiguration.disableCurrentDate,
                disableWeekends: customConfiguration.disableWeekends || defaultConfiguration.disableWeekends,
                disabledDates: customConfiguration.disabledDates || defaultConfiguration.disabledDates,
                setDefaultDate: customConfiguration.setDefaultDate || defaultConfiguration.setDefaultDate,
                format: customConfiguration.format || defaultConfiguration.format,
                lang: customConfiguration.lang || defaultConfiguration.lang
            });

            customConfiguration.initialDate = customConfiguration.initialDate >= customConfiguration.minDate ? customConfiguration.initialDate : customConfiguration.minDate;
            customConfiguration.initialDate = customConfiguration.initialDate <= customConfiguration.maxDate ? customConfiguration.initialDate : customConfiguration.maxDate;

            return customConfiguration;
        }

        function getAvailableYears(range, yearReference, minDate, maxDate) {
            var start, end, yearRange = [];

            start = yearReference - range;
            end = yearReference + range;

            if (minDate && (minDate.getFullYear()) > start) {
                start = minDate.getFullYear();
            }

            if (maxDate && (maxDate.getFullYear()) < end) {
                end = maxDate.getFullYear();
            }

            if (start === end) {
                yearRange.push(start);
            } else {
                for (var i = start; i <= end; i++) {
                    yearRange.push(i);
                }
            }

            return yearRange;
        }

        function getAvailableMonths(year) {
            var start, end, monthRange = [];

            start = (!$scope.configuration.minDate || !($scope.configuration.minDate && ($scope.configuration.minDate.getFullYear()) == year)) ? 0 : $scope.configuration.minDate.getMonth();
            end = (!$scope.configuration.maxDate || !($scope.configuration.maxDate && ($scope.configuration.maxDate.getFullYear()) == year)) ? 11 : $scope.configuration.maxDate.getMonth();

            for (var i = start; i <= end; i++) {
                monthRange.push(i);
            }

            if ($scope.month < start) {
                $scope.month = start;
            } else if ($scope.month > end) {
                $scope.month = end;
            }

            return monthRange;
        }

        function setDisabledDate() {
            var tobeDisabled = {exceptionDates: {}, regularDates: {}}, y, m, d;

            angular.forEach($scope.configuration.disabledDates.exceptionDates, function (exceptionDate) {
                y = exceptionDate.getFullYear();
                m = exceptionDate.getMonth();
                d = exceptionDate.getDate();

                tobeDisabled.exceptionDates[y] = tobeDisabled.exceptionDates[y] ? tobeDisabled.exceptionDates[y] : {};
                tobeDisabled.exceptionDates[y][m] = tobeDisabled.exceptionDates[y][m] ? tobeDisabled.exceptionDates[y][m] : [];
                tobeDisabled.exceptionDates[y][m].push(d);
            });

            angular.forEach($scope.configuration.disabledDates.regularDates, function (regularDate) {
                m = regularDate.month;
                d = regularDate.day;

                tobeDisabled.regularDates[m] = tobeDisabled.regularDates[m] ? tobeDisabled.regularDates[m] : [];
                tobeDisabled.regularDates[m].push(d);
            });

            return tobeDisabled;
        }


        $scope.$watch('[month, year]', function () {
            $scope.calendarModel = accCalendarModelService.getCalendarModel($scope.year, $scope.month, $scope.day);
            $scope.availableMonths = getAvailableMonths($scope.year);
            $scope.firstWeek = accCalendarModelService.getFirstWeek($scope.year, $scope.month);
        });

        listenInputField = $scope.$watch('inputField', function (newDate, oldDate) {
            if ($scope.configuration.setDefaultDate) {
                $scope.setDate($scope.day);
            }
            listenInputField();
        });

        $scope.setDate = function (day, setFocus) {
            $scope.day = day;

            $scope.selectedDate = new Date($scope.calendarModel.year, $scope.calendarModel.month, day);
            $scope.inputField.val(accCalendarFormatService.applyFormat(day, $scope.calendarModel, $scope.configuration.format)).triggerHandler('input');

            $scope.showCalendar = $scope.configuration.visible;

            selectedYear = $scope.selectedDate.getFullYear();
            selectedMonth = $scope.selectedDate.getMonth();
            selectedDate = $scope.selectedDate.getDate();

            $scope.ariaActivedescendant = 'm-' + $scope.calendarModel.month + '_d-' + day;

            if (setFocus) {
                angular.element($scope.inputField)[0].focus();
                if ($scope.configuration.onSelect) {
                    $scope.configuration.onSelect.call($scope.configuration.onSelect, $scope.selectedDate);
                }
            }
        };

        $scope.isMinMonth = function (month) {
            return ($scope.configuration.minDate && minMonth <= month && minYear >= $scope.year);
        };

        $scope.isMaxMonth = function (month) {
            return ($scope.configuration.maxDate && maxMonth > month && maxYear <= $scope.year);
        };

        $scope.rowClass = function (rowIndex, last) {
            if (last) {
                $scope.buttons = $scope.wrapper.find('button');
            }
            return 'acc-row-' + rowIndex + (last ? ' acc-row-last' : '');
        };

        $scope.cellClass = function (day, colIndex) {
            var classValue = 'acc-col-' + colIndex,
                month = parseInt($scope.month),
                year = parseInt($scope.year);

            if ($scope.isSelectedDate(day)) {
                classValue += ' acc-date-active';
            }

            if ($scope.disabledDay(day) || $scope.disabledDay(day, colIndex)) {
                classValue += ' acc-date-disabled';
            }

            if (currentDate === day && currentMonth === month && (currentYear) === year) {
                classValue += ' acc-date-current';
            }

            if ($scope.disabled.exceptionDates[year] && $scope.disabled.exceptionDates[year][month] && $scope.disabled.exceptionDates[year][month].indexOf(day) > -1) {
                classValue += ' acc-date-disabled-exception';
            }

            if ($scope.disabled.regularDates[month] && $scope.disabled.regularDates[month].indexOf(day) > -1) {
                classValue += ' acc-date-disabled-regular';
            }

            return classValue;
        };

        $scope.isSelectedDate = function (day) {
            return (selectedYear === $scope.calendarModel.year && selectedMonth === $scope.calendarModel.month && selectedDate === day);
        };

        $scope.disabledDay = function (day, colIndex) {
            var month = parseInt($scope.month),
                year = parseInt($scope.year);

            return !!((colIndex && $scope.configuration.disableWeekends && (colIndex === 5 || colIndex === 6)) ||
            ($scope.configuration.minDate && minMonth === month && minDay > day && minYear === year) ||
            ($scope.configuration.maxDate && maxMonth === month && maxDay < day && maxYear === year) ||
            ($scope.configuration.disableCurrentDate && currentDate === day && currentMonth === month && (currentYear) === year) ||
            ($scope.disabled.exceptionDates[year] && $scope.disabled.exceptionDates[year][month] && $scope.disabled.exceptionDates[year][month].indexOf(day) > -1) ||
            ($scope.disabled.regularDates[month] && $scope.disabled.regularDates[month].indexOf(day) > -1));
        };

        $scope.nextButton = function (event) {
            var nextButton, currentCell, currentRow, currentTableBody, rowsLength, currentColIndex, currentRowIndex,
                keyMap = {
                    13: function () {
                    },
                    37: function () {
                        while (!nextButton || (nextButton && !nextButton.length && currentRowIndex >= 0)) {
                            currentColIndex--;
                            if (currentColIndex === -1) {
                                currentColIndex = 7;
                                currentRowIndex--;
                            }
                            nextButton = findNext(currentRowIndex, currentColIndex);
                        }
                        if (!triggerEvent(nextButton)) {
                            if (prevMonth()) {
                                $timeout(function () {
                                    $scope.buttons[$scope.buttons.length - 1].focus();
                                });
                                event.preventDefault();
                            }
                        }
                    },
                    38: function () {
                        while (!nextButton || (nextButton && !nextButton.length && currentRowIndex > 0)) {
                            currentRowIndex--;
                            nextButton = findNext(currentRowIndex, currentColIndex);
                        }
                        if (!triggerEvent(nextButton)) {
                            if (prevMonth()) {
                                $timeout(function () {
                                    currentRowIndex = currentTableBody.find('tr').length;

                                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex > 0)) {
                                        currentRowIndex--;
                                        nextButton = findNext(currentRowIndex, currentColIndex);
                                    }
                                    return triggerEvent(nextButton);
                                });
                                event.preventDefault();
                            }
                        }
                    },
                    39: function () {
                        while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength)) {
                            currentColIndex++;
                            if (currentColIndex === 7) {
                                currentColIndex = -1;
                                currentRowIndex++;
                            }
                            nextButton = findNext(currentRowIndex, currentColIndex);
                        }
                        if (!triggerEvent(nextButton)) {
                            if (nextMonth()) {
                                $timeout(function () {
                                    $scope.buttons[0].focus();
                                });
                                event.preventDefault();
                            }
                        }
                    },
                    40: function () {
                        while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength - 1)) {
                            currentRowIndex++;
                            nextButton = findNext(currentRowIndex, currentColIndex);
                        }
                        if (!triggerEvent(nextButton)) {
                            if (nextMonth()) {
                                $timeout(function () {
                                    currentRowIndex = -1;

                                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength - 1)) {
                                        currentRowIndex++;
                                        nextButton = findNext(currentRowIndex, currentColIndex);
                                    }
                                    return triggerEvent(nextButton);
                                });
                                event.preventDefault();
                            }
                        }
                    }
                };

            if (event.keyCode !== KEYS.ENTER && event.keyCode !== KEYS.LEFT_ARROW && event.keyCode !== KEYS.UP_ARROW && event.keyCode !== KEYS.RIGHT_ARROW && event.keyCode !== KEYS.DOWN_ARROW) {
                return;
            }

            currentCell = angular.element(event.target).parent();
            currentRow = currentCell.parent();
            currentTableBody = angular.element(currentRow.parent()[0]);
            rowsLength = currentTableBody.find('tr').length;
            currentColIndex = parseInt(currentCell.attr('data-index'));
            currentRowIndex = parseInt(currentRow.attr('data-index'));

            keyMap[event.keyCode]();

            function findNext(rowIndex, colIndex) {
                return angular.element(angular.element(currentTableBody.find('tr')[rowIndex]).find('td')[colIndex]).find('button');
            }

            function prevMonth() {
                if ($scope.month > 0) {
                    if (!minYear || $scope.month > minMonth || $scope.year > minYear) {
                        $scope.month--;
                        return true;
                    }
                } else {
                    if (!minYear || $scope.year > minYear) {
                        $scope.month = 11;
                        $scope.year--;
                        return true;
                    }
                }
                return false;
            }

            function nextMonth() {
                if ($scope.month < 11) {
                    if (!maxYear || $scope.year < maxYear) {
                        $scope.month++;
                        return true;
                    } else {
                        if ($scope.month < maxMonth) {
                            $scope.month++;
                            return true;
                        }
                    }
                } else {
                    if (!maxYear || $scope.year < maxYear) {
                        $scope.month = 0;
                        $scope.year++;
                        return true;
                    }
                }
                return false;
            }

            function triggerEvent(nextButton) {
                if (nextButton.length) {
                    nextButton = nextButton[0];
                    if (nextButton && nextButton.focus) {
                        nextButton.focus();
                        event.preventDefault();
                    }
                    return true;
                }
                return false;
            }
        };

    }])
    .directive('accCalendar', ['$compile', '$timeout', '$window', function ($compile, $timeout, $window) {
        return {
            restrict: 'A',
            require: '?ngModel',
            controller: 'accCalendarController',
            scope: {
                configuration: '=accCalendar'
            },
            link: function (scope, element, iAttrs, ngModelCtrl) {
                var template = '<div data-ng-show="showCalendar" aria-hidden="{{!showCalendar}}" class="acc-calendar" data-ng-style="{\'top\': (elementPosition.top + elementPosition.height) + \'px\', \'left\': elementPosition.left + \'px\', \'width\': elementPosition.width + \'px\'}">' +
                        '<div class="acc-calendar-table-wrapper">' +
                        '<span><label for="acc_month" data-ng-show="availableMonths.length > 1"><span class="acc-calendar-hidden">{{translate.month[configuration.lang]}}</span>' +
                        '<select data-ng-model="month" id="acc_month">' +
                        '<option data-ng-repeat="month in availableMonths" value="{{month}}" data-ng-selected="month === calendarModel.month">{{translate.monthNaming[configuration.lang][month]}}</option>' +
                        '</select></label>' +
                        '<label for="acc_year" data-ng-show="availableYears.length > 1"><span class="acc-calendar-hidden">{{translate.year[configuration.lang]}}</span>' +
                        '<select data-ng-model="year" id="acc_year">' +
                        '<option data-ng-repeat="year in availableYears" value="{{year}}" data-ng-selected="year === calendarModel.year">{{year}}</option>' +
                        '</select></label></span>' +
                        '<table data-ng-class="{\'add-calendar-table-week-number\': configuration.showWeekNumber}" aria-activedescendant="{{ariaActivedescendant}}">' +
                        '<caption aria-live="polite" aria-atomic="true">{{translate.monthNaming[configuration.lang][calendarModel.month]}} - {{calendarModel.year}}</caption>' +
                        '<thead><tr>' +
                        '<th data-ng-if="configuration.showWeekNumber" class="add-calendar-week-number"><abbr title="{{translate.week[configuration.lang]}}"><span>{{translate.week[configuration.lang]}}</span></th>' +
                        '<th scope="col" data-ng-repeat="header in translate.headerRow[configuration.lang]" id="d_{{::$index}}"><span>{{header}}</span></th></tr></thead>' +
                        '<tbody><tr data-ng-repeat="semanas in calendarModel.dataRows track by $index" data-index="{{::$index}}" data-last="{{::$last}}" data-ng-class="rowClass($index, $last)" >' +
                        '<th scope="row" data-ng-if="configuration.showWeekNumber" class="add-calendar-week-number"><span class="acc-calendar-hidden">{{translate.week[configuration.lang]}}</span> {{firstWeek + $index}}</th>' +
                        '<td data-ng-repeat="day in semanas track by $index" data-ng-class="cellClass(day, $index)" data-index="{{::$index}}" headers="d_{{::$index}}">' +
                        '<button tabindex="0"' +
                        ' aria-selected="{{isSelectedDate(day)}}"' +
                        ' id="m-{{month}}_d-{{day}}"' +
                        ' data-ng-click="setDate(day, true)" data-ng-keypress="setDate(day, true)"' +
                        ' data-ng-if="day && !disabledDay(day, $index)" class="acc-button-date"' +
                        ' data-ng-keydown="nextButton($event)"><span data-ng-if="isSelectedDate(day)" class="acc-calendar-hidden">{{translate.selectedDate[configuration.lang]}} </span><span class="acc-calendar-hidden">{{translate.day[configuration.lang]}} </span>{{day}}</button>' +
                        '<span data-ng-if="day && disabledDay(day, $index)" title="{{translate.day[configuration.lang]}} {{translate.notAvailable[configuration.lang]}}">{{day}}</span>' +
                        '</td>' +
                        '</tr>' +
                        '</table>' +
                        '</div>' +
                        '</div>',
                    button = '<button data-ng-click="showCalendar = !showCalendar" class="acc-calendar-button"' +
                        ' aria-label="{{translate.selectedDate[configuration.lang]}} {{translate.day[configuration.lang]}} {{day}}"></button>',
                    wrapper = $compile(template)(scope);

                scope.wrapper = wrapper;
                element.after(wrapper);

                if (!scope.configuration.visible) {
                    element.after($compile(button)(scope));
                }

                $timeout(function () {
                    scope.elementPosition = elementStyle(element[0]);
                });

                angular.element($window).bind("resize", function (e) {
                    scope.elementPosition = elementStyle(element[0]);
                    scope.$apply();
                });

                scope.inputField = element;

                scope.$watch('showCalendar', function (newValue, oldValue) {
                    if (newValue && !scope.configuration.visible) {
                        $timeout(function () {
                            wrapper.find('select')[0].focus();
                        });
                        if (scope.configuration.onOpen && newValue !== oldValue) {
                            scope.configuration.onOpen();
                        }
                    } else if (!newValue) {
                        if (scope.configuration.onClose && newValue !== oldValue) {
                            scope.configuration.onClose();
                        }
                    }
                });

                element.on('keydown', function (event) {
                    if (event.keyCode !== 27) {
                        scope.showCalendar = scope.configuration.visible;
                        scope.$apply();
                    }
                });

                wrapper.on('keydown', function (event) {
                    if (event.keyCode === 27) {
                        if (!scope.configuration.visible) {
                            scope.showCalendar = false;
                            angular.element(element)[0].focus();
                        }
                        scope.$apply();
                    }
                });

                if (ngModelCtrl) {

                    // set the input field value when the model changes
                    ngModelCtrl.$formatters.push(function (value) {
                            return value;
                        }
                    );

                    // to set the model as date object
                    ngModelCtrl.$parsers.push(function (value) {
                        return value;
                    });

                }

                function elementStyle(elem) {
                    return {
                        top: elem.offsetTop || 0,
                        left: elem.offsetLeft || 0,
                        width: elem.offsetWidth,
                        height: elem.offsetHeight
                    }
                }

            }
        }
    }]);
