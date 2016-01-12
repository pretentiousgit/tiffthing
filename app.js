'use strict';

var app = angular.module('app', [
  'ui.router',
  'Views'
]);

app.config(function($stateProvider, $urlRouterProvider,
  $urlMatcherFactoryProvider, $locationProvider) {
  // remove the hash/pound sign from the url
  // $locationProvider.html5Mode({
  //     enabled: true,
  //     requireBase: false
  // });

  $stateProvider
    .state('default', {
      url: '/',
      templateUrl: './app/views/home/home.html',
      controller: 'home'
    })
    .state('home', {
      url: '/home',
      templateUrl: 'app/views/home/home.html',
      controller: 'home'
    });
});


app.controller('home', ['$http', '$scope', '$sce',
  function($http, $scope, $sce) {

    var api = 'https://apps.tiff.net/proxy/ems/api/live/eventcollection/',
      filtervalue = 'Canada',
      filtername = 'programmes.arrangementType',
      eventcollection = '2015-Holiday',
      url = api + '/' + eventcollection;

    $scope.title = filtername;
    $scope.country = filtervalue;
    $scope.eventcollection = eventcollection.replace(/-/g, ' ');

    $scope.events;

    $http.get(url, {
      params: {
        filtervalue: filtervalue,
        filtername: filtername
      }
    }).success(function(data, status) {
      // in here we want to report out the data
      // cleaned of null values

      // then we want to separate into two groups:
      // -- events (EventProgram)
      // -- films (No event type set)

      var events = _.map(data.EventCollection, function(obj) {
        obj = _.omit(obj, function objectFilter(value) {
          return !value;
        });

        $sce.trustAsHtml(obj.filmpitch);
        
        return obj;
      });

      events = _.map(events, function(n){
        // for each event, trust the film pitch, and return
        
        n.filmpitch = $sce.trustAsHtml(n.filmpitch);
        n.filmnote = $sce.trustAsHtml(n.filmnote);

        return n;
      })

      console.log(events[14].filmpitch);
      // todo: Implement async here to do all the list processing for speed
      $scope.all = events;

      $scope.events = _.filter(events, function(n) {
        return n.eventtype === "EventProgram";
      });

      $scope.films = _.filter(events, function(n) {
        if (n.runtime > 40) {
          return n.eventtype === "0";
        }
      });

      $scope.shorts = _.filter(events, function(n) {
        if (n.runtime < 40) {
          return n.eventtype === "0";
        }
      });

      $scope.student = _.filter($scope.shorts, function(n) {
        if (n.productionCompany) {
          var l = n.productionCompany.toLowerCase();
          if ((l.indexOf("university") !== -1) || (l.indexOf(
              "college") !== -1)) {
            return n;
          }
        }
      });

      $scope.cuts = _.filter($scope.shorts, function(n) {
        return n.PrimaryFestivalProgramme == "Short Cuts";
      });

      $scope.talks = _.filter(events, function(n) {
        var l = n.title.toLowerCase();
        return l.indexOf("in conversation") !== -1;
      });

      console.log($scope.cuts, $scope.student);
    });

  }
]);

angular.module('Views', []);
