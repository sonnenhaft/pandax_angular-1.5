import angular from 'angular';
import uiRouter from 'angular-ui-router';
import profileCreateComponent from './profile.create.component';
import Storage from '../../../services/storage/storage';
import ngFileUpload from 'ng-file-upload';

let profileCreateModule = angular.module('profileCreate', [
  uiRouter,
  Storage,
  ngFileUpload
])

  .config(($stateProvider) => {
    "ngInject";

    $stateProvider
      .state('profile.create', {
        url: '/create',
        parent: 'profile',
        component: 'profileCreate'
      });
  })

  .component('profileCreate', profileCreateComponent)

  .name;

export default profileCreateModule;
