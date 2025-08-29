const container = require('../src/config/container');

/**
 * Dependency Injection Tests
 * Tests that the DI container works correctly and all dependencies are properly wired
 */
describe('Dependency Injection Container', () => {
  
  describe('Container Setup', () => {
    it('should create container successfully', () => {
      expect(container).toBeDefined();
      expect(typeof container.get).toBe('function');
      expect(typeof container.has).toBe('function');
    });
    
    it('should have all required services registered', () => {
      const requiredServices = [
        'bookService',
        'borrowerService', 
        'borrowingService',
        'analyticsService',
        'authService'
      ];
      
      requiredServices.forEach(serviceName => {
        expect(container.has(serviceName)).toBe(true);
      });
    });
    
    it('should have all required controllers registered', () => {
      const requiredControllers = [
        'bookController',
        'borrowerController',
        'borrowingController', 
        'analyticsController',
        'authController'
      ];
      
      requiredControllers.forEach(controllerName => {
        expect(container.has(controllerName)).toBe(true);
      });
    });
    
    it('should have all required repositories registered', () => {
      const requiredRepositories = [
        'bookRepository',
        'borrowerRepository',
        'borrowingRepository'
      ];
      
      requiredRepositories.forEach(repositoryName => {
        expect(container.has(repositoryName)).toBe(true);
      });
    });
  });
  
  describe('Service Dependencies', () => {
    it('should inject BookRepository into BookService', () => {
      const bookService = container.get('bookService');
      expect(bookService).toBeDefined();
      expect(bookService.bookRepository).toBeDefined();
    });
    
    it('should inject BorrowerRepository into BorrowerService', () => {
      const borrowerService = container.get('borrowerService');
      expect(borrowerService).toBeDefined();
      expect(borrowerService.borrowerRepository).toBeDefined();
    });
    
    it('should inject multiple repositories into BorrowingService', () => {
      const borrowingService = container.get('borrowingService');
      expect(borrowingService).toBeDefined();
      expect(borrowingService.borrowingRepository).toBeDefined();
      expect(borrowingService.bookRepository).toBeDefined();
      expect(borrowingService.borrowerRepository).toBeDefined();
    });
    
    it('should inject multiple repositories into AnalyticsService', () => {
      const analyticsService = container.get('analyticsService');
      expect(analyticsService).toBeDefined();
      expect(analyticsService.bookRepository).toBeDefined();
      expect(analyticsService.borrowerRepository).toBeDefined();
      expect(analyticsService.borrowingRepository).toBeDefined();
    });
    
    it('should create AuthService with UserDAO', () => {
      const authService = container.get('authService');
      expect(authService).toBeDefined();
      expect(authService.userDAO).toBeDefined();
    });
  });
  
  describe('Controller Dependencies', () => {
    it('should inject BookService into BookController', () => {
      const bookController = container.get('bookController');
      expect(bookController).toBeDefined();
      expect(bookController.bookService).toBeDefined();
    });
    
    it('should inject BorrowerService into BorrowerController', () => {
      const borrowerController = container.get('borrowerController');
      expect(borrowerController).toBeDefined();
      expect(borrowerController.borrowerService).toBeDefined();
    });
    
    it('should inject BorrowingService into BorrowingController', () => {
      const borrowingController = container.get('borrowingController');
      expect(borrowingController).toBeDefined();
      expect(borrowingController.borrowingService).toBeDefined();
    });
    
    it('should inject AnalyticsService into AnalyticsController', () => {
      const analyticsController = container.get('analyticsController');
      expect(analyticsController).toBeDefined();
      expect(analyticsController.analyticsService).toBeDefined();
    });
    
    it('should inject AuthService into AuthController', () => {
      const authController = container.get('authController');
      expect(authController).toBeDefined();
      expect(authController.authService).toBeDefined();
    });
  });
  
  describe('Singleton Behavior', () => {
    it('should return the same instance for multiple calls', () => {
      const bookService1 = container.get('bookService');
      const bookService2 = container.get('bookService');
      expect(bookService1).toBe(bookService2);
    });
    
    it('should share repository instances between services', () => {
      const bookService = container.get('bookService');
      const borrowingService = container.get('borrowingService');
      
      expect(bookService.bookRepository).toBe(borrowingService.bookRepository);
    });
  });
  
  describe('Method Availability', () => {
    it('should have all required methods on BookService', () => {
      const bookService = container.get('bookService');
      const requiredMethods = [
        'createBook',
        'getAllBooks', 
        'getBookById',
        'updateBook',
        'deleteBook',
        'searchBooks',
        'getLowAvailabilityBooks'
      ];
      
      requiredMethods.forEach(methodName => {
        expect(typeof bookService[methodName]).toBe('function');
      });
    });
    
    it('should have all required methods on BookController', () => {
      const bookController = container.get('bookController');
      const requiredMethods = [
        'create',
        'getAll',
        'getById', 
        'update',
        'delete',
        'search',
        'getLowAvailability'
      ];
      
      requiredMethods.forEach(methodName => {
        expect(typeof bookController[methodName]).toBe('function');
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should throw error for non-existent dependency', () => {
      expect(() => {
        container.get('nonExistentService');
      }).toThrow("Dependency 'nonExistentService' not found in container");
    });
    
    it('should return false for non-existent dependency check', () => {
      expect(container.has('nonExistentService')).toBe(false);
    });
  });
  
  describe('Dependency Chain Validation', () => {
    it('should properly wire the complete dependency chain', () => {
      const bookController = container.get('bookController');
      
      expect(bookController.bookService).toBeDefined();
      expect(bookController.bookService.bookRepository).toBeDefined();
      
      const bookService = container.get('bookService');
      const bookRepository = container.get('bookRepository');
      
      expect(bookController.bookService).toBe(bookService);
      expect(bookService.bookRepository).toBe(bookRepository);
    });
  });
}); 