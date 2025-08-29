const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');


const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    const books = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        available_quantity: 5,
        total_quantity: 5,
        shelf_location: 'A1-001'
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780446310789',
        available_quantity: 3,
        total_quantity: 4,
        shelf_location: 'A1-002'
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        available_quantity: 2,
        total_quantity: 3,
        shelf_location: 'B2-001'
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9780141439518',
        available_quantity: 4,
        total_quantity: 4,
        shelf_location: 'C3-001'
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '9780316769174',
        available_quantity: 1,
        total_quantity: 2,
        shelf_location: 'A1-003'
      }
    ];
    
    const borrowers = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        registered_date: '2024-01-15'
      },
      {
        name: 'Emma Johnson',
        email: 'emma.johnson@email.com',
        registered_date: '2024-02-01'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        registered_date: '2024-02-15'
      },
      {
        name: 'Sarah Davis',
        email: 'sarah.davis@email.com',
        registered_date: '2024-03-01'
      }
    ];
    
    for (const book of books) {
      await pool.query(
        `INSERT INTO books (title, author, isbn, available_quantity, total_quantity, shelf_location)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (isbn) DO NOTHING`,
        [book.title, book.author, book.isbn, book.available_quantity, book.total_quantity, book.shelf_location]
      );
    }
    
    for (const borrower of borrowers) {
      await pool.query(
        `INSERT INTO borrowers (name, email, registered_date)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING`,
        [borrower.name, borrower.email, borrower.registered_date]
      );
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', hashedPassword, 'admin']
    );
    
    const borrowingQuery = `
      INSERT INTO borrowings (book_id, borrower_id, checkout_date, due_date, is_returned, return_date)
      SELECT 
        (SELECT id FROM books WHERE isbn = $1),
        (SELECT id FROM borrowers WHERE email = $2),
        $3::date,
        $4::date,
        $5,
        $6::date
      WHERE EXISTS (SELECT 1 FROM books WHERE isbn = $1)
        AND EXISTS (SELECT 1 FROM borrowers WHERE email = $2)
    `;
    
    const sampleBorrowings = [
      ['9780743273565', 'john.smith@email.com', '2024-01-20', '2024-02-03', true, '2024-02-01'],
      ['9780446310789', 'emma.johnson@email.com', '2024-02-05', '2024-02-19', false, null],
      ['9780451524935', 'michael.brown@email.com', '2024-01-15', '2024-01-29', false, null], // Overdue
      ['9780316769174', 'sarah.davis@email.com', '2024-03-01', '2024-03-15', false, null]
    ];
    
    for (const borrowing of sampleBorrowings) {
      await pool.query(borrowingQuery, borrowing);
    }
    
    console.log('✅ Database seeding completed successfully');
    console.log('📚 Sample books, borrowers, and borrowings created');
    console.log('👤 Default admin user created (username: admin, password: admin123)');
    console.log('🔢 All records use auto-incrementing integer IDs');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  seed();
}

module.exports = { seed }; 