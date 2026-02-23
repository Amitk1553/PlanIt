import { callMovieAgent } from './movie.agent.js';
import { callRestaurantAgent } from './restaurant.agent.js';
import { callWebSearchAgent } from './web-search.agent.js';

export const agentRegistry = {
  movie: callMovieAgent,
  restaurant: callRestaurantAgent,
  web_search: callWebSearchAgent,
};
