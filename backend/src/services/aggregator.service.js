import { agentRegistry } from '../agents/index.js';

export const aggregatorService = {
  async executeAgents({ location, subtasks, prompt, eventDate }) {
    if (!Array.isArray(subtasks) || !subtasks.length) {
      return [];
    }

    const operations = subtasks.map((taskName) => {
      const agentFn = agentRegistry[taskName];

      if (!agentFn) {
        return Promise.resolve({
          agent: taskName,
          error: 'Unsupported agent type',
        });
      }

      return agentFn({ location, prompt, eventDate }).catch((error) => ({
        agent: taskName,
        error: error.message || 'Agent execution failed',
      }));
    });

    return Promise.all(operations);
  },
};
