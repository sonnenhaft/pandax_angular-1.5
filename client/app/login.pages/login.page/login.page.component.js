import template from './login.page.html';
import StatefulAuthTokenService from './StatefulAuthTokenService';

export default angular.module('loginPage', [
  StatefulAuthTokenService
]).component('loginPage', {
  template,
  controller (LoginResource, $stateParams, $location, $state, StatefulAuthTokenService, StatefulUserData) {
    'ngInject';

    this.skipFinallyTheButton = true;
    this.login = ( ) => LoginResource.login({}, this.credentials).$promise.then(({ data: user, token }) => {
      StatefulAuthTokenService.remember(token);
      return user;
    }).then(user => {
      if (user.role === 'admin') {
        return user;
      } else {
        const role = user.role === 'client' ? 'customer' : user.role;
        return LoginResource.fetchProfile({ role }).$promise.then(newUser => Object.assign(user, newUser, { role }));
      }
    }).then(user => {
      StatefulUserData.extend(user);
      if ($stateParams.redirectUrl) {
        $location.search({}).replace( ).path($stateParams.redirectUrl);
      } else if (StatefulUserData.isCustomer( )) {
        $state.go('main.create-order');
      } else if (StatefulUserData.isAdmin( )) {
        $state.go('entertainersAdminPage');
      } else if (user.first_name && user.last_name) {
        $state.go('viewProfilePage');
      } else {
        $state.go('createProfilePage');
      }
    });
  }
}).name;
