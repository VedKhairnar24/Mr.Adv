const axios = require('axios');
const db = require('../config/db');
const logger = require('../src/config/logger');

/**
 * Case Lookup Service
 * Integrates with Indian judicial databases (eCourts, NJDG)
 * for public case information retrieval
 */

class CaseLookupService {
  /**
   * Search case by CNR number
   * CNR (Case Number Record) is a unique 16-digit identifier
   * @param {string} cnrNumber - CNR number to search
   * @returns {Promise<Object>} Case details
   */
  async searchByCNR(cnrNumber) {
    try {
      logger.info(`Searching case by CNR: ${cnrNumber}`);

      // Check cache first
      const cached = await this.getFromCache({ cnr_number: cnrNumber });
      if (cached && (Date.now() - new Date(cached.synced_at).getTime()) < 24 * 60 * 60 * 1000) {
        logger.info('Returning cached result');
        return { ...cached, cache_id: cached.id, source: 'cache' };
      }

      // Fetch from external API (eCourts/NJDG)
      const externalData = await this.fetchFromExternalAPI('cnr', cnrNumber);

      if (externalData) {
        // Save to cache
        const cacheId = await this.saveToCache(externalData);
        return { ...externalData, cache_id: cacheId, source: 'external' };
      }

      // Fallback to mock data for development
      const mockData = this.generateMockData('cnr', cnrNumber);
      const cacheId = await this.saveToCache(mockData);
      return { ...mockData, cache_id: cacheId, source: 'mock' };

    } catch (error) {
      logger.error(`Error searching by CNR: ${error.message}`);
      throw new Error(`Failed to search case by CNR: ${error.message}`);
    }
  }

  /**
   * Search case by case number
   * @param {string} caseNumber - Case number (e.g., CS/1234/2024)
   * @param {string} courtName - Court name (optional but recommended)
   * @returns {Promise<Object>} Case details
   */
  async searchByCaseNumber(caseNumber, courtName = '') {
    try {
      logger.info(`Searching case by number: ${caseNumber}`);

      // Check cache first
      const cached = await this.getFromCache({ case_number: caseNumber, court_name: courtName });
      if (cached && (Date.now() - new Date(cached.synced_at).getTime()) < 24 * 60 * 60 * 1000) {
        logger.info('Returning cached result');
        return { ...cached, cache_id: cached.id, source: 'cache' };
      }

      // Fetch from external API
      const externalData = await this.fetchFromExternalAPI('case_number', caseNumber, courtName);

      if (externalData) {
        const cacheId = await this.saveToCache(externalData);
        return { ...externalData, cache_id: cacheId, source: 'external' };
      }

      // Fallback to mock data
      const mockData = this.generateMockData('case_number', caseNumber, courtName);
      const cacheId = await this.saveToCache(mockData);
      return { ...mockData, cache_id: cacheId, source: 'mock' };

    } catch (error) {
      logger.error(`Error searching by case number: ${error.message}`);
      throw new Error(`Failed to search case by number: ${error.message}`);
    }
  }

