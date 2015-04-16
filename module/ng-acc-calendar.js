angular.module('ngAccCalendar', [])
    .factory('calendarModelService', function () {

        return {
            getCalendarModel: getCalendarModel
        };

        function getCalendarModel(day, month, year) {
            var monthModel = {},
                date = new Date(year, month, day);

            monthModel.year = date.getYear() + 1900;
            monthModel.month = date.getMonth();
            monthModel.day = date.getDate();

            monthModel.headerRow = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            monthModel.dataRows = calendarModel(date);

            return monthModel;
        }

        function calendarModel(date) {
            var daysMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                year = date.getYear() + 1900,
                monthsArray = [],
                daysArray = [],
                availables = [],
                nDays, starting, total, resto, cont;

            for (cont = 0; cont <= 31; cont++) {
                availables.push(cont + 'd');
            }

            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
                daysMonth[1] = 29;
            } else {
                daysMonth[1] = 28;
            }

            nDays = daysMonth[date.getMonth()];

            date.setDate(1);
            starting = date.getDay();
            if (starting == 0) {
                starting = 7;
            }
            total = starting + nDays;

            for (cont = 0; cont < starting - cont; cont++) {
                daysArray.push('');
            }

            for (cont = starting - 1; cont < total - 1; cont++) {
                daysArray.push(cont - starting + 2);
            }

            resto = 7 - (cont % 7);
            if (resto < 7) {
                var white = daysArray.length + resto;
                for (cont = daysArray.length; cont < white; cont++) {
                    daysArray.push('');
                }
            }

            while (daysArray.length) {
                monthsArray.push(daysArray.splice(0, 7));
            }

            return monthsArray;
        }
    })

    .controller('calendarController', function ($scope, calendarModelService) {
            var currentYear, currentMonth, currentDate, selectedYear, selectedMonth, selectedDate, minDay, minMonth, minYear, maxMonth, maxDay, maxYear, listenInputField;

        $scope.defaultConfiguration = {
            initialDate: new Date(),
            yearRange: 20,
            disableCurrentDate: false,
            disableWeekends: false,
            disabledDates: {exceptionDates: [], regularDates: []},
            setDefaultDate: false,
            format: 'd/m/yyyy'
        };
        $scope.configuration = {
            initialDate: new Date(2015, 3, 18),
            yearRange: 5,
            //disableCurrentDate: false,
            //disableWeekends: true,
            disabledDates: {
                exceptionDates: [
                    new Date(2015, 3, 1),
                    new Date(2016, 4, 1),
                    new Date(2015, 3, 24),
                    new Date(2015, 3, 8),
                    new Date(2015, 3, 9),
                    new Date(2015, 3, 16),
                    new Date(2015, 3, 10),
                    new Date(2015, 4, 11),
                    new Date(2015, 4, 13),
                    new Date(2015, 4, 14)],
                regularDates: [
                    {month: 2, day: 18},
                    {month: 2, day: 26},
                    {month: 3, day: 1},
                    {month: 4, day: 14},
                    {month: 4, day: 15}
                ]
            },
            minDate: new Date(2015, 3, 10),
            maxDate: new Date(2016, 4, 10),
            setDefaultDate: true,
            format: 'd m yyyy'
        };

        $scope.currentDate = new Date();
        currentYear = $scope.currentDate.getYear();
        currentMonth = $scope.currentDate.getMonth();
        currentDate = $scope.currentDate.getDate();

        $scope.monthNaming = {'es': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December']};

        $scope.configuration = $scope.configuration ? $scope.configuration : {};
        $scope.configuration.initialDate = $scope.configuration.initialDate || $scope.defaultConfiguration.initialDate;
        $scope.configuration.yearRange = $scope.configuration.yearRange || $scope.defaultConfiguration.yearRange;
        $scope.configuration.disableCurrentDate = $scope.configuration.disableCurrentDate || $scope.defaultConfiguration.disableCurrentDate;
        $scope.configuration.disableWeekends = $scope.configuration.disableWeekends || $scope.defaultConfiguration.disableWeekends;
        $scope.configuration.disabledDates = $scope.configuration.disabledDates || $scope.defaultConfiguration.disabledDates;
        $scope.configuration.setDefaultDate = $scope.configuration.setDefaultDate || $scope.defaultConfiguration.setDefaultDate;
        $scope.configuration.format = $scope.configuration.format || $scope.defaultConfiguration.format;

        if ($scope.configuration.minDate) {
            $scope.configuration.initialDate = $scope.configuration.initialDate >= $scope.configuration.minDate ? $scope.configuration.initialDate : $scope.configuration.minDate;
            minYear = $scope.configuration.minDate.getYear() + 1900;
            minMonth = $scope.configuration.minDate.getMonth();
            minDay = $scope.configuration.minDate.getDate();
        }
        if ($scope.configuration.maxDate) {
            $scope.configuration.initialDate = $scope.configuration.initialDate <= $scope.configuration.maxDate ? $scope.configuration.initialDate : $scope.configuration.maxDate;
            maxYear = $scope.configuration.maxDate.getYear() + 1900;
            maxMonth = $scope.configuration.maxDate.getMonth();
            maxDay = $scope.configuration.maxDate.getDate();
        }

        $scope.selectedDate = $scope.configuration.initialDate;
        selectedYear = $scope.selectedDate.getYear();
        selectedMonth = $scope.selectedDate.getMonth();
        selectedDate = $scope.selectedDate.getDate();

        $scope.year = $scope.configuration.initialDate.getYear() + 1900;
        $scope.month = $scope.configuration.initialDate.getMonth();
        $scope.day = $scope.configuration.initialDate.getDate();

        $scope.showCalendar = false;

        $scope.calendarModel = calendarModelService.getCalendarModel($scope.day, $scope.month, $scope.year);

        $scope.disabled = setDisabledDate();

        $scope.availableYears = getAvailableYears($scope.configuration.yearRange, $scope.year);
        $scope.availableMonths = getAvailableMonths($scope.year);

        function getAvailableYears(range, yearReference) {
            var yearRange = [], start, end;

            start = yearReference - range;
            end = yearReference + range;

            if ($scope.configuration.minDate && ($scope.configuration.minDate.getYear() + 1900) > start) {
                start = $scope.configuration.minDate.getYear() + 1900;
            }

            if ($scope.configuration.maxDate && ($scope.configuration.maxDate.getYear() + 1900) < end) {
                end = $scope.configuration.maxDate.getYear() + 1900;
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

            start = (!$scope.configuration.minDate || !($scope.configuration.minDate && ($scope.configuration.minDate.getYear() + 1900) == year)) ? 0 : $scope.configuration.minDate.getMonth();
            end = (!$scope.configuration.maxDate || !($scope.configuration.maxDate && ($scope.configuration.maxDate.getYear() + 1900) == year)) ? 11 : $scope.configuration.maxDate.getMonth();

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
                y = exceptionDate.getYear() + 1900;
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
            $scope.calendarModel = calendarModelService.getCalendarModel($scope.day, $scope.month, $scope.year);
            $scope.availableMonths = getAvailableMonths($scope.year);
        });

        listenInputField = $scope.$watch('inputField', function () {
            if ($scope.configuration.setDefaultDate) {
                $scope.setDate($scope.day);
            }
            listenInputField();
        });

        $scope.setDate = function (day, setFocus) {
            $scope.selectedDate = new Date($scope.calendarModel.year, $scope.calendarModel.month, day);
            $scope.inputField.val(applyFormat(day, $scope.calendarModel)).triggerHandler('input');
            if (setFocus) {
                angular.element($scope.inputField)[0].focus();
            }
            $scope.showCalendar = false;

            selectedYear = $scope.selectedDate.getYear();
            selectedMonth = $scope.selectedDate.getMonth();
            selectedDate = $scope.selectedDate.getDate();

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

            if (currentDate === day && currentMonth === month && (currentYear + 1900) === year) {
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
            return (selectedYear + 1900 === $scope.calendarModel.year && selectedMonth === $scope.calendarModel.month && selectedDate === day);
        };

        $scope.disabledDay = function (day, index) {
            var month = parseInt($scope.month),
                year = parseInt($scope.year);

            return !!((index && $scope.configuration.disableWeekends && (index === 5 || index === 6)) ||
            ($scope.configuration.minDate && minMonth === month && minDay > day && minYear === year) ||
            ($scope.configuration.maxDate && maxMonth === month && maxDay < day && maxYear === year) ||
            ($scope.configuration.disableCurrentDate && currentDate === day && currentMonth === month && (currentYear + 1900) === year) ||
            ($scope.disabled.exceptionDates[year] && $scope.disabled.exceptionDates[year][month] && $scope.disabled.exceptionDates[year][month].indexOf(day) > -1) ||
            ($scope.disabled.regularDates[month] && $scope.disabled.regularDates[month].indexOf(day) > -1));

        };

        $scope.nextButton = function (event) {
            var currentRow, rowsLength, currentCell, currentCalendar, currentColIndex, currentRowIndex, nextButton, caption = false;

            if (event.keyCode !== 37 && event.keyCode !== 38 && event.keyCode !== 39 && event.keyCode !== 40) {
                return;
            }

            currentCell = angular.element(event.target).parent();
            if(!currentCell.find('tbody').length){
                currentRow = currentCell.parent();
                currentCalendar = angular.element(currentRow.parent()[0]);
                rowsLength = currentCalendar.find('tr').length;
                currentColIndex = parseInt(currentCell.attr('data-index'));
                currentRowIndex = parseInt(currentRow.attr('data-index'));
            }else{
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
            } else if (event.keyCode === 40) {
                if(!caption){
                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength - 1)) {
                        currentRowIndex++;
                        nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                    }
                }else{
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
                if(!caption){
                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex >= 0)) {
                        currentColIndex--;
                        if (currentColIndex === -1) {
                            currentColIndex = 7;
                            currentRowIndex--;
                        }
                        nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                    }
                }
                if(caption || !nextButton || (nextButton && !nextButton.length)){
                    if($scope.month > minMonth){
                        if($scope.year > minYear) {
                            if($scope.month > 0){
                                $scope.month--;
                            }else{
                                $scope.month = 11;
                                $scope.year--;
                            }
                        } else {
                            if($scope.month > 0){
                                $scope.month--;
                            }
                        }
                    } else {
                        if($scope.year > minYear) {
                            if($scope.month > 0){
                                $scope.month--;
                            }else{
                                $scope.month = 11;
                                $scope.year--;
                            }
                        }
                    }
                    $scope.caption.focus();
                }
            } else if (event.keyCode === 39) {
                if(!caption){
                    while (!nextButton || (nextButton && !nextButton.length && currentRowIndex < rowsLength)) {
                        currentColIndex++;
                        if (currentColIndex === 7) {
                            currentColIndex = -1;
                            currentRowIndex++;
                        }
                        nextButton = angular.element(angular.element(currentCalendar.find('tr')[currentRowIndex]).find('td')[currentColIndex]).find('a');
                    }
                }
                if(caption || !nextButton || (nextButton && !nextButton.length)){
                    if($scope.month < 11) {
                        if($scope.year < maxYear) {
                            $scope.month++;
                            $scope.caption.focus();
                        }else {
                            if($scope.month < maxMonth) {
                                $scope.month++;
                                $scope.caption.focus();
                            }
                        }
                    }else {
                        if($scope.year < maxYear) {
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
        }

    })
    .directive('accCalendar', function ($compile, $timeout) {
        return {
            restrict: 'A',
            controller: 'calendarController',
            scope: {
                configuration: '=accCalendar'
            },
            link: function (scope, element) {
                var template = '<span class="acc-calendar"><button ng-click="showCalendar = !showCalendar">show</button>' +
                        '<div class="acc-calendar-table-wrapper" ng-show="showCalendar">' +
                        '<span><select ng-model="month" ng-disabled="availableMonths.length === 1">' +
                        '<option ng-repeat="month in availableMonths" value="{{month}}" ng-selected="month === calendarModel.month">{{monthNaming["es"][month]}}</option>' +
                        '</select>' +
                        '<select ng-model="year" ng-disabled="availableYears.length === 1">' +
                        '<option ng-repeat="year in availableYears" value="{{year}}" ng-selected="year === calendarModel.year">{{year}}</option>' +
                        '</select></span>' +
                        '<table>' +
                        '<caption aria-live="polite" aria-atomic="true" tabindex="0" ng-keydown="nextButton($event)">{{monthNaming["es"][calendarModel.month]}} - {{calendarModel.year}}</caption>' +
                        '<thead><tr><th scope="col" ng-repeat="header in calendarModel.headerRow"><abbr title="{{header}}">{{header.substr(0, 2)}}</abbr></th></tr></thead>' +
                        '<tbody><tr ng-repeat="semanas in calendarModel.dataRows track by $index" data-index="{{::$index}}" data-last="{{::$last}}" ng-class="::rowClass($index, $last)">' +
                        '<td ng-repeat="day in semanas track by $index" ng-class="cellClass(day, $index)" data-index="{{::$index}}">' +
                        '<a role="button" tabindex="0"' +
                                ' ng-click="setDate(day, true)" ng-keypress="setDate(day, true)"' +
                                ' ng-if="day && !disabledDay(day, $index)" class="acc-button-date"' +
                                ' ng-keydown="nextButton($event)">{{day}}</a>' +
                        '<span ng-if="day && disabledDay(day, $index)" >{{day}}</span>' +
                        '</td>' +
                        '</tr></tbody>' +
                        '</table>' +
                        '</div>' +
                        '</span>',
                    wrapper = $compile(template)(scope);

                element.after(wrapper);
                wrapper.prepend(element);

                scope.inputField = element;
                scope.caption = wrapper.find('caption')[0];

                scope.$watch('showCalendar', function (newValue) {
                    if (newValue) {
                        $timeout(function () {
                            wrapper.find('select')[0].focus();
                            //wrapper.find('select[ng-model=month]').focus();
                        });
                    }
                });

                element.on('keydown', function (event) {
                    if (event.keyCode !== 27) {
                        return;
                    }
                });

                wrapper.on('keydown', function (event) {
                    if (event.keyCode === 27) {
                        scope.showCalendar = false;
                        scope.$apply();
                        angular.element(element)[0].focus();
                    }
                });

            }
        }
    });
