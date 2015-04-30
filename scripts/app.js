'use strict';

var myApp = angular
    .module('exampleNgAccCalendar', [
        'ngAccCalendar'
    ])
    .controller('exampleController', function ($scope, accCalendarModelService) {
        $scope.configuration1 = {
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
            format: 'd m yyyy',
            //showWeekNumber: true,
            //visible: true,
            onSelect: onSelect,
            onOpen: function(){console.log('open')},
            onClose: function(){console.log('close')}
        };

        $scope.configuration2 = {
            initialDate: new Date(2015, 3, 18),
            yearRange: 5,
            disableCurrentDate: false,
            disableWeekends: true,
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
            format: 'd m yyyy',
            showWeekNumber: true,
            visible: true,
            lang: 'en',
            onSelect: onSelect,
            onOpen: function(){console.log('open')},
            onClose: function(){console.log('close')}
        };
    });

function onSelect(date){console.log('selectedDate:', date)}

