import Helper from '../../common-services/helper.service';
import Validation from '../../common-services/validation.service';
import OrderService from '../../common-services/orderService.service';
import orderConfirm from './confirmed-order.page.component/confirmed-order.page.component';
import manipulationEntertainers from './manipulation-entertainers.component/manipulation-entertainers.page';
import acceptTermsAndConditionsPage from './accept-terms-and-conditions.page.component/accept-terms-and-conditions.page.component';
import RateEntertainersComponent from './rate-entertainers.component/rate-entertainers.component';
import OrderResource from './order.resource';
import SelectInput from './blocks/select-input/select-input.component';

import TipModalComponent from '../../common/tip-modal.component/tip-modal.component';
import template from './create-order.page.html';

class controller {
  hours = ['0.5 H', '1 H', '1.5 H', '2 H', '2.5 H', '3 H', '3.5 H', '4 H']
  guests = ['1', '2-3', '4-5', '5-10', '10-15', '15+']
  entertainers = [1, 2, 3, 4, 5, 6]
  guest = 1
  asap = true
  hour = '0.5H'
  date = new Date( )
  currentDate = new Date( )

  constructor (Helper, Validation, OrderService, $http, $window, $state, $mdDialog, moment, StatefulUserData, $q, $stateParams, OrderResource, $location) {
    'ngInject';


    this.resolved = false;
    $q.all($location.search( ).skipNotAccomplished ? {} : {
      notAccomplishedOrder: OrderService.fetchLastNotAccomplishedOrder( ).then(({ data }) => data),
      notRatedEntertainers: OrderResource.fetchNotRatedEntertainers($stateParams.notRatedEntertainers).$promise
    }).then(({ notAccomplishedOrder, notRatedEntertainers }) => {
      if (notAccomplishedOrder) {
        $state.go('manipulationEntertainers', { orderId: notAccomplishedOrder.id });
      } else if (notRatedEntertainers && notRatedEntertainers.length) {
        $state.go('main.rate-entertainers', { notRatedEntertainers });
      }
    }).finally(( ) => {
      this.resolved = true;
    });

    Object.assign(this, { Helper, Validation, OrderService, $http,
      $state, $mdDialog, StatefulUserData, $window });

    this.maxDateForCreating = moment( ).add(14, 'days').toDate( );
    this._setIsMobile( );
    $window.addEventListener('resize', this._setIsMobile);
  }

  _setIsMobile = ( ) => this.isMobile = this.$window.innerWidth <= 960;

  $onInit ( ) {
    this.providers = _.map(this.OrderService.getProviders( ), (provider, i) => {
      provider.active = i === 0;
      return provider;
    });

    this.time = this.Helper.getNearestTime('time');
    this.range = this.Helper.getNearestTime('range');

    // if (this.StatefulUserData.get('is_newcomer')) {
    //   this.isNewcomer = true;
    //   this.entertainers = this.entertainers.slice(1);
    // } else {
    //   this.hours = this.hours.slice(1);
    // }
    this.hours = this.hours.slice(1);
    this.entertainer = this.entertainers[0];
    this.hour = this.hours[0];
  }

  showDescription (event, type) {
    if (!type.description) {
      return;
    }
    this.activeType = type;
    this.$mdDialog.show({
      contentElement: '#typeDescr',
      parent: document.body,
      targetEvent: event,
      clickOutsideToClose: true
    });
  }

  onDateChange (date) {
    this.range = this.Helper.getNearestTime('range', date);
  }

  getTotalPrice ( ) {
    return (this.providers || [])
        .filter(({ active }) => active)
        .reduce((sum, { price }) => sum + price, 0)
      * parseFloat(this.hour) * Number(this.entertainer);
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

  /** @deprecated mass */
  onSearch (form) {
    form.$setSubmitted( );
    if (form.$invalid) {
      return;
    }
    const orderModel = {
      hour: form.hour.$viewValue,
      entertainer: form.entertainer.$viewValue,
      apt: form.apt.$viewValue,
      notes: form.notes.$viewValue,
      guest: form.guest.$viewValue,
      asap: this.asap,
      later: !this.asap,
      date: form.date.$viewValue,
      time: form.time.$viewValue,
      geo: this.inputLocation,
      price: this.getTotalPrice( )
    };

    if ((this.typeError = !this.Helper.getActiveObjectFromArray(this.providers).length)) { // eslint-disable-line no-cond-assign
      return false;
    } else if (!this.validate({ apt: orderModel.apt, location: this.inputLocation, date: orderModel.date })) {
      this.location = false;
      return false;
    } else if (!this.StatefulUserData.isAccepted( )) {
      const order = this.OrderService.buildOrder(orderModel);
      this.$state.go(acceptTermsAndConditionsPage, { order });
      return false;
    } else {
      this.orderLoading = true;
      this.$http.post('{{config_api_url}}/api/order', this.orderData(orderModel)).then(({ data: { customer, id: orderId, channel_name: channelName } }) => {
        this.orderLoading = false;
        this.StatefulUserData.extend(customer);
        this.$state.go('manipulationEntertainers', { orderId, channelName });
      }).finally(( ) => {
        this.orderLoading = false;
      });
    }
  }

  orderData (orderModel) {
    return this.OrderService.buildOrder(Object.assign(orderModel, {
      geo: this.inputLocation,
      price: this.getTotalPrice( )
    }));
  }
}

export default angular.module('order', [
  Helper,
  Validation,
  SelectInput,
  orderConfirm,
  OrderService,
  OrderResource,
  TipModalComponent,
  manipulationEntertainers,
  RateEntertainersComponent,
  acceptTermsAndConditionsPage
]).config($stateProvider => {
  'ngInject';

  $stateProvider.state('main.create-order', {
    url: '/create-order',
    parent: 'main',
    component: 'createOrderPage',
    params: { notRatedEntertainers: null }
  });
}).component('createOrderPage', {
  template,
  controller
}).name;
