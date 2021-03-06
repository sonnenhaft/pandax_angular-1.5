import OrderService from '../../../../common-services/orderService.service';
import WebSocket from '../../../../common-services/WebSocket.service';
import timer from '../../../../common/timer.directive';
import byStatuses from './byStatuses.filter';
import showInTime from '../../../../common/show-in-time.directive';
import template from './confirmed-entertainers.page.html';

class controller {
  statuses = {
    accepted: 'accepted',
    declined: 'declined',
    invited: 'invited',
    inProgress: 'in progress',
    finished: 'finished`',
    missed: 'missed',
    new: 'new',
    paid: 'paid',
    canceled: 'canceled',
    active: 'active',
    canceledByProvider: 'canceled_by_provider',
    canceledByCustomer: 'canceled_by_customer'
  }
  timeToCleanCancel = 5

  constructor (OrderService, Helper, moment, $scope, $state, $stateParams) {
    'ngInject';

    Object.assign(this, { OrderService, Helper, moment, $scope, $state, $stateParams });

    this.STATUSES = [
      this.statuses.accepted,
      this.statuses.canceledByCustomer,
      this.statuses.canceledByProvider
    ];
    this.$scope.$watch(( ) => this.entertainers, newValue => {
      const currentCount = newValue.filter(item => this.STATUSES.includes(item.status)).length;
      if (currentCount === this.countOfRequiredEntertainers) {
        this.$state.go('orderConfirm', { orderId: this.$stateParams.orderId });
      }
    }, true);
  }

  cancelOrder (ev, invite, dirtyCancelling = true) {
    this.OrderService.cancelOrderForEntertainer(ev, invite, dirtyCancelling ? this.inviteTypePenaltyAmount : 0).then(( ) => {
      this.Helper.showToast('Done');
    });
  }
}

export default angular.module('confirmedEntertainers', [
  OrderService,
  showInTime,
  WebSocket,
  timer
]).filter('byStatuses', byStatuses).component('confirmedEntertainers', {
  bindings: {
    countOfRequiredEntertainers: '<',
    inviteTypePenaltyAmount: '<',
    entertainers: '='
  },
  template,
  controller
}).name;
