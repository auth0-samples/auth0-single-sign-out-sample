angular.module('signout', [
  'ngRoute'
])
.config(function myAppConfig($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'LogoutCtrl',
      templateUrl: 'logout.html',
    })
    .when('/complete', {
      controller: 'LogoutCompleteCtrl',
      templateUrl: 'complete.html',
    });
})
.controller('LogoutCtrl', function($scope) {
  $scope.logout = function() {
    window.location = 'https://' + AUTH0_DOMAIN + '/v2/logout?returnTo=' + encodeURIComponent('http://localhost:8080/#complete');
  };

  var auth0 = new Auth0({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID
  });

  var clients = {
    'ATqGIGvsX5d9AWiOypgPOEBGkOVbrf55': {
      name: 'JWT Debugger',
      logout_url: 'http://fabrikam-jwt.azurewebsites.net/'
    },
    'bOFty3tWgpijnwMcltysNFqHgO1ziz1I': {
      name: 'SharePoint Intranet',
      logout_url: 'http://p.fabrikamcorp.com/_layouts/15/SignOut.aspx'
    },
    'h2NE1kxhzzFgLpNBvcCuyefjfwFVGx49': {
      name: 'Timesheet SaaS',
      logout_url: 'http://fabrikam-timesheets.azurewebsites.net/account/logoff'
    },
    'ZXa6tH7KCkpFgRxl6SMQzhpyMuL1LZmN': {
      name: 'Sales Portal',
      logout_url: 'http://fabrikam-jwt.azurewebsites.net/'
    }
  };

  // Get SSO information from auth0.
  $scope.complete = false;
  auth0.getSSOData(function(err, ssoData) {
    $scope.$apply(function() {
      if (ssoData && ssoData.sso && ssoData.sessionClients && ssoData.sessionClients.length > 0) {
        $scope.username = ssoData.lastUsedUsername;
        $scope.clients = [];

        // Only show the clients for which we actually logged in.
        angular.forEach(ssoData.sessionClients, function(clientId) {
          var client = clients[clientId];
          if (client) {
            client.complete = false;
            $scope.clients.push(client);
          }
        });
      } else {
        $scope.complete = true;
      }

      $scope.loaded = true;
    });
  });

  $scope.$watch(function() {
    // Wait for all iframes to load.
    if ($scope.loaded && !$scope.complete) {
      var complete = true;
      angular.forEach($scope.clients, function(client) {
        if (!client.complete) {
          complete = false;
        }
      });
      $scope.complete = complete;
    }

    // If we didn't receive any clients, just logout immediately.
    else if ($scope.loaded && $scope.complete && ($scope.clients == null || $scope.clients.length == 0)) {
      $scope.logout();
    }
  });
})
.controller('LogoutCompleteCtrl', function($scope) {

})
.directive('clientLogout', function($timeout) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      client: "=client"
    },
    template: '<iframe height="0" width="0" frameborder="0"></iframe>',
    link: function(scope, elem, attrs, ngModel) {
      scope.client.status = 'loading';

      // Load the iframe.
      var frame = angular.element(elem[0]);
      frame.bind('load', function() {
        scope.$apply(function() {
          if (!scope.client.complete) {
            scope.client.complete = true;
            scope.client.status = 'loaded';
          }
        });
      });
      frame.attr('src', scope.client.logout_url);

      // Mark error if it takes longer than 5 seconds.
      $timeout(function() {
        if (!scope.client.complete) {
          scope.client.complete = true;
          scope.client.status = 'error';
        }
      }, 5000);
    }
  }
});