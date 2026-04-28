const HearingPrepAssistantService = require('../services/hearingPrepAssistantService');
const logger = require('../config/logger');

class HearingPrepController {
  static async caseSummary(req, res) {
    try {
      const advocateId = req.advocateId || req.user?.id;
      const caseId = req.params.caseId;
      const result = await HearingPrepAssistantService.generateCaseSummary({ advocateId, caseId });
      if (!result) return res.status(404).json({ success: false, message: 'Case not found or access denied' });
      return res.json({ success: true, data: result });
    } catch (error) {
      logger.error('HearingPrep caseSummary error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate case summary' });
    }
  }

  static async briefing(req, res) {
    try {
      const advocateId = req.advocateId || req.user?.id;
      const caseId = req.params.caseId;
      const result = await HearingPrepAssistantService.generateHearingPrepBriefing({ advocateId, caseId });
      if (!result) return res.status(404).json({ success: false, message: 'Case not found or access denied' });
      return res.json({ success: true, data: result });
    } catch (error) {
      logger.error('HearingPrep briefing error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate hearing prep briefing' });
    }
  }

  static async arguments(req, res) {
    try {
      const advocateId = req.advocateId || req.user?.id;
      const caseId = req.params.caseId;
      const result = await HearingPrepAssistantService.generateSuggestedArguments({ advocateId, caseId });
      if (!result) return res.status(404).json({ success: false, message: 'Case not found or access denied' });
      return res.json({ success: true, data: result });
    } catch (error) {
      logger.error('HearingPrep arguments error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate suggested arguments' });
    }
  }

  static async missingDocs(req, res) {
    try {
      const advocateId = req.advocateId || req.user?.id;
      const caseId = req.params.caseId;
      const result = await HearingPrepAssistantService.generateMissingDocumentChecklist({ advocateId, caseId });
      if (!result) return res.status(404).json({ success: false, message: 'Case not found or access denied' });
      return res.json({ success: true, data: result });
    } catch (error) {
      logger.error('HearingPrep missingDocs error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate missing document checklist' });
    }
  }

  static async bePreparedTomorrow(req, res) {
    try {
      const advocateId = req.advocateId || req.user?.id;
      const caseId = req.params.caseId;
      const result = await HearingPrepAssistantService.generateBePreparedTomorrow({ advocateId, caseId });
      if (!result) return res.status(404).json({ success: false, message: 'Case not found or access denied' });
      return res.json({ success: true, data: result });
    } catch (error) {
      logger.error('HearingPrep bePreparedTomorrow error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate tomorrow preparation assistant' });
    }
  }

  static async preHearingSummary(req, res) {
    try {
      const advocateId = req.advocateId || req.user?.id;
      const caseId = req.params.caseId;
      const result = await HearingPrepAssistantService.generatePreHearingNotificationSummary({ advocateId, caseId });
      if (!result) return res.status(404).json({ success: false, message: 'Case not found or access denied' });
      return res.json({ success: true, data: result });
    } catch (error) {
      logger.error('HearingPrep preHearingSummary error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate pre-hearing summary' });
    }
  }
}

module.exports = HearingPrepController;

