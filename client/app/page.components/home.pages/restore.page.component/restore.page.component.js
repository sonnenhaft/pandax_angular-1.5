import angular from 'angular';
import uiRouter from 'angular-ui-router';
import Validation from '../../../common-services/validation.service';
import User from '../../../common-services/user.service';
import template from './restore.page.html';

class controller {
  constructor (Validation, User, $mdDialog) {
    'ngInject';

    Object.assign(this, { Validation, User, $mdDialog });
  }

  onSubmit (email, $event) {
    if (this.validate(email)) {
      this.restoreError = false;
      return this.restore(email, $event);
    }

    return false;
  }

  validate (field) {
    if (this.Validation.error(field).length) {
      _.map(this.Validation.error(field), error => {
        this[`${error.name}Error`] = error.text;
      });
      return false;
    }
    return true;
  }

  restore (email, $event) {
    this.restoreLoading = true;
    return this
      .User
      .restore(email)
      .then(
        result => {
          this.restoreLoading = false;

          if (result && result.error) {
            this.restoreError = result.error;
            return false;
          }

          return true;
        },
        error => {
          this.restoreLoading = false;
        }
      )
      .then(result => {
        if (result) {
          this.showMessage($event);
        }
      });
  }

  showMessage ($event) {
    this.$mdDialog
      .show({
        contentElement: '#restore-success',
        parent: document.body,
        targetEvent: $event,
        clickOutsideToClose: false
      });
  }

  hideMessage ( ) {
    this.$mdDialog.hide( );
    this.output({ view: 'signIn' });
  }

}


export default angular.module('restore', [
  uiRouter,
  Validation,
  User
]).component('restore', {
  bindings: {
    output: '&'
  },
  template,
  controller
}).name;