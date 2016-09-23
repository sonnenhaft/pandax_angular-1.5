class EntertainersController {

  constructor (EntertainersService) {
    'ngInject';

    _.assign(this, {
    	EntertainersService,
    	list: [],
    	isOnProgress: false,
      isLastPage: false,
      currentPage: 1,
    });
  }

  $onInit () {
  	this.isOnProgress = true;
    this.EntertainersService.fetchEntertainers()
      .then(data => {
      	this.isOnProgress = false;
        this.isLastPage = this.checkIsLastPage(data.meta.pagination.total_pages);
        return this.list = data.items;
      });
  }

  fetchMoreItems () {
    this.isOnProgress = true;

    this.EntertainersService.fetchEntertainers(this.currentPage + 1)
      .then((data) => {
        this.isOnProgress = false;
        this.currentPage = data.meta.pagination.current_page;
        this.list = this.list.concat( data.items );
        this.isLastPage = this.checkIsLastPage(data.meta.pagination.total_pages);
      })
  };

  checkIsLastPage (totalPages) {
		return this.currentPage == totalPages;
  }
}

export default EntertainersController;
