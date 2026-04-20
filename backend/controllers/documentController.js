const db = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Upload a legal document
 * POST /api/documents/upload
 */
exports.uploadDocument = (req, res) => {
  const { case_id } = req.body;
  const file = req.file;

  // Validate required fields
  if (!case_id) {
    return res.status(400).json({ 
      message: 'Case ID is required' 
    });
  }

  if (!file) {
    return res.status(400).json({ 
      message: 'No file uploaded' 
    });
  }

  // Verify that the case belongs to this advocate
  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  
  db.query(checkCaseSql, [case_id, req.advocateId], (err, caseResult) => {
    if (err) {
      console.error('Case verification error:', err);
      return res.status(500).json({ 
        message: 'Failed to verify case',
        error: err.message 
      });
    }

    if (caseResult.length === 0) {
      return res.status(404).json({ 
        message: 'Case not found or does not belong to you' 
      });
    }

    // Insert document into database
    const sql = 'INSERT INTO documents (case_id, document_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)';

    db.query(
      sql,
      [case_id, file.originalname, file.path, file.mimetype, file.size],
      (err, result) => {
        if (err) {
          console.error('Upload document error:', err);
          return res.status(500).json({ 
            message: 'Document upload failed',
            error: err.message 
          });
        }

        res.status(201).json({ 
          message: 'Document uploaded successfully',
          documentId: result.insertId,
          fileName: file.originalname,
          filePath: file.path
        });
      }
    );
  });
};

/**
 * Get all documents for a specific case
 * GET /api/documents/:caseId
 */
exports.getDocuments = (req, res) => {
  const caseId = req.params.caseId;

  // Verify that the case belongs to this advocate
  const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
  
  db.query(checkCaseSql, [caseId, req.advocateId], (err, caseResult) => {
    if (err) {
      console.error('Case verification error:', err);
      return res.status(500).json({ 
        message: 'Failed to verify case',
        error: err.message 
      });
    }

    if (caseResult.length === 0) {
      return res.status(404).json({ 
        message: 'Case not found or does not belong to you' 
      });
    }

    // Fetch documents for the case
    const sql = 'SELECT * FROM documents WHERE case_id = ? ORDER BY uploaded_at DESC';

    db.query(sql, [caseId], (err, result) => {
      if (err) {
        console.error('Get documents error:', err);
        return res.status(500).json({ 
          message: 'Error fetching documents',
          error: err.message 
        });
      }

      res.json(result);
    });
  });
};

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
exports.deleteDocument = (req, res) => {
  const documentId = req.params.id;

  // First verify the document exists and get file path
  const checkSql = 'SELECT * FROM documents WHERE id = ?';
  
  db.query(checkSql, [documentId], (err, docResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error deleting document',
        error: err.message 
      });
    }

    if (docResult.length === 0) {
      return res.status(404).json({ 
        message: 'Document not found' 
      });
    }

    const document = docResult[0];

    // Verify the case belongs to this advocate
    const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
    
    db.query(checkCaseSql, [document.case_id, req.advocateId], (err, caseResult) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Error verifying case',
          error: err.message 
        });
      }

      if (caseResult.length === 0) {
        return res.status(404).json({ 
          message: 'Case not found or does not belong to you' 
        });
      }

      // Delete the physical file
      const filePath = path.resolve(document.file_path);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('File deletion error:', err);
          // Continue with database deletion even if file deletion fails
        }
      });

      // Delete from database
      const deleteSql = 'DELETE FROM documents WHERE id = ?';

      db.query(deleteSql, [documentId], (err, result) => {
        if (err) {
          console.error('Delete document error:', err);
          return res.status(500).json({ 
            message: 'Failed to delete document',
            error: err.message 
          });
        }

        res.json({ 
          message: 'Document deleted successfully' 
        });
      });
    });
  });
};

/**
 * Get all documents for the advocate across all cases (Global)
 * GET /api/documents/all/advocate
 */
exports.getAllDocuments = (req, res) => {
  // Fetch all documents for cases belonging to this advocate
  const sql = `
    SELECT d.*, c.case_title, c.client_name, c.case_number
    FROM documents d
    INNER JOIN cases c ON d.case_id = c.id
    WHERE c.advocate_id = ?
    ORDER BY d.uploaded_at DESC
  `;

  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      console.error('Get all documents error:', err);
      return res.status(500).json({ 
        message: 'Error fetching documents',
        error: err.message 
      });
    }

    res.json(result || []);
  });
};
