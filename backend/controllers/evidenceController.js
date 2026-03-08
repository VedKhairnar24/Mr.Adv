const db = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Upload evidence for a case
 * POST /api/evidence/upload
 */
exports.uploadEvidence = (req, res) => {
  const { case_id, evidence_type, description } = req.body;
  const file = req.file;

  // Validate required fields
  if (!case_id) {
    return res.status(400).json({ 
      message: 'Case ID is required' 
    });
  }

  if (!evidence_type) {
    return res.status(400).json({ 
      message: 'Evidence type is required' 
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

    // Insert evidence into database
    const sql = 'INSERT INTO evidence (case_id, evidence_type, description, file_path, file_name) VALUES (?, ?, ?, ?, ?)';

    db.query(
      sql,
      [case_id, evidence_type, description || '', file.path, file.originalname],
      (err, result) => {
        if (err) {
          console.error('Upload evidence error:', err);
          return res.status(500).json({ 
            message: 'Evidence upload failed',
            error: err.message 
          });
        }

        res.status(201).json({ 
          message: 'Evidence uploaded successfully',
          evidenceId: result.insertId,
          fileName: file.originalname,
          filePath: file.path
        });
      }
    );
  });
};

/**
 * Get all evidence for a specific case
 * GET /api/evidence/:caseId
 */
exports.getEvidence = (req, res) => {
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

    // Fetch evidence for the case
    const sql = 'SELECT * FROM evidence WHERE case_id = ? ORDER BY uploaded_at DESC';

    db.query(sql, [caseId], (err, result) => {
      if (err) {
        console.error('Get evidence error:', err);
        return res.status(500).json({ 
          message: 'Error fetching evidence',
          error: err.message 
        });
      }

      res.json(result);
    });
  });
};

/**
 * Delete evidence
 * DELETE /api/evidence/:id
 */
exports.deleteEvidence = (req, res) => {
  const evidenceId = req.params.id;

  // First verify the evidence exists and get file path
  const checkSql = 'SELECT * FROM evidence WHERE id = ?';
  
  db.query(checkSql, [evidenceId], (err, evidenceResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error deleting evidence',
        error: err.message 
      });
    }

    if (evidenceResult.length === 0) {
      return res.status(404).json({ 
        message: 'Evidence not found' 
      });
    }

    const evidence = evidenceResult[0];

    // Verify the case belongs to this advocate
    const checkCaseSql = 'SELECT id FROM cases WHERE id = ? AND advocate_id = ?';
    
    db.query(checkCaseSql, [evidence.case_id, req.advocateId], (err, caseResult) => {
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
      const filePath = path.resolve(evidence.file_path);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('File deletion error:', err);
          // Continue with database deletion even if file deletion fails
        }
      });

      // Delete from database
      const deleteSql = 'DELETE FROM evidence WHERE id = ?';

      db.query(deleteSql, [evidenceId], (err, result) => {
        if (err) {
          console.error('Delete evidence error:', err);
          return res.status(500).json({ 
            message: 'Failed to delete evidence',
            error: err.message 
          });
        }

        res.json({ 
          message: 'Evidence deleted successfully' 
        });
      });
    });
  });
};
