import angular from 'angular';

import template from './card-list.component.html';
import './card-list.component.scss';

class controller {
  constructor(Cards, User) {
    'ngInject';

    _.assign(this, {
      Cards,
      User,
      saveLoading: false,
    });
  }

  setDefaultCard() {
    this.saveLoading = true;
    this.Cards.setDefaultCard(this.Cards.defaultCardId)
      .then((data) => {
        return data;
      })
      .then((_data) => {
        this.saveLoading = false;
      })
  }

  deleteCard(cardId) {
    this.saveLoading = true;
    this.Cards.deleteCard(cardId)
      .then((data) => {
        return data;
      })
      .then((_data) => {
        this.saveLoading = false;
      })
  }

}


export default angular.module('cardList', []).component('cardList', {
  bindings: { cards: '<' },
  template,
  controller
}).name;