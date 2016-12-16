import angular from 'angular';
import uiRouter from 'angular-ui-router';
import historyMinxComponent from './historyMinx.component';
import OrderService from '../../services/orderService/orderService';
import hoursToTime from '../../common/hoursToTime.filter';
import timer from '../../common/timer.directive';
import showInTime from '../../common/show-in-time.directive';

export default angular
  .module('historyMinx', [
    uiRouter,
    OrderService,
    timer,
    showInTime
  ])
  .config(($stateProvider) => {
    "ngInject";

    $stateProvider
      .state('main.minx', {
        url: '/orders-history/:type/:id',
        parent: 'main',
        template: '<history-minx order="order"></history-minx>',
        controller: (order, $scope) => {
          $scope.order = order;
        },
        resolve: {
          order: (OrderService, $stateParams) => {
            return OrderService
              .getOrdersWithParam($stateParams.id);
          }
        }
      });
  })
  .filter('hoursToTime', hoursToTime)
  .component('historyMinx', historyMinxComponent)
  .name;
