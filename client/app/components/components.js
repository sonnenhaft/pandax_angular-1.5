import angular from 'angular';
import Home from './home/home';
import About from './about/about';
import Main from './main/main';
import Profile from './profile/profile';
import ProfileCreate from './profile/create/profile.create';
import Order from './order/order';

let componentModule = angular.module('app.components', [
  Home,
  About,
  Main,
  Profile,
  ProfileCreate,
  Order
])

.name;

export default componentModule;
