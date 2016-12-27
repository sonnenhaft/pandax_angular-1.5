import angular from 'angular';

class CustomersService {
  constructor (Constants, Request, $mdDialog, $q) {
    'ngInject';

    Object.assign(this, {
      Constants,
      Request,
      $mdDialog,
      $q,
      list: []
    });
  }

  fetchCustomers (page = 1) {
    return this
      .Request
      .send(
        null,
        this.Constants.api.customers.get.method,
        this.Constants.api.customers.get.uri(page)
      )
      .then(
        result => {
          this.list = this.list.concat(result.data.items);
          return result.data;
        }
      );
  }

  getCustomers ( ) {
    return this.list;
  }

  setStatus (ev, customer, targetStatus, showPopup = true, targetStatusForPopup) {
    if (!targetStatusForPopup) {
      targetStatusForPopup = targetStatus;
    }
    let confirm;

    if (showPopup) {
      confirm = this.$mdDialog.show(
        this.$mdDialog.confirm( )
          .title(this.Constants.admin.setStatusMessage.title('customer', targetStatusForPopup))
          .textContent(this.Constants.admin.setStatusMessage.content('customer', targetStatusForPopup))
          .ariaLabel('Set status')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('No'));
    } else {
      confirm = this.$q.defer( );
      confirm.resolve( );
      confirm = confirm.promise;
    }

    return confirm.then(_data => this
        .Request
        .send(
          null,
          this.Constants.api.admin.setStatus.method,
          this.Constants.api.admin.setStatus.uri('customers', customer.id),
          { set: targetStatus }
        )
        .then(
          result => {
            this.updateCustomerInList(customer, result.data.status);
            return result.data;
          }
        ));
  }

  updateCustomerInList (customer, targetStatus) {
    customer.status = targetStatus;
  }

}

export default angular
  .module('CustomersService', [])
  .service('CustomersService', CustomersService)
  .name;