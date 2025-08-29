
class BookDTO {
  

  static toPublicBook(book) {
    if (!book) return null;
    
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      available_quantity: book.available_quantity,
      total_quantity: book.total_quantity,
      shelf_location: book.shelf_location,
      created_at: book.created_at,
      updated_at: book.updated_at
    };
  }
  

  static fromCreateRequest(requestData) {
    const { 
      title, 
      author, 
      isbn, 
      available_quantity, 
      total_quantity, 
      shelf_location 
    } = requestData;
    
    const finalTotalQuantity = total_quantity || available_quantity || 0;
    const finalAvailableQuantity = available_quantity || 0;
    
    return {
      title: title?.trim(),
      author: author?.trim(),
      isbn: isbn?.trim(),
      available_quantity: finalAvailableQuantity,
      total_quantity: finalTotalQuantity,
      shelf_location: shelf_location?.trim()
    };
  }
  

  static fromUpdateRequest(requestData) {
    const updateData = {};
    
    if (requestData.title !== undefined) {
      updateData.title = requestData.title?.trim();
    }
    if (requestData.author !== undefined) {
      updateData.author = requestData.author?.trim();
    }
    if (requestData.isbn !== undefined) {
      updateData.isbn = requestData.isbn?.trim();
    }
    if (requestData.available_quantity !== undefined) {
      updateData.available_quantity = requestData.available_quantity;
    }
    if (requestData.total_quantity !== undefined) {
      updateData.total_quantity = requestData.total_quantity;
    }
    if (requestData.shelf_location !== undefined) {
      updateData.shelf_location = requestData.shelf_location?.trim();
    }
    
    return updateData;
  }
  

  static toBooksListResponse(books, pagination) {
    return {
      books: books.map(book => this.toPublicBook(book)),
      pagination
    };
  }
  

  static fromSearchQuery(queryParams) {
    const { search, author, page = 1, limit = 10, sortBy = 'title', sortOrder = 'ASC' } = queryParams;
    
    return {
      search: search?.trim(),
      author: author?.trim(),
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit) || 10)),
      sortBy: ['title', 'author', 'created_at'].includes(sortBy) ? sortBy : 'title',
      sortOrder: ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC'
    };
  }
  

  static validateQuantities(bookData) {
    const { available_quantity, total_quantity } = bookData;
    
    if (available_quantity < 0) {
      return {
        isValid: false,
        message: 'Available quantity cannot be negative'
      };
    }
    
    if (total_quantity < 0) {
      return {
        isValid: false,
        message: 'Total quantity cannot be negative'
      };
    }
    
    if (available_quantity > total_quantity) {
      return {
        isValid: false,
        message: 'Available quantity cannot exceed total quantity'
      };
    }
    
    return { isValid: true };
  }
}

module.exports = BookDTO; 