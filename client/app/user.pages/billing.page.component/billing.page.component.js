import Cards from '../../common-services/card.service';
import cardList from './card-list.component/card-list.component';
import cardInfo from '../../inputs/add-new-card.form.input';
import CommonUserFieldsInput from '../../inputs/common-user-fields.input';

import template from './billing.page.html';

class controller {
  defaultCardId = 0
  newCard = {}   // temporary
  saveLoading = false
  hasPersonalInfo = false

  constructor ($state, Cards, $stateParams, Resolve, $mdToast, $q, OrderService, $mdDialog, StatefulUserData, $http, UserProfileResource) {
    'ngInject';

    Object.assign(this, { $state, $stateParams, Resolve, Cards, $mdToast, $q, OrderService, $mdDialog, StatefulUserData, $http, UserProfileResource });

    $q.all({
      orderDetails: OrderService.fetchOrderDetails($stateParams.orderId),
      billingInfo: this.Cards.getCards( ).then(cards => Object.assign({}, StatefulUserData.getUser( ), { cards }))
    }).then(({ billingInfo, orderDetails }) => {
      Object.assign(this, { billingInfo, orderDetails });
      this.defaultCardId = this.getDefaultCardId( );
      this.hasPersonalInfo = billingInfo && billingInfo.first_name && billingInfo.last_name && billingInfo.phone;
    });
  }

  hasNoCards ( ) {
    const { cards } = this.billingInfo || { cards: [] };
    return !cards || cards.length === 0;
  }

  isButtonDisabled (billingInformationForm, personalInformationForm) {
    const personalValid = personalInformationForm.$submitted && personalInformationForm.$invalid;
    const billingValid = billingInformationForm.$submitted && billingInformationForm.$invalid;
    return (!this.hasPersonalInfo && personalValid) || (this.hasNoCards( ) && billingValid) || this.saveLoading;
  }

  saveInfo (billingInformationForm, personalInformationForm) {
    [billingInformationForm, personalInformationForm].forEach(form => form.$setSubmitted( ));

    const isStillDisabled = this.isButtonDisabled(billingInformationForm, personalInformationForm);

    if (isStillDisabled) { return; }
    const promises = [];

    this.saveLoading = true;

    if (!this.hasPersonalInfo) {
      const updateUserInfoPromise = this.UserProfileResource.update({}, this.billingInfo).$promise;
      updateUserInfoPromise.then(user => this.StatefulUserData.extend(user));
      promises.push(updateUserInfoPromise);
    }

    if (!this.billingInfo.cards || !this.billingInfo.cards.length) {      // should add card
      promises.push(this.Cards.add(this.newCard));
    } else if (this.defaultCardId !== this.getDefaultCardId( )) {
      // TODO: send request to change default card
    }

    return this.$q.all(promises)
      .then(( ) => this.payForOrder( ))
      .then(( ) => {
        this.StatefulUserData.extend({ is_newcomer: false });
        this.$state.go(this.$stateParams.from, { orderId: this.$stateParams.orderId });
      })
      .catch(( ) => this.saveLoading = false);
  }

  getDefaultCardId ( ) {
    let result = 0;
    if (this.billingInfo.cards && this.billingInfo.cards.length > 0) {
      const defaultCardIndex = _.findIndex(this.billingInfo.cards, { is_default: true });
      result = defaultCardIndex >= 0 ? this.billingInfo.cards[defaultCardIndex].id : 0;
    }
    return result;
  }

  payForOrder ( ) {
    return this.OrderService.payForOrder(this.$stateParams.orderId, this.getDefaultCardId( )).then(
      data => this.OrderService.inviteEntertainer(this.$stateParams.orderId, parseInt(this.$stateParams.entertainerId, 10)),
      error => {
        this.showMoneyReservationFailedPopUp( );
        return this.$q.reject(error);
      });
  }

  showMoneyReservationFailedPopUp ( ) {
    this.$mdDialog.show(
      this.$mdDialog.alert( )
        .clickOutsideToClose(true)
        .title('Money reservation failed')
        .textContent('Money capture failed. Please try another card.')
        .ariaLabel('Ban Dialog')
        .ok('Ok')
    );
  }

  goToPreviousStep ( ) {
    this.$state.go(this.$stateParams.from, { orderId: this.$stateParams.orderId });
  }
}

const component = 'billingPageComponent';
export default angular.module(component, [
  CommonUserFieldsInput,
  cardInfo,
  cardList,
  Cards
]).config($stateProvider => {
  'ngInject';

  $stateProvider.state('main.billing', {
    url: '/billing/:orderId/:entertainerId?from?stub',
    parent: 'main',
    component
  });
}).component(component, {
  template,
  controller
}).name;
