const BookRepository = require('../repositories/BookRepository');
const BorrowerRepository = require('../repositories/BorrowerRepository');
const BorrowingRepository = require('../repositories/BorrowingRepository');


const BookService = require('../services/BookService');
const BorrowerService = require('../services/BorrowerService');
const BorrowingService = require('../services/BorrowingService');
const AnalyticsService = require('../services/AnalyticsService');
const AuthService = require('../services/AuthService');


const BookController = require('../controllers/bookController');
const BorrowerController = require('../controllers/borrowerController');
const BorrowingController = require('../controllers/borrowingController');
const AnalyticsController = require('../controllers/analyticsController');
const AuthController = require('../controllers/authController');


class Container {
  constructor() {
    this.instances = new Map();
    this._setupDependencies();
  }


  _setupDependencies() {

    this.instances.set('bookRepository', new BookRepository());
    this.instances.set('borrowerRepository', new BorrowerRepository());
    this.instances.set('borrowingRepository', new BorrowingRepository());


    this.instances.set('bookService', new BookService(
      this.get('bookRepository'),
      this.get('borrowingRepository')
    ));
    
    this.instances.set('borrowerService', new BorrowerService(
      this.get('borrowerRepository')
    ));
    
    this.instances.set('borrowingService', new BorrowingService(
      this.get('borrowingRepository'),
      this.get('bookRepository'),
      this.get('borrowerRepository')
    ));
    
    this.instances.set('analyticsService', new AnalyticsService(
      this.get('bookRepository'),
      this.get('borrowerRepository'),
      this.get('borrowingRepository')
    ));
    
    this.instances.set('authService', new AuthService());


    this.instances.set('bookController', new BookController(
      this.get('bookService')
    ));
    
    this.instances.set('borrowerController', new BorrowerController(
      this.get('borrowerService')
    ));
    
    this.instances.set('borrowingController', new BorrowingController(
      this.get('borrowingService')
    ));
    
    this.instances.set('analyticsController', new AnalyticsController(
      this.get('analyticsService')
    ));
    
    this.instances.set('authController', new AuthController(
      this.get('authService')
    ));
  }


  get(name) {
    if (!this.instances.has(name)) {
      throw new Error(`Dependency '${name}' not found in container`);
    }
    return this.instances.get(name);
  }


  has(name) {
    return this.instances.has(name);
  }


  register(name, instance) {
    this.instances.set(name, instance);
  }
}


const container = new Container();

module.exports = container; 