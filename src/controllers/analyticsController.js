const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;


class AnalyticsController {
  
  constructor(analyticsService) {
    if (!analyticsService) {
      throw new Error('AnalyticsService is required');
    }
    this.analyticsService = analyticsService;
  }
  
  
  async exportData(req, res) {
    try {
      const { type, format = 'csv', start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let data;
      let filename;
      
      if (type === 'overdue') {
        data = await this.analyticsService.getOverdueAnalytics(startDate, endDate);
        filename = `overdue_borrowings_${startDate}_to_${endDate}`;
      } else if (type === 'borrowings') {
        const borrowingAnalytics = await this.analyticsService.getBorrowingAnalytics(startDate, endDate);
        data = borrowingAnalytics.overdue_details || [];
        filename = `borrowings_${startDate}_to_${endDate}`;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid export type. Use "overdue" or "borrowings"'
        });
      }
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No data found for the specified date range'
        });
      }
      
      const exportsDir = path.join(process.cwd(), 'exports');
      try {
        await fs.access(exportsDir);
      } catch {
        try {
          await fs.mkdir(exportsDir, { recursive: true });
        } catch (mkdirError) {
          console.error('Failed to create exports directory:', mkdirError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create exports directory',
            error: mkdirError.message
          });
        }
      }
      
      try {
        await fs.access(exportsDir, fs.constants.W_OK);
      } catch (permissionError) {
        console.error('No write permission for exports directory:', permissionError);
        return res.status(500).json({
          success: false,
          message: 'No write permission for exports directory. Please check file permissions.',
          error: permissionError.message
        });
      }
      
      if (format === 'csv') {
        const csvPath = path.join(exportsDir, `${filename}.csv`);
        
        const csvWriter = createCsvWriter({
          path: csvPath,
          header: [
            { id: 'id', title: 'Borrowing ID' },
            { id: 'book_title', title: 'Book Title' },
            { id: 'book_author', title: 'Book Author' },
            { id: 'book_isbn', title: 'Book ISBN' },
            { id: 'borrower_name', title: 'Borrower Name' },
            { id: 'borrower_email', title: 'Borrower Email' },
            { id: 'checkout_date', title: 'Checkout Date' },
            { id: 'due_date', title: 'Due Date' },
            { id: 'return_date', title: 'Return Date' },
            { id: 'status', title: 'Status' },
            { id: 'days_overdue', title: 'Days Overdue' }
          ]
        });
        
        await csvWriter.writeRecords(data);
        
        res.download(csvPath, `${filename}.csv`, (err) => {
          if (err) {
            console.error('Error downloading CSV:', err);
            res.status(500).json({
              success: false,
              message: 'Failed to download CSV file'
            });
          }
          fs.unlink(csvPath).catch(console.error);
        });
        
      } else if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Analytics Data');
        
        worksheet.columns = [
          { header: 'Borrowing ID', key: 'id', width: 15 },
          { header: 'Book Title', key: 'book_title', width: 30 },
          { header: 'Book Author', key: 'book_author', width: 25 },
          { header: 'Book ISBN', key: 'book_isbn', width: 15 },
          { header: 'Borrower Name', key: 'borrower_name', width: 25 },
          { header: 'Borrower Email', key: 'borrower_email', width: 30 },
          { header: 'Checkout Date', key: 'checkout_date', width: 15 },
          { header: 'Due Date', key: 'due_date', width: 15 },
          { header: 'Return Date', key: 'return_date', width: 15 },
          { header: 'Status', key: 'status', width: 12 },
          { header: 'Days Overdue', key: 'days_overdue', width: 15 }
        ];
        
        worksheet.addRows(data);
        
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        
        const xlsxPath = path.join(exportsDir, `${filename}.xlsx`);
        await workbook.xlsx.writeFile(xlsxPath);
        
        res.download(xlsxPath, `${filename}.xlsx`, (err) => {
          if (err) {
            console.error('Error downloading XLSX:', err);
            res.status(500).json({
              success: false,
              message: 'Failed to download XLSX file'
            });
          }
          fs.unlink(xlsxPath).catch(console.error);
        });
        
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid format. Use "csv" or "xlsx"'
        });
      }
      
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async getSummary(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const summary = await this.analyticsService.getAnalyticsSummary(startDate, endDate);
      
      res.json({
        success: true,
        message: 'Analytics summary retrieved successfully',
        data: summary,
        meta: {
          date_range: {
            start_date: startDate,
            end_date: endDate
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  
  async getPopularBooks(req, res) {
    try {
      const { limit = 10, start_date, end_date } = req.query;
      
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const popularBooks = await this.analyticsService.getPopularBooks(startDate, endDate, parseInt(limit));
      
      res.json({
        success: true,
        message: 'Popular books analytics retrieved successfully',
        data: popularBooks,
        meta: {
          limit: parseInt(limit),
          date_range: {
            start_date: startDate,
            end_date: endDate
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching popular books analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular books analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AnalyticsController; 