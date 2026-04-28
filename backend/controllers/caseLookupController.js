const caseLookupService = require('../services/caseLookupService');
const logger = require('../src/config/logger');

/**
 * Case Lookup Controller
 * Handles API requests for Indian judicial case search
 */

/**
 * Search case by CNR number
 * POST /api/case-lookup/search/cnr
 */
exports.searchByCNR = async (req, res) => {
  try {
    let { cnr_number } = req.body;

    if (!cnr_number) {
      return res.status(400).json({
        success: false,
        message: 'CNR number is required'
      });
    }

    // Convert to uppercase for consistency
    cnr_number = cnr_number.toUpperCase().trim();

    // Validate CNR format (16 alphanumeric: 4 uppercase letters + 12 digits)
    // e.g., MHAU030080742026
    const cnrPattern = /^[A-Z]{4}[0-9]{12}$/;
    if (!cnrPattern.test(cnr_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CNR format. Must be 16 characters (4 letters + 12 digits, e.g., MHAU030080742026)'
      });
    }

    logger.info(`CNR search request: ${cnr_number}`);

    const caseData = await caseLookupService.searchByCNR(cnr_number);

    res.json({
      success: true,
      message: 'Case found',
      data: caseData
    });

  } catch (error) {
    logger.error(`CNR search error: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search case by case number
 * POST /api/case-lookup/search/case-number
 */
exports.searchByCaseNumber = async (req, res) => {
  try {
    const { case_number, court_name } = req.body;

    if (!case_number) {
      return res.status(400).json({
        success: false,
        message: 'Case number is required'
      });
    }

    logger.info(`Case number search request: ${case_number}`);

    const caseData = await caseLookupService.searchByCaseNumber(case_number, court_name);

    res.json({
      success: true,
      message: 'Case found',
      data: caseData
    });

  } catch (error) {
    logger.error(`Case number search error: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Import external case to advocate's dashboard
 * POST /api/case-lookup/import
 */
exports.importCase = async (req, res) => {
  try {
    const { cache_id, client_id, phone, email, address } = req.body;

    if (!cache_id) {
      return res.status(400).json({
        success: false,
        message: 'Cache ID is required'
      });
    }

    logger.info(`Import case request: cache_id=${cache_id}`);

    const result = await caseLookupService.importCase(req.advocateId, cache_id, {
      client_id,
      phone,
      email,
      address
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        case_id: result.case_id
      });
    } else {
      res.status(409).json({
        success: false,
        message: result.message,
        case_id: result.case_id
      });
    }

  } catch (error) {
    logger.error(`Import case error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Auto-sync case metadata
 * POST /api/case-lookup/sync/:caseId
 */
exports.syncCase = async (req, res) => {
  try {
    const caseId = req.params.caseId;

    logger.info(`Sync case request: case_id=${caseId}`);

    const result = await caseLookupService.autoSyncCase(caseId);

    res.json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    logger.error(`Sync case error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get sync history for a case
 * GET /api/case-lookup/sync-history/:caseId
 */
exports.getSyncHistory = async (req, res) => {
  try {
    const caseId = req.params.caseId;

    const sql = `
      SELECT csl.*, clc.cnr_number, clc.case_number
      FROM case_sync_log csl
      LEFT JOIN case_lookup_cache clc ON csl.case_lookup_id = clc.id
      WHERE csl.local_case_id = ?
      ORDER BY csl.synced_at DESC
    `;

    require('../config/db').query(sql, [caseId], (err, result) => {
      if (err) {
        logger.error(`Get sync history error: ${err.message}`);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch sync history'
        });
      }

      res.json({
        success: true,
        data: result
      });
    });

  } catch (error) {
    logger.error(`Get sync history error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Bulk sync all external cases
 * POST /api/case-lookup/bulk-sync
 */
exports.bulkSync = async (req, res) => {
  try {
    logger.info('Bulk sync request for all external cases');

    const sql = `
      SELECT id, cnr_number 
      FROM cases 
      WHERE advocate_id = ? 
      AND is_external_case = TRUE 
      AND cnr_number IS NOT NULL
    `;

    require('../config/db').query(sql, [req.advocateId], async (err, cases) => {
      if (err) {
        logger.error(`Bulk sync error: ${err.message}`);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch cases for sync'
        });
      }

      const results = [];
      const errors = [];

      for (const caseItem of cases) {
        try {
          const result = await caseLookupService.autoSyncCase(caseItem.id);
          results.push({
            case_id: caseItem.id,
            cnr_number: caseItem.cnr_number,
            status: 'success',
            message: result.message
          });
        } catch (error) {
          errors.push({
            case_id: caseItem.id,
            cnr_number: caseItem.cnr_number,
            status: 'error',
            message: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `Bulk sync completed: ${results.length} successful, ${errors.length} failed`,
        data: {
          synced: results,
          errors: errors
        }
      });
    });

  } catch (error) {
    logger.error(`Bulk sync error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get cached case details
 * GET /api/case-lookup/cache/:cacheId
 */
exports.getCachedCase = async (req, res) => {
  try {
    const cacheId = req.params.cacheId;

    const sql = 'SELECT * FROM case_lookup_cache WHERE id = ?';

    require('../config/db').query(sql, [cacheId], (err, result) => {
      if (err) {
        logger.error(`Get cached case error: ${err.message}`);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch cached case'
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cached case not found'
        });
      }

      res.json({
        success: true,
        data: result[0]
      });
    });

  } catch (error) {
    logger.error(`Get cached case error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Search cached cases
 * GET /api/case-lookup/cache/search?q=keyword
 */
exports.searchCachedCases = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const sql = `
      SELECT * FROM case_lookup_cache
      WHERE cnr_number LIKE ?
         OR case_number LIKE ?
         OR petitioner_name LIKE ?
         OR respondent_name LIKE ?
         OR court_name LIKE ?
      ORDER BY synced_at DESC
      LIMIT 50
    `;

    const searchValue = `%${keyword}%`;

    require('../config/db').query(
      sql,
      [searchValue, searchValue, searchValue, searchValue, searchValue],
      (err, result) => {
        if (err) {
          logger.error(`Search cached cases error: ${err.message}`);
          return res.status(500).json({
            success: false,
            message: 'Search failed'
          });
        }

        res.json({
          success: true,
          data: result,
          count: result.length
        });
      }
    );

  } catch (error) {
    logger.error(`Search cached cases error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
