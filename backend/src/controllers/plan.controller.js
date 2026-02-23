import { CONTROLLED_LOCATION_PROMPT, plannerService } from '../services/planner.service.js';
import { aggregatorService } from '../services/aggregator.service.js';
import { planRepository } from '../db/plan.repository.js';
import { sanitizeLocation, sanitizeDate } from '../utils/request.util.js';

export const planController = {
  async createPlan(req, res) {
    const { prompt, userId, location, date } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'A prompt string is required.',
      });
    }

    const normalizedLocation = sanitizeLocation(location);
    const normalizedDate = sanitizeDate(date);

    if (date && !normalizedDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Provide an ISO 8601 string (e.g. 2026-02-22).',
      });
    }

    const plan = await plannerService.extractPlan({
      prompt,
      locationOverride: normalizedLocation,
    });

    const agentResults = await aggregatorService.executeAgents({
      location: plan.location,
      subtasks: plan.subtasks,
      prompt,
      eventDate: normalizedDate,
    });

    const aggregatedPlan = {
      location: plan.location,
      subtasks: plan.subtasks,
      results: agentResults,
      eventDate: normalizedDate,
    };

    const record = await planRepository.savePlan({
      userId,
      prompt,
      location: plan.location,
      aggregatedPlan,
      agentResults,
    });

    return res.status(201).json({
      requestId: record.id,
      location: plan.location,
      subtasks: plan.subtasks,
      results: agentResults,
      eventDate: normalizedDate,
      locationPrompt: CONTROLLED_LOCATION_PROMPT,
    });
  },
};
