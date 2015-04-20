angular.module('ngAccCalendar', [])
    .factory('calendarModelService', function () {
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

            monthModel.headerRow = {
                en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                es: ['Lunes', 'martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
            };

            monthModel.monthNaming = {
                'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                'es': ['Enero', 'Febero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
            };

            monthModel.dataRows = calendarModel(date);

            return monthModel;
        }

        function calendarModel(date) {
            var month = date.getMonth(),
                year = date.getFullYear(),
                monthArray = [],
                daysArray = [],
                availables = [],
                nDays, starting, total, lastDayPrevMonth, cont;

            for (cont = 0; cont <= 31; cont++) {
                availables.push(cont + 'd');
            }

            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
                daysMonth[1] = 29;
            } else {
                daysMonth[1] = 28;
            }

            nDays = daysMonth[month];

            //lastDayPrevMonth = month ? daysMonth[month - 1] : daysMonth[daysMonth.length - 1];

            date.setDate(1);
            starting = date.getDay();

            if (starting == 0) {
                starting = 7;
            }

            total = starting + nDays;

            //if(starting) {
            //    for(cont = starting - 1; cont >= 0; cont--) {
            //        daysArray.push(lastDayPrevMonth - cont);
            //    }
            //}

            for (cont = 0; cont < starting - 1; cont++) {
                daysArray.push('');
            }

            for (cont = starting - 1; cont < total - 1; cont++) {
                daysArray.push(cont - starting + 2);
            }

            //cont = 1;
            while (daysArray.length % 7 > 0) {
                //daysArray.push(cont++);
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

    .controller('calendarController', ['$scope', 'calendarModelService', function ($scope, calendarModelService) {
        var currentYear, currentMonth, currentDate, selectedYear, selectedMonth, selectedDate, listenInputField,
            minDay = false, minMonth = false, minYear = false,
            maxMonth = false, maxDay = false, maxYear = false;

        $scope.configuration = setInitialConfiguration($scope.configuration);

        $scope.currentDate = new Date();
        currentYear = $scope.currentDate.getFullYear();
        currentMonth = $scope.currentDate.getMonth();
        currentDate = $scope.currentDate.getDate();

        minYear = $scope.configuration.minDate.getFullYear();
        minMonth = $scope.configuration.minDate.getMonth();
        minDay = $scope.configuration.minDate.getDate();
        maxYear = $scope.configuration.maxDate.getFullYear();
        maxMonth = $scope.configuration.maxDate.getMonth();
        maxDay = $scope.configuration.maxDate.getDate();

        $scope.selectedDate = $scope.configuration.initialDate;
        selectedYear = $scope.selectedDate.getFullYear();
        selectedMonth = $scope.selectedDate.getMonth();
        selectedDate = $scope.selectedDate.getDate();

        $scope.year = $scope.configuration.initialDate.getFullYear();
        $scope.month = $scope.configuration.initialDate.getMonth();
        $scope.day = $scope.configuration.initialDate.getDate();

        $scope.showCalendar = $scope.configuration.visible;

        $scope.calendarModel = calendarModelService.getCalendarModel($scope.year, $scope.month, $scope.day);

        $scope.disabled = setDisabledDate();

        $scope.availableYears = $scope.configuration.availableYears;
        $scope.availableMonths = getAvailableMonths($scope.year);

        function setInitialConfiguration(customConfiguration) {
            var defaultConfiguration = {
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
                maxDate: false
            };

            customConfiguration = customConfiguration ? customConfiguration : {};
            customConfiguration.visible = customConfiguration.visible || defaultConfiguration.visible;
            customConfiguration.initialDate = customConfiguration.initialDate || defaultConfiguration.initialDate;
            customConfiguration.yearRange = customConfiguration.yearRange || defaultConfiguration.yearRange;

            customConfiguration.minDate = customConfiguration.minDate || defaultConfiguration.minDate;

            customConfiguration.maxDate = customConfiguration.maxDate || defaultConfiguration.maxDate;

            customConfiguration.availableYears = getAvailableYears(customConfiguration.yearRange, customConfiguration.initialDate.getFullYear(), customConfiguration.minDate, customConfiguration.maxDate);

            if (!customConfiguration.minDate) {
                customConfiguration.minDate = new Date(customConfiguration.availableYears[0], customConfiguration.initialDate.getMonth(), customConfiguration.initialDate.getDate());
            }

            if (!customConfiguration.maxDate) {
                customConfiguration.maxDate = new Date(customConfiguration.availableYears[customConfiguration.availableYears.length - 1], customConfiguration.initialDate.getMonth(), customConfiguration.initialDate.getDate());
            }

            customConfiguration.disableCurrentDate = customConfiguration.disableCurrentDate || defaultConfiguration.disableCurrentDate;
            customConfiguration.disableWeekends = customConfiguration.disableWeekends || defaultConfiguration.disableWeekends;
            customConfiguration.disabledDates = customConfiguration.disabledDates || defaultConfiguration.disabledDates;
            customConfiguration.setDefaultDate = customConfiguration.setDefaultDate || defaultConfiguration.setDefaultDate;
            customConfiguration.format = customConfiguration.format || defaultConfiguration.format;

            customConfiguration.initialDate = customConfiguration.initialDate >= customConfiguration.minDate ? customConfiguration.initialDate : customConfiguration.minDate;
            customConfiguration.initialDate = customConfiguration.initialDate <= customConfiguration.maxDate ? customConfiguration.initialDate : customConfiguration.maxDate;

            return customConfiguration;
        }

        function getAvailableYears(range, yearReference, minDate, maxDate) {
            var yearRange = [], start, end;

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
            var monthRange = [], start, end;

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
            $scope.calendarModel = calendarModelService.getCalendarModel($scope.year, $scope.month, $scope.day);
            $scope.availableMonths = getAvailableMonths($scope.year);
            $scope.firstWeek = calendarModelService.getFirstWeek($scope.year, $scope.month);
        });

        listenInputField = $scope.$watch('inputField', function () {
            if ($scope.configuration.setDefaultDate) {
                $scope.setDate($scope.day);
            }
            listenInputField();
        });

        $scope.setDate = function (day, setFocus) {
            $scope.day = day;

            $scope.selectedDate = new Date($scope.calendarModel.year, $scope.calendarModel.month, day);
            $scope.inputField.val(applyFormat(day, $scope.calendarModel)).triggerHandler('input');
            if (setFocus && !$scope.configuration.visible) {
                angular.element($scope.inputField)[0].focus();
            }
            $scope.showCalendar = $scope.configuration.visible;

            selectedYear = $scope.selectedDate.getFullYear();
            selectedMonth = $scope.selectedDate.getMonth();
            selectedDate = $scope.selectedDate.getDate();

            $scope.ariaActivedescendant = 'm-' + $scope.calendarModel.month + '_d-' + day;

            function applyFormat(day, calendarModel) {
                var fecha_format, inic,
                    month = calendarModel.month + 1,
                    year = calendarModel.year,
                    formato = $scope.configuration.format,
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

        };

        $scope.isMinMonth = function (month) {
            return ($scope.configuration.minDate && minMonth <= month && minYear >= $scope.year);
        };

        $scope.isMaxMonth = function (month) {
            return ($scope.configuration.maxDate && maxMonth > month && maxYear <= $scope.year);
        };

        $scope.rowClass = function (rowIndex, last) {
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
            var currentRow, rowsLength, currentCell, currentCalendar, currentColIndex, currentRowIndex, nextButton,
                c = +$scope.configuration.showWeekNumber ? 1 : 0,
                caption = false;

            if (event.keyCode !== 13 && event.keyCode !== 37 && event.keyCode !== 38 && event.keyCode !== 39 && event.keyCode !== 40) {
                return;
            }

            currentCell = angular.element(event.target).parent();
            if (!currentCell.find('tbody').length) {
                currentRow = currentCell.parent();
                currentCalendar = angular.element(currentRow.parent()[0]);
                rowsLength = currentCalendar.find('tr').length;
                currentColIndex = parseInt(currentCell.attr('data-index')) + c;
                currentRowIndex = parseInt(currentRow.attr('data-index'));
            } else {
                caption = true;
                currentCalendar = angular.element(currentCell.find('tbody')[0]);
                rowsLength = currentCalendar.find('tr').length;
                currentColIndex = -1;
                currentRowIndex = -1;
            }

            if (event.keyCode === 38 && !caption) {
                while (!nextButton || (nextButton && !nextButton.length && currentRowIndex > 0)) {
                    currentRowIndex--;
                    nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                }
                if (nextButton && !nextButton.length) {
                    $scope.caption.focus();
                }
            } else if (event.keyCode === 40 || (caption && event.keyCode === 13)) {
                if (!caption) {
                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength - 1)) {
                        currentRowIndex++;
                        nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                    }
                } else {
                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength)) {
                        currentColIndex++;
                        if (currentColIndex === 7) {
                            currentColIndex = -1;
                            currentRowIndex++;
                        }
                        nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                    }
                }
            } else if (event.keyCode === 37) {
                if (!caption) {
                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex >= 0)) {
                        currentColIndex--;
                        if (currentColIndex === -1) {
                            currentColIndex = 7;
                            currentRowIndex--;
                        }
                        nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                    }
                }
                if (caption || !nextButton || (nextButton && !nextButton.length)) {
                    if (!minYear || $scope.month > minMonth) {
                        if (!minYear || $scope.year > minYear) {
                            if ($scope.month > 0) {
                                $scope.month--;
                            } else {
                                $scope.month = 11;
                                $scope.year--;
                            }
                        } else {
                            if ($scope.month > 0) {
                                $scope.month--;
                            }
                        }
                    } else {
                        if (!minYear || $scope.year > minYear) {
                            if ($scope.month > 0) {
                                $scope.month--;
                            } else {
                                $scope.month = 11;
                                $scope.year--;
                            }
                        }
                    }
                    $scope.caption.focus();
                }
            } else if (event.keyCode === 39) {
                if (!caption) {
                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength)) {
                        currentColIndex++;
                        if ((currentColIndex === 7 && !c) || (c && currentColIndex === 8)) {
                            currentColIndex = -1;
                            currentRowIndex++;
                        }
                        nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                    }
                }
                if (caption || !nextButton || (nextButton && !nextButton.length)) {
                    if ($scope.month < 11) {
                        if (!maxYear || $scope.year < maxYear) {
                            $scope.month++;
                            $scope.caption.focus();
                        } else {
                            if ($scope.month < maxMonth) {
                                $scope.month++;
                                $scope.caption.focus();
                            }
                        }
                    } else {
                        if (!maxYear || $scope.year < maxYear) {
                            $scope.month = 0;
                            $scope.year++;
                            $scope.caption.focus();
                        }
                    }
                }
            }

            if (nextButton && nextButton.length) {
                nextButton[0].focus();
                event.preventDefault();
            }
        };

    }])
    .directive('accCalendar', ['$compile', '$timeout', '$window', function ($compile, $timeout, $window) {
        return {
            restrict: 'A',
            controller: 'calendarController',
            scope: {
                configuration: '=accCalendar'
            },
            link: function (scope, element) {
                var template = '<div  ng-show="showCalendar" aria-hidden="{{!showCalendar}}" class="acc-calendar" ng-style="{\'top\': (elementPosition.top + elementPosition.height) + \'px\', \'left\': elementPosition.left + \'px\', \'width\': elementPosition.width + \'px\'}">' +
                        '<div class="acc-calendar-table-wrapper">' +
                        '<span><select ng-model="month" ng-show="availableMonths.length > 1">' +
                        '<option ng-repeat="month in availableMonths" value="{{month}}" ng-selected="month === calendarModel.month">{{calendarModel.monthNaming["es"][month]}}</option>' +
                        '</select>' +
                        '<select ng-model="year" ng-show="availableYears.length > 1">' +
                        '<option ng-repeat="year in availableYears" value="{{year}}" ng-selected="year === calendarModel.year">{{year}}</option>' +
                        '</select></span>' +
                        '<table ng-class="{\'add-calendar-table-week-number\': configuration.showWeekNumber}" aria-activedescendant="{{ariaActivedescendant}}">' +
                        '<caption aria-live="polite" aria-atomic="true" tabindex="0" ng-keydown="nextButton($event)">{{calendarModel.monthNaming["es"][calendarModel.month]}} - {{calendarModel.year}}</caption>' +
                        '<thead><tr>' +
                        '<th ng-if="configuration.showWeekNumber" class="add-calendar-week-number">w</th>' +
                        '<th scope="col" ng-repeat="header in calendarModel.headerRow.es"><abbr title="{{header}}">{{header.substr(0, 2)}}</abbr></th></tr></thead>' +
                        '<tbody><tr ng-repeat="semanas in calendarModel.dataRows track by $index" data-index="{{::$index}}" data-last="{{::$last}}" ng-class="::rowClass($index, $last)" acc-last-row>' +
                        '<td ng-if="configuration.showWeekNumber" class="add-calendar-week-number">{{firstWeek + $index}}</td>' +
                        '<td ng-repeat="day in semanas track by $index" ng-class="cellClass(day, $index)" data-index="{{::$index}}">' +
                        '<a role="button" tabindex="0"' +
                        ' aria-selected="{{isSelectedDate(day)}}"' +
                        ' id="m-{{month}}_d-{{day}}"' +
                        ' ng-click="setDate(day, true)" ng-keypress="setDate(day, true)"' +
                        ' ng-if="day && !disabledDay(day, $index)" class="acc-button-date"' +
                        ' ng-keydown="nextButton($event)">{{day}}</a>' +
                        '<span ng-if="day && disabledDay(day, $index)" >{{day}}</span>' +
                        '</td>' +
                        '</tr></tbody>' +
                        '</table>' +
                        '</div>' +
                        '</div>',
                    button = '<button ng-click="showCalendar = !showCalendar" class="acc-calendar-button"><span ng-if="!showCalendar">show</span><span ng-if="showCalendar">hide</span></button>',
                    wrapper = $compile(template)(scope);

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
                scope.caption = wrapper.find('caption')[0];

                scope.$watch('showCalendar', function (newValue) {
                    if (newValue && !scope.configuration.visible) {
                        $timeout(function () {
                            wrapper.find('select')[0].focus();
                        });
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

                function elementStyle (elem) {
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
