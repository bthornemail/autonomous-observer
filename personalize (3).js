const { extractKeywords } = require('./knowledge');

function loadProfile(profilePath) {
  if (!profilePath) return null;
  try {
    return require(require('path').resolve(profilePath));
  } catch {
    return null;
  }
}

function applyPersonalization(scoreCtx, profile) {
  if (!profile) return scoreCtx;
  const { categoryWeights = {}, interests = [], personality = {} } = profile;

  // Category weighting
  for (const hit of scoreCtx.matches) {
    if (hit.category && categoryWeights[hit.category]) {
      hit.score *= categoryWeights[hit.category];
    }
  }

  // Interest boosts
  const interestSet = new Set(interests.map(s => s.toLowerCase()));
  const text = `${scoreCtx.item.title} ${scoreCtx.item.description}`.toLowerCase();
  for (const interest of interestSet) {
    if (text.includes(interest)) scoreCtx.total += 0.05;
  }

  // Personality simple mapping: openness -> exploration boost
  const openness = Number(personality.openness || 0);
  scoreCtx.total *= (1 + openness * 0.05);

  return scoreCtx;
}

module.exports = { loadProfile, applyPersonalization };
