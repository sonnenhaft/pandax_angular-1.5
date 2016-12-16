import angular from 'angular';
import uiRouter from 'angular-ui-router';

import photoFullPageTemplate from '../../order/manipulationEntertainers/photoFullPage/photoFullPage.html';
import photoFullPageController from '../../order/manipulationEntertainers/photoFullPage/photoFullPage.controller.js';
import EntertainersService from '../../../services/entertainersService/entertainersService';

import template from './entertainers.page.html';

class controller {
  constructor(EntertainersService, Constants, $mdDialog) {
    'ngInject';

    _.assign(this, {
      EntertainersService,
      Constants,
      $mdDialog,
      isOnProgress: false,
      isLastPage: false,
      currentPage: 1,
      statuses: Constants.admin.statuses.entertainer
    });
  }

  $onInit() {
    this.isOnProgress = true;
    this.EntertainersService.fetchEntertainers()
      .then(data => {
        this.isOnProgress = false;
        this.isLastPage = this.checkIsLastPage(data.meta.pagination.total_pages);
      });
  }

  fetchMoreItems() {
    this.isOnProgress = true;

    this.EntertainersService.fetchEntertainers(this.currentPage + 1)
      .then((data) => {
        this.isOnProgress = false;
        this.currentPage = data.meta.pagination.current_page;
        this.isLastPage = this.checkIsLastPage(data.meta.pagination.total_pages);
      });
  };

  checkIsLastPage(totalPages) {
    return this.currentPage == totalPages;
  }

  showPopup(ev, index) {
    this.$mdDialog.show({
      controller: photoFullPageController,
      controllerAs: '$ctrl',
      clickOutsideToClose: true,
      template: '<div layout="row" layout-align="end" class="icon_modal-close">\
                    <div class="icon_modal-close__image" ng-click="$ctrl.$mdDialog.hide()"></div>\
                  </div>' +
      photoFullPageTemplate,
      targetEvent: ev,
      bindToController: true,
      locals: {
        photos: this.EntertainersService.list[index].photos,
        photoIndexActive: 0
      }
    });
  }
}

var name = 'entertainers';
export default angular.module(name, [
  uiRouter,
  EntertainersService
]).config(($stateProvider) => {
  "ngInject";

  $stateProvider.state('admin.entertainers', {
    url: '/entertainers',
    parent: 'admin',
    component: name
  });
}).component(name, {
  template,
  controller
}).name;