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

    // truncator
    String.prototype.trunc = String.prototype.trunc ||
      function(n) {
        return (this.length > n) ? this.substr(0, n - 1) + '&hellip;' :
          this;
      };

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

      events = _.map(events, function(n) {
        // for each event, trust the film pitch, and return

        n.filmhex = $sce.trustAsHtml(n.filmpitch.trunc(100));
        n.filmpitch = $sce.trustAsHtml(n.filmpitch);
        n.filmnote = $sce.trustAsHtml(n.filmnote);

        return n;
      })


      // todo: Implement async here to do all the list processing for speed
      $scope.all = events;

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

      $scope.otherShorts = _.filter($scope.shorts, function(n) {
        if (n.productionCompany) {
          var l = n.productionCompany.toLowerCase();
          if ((l.indexOf("university") === -1) && (l.indexOf(
              "college") === -1)) {
            return n;
          }
        }
      });

      $scope.talks = _.filter(events, function(n) {
        var l = n.title.toLowerCase();
        return l.indexOf("in conversation") !== -1;
      });

      $scope.events = _.filter(events, function(n) {
        var l = n.title.toLowerCase();
        return (n.eventtype === "EventProgram" && l.indexOf(
          "in conversation") === -1);
      });

      $scope.selectThis = function(obj) {
        $scope.selected = obj;
      }
      $scope.deselectThis = function() {
        $scope.selected = '';
      }

      $scope.selectedGroup = $scope.films;

      $scope.selectGroup = function(obj) {
        $scope.selectedTitle = obj.title;

        if (obj.eventKey === "studentshorts") {
          $scope.selectedGroup = $scope.student;
          return;
        }
        if (obj.eventKey === "canadastoptenshortsp") {
          $scope.selectedGroup = $scope.cuts;
          return;
        }
        if (obj.eventKey === "canadastoptenshorts3") {
          console.log('shorts', $scope.otherShorts);
          var reply = _.filter($scope.shorts, function(n){
            return !n.PrimaryFestivalProgramme;
          })
          $scope.selectedGroup = reply; 
        }
         else {
          $scope.selectedGroup = $scope.films;
          return;
        }
      }
    });

  }
]);

angular.module('Views', []);
