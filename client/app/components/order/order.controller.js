class orderController {

  constructor (User, Constants, Helper, Validation, OrderService, Request, $window, $state, $mdDialog) {
    'ngInject';

    _.assign(this, {
      User,
      Constants,
      Helper,
      Validation,
      OrderService,
      Request,
      $state,
      $mdDialog
    });

    this.providers = OrderService.getProviders();
    this.mobile = $window.innerWidth <= 960;

    $window.addEventListener('resize', () => {
      this.mobile = $window.innerWidth <= 960;
    });

  }

  $onInit () {
    _.mapValues(this.Constants.order.models, (model, key) => {
      this[key] = model;
    });

    this.time = this.Helper.getNearestTime('time');
    this.range = this.Helper.getNearestTime('range');

    if (this.User.get('is_newcomer')) {
      this.entertainers = _.slice(this.entertainers, 1);
      this.entertainer = _.head(this.entertainers);
    }

    if (!this.User.get('is_newcomer')) {
      this.hours = _.slice(this.hours, 1);
      this.hour = _.head(this.hours);
    }
  }

  showDescription (event, index) {
    this.$mdDialog
      .show({
        contentElement: '#typeDescr-' + index,
        parent: document.body,
        targetEvent: event,
        clickOutsideToClose: true
      });
  }

  onDateChange (date) {
    this.range = this.Helper.getNearestTime('range', date);
  }

  getTotalPrice () {
    return _
      .chain(this.Helper.getActiveObjectFromArray(this.providers))
      .map('price')
      .sum()
      .value() * parseFloat(this.hour) * Number(this.entertainer);
  }

  validate (field) {
    if (this.Validation.error(field).length) {
      _.map(this.Validation.error(field), error => {
        this[error.name + 'Error'] = error.text;
      });
      return false;
    }
    return true;
  }

  onSearch (form) {
    this.orderLoading = true;

    if (!this.validate({apt: form.apt, location: this.inputLocation})) {
      this.orderLoading = false;
      return false;
    }

    this.Request
      .send(
        this.User.token(),
        this.Constants.api.order.method,
        this.Constants.api.order.uri,
        this.orderData(form)
      )
      .then(
        result => {
          this.orderLoading = false;
          this.$state.go('main.searchEntertainers');
          console.log(result);
        },
        error => {
          this.orderLoading = false;
          console.log(error);
        }
      );
  }

  orderData (form) {
    return this
      .OrderService
      .buildOrder(
        _.assign(form, {
          geo: this.inputLocation,
          price: this.getTotalPrice()
        })
      );
  }

}

export default orderController;
