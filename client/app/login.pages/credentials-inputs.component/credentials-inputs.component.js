import TouchedInvalidDirective from '../../inputs/touched-invalid.directive';
import PandaEmailInput from '../../inputs/panda-email.input';

import template from './credentials-inputs.html';

class controller {
  constructor ($stateParams, $timeout) {
    'ngInject';

    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
  }

  $onInit ( ) {
    const { email, password } = this.$stateParams;
    this.credentials = Object.assign({ email, password }, this.credentials || {});
    if (this.$stateParams.auto) {
      this.$timeout(( ) => this.submit( ), 0, false);
    }
    if (this.passwordOnly && this.credentials.password) {
      this.repeatedPassword = this.credentials.password;
    }
  }

  submit ($event) {
    if (!this.form.$submitted) {
      this.form.$setSubmitted( );
    }
    if (!this.form.$valid) {
      return;
    }
    this.ajaxError = null;
    this.loading = true;
    this.onSubmit($event).catch(e => {
      this.ajaxError = e.statusText;
      this.loading = false;
    }).finally(( ) => {
      if (!this.skipFinallyButton) {
        this.loading = false;
      }
    });
  }
}

export default angular.module('credentialsInputs', [
  TouchedInvalidDirective,
  PandaEmailInput
]).component('credentialsInputs', {
  require: { form: '^form' },
  bindings: { credentials: '=', submitTitle: '@', onSubmit: '&', emailOnly: '<', passwordOnly: '<', forgotPasswordLink: '<', skipFinallyButton: '<' },
  controller,
  template
}).directive('repeatPasswordEqual', ( ) => ({
  require: ['^ngModel', '^form', TouchedInvalidDirective],
  link: ($scope, $element, $attr, [ngModel, form]) => {
    const equalityNgModel = form[$attr.repeatPasswordEqual];

    const validate = val => {
      ngModel.$setValidity('repeatPasswordEqual', ngModel.$viewValue === equalityNgModel.$viewValue);
      ngModel.setTouchedInvalid( );
      return val;
    };

    equalityNgModel.$viewChangeListeners.unshift(validate);
    ngModel.$parsers.push(validate);
    ngModel.$setValidity('repeatPasswordEqual', false);
  }
})).name;
