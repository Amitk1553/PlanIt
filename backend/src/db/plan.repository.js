import { prisma } from '../config/prisma.js';

const DEFAULT_USER_EMAIL = 'planner+demo@example.com';

const ensureDefaultUser = async () => {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_USER_EMAIL,
      passwordHash: 'demo-hash',
    },
  });

  return user.id;
};

const resolveUserId = async (userId) => {
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error(`User ${userId} not found`);
      error.status = 404;
      throw error;
    }
    return userId;
  }

  return ensureDefaultUser();
};

export const planRepository = {
  async savePlan({ userId, prompt, location, aggregatedPlan, agentResults }) {
    const resolvedUserId = await resolveUserId(userId);

    const task = await prisma.task.create({
      data: {
        userId: resolvedUserId,
        prompt,
        location,
        aggregatedPlan,
        results: {
          create: agentResults.map((result) => ({
            agentType: result.agent,
            payload: result.error ? { error: result.error } : result.data,
          })),
        },
      },
      include: {
        results: true,
      },
    });

    return task;
  },
};
