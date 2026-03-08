const db = require('../config/db');

/**
 * Create a new client
 * POST /api/clients/create
 */
exports.createClient = (req, res) => {
  const { name, phone, email, address } = req.body;

  // Validate required fields
  if (!name || !phone) {
    return res.status(400).json({ 
      message: 'Name and phone are required' 
    });
  }

  // Insert client into database
  const sql = 'INSERT INTO clients (advocate_id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)';

  db.query(sql, [req.advocateId, name, phone, email, address], (err, result) => {
    if (err) {
      console.error('Create client error:', err);
      return res.status(500).json({ 
        message: 'Client creation failed',
        error: err.message 
      });
    }

    res.status(201).json({ 
      message: 'Client added successfully',
      clientId: result.insertId
    });
  });
};

/**
 * Get all clients for the logged-in advocate
 * GET /api/clients/all
 */
exports.getClients = (req, res) => {
  const sql = 'SELECT * FROM clients WHERE advocate_id = ? ORDER BY created_at DESC';

  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      console.error('Get clients error:', err);
      return res.status(500).json({ 
        message: 'Error fetching clients',
        error: err.message 
      });
    }

    res.json(result);
  });
};

/**
 * Get single client by ID
 * GET /api/clients/:id
 */
exports.getClientById = (req, res) => {
  const clientId = req.params.id;

  const sql = 'SELECT * FROM clients WHERE id = ? AND advocate_id = ?';

  db.query(sql, [clientId, req.advocateId], (err, result) => {
    if (err) {
      console.error('Get client error:', err);
      return res.status(500).json({ 
        message: 'Error fetching client',
        error: err.message 
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ 
        message: 'Client not found' 
      });
    }

    res.json(result[0]);
  });
};

/**
 * Update client information
 * PUT /api/clients/:id
 */
exports.updateClient = (req, res) => {
  const clientId = req.params.id;
  const { name, phone, email, address } = req.body;

  // Validate that client belongs to this advocate
  const checkSql = 'SELECT * FROM clients WHERE id = ? AND advocate_id = ?';
  
  db.query(checkSql, [clientId, req.advocateId], (err, checkResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error updating client',
        error: err.message 
      });
    }

    if (checkResult.length === 0) {
      return res.status(404).json({ 
        message: 'Client not found' 
      });
    }

    // Update client data
    const updateSql = 'UPDATE clients SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?';

    db.query(updateSql, [name, phone, email, address, clientId], (err, result) => {
      if (err) {
        console.error('Update client error:', err);
        return res.status(500).json({ 
          message: 'Failed to update client',
          error: err.message 
        });
      }

      res.json({ 
        message: 'Client updated successfully' 
      });
    });
  });
};

/**
 * Delete a client
 * DELETE /api/clients/:id
 */
exports.deleteClient = (req, res) => {
  const clientId = req.params.id;

  // First verify the client belongs to this advocate
  const checkSql = 'SELECT * FROM clients WHERE id = ? AND advocate_id = ?';
  
  db.query(checkSql, [clientId, req.advocateId], (err, checkResult) => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error deleting client',
        error: err.message 
      });
    }

    if (checkResult.length === 0) {
      return res.status(404).json({ 
        message: 'Client not found' 
      });
    }

    // Delete the client (CASCADE will delete related cases, documents, etc.)
    const deleteSql = 'DELETE FROM clients WHERE id = ?';

    db.query(deleteSql, [clientId], (err, result) => {
      if (err) {
        console.error('Delete client error:', err);
        return res.status(500).json({ 
          message: 'Failed to delete client',
          error: err.message 
        });
      }

      res.json({ 
        message: 'Client deleted successfully' 
      });
    });
  });
};

/**
 * Get total client count for the logged-in advocate
 * GET /api/clients/count
 */
exports.getClientCount = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM clients WHERE advocate_id = ?';
  
  db.query(sql, [req.advocateId], (err, result) => {
    if (err) {
      console.error('Get client count error:', err);
      return res.status(500).json({ 
        message: 'Error fetching client count',
        error: err.message 
      });
    }

    res.json({ count: result[0].count });
  });
};
