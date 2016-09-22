let ActiveMenuItemDirective = ['$state', '$timeout', '$rootScope', function($state, $timeout, $rootScope) {
  'ngInject';

  const STYLES = {
    CSS_CLASS_LINK_ACTIVE: 'active',
    CSS_CLASS_OPENED_SUB_ITEMS: 'opened-subitems'
  };


  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      let menuItems = [];

      function toggleOpened (menuItem) {
        if (!menuItem.hasClass(STYLES.CSS_CLASS_OPENED_SUB_ITEMS)) {
          clearAll();
        }
        angular.element(menuItem).toggleClass(STYLES.CSS_CLASS_OPENED_SUB_ITEMS);
      }

      function clearAll () {
        menuItems.removeClass(STYLES.CSS_CLASS_OPENED_SUB_ITEMS);
      }

      function checkActiveSubItem () {
        _.each(menuItems, menuItem => {
          if (menuItem.querySelector('ul>li>a.' + STYLES.CSS_CLASS_LINK_ACTIVE)) {
            angular.element(menuItem).addClass(STYLES.CSS_CLASS_OPENED_SUB_ITEMS);
            angular.element(menuItem).children('a').addClass(STYLES.CSS_CLASS_LINK_ACTIVE);
          }
        });
      }

      function init () {
        menuItems = angular.element(element).children('li');
console.log('init:', menuItems)

        checkActiveSubItem();

        _.each(menuItems, menuItem => {
          angular.element(menuItem).bind("click", (_e) => {
            toggleOpened(angular.element(menuItem));
          });
        });


        $rootScope.$on("$stateChangeSuccess", function(event, next, current) {
          clearAll();
          $timeout(checkActiveSubItem, 300);
        });
      }


      $timeout(init, 300);
    }
  }
}];

export default ActiveMenuItemDirective;
