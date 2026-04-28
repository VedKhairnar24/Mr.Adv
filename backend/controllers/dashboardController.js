const db = require('../config/db');

/**
 * Get complete dashboard statistics for the logged-in advocate
 * GET /api/dashboard
 */
exports.getDashboard = (req, res) => {
  const advocateId = req.advocateId;
  const dashboardData = {};

  // Query 1: Total clients count
  const totalClientsQuery = 'SELECT COUNT(*) AS totalClients FROM clients WHERE advocate_id = ?';

  db.query(totalClientsQuery, [advocateId], (err, clientsResult) => {
    if (err) {
      console.error('Total clients query error:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch dashboard data',
        error: err.message 
      });
    }

    dashboardData.totalClients = clientsResult[0].totalClients || 0;

    // Query 2: Total cases count
    const totalCasesQuery = 'SELECT COUNT(*) AS totalCases FROM cases WHERE advocate_id = ?';

    db.query(totalCasesQuery, [advocateId], (err, casesResult) => {
      if (err) {
        console.error('Total cases query error:', err);
        return res.status(500).json({ 
          message: 'Failed to fetch dashboard data',
          error: err.message 
        });
      }

      dashboardData.totalCases = casesResult[0].totalCases || 0;

      // Query 3: Upcoming hearings (next 5)
      const upcomingHearingsQuery = `
        SELECT hearings.*, cases.case_title, cases.case_number
        FROM hearings
        JOIN cases ON hearings.case_id = cases.id
        WHERE cases.advocate_id = ?
        AND hearings.hearing_date >= CURDATE()
        AND hearings.status NOT IN ('Cancelled', 'Completed')
        ORDER BY hearings.hearing_date ASC, hearings.hearing_time ASC
        LIMIT 5
      `;

      db.query(upcomingHearingsQuery, [advocateId], (err, hearingsResult) => {
        if (err) {
          console.error('Upcoming hearings query error:', err);
          return res.status(500).json({ 
            message: 'Failed to fetch dashboard data',
            error: err.message 
          });
        }

        dashboardData.upcomingHearings = hearingsResult;

        // Query 4: Active cases count
        const activeCasesQuery = 'SELECT COUNT(*) AS activeCases FROM cases WHERE advocate_id = ? AND status = "Active"';

        db.query(activeCasesQuery, [advocateId], (err, activeResult) => {
          if (err) {
            console.error('Active cases query error:', err);
            return res.status(500).json({ 
              message: 'Failed to fetch dashboard data',
              error: err.message 
            });
          }

          dashboardData.activeCases = activeResult[0].activeCases || 0;

          // Query 5: Pending cases count
          const pendingCasesQuery = 'SELECT COUNT(*) AS pendingCases FROM cases WHERE advocate_id = ? AND status = "Pending"';

          db.query(pendingCasesQuery, [advocateId], (err, pendingResult) => {
            if (err) {
              console.error('Pending cases query error:', err);
              return res.status(500).json({ 
                message: 'Failed to fetch dashboard data',
                error: err.message 
              });
            }

            dashboardData.pendingCases = pendingResult[0].pendingCases || 0;

            // Query 6: Recent documents count (last 7 days)
            const recentDocsQuery = `
              SELECT COUNT(*) AS recentDocuments 
              FROM documents 
              WHERE case_id IN (SELECT id FROM cases WHERE advocate_id = ?)
              AND uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            `;

            db.query(recentDocsQuery, [advocateId], (err, docsResult) => {
              if (err) {
                console.error('Recent documents query error:', err);
                return res.status(500).json({ 
                  message: 'Failed to fetch dashboard data',
                  error: err.message 
                });
              }

              dashboardData.recentDocuments = docsResult[0].recentDocuments || 0;

              // Query 7: Total documents count (all time)
              const totalDocsQuery = `
                SELECT COUNT(*) AS totalDocuments 
                FROM documents 
                WHERE case_id IN (SELECT id FROM cases WHERE advocate_id = ?)
              `;

              db.query(totalDocsQuery, [advocateId], (err, totalDocsResult) => {
                if (err) {
                  console.error('Total documents query error:', err);
                  return res.status(500).json({ 
                    message: 'Failed to fetch dashboard data',
                    error: err.message 
                  });
                }

                dashboardData.totalDocuments = totalDocsResult[0].totalDocuments || 0;

                // Query 8: Recent cases (last 30 days)
                const recentCasesQuery = `
                  SELECT id, case_title, case_number, status, created_at
                  FROM cases
                  WHERE advocate_id = ?
                  ORDER BY created_at DESC
                  LIMIT 5
                `;

                db.query(recentCasesQuery, [advocateId], (err, recentCasesResult) => {
                  if (err) {
                    console.error('Recent cases query error:', err);
                    return res.status(500).json({ 
                      message: 'Failed to fetch dashboard data',
                      error: err.message 
                    });
                  }

                  dashboardData.recentCases = recentCasesResult;

                  // Return complete dashboard data
                  res.json(dashboardData);
                });
              });
            });
          });
        });
      });
    });
  });
};

/**
 * Get statistics by case type
 * GET /api/dashboard/case-types
 */
exports.getCaseTypeStats = (req, res) => {
  const advocateId = req.advocateId;

  const sql = `
    SELECT case_type, COUNT(*) as count
    FROM cases
    WHERE advocate_id = ?
    GROUP BY case_type
    ORDER BY count DESC
  `;

  db.query(sql, [advocateId], (err, result) => {
    if (err) {
      console.error('Case type stats error:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch case type statistics',
        error: err.message 
      });
    }

    res.json(result);
  });
};

/**
 * Get this month's activity summary
 * GET /api/dashboard/monthly-activity
 */
exports.getMonthlyActivity = (req, res) => {
  const advocateId = req.advocateId;

  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM cases WHERE advocate_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) as new_cases,
      (SELECT COUNT(*) FROM hearings WHERE case_id IN (SELECT id FROM cases WHERE advocate_id = ?) AND MONTH(hearing_date) = MONTH(CURDATE()) AND YEAR(hearing_date) = YEAR(CURDATE())) as hearings_this_month,
      (SELECT COUNT(*) FROM documents WHERE case_id IN (SELECT id FROM cases WHERE advocate_id = ?) AND MONTH(uploaded_at) = MONTH(CURDATE()) AND YEAR(uploaded_at) = YEAR(CURDATE())) as documents_uploaded
  `;

  db.query(sql, [advocateId, advocateId, advocateId], (err, result) => {
    if (err) {
      console.error('Monthly activity error:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch monthly activity',
        error: err.message 
      });
    }

    res.json(result[0]);
  });
};
