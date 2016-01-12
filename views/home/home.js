'use strict';

console.log('touched home.js');
angular.module('Views')
  .controller('home', ['$http', 
    function($http) {

      var api = 'https://apps.tiff.net/proxy/ems/api/live/eventcollection/',
        filtervalue = 'Canada',
        filtername = 'programmes.arrangementType',
        eventcollection = '2015-Holiday',
        url = api + '/' + eventcollection;
      
        console.log(url);
      $http.get(url, {
        params: {
          filtervalue: filtervalue,
          filtername: filtername
        }
      }).success(function(data,status){
        console.log(data);
      })
    }
  ]);