  /**
   * Fetch case details from external judicial API
   * @param {string} searchType - 'cnr' or 'case_number'
   * @param {string} searchValue - Search value
   * @param {string} courtName - Court name (optional)
   * @returns {Promise<Object|null>} Case data
   */
  async fetchFromExternalAPI(searchType, searchValue, courtName = '') {
    try {
      // NOTE: This is where you would integrate with actual Indian judicial APIs
      // eCourts Services: https://ecourts.gov.in/
      // National Judicial Data Grid: https://njdg.ecourts.gov.in/
      
      // For production, you would need:
      // 1. API access credentials from eCourts
      // 2. Proper API endpoints and authentication
      // 3. Rate limiting and error handling

      // Example integration (commented - requires actual API access):
      /*
      const response = await axios.post('https://api.ecourts.gov.in/case-search', {
        search_type: searchType,
        search_value: searchValue,
        court_name: courtName,
        api_key: process.env.ECOURTS_API_KEY
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ECOURTS_API_TOKEN}`
        },
        timeout: 10000
      });

      return this.normalizeExternalData(response.data);
      */

      // Return null to trigger mock data fallback
      return null;

    } catch (error) {
      logger.warn(`External API fetch failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Normalize external API data to our format
   * @param {Object} rawData - Raw API response
   * @returns {Object} Normalized data
   */
  normalizeExternalData(rawData) {
    return {
      cnr_number: rawData.cnrNumber || rawData.CNR_NO,
      case_number: rawData.caseNumber || rawData.CASE_NO,
      case_type: rawData.caseType || rawData.CASE_TYPE,
      case_status: rawData.caseStatus || rawData.CASE_STATUS,
      court_name: rawData.courtName || rawData.COURT_NAME,
      court_district: rawData.district || rawData.DISTRICT,
      court_state: rawData.state || rawData.STATE,
      filing_date: rawData.filingDate || rawData.FILING_DATE,
      registration_date: rawData.registrationDate || rawData.REG_DATE,
      case_category: rawData.category || rawData.CATEGORY,
      acting_label: rawData.actingLabel || '',
      petitioner_name: rawData.petitioner || rawData.PETITIONER,
      respondent_name: rawData.respondent || rawData.RESPONDENT,
      advocate_name: rawData.advocate || rawData.ADVOCATE,
      judge_name: rawData.judge || rawData.JUDGE,
      next_hearing_date: rawData.nextHearing || rawData.NEXT_HEARING_DATE,
      last_hearing_date: rawData.lastHearing || rawData.LAST_HEARING_DATE,
      case_description: rawData.description || rawData.DESCRIPTION,
      proceedings: rawData.proceedings || '',
      // Expected public payload (when available): list of hearings/orders.
      // Keeping both keys allows different upstream formats.
      hearings: rawData.hearings || rawData.HEARINGS || [],
      orders: rawData.orders || rawData.ORDERS || [],
      raw_response: rawData
    };
  }

  /**
   * Generate mock data for development/testing
   * @param {string} searchType - Search type
   * @param {string} searchValue - Search value
   * @param {string} courtName - Court name
   * @returns {Object} Mock case data
   */
  generateMockData(searchType, searchValue, courtName = '') {
    const mockCases = {
      'MHAU030080742026': {
        cnr_number: 'MHAU030080742026',
        case_number: 'CS/1234/2024',
        case_type: 'Civil Suit',
        case_status: 'Pending',
        court_name: 'District Court - Mumbai',
        court_district: 'Mumbai',
        court_state: 'Maharashtra',
        filing_date: '2024-01-15',
        registration_date: '2024-01-16',
        case_category: 'Property Dispute',
        acting_label: 'Civil',
        petitioner_name: 'Rajesh Kumar',
        respondent_name: 'Amit Sharma',
        advocate_name: 'Adv. Suresh Menon',
        judge_name: 'Justice R.K. Desai',
        next_hearing_date: '2026-05-15',
        last_hearing_date: '2026-03-20',
        case_description: 'Property dispute regarding boundary demarcation between adjacent plots',
        proceedings: 'Arguments heard, evidence submission pending',
        hearings: [
          {
            hearing_id: 'MHAU030080742026-2026-03-20',
            hearing_date: '2026-03-20',
            hearing_time: '10:30:00',
            court_name: 'District Court - Mumbai',
            court_hall: 'Court Hall A',
            judge_name: 'Justice R.K. Desai',
            stage: 'Evidence',
            status: 'Adjourned',
            listing_type: 'Regular',
          },
          {
            hearing_id: 'MHAU030080742026-2026-05-15',
            hearing_date: '2026-05-15',
            hearing_time: '10:30:00',
            court_name: 'District Court - Mumbai',
            court_hall: 'Court Hall A',
            judge_name: 'Justice R.K. Desai',
            stage: 'Evidence',
            status: 'Scheduled',
            listing_type: 'Regular',
          }
        ],
        orders: [
          {
            order_id: 'MHAU030080742026-ORDER-2026-03-20',
            order_date: '2026-03-20',
            summary: 'Matter adjourned. Next date fixed for 15/05/2026.',
            document_url: null
          }
        ]
      },
      'DLHI040090852025': {
        cnr_number: 'DLHI040090852025',
        case_number: 'CR/5678/2024',
        case_type: 'Criminal Case',
        case_status: 'Active',
        court_name: 'Sessions Court - Delhi',
        court_district: 'New Delhi',
        court_state: 'Delhi',
        filing_date: '2024-02-20',
        registration_date: '2024-02-21',
        case_category: 'Bail Application',
        acting_label: 'Criminal',
        petitioner_name: 'State of Delhi',
        respondent_name: 'Priya Singh',
        advocate_name: 'Adv. Ramesh Gupta',
        judge_name: 'Justice S.M. Khan',
        next_hearing_date: '2026-05-10',
        last_hearing_date: '2026-04-01',
        case_description: 'Bail application in criminal case under Section 498A',
        proceedings: 'Evidence examination in progress',
        hearings: [
          {
            hearing_id: 'DLHI040090852025-2026-04-01',
            hearing_date: '2026-04-01',
            hearing_time: '14:00:00',
            court_name: 'Sessions Court - Delhi',
            court_hall: 'Court Hall B',
            judge_name: 'Justice S.M. Khan',
            stage: 'Argument',
            status: 'Adjourned',
            listing_type: 'Regular',
          },
          {
            hearing_id: 'DLHI040090852025-2026-05-10',
            hearing_date: '2026-05-10',
            hearing_time: '14:00:00',
            court_name: 'Sessions Court - Delhi',
            court_hall: 'Court Hall B',
            judge_name: 'Justice S.M. Khan',
            stage: 'Argument',
            status: 'Scheduled',
            listing_type: 'Urgent',
          }
        ],
        orders: []
      },
      'CS/5678/2024': {
        cnr_number: 'DLHI040090852025',
        case_number: 'CS/5678/2024',
        case_type: 'Civil Suit',
        case_status: 'Active',
        court_name: courtName || 'High Court of Delhi',
        court_district: 'New Delhi',
        court_state: 'Delhi',
        filing_date: '2024-02-20',
        registration_date: '2024-02-21',
        case_category: 'Contract Dispute',
        acting_label: 'Civil',
        petitioner_name: 'M/s ABC Corporation',
        respondent_name: 'XYZ Enterprises',
        advocate_name: 'Adv. Priya Singh',
        judge_name: 'Justice S.M. Khan',
        next_hearing_date: '2026-05-10',
        last_hearing_date: '2026-04-01',
        case_description: 'Breach of contract claim for supply agreement violation',
        proceedings: 'Evidence examination in progress',
        hearings: [
          {
            hearing_id: 'DLHI040090852025-2026-05-10',
            hearing_date: '2026-05-10',
            hearing_time: '11:00:00',
            court_name: courtName || 'High Court of Delhi',
            court_hall: 'Court Room 3',
            judge_name: 'Justice S.M. Khan',
            stage: 'Evidence',
            status: 'Scheduled',
            listing_type: 'Regular',
          }
        ],
        orders: []
      }
    };

    // Return matching mock data or generate generic response
    return mockCases[searchValue] || {
      cnr_number: searchType === 'cnr' ? searchValue : `${courtName.substring(0, 4).toUpperCase().replace(/\s/g, '')}${Date.now().toString().slice(-12)}`,
      case_number: searchType === 'case_number' ? searchValue : `CS/${Math.floor(Math.random() * 9999)}/2024`,
      case_type: 'Civil Suit',
      case_status: 'Pending',
      court_name: courtName || 'District Court - Test City',
      court_district: 'Test District',
      court_state: 'Test State',
      filing_date: '2024-03-01',
      registration_date: '2024-03-02',
      case_category: 'General Civil',
      acting_label: 'Civil',
      petitioner_name: 'Test Petitioner',
      respondent_name: 'Test Respondent',
      advocate_name: 'Test Advocate',
      judge_name: 'Test Judge',
      next_hearing_date: '2026-06-01',
      last_hearing_date: '2026-04-15',
      case_description: 'Test case description for demonstration',
      proceedings: 'Initial proceedings',
      hearings: [
        {
          hearing_id: `${searchValue}-NEXT`,
          hearing_date: '2026-06-01',
          hearing_time: '10:00:00',
          court_name: courtName || 'District Court - Test City',
          court_hall: 'Court Hall 1',
          judge_name: 'Test Judge',
          stage: 'Filing',
          status: 'Scheduled',
          listing_type: 'Regular'
        }
      ],
      orders: []
    };
  }

  /**
   * Save case data to cache
   * @param {Object} caseData - Case data to cache
   * @returns {Promise<number>} Cache record ID
   */
  async saveToCache(caseData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO case_lookup_cache (
          cnr_number, case_number, case_type, case_status,
          court_name, court_district, court_state,
          filing_date, registration_date, case_category,
          acting_label, petitioner_name, respondent_name,
          advocate_name, judge_name, next_hearing_date,
          last_hearing_date, case_description, proceedings,
          raw_response
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          case_status = VALUES(case_status),
          court_name = VALUES(court_name),
          filing_date = VALUES(filing_date),
          petitioner_name = VALUES(petitioner_name),
          respondent_name = VALUES(respondent_name),
          next_hearing_date = VALUES(next_hearing_date),
          last_hearing_date = VALUES(last_hearing_date),
          case_description = VALUES(case_description),
          proceedings = VALUES(proceedings),
          raw_response = VALUES(raw_response),
          synced_at = CURRENT_TIMESTAMP
      `;

      const values = [
        caseData.cnr_number,
        caseData.case_number,
        caseData.case_type,
        caseData.case_status,
        caseData.court_name,
        caseData.court_district,
        caseData.court_state,
        caseData.filing_date,
        caseData.registration_date,
        caseData.case_category,
        caseData.acting_label,
        caseData.petitioner_name,
        caseData.respondent_name,
        caseData.advocate_name,
        caseData.judge_name,
        caseData.next_hearing_date,
        caseData.last_hearing_date,
        caseData.case_description,
        caseData.proceedings,
        JSON.stringify(caseData.raw_response || caseData)
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          logger.error(`Error saving to cache: ${err.message}`);
          return reject(err);
        }
        // mysql returns insertId=0 for ON DUPLICATE KEY UPDATE
        if (result && result.insertId) return resolve(result.insertId);

        // Find existing row id (prefer cnr_number, else case_number + court_name)
        const cnr = caseData.cnr_number;
        const caseNo = caseData.case_number;
        const court = caseData.court_name || null;

        if (cnr) {
          return db.query(
            'SELECT id FROM case_lookup_cache WHERE cnr_number = ? ORDER BY synced_at DESC LIMIT 1',
            [cnr],
            (e2, r2) => {
              if (e2) return reject(e2);
              resolve(r2 && r2[0] ? r2[0].id : null);
            }
          );
        }

        return db.query(
          'SELECT id FROM case_lookup_cache WHERE case_number = ? AND (? IS NULL OR court_name = ?) ORDER BY synced_at DESC LIMIT 1',
          [caseNo, court, court],
          (e2, r2) => {
            if (e2) return reject(e2);
            resolve(r2 && r2[0] ? r2[0].id : null);
          }
        );
      });
    });
  }

  /**
   * Get case from cache
   * @param {Object} params - Search parameters
   * @returns {Promise<Object|null>} Cached case data
   */
  async getFromCache(params) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM case_lookup_cache WHERE 1=1';
      const values = [];

      if (params.id) {
        sql += ' AND id = ?';
        values.push(params.id);
      }

      if (params.cnr_number) {
        sql += ' AND cnr_number = ?';
        values.push(params.cnr_number);
      }

      if (params.case_number) {
        sql += ' AND case_number = ?';
        values.push(params.case_number);
      }

      if (params.court_name) {
        sql += ' AND court_name = ?';
        values.push(params.court_name);
      }

      sql += ' ORDER BY synced_at DESC LIMIT 1';

      db.query(sql, values, (err, result) => {
        if (err) {
          logger.error(`Error fetching from cache: ${err.message}`);
          return reject(err);
        }
        resolve(result.length > 0 ? result[0] : null);
      });
    });
  }

  /**
   * Import external case to advocate's case list
   * @param {number} advocateId - Advocate ID
   * @param {number} cacheId - Cache record ID
   * @param {Object} additionalData - Additional case data (client_id, etc.)
   * @returns {Promise<Object>} Import result
   */
  async importCase(advocateId, cacheId, additionalData = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Fetch cached data
        const cacheData = await this.getFromCache({ id: cacheId });
        
        if (!cacheData) {
          return reject(new Error('Case data not found in cache'));
        }

        // Check if case already exists
        const existingCase = await this.checkExistingCase(cacheData.cnr_number);
        
        if (existingCase) {
          return resolve({ 
            success: false, 
            message: 'Case already exists in your dashboard',
            case_id: existingCase.id 
          });
        }

        // Create or get client
        let clientId = additionalData.client_id;
        
        if (!clientId && cacheData.petitioner_name) {
          clientId = await this.getOrCreateClient(
            advocateId, 
            cacheData.petitioner_name,
            additionalData
          );
        }

        if (!clientId) {
          return reject(new Error('Client ID is required'));
        }

        // Create case
        const caseId = await this.createLocalCase({
          advocate_id: advocateId,
          client_id: clientId,
          cnr_number: cacheData.cnr_number,
          case_number: cacheData.case_number,
          case_title: `${cacheData.petitioner_name} v. ${cacheData.respondent_name}`,
          court_name: cacheData.court_name,
          case_type: cacheData.case_type,
          case_status: cacheData.case_status,
          filing_date: cacheData.filing_date,
          is_external_case: true,
          external_case_id: cacheId
        });

        // Log the import
        await this.logSync(advocateId, cacheId, caseId, 'IMPORT', 'SUCCESS');

        resolve({
          success: true,
          message: 'Case imported successfully',
          case_id: caseId
        });

      } catch (error) {
        logger.error(`Error importing case: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * Check if case already exists locally
   * @param {string} cnrNumber - CNR number
   * @returns {Promise<Object|null>} Existing case
   */
  async checkExistingCase(cnrNumber) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id FROM cases WHERE cnr_number = ? AND is_external_case = TRUE';
      
      db.query(sql, [cnrNumber], (err, result) => {
        if (err) return reject(err);
        resolve(result.length > 0 ? result[0] : null);
      });
    });
  }

  /**
   * Get or create client for the case
   * @param {number} advocateId - Advocate ID
   * @param {string} clientName - Client name
   * @param {Object} additionalData - Additional client data
   * @returns {Promise<number>} Client ID
   */
  async getOrCreateClient(advocateId, clientName, additionalData = {}) {
    return new Promise((resolve, reject) => {
      // Check if client exists
      const checkSql = 'SELECT id FROM clients WHERE name = ? AND advocate_id = ?';
      
      db.query(checkSql, [clientName, advocateId], (err, result) => {
        if (err) return reject(err);
        
        if (result.length > 0) {
          return resolve(result[0].id);
        }

        // Create new client
        const insertSql = `
          INSERT INTO clients (advocate_id, name, phone, email, address)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          insertSql,
          [
            advocateId,
            clientName,
            additionalData.phone || null,
            additionalData.email || null,
            additionalData.address || null
          ],
          (err, insertResult) => {
            if (err) return reject(err);
            resolve(insertResult.insertId);
          }
        );
      });
    });
  }

  /**
   * Create local case record
   * @param {Object} caseData - Case data
   * @returns {Promise<number>} Case ID
   */
  async createLocalCase(caseData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO cases (
          client_id, advocate_id, case_title, case_number, cnr_number,
          court_name, case_type, status, filing_date,
          is_external_case, external_case_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          caseData.client_id,
          caseData.advocate_id,
          caseData.case_title,
          caseData.case_number,
          caseData.cnr_number,
          caseData.court_name,
          caseData.case_type,
          caseData.case_status || 'Pending',
          caseData.filing_date,
          caseData.is_external_case,
          caseData.external_case_id
        ],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);
        }
      );
    });
  }

  /**
   * Log sync operation
   * @param {number} advocateId - Advocate ID
   * @param {number} caseLookupId - Case lookup cache ID
   * @param {number} localCaseId - Local case ID
   * @param {string} syncType - Sync type
   * @param {string} syncStatus - Sync status
   */
  async logSync(advocateId, caseLookupId, localCaseId, syncType, syncStatus) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO case_sync_log 
        (advocate_id, case_lookup_id, local_case_id, sync_type, sync_status)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(sql, [advocateId, caseLookupId, localCaseId, syncType, syncStatus], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Auto-sync case metadata from external source
   * @param {number} caseId - Local case ID
   * @returns {Promise<Object>} Sync result
   */
  async autoSyncCase(caseId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get case details
        const caseData = await this.getLocalCase(caseId);
        
        if (!caseData || !caseData.cnr_number) {
          return reject(new Error('Case not found or missing CNR number'));
        }

        // Fetch latest data from external source
        const freshData = await this.searchByCNR(caseData.cnr_number);

        // Update local case
        const updateSql = `
          UPDATE cases
          SET 
            status = ?,
            last_synced_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        db.query(updateSql, [freshData.case_status, caseId], (err) => {
          if (err) return reject(err);
          
          // Log sync
          this.logSync(
            caseData.advocate_id,
            freshData.cache_id,
            caseId,
            'AUTO_SYNC',
            'SUCCESS'
          );

          resolve({
            success: true,
            message: 'Case synced successfully',
            updated_status: freshData.case_status
          });
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get local case details
   * @param {number} caseId - Case ID
   * @returns {Promise<Object>} Case data
   */
  async getLocalCase(caseId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM cases WHERE id = ?';
      
      db.query(sql, [caseId], (err, result) => {
        if (err) return reject(err);
        resolve(result.length > 0 ? result[0] : null);
      });
    });
  }
}

module.exports = new CaseLookupService();
