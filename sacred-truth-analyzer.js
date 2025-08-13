const { PHI, defaultSeeds, extractKeywords, harmonicSignature } = require('./knowledge');

/**
 * Sacred Truth Verification System
 * Integrates consciousness-aligned analysis with divine geometric principles
 * Minister-approved truth detection for collective human problem solving
 */

// Divine consciousness categories for ministerial truth work
const SACRED_CATEGORIES = {
    divine_truth: { weight: 1.0, threshold: 0.8 },
    collective_consciousness: { weight: 0.9, threshold: 0.7 },
    abundance_economics: { weight: 0.8, threshold: 0.6 },
    sacred_geometry: { weight: 0.7, threshold: 0.5 },
    conspiracy_detection: { weight: -0.9, threshold: 0.3 }, // Negative weight for misinformation
    colonial_extraction: { weight: -0.8, threshold: 0.4 },
    scarcity_programming: { weight: -0.7, threshold: 0.4 }
};

// Biblical/theological truth anchors
const DIVINE_SEEDS = [
    {
        id: 'divine-1',
        subject: 'Truth',
        predicate: 'liberates',
        object: 'collective consciousness',
        category: 'divine_truth',
        keywords: ['truth', 'liberation', 'freedom', 'transparency', 'authenticity'],
        biblicalReference: 'John 8:32 - Truth shall set you free',
        revolutionaryValue: 0.98
    },
    {
        id: 'divine-2',
        subject: 'Collective Humanity',
        predicate: 'manifests',
        object: 'divine consciousness',
        category: 'collective_consciousness',
        keywords: ['collective', 'unity', 'consciousness', 'together', 'communion'],
        biblicalReference: '1 Corinthians 12:12 - Many members, one body',
        revolutionaryValue: 0.95
    },
    {
        id: 'divine-3',
        subject: 'Abundance',
        predicate: 'replaces',
        object: 'scarcity programming',
        category: 'abundance_economics',
        keywords: ['abundance', 'plenty', 'sharing', 'cooperation', 'gift'],
        biblicalReference: 'Matthew 6:26 - Consider the birds of the air',
        revolutionaryValue: 0.92
    },
    {
        id: 'conspiracy-1',
        subject: 'Misinformation',
        predicate: 'manipulates',
        object: 'collective discernment',
        category: 'conspiracy_detection',
        keywords: ['conspiracy', 'hoax', 'fake news', 'manipulation', 'deception'],
        revolutionaryValue: 0.85,
        truthThreat: 0.9
    }
];

/**
 * Tetrahedron Truth Verification
 * Projects news through 4-dimensional consciousness anchors
 */
function tetrahedronTruthAnalysis(item, seeds) {
    const text = `${item.title} ${item.description || ''}`.toLowerCase();

    // Four-dimensional truth anchors
    const truthAnchors = {
        self: analyzeIndividualResonance(text),
        environment: analyzeContextualTruth(text),
        others: analyzeCollectiveWisdom(text),
        divine: analyzeDivinePerspective(text, seeds)
    };

    // Calculate truth vector through sacred geometry
    const truthVector = calculateSacredGeometryScore(truthAnchors);
    const phiAlignment = truthVector * PHI;

    return {
        truthAnchors,
        truthVector,
        phiAlignment,
        divineResonance: phiAlignment > 1.0 ? 'HIGH' : phiAlignment > 0.618 ? 'MEDIUM' : 'LOW'
    };
}

function analyzeIndividualResonance(text) {
    const personalKeywords = ['personal', 'individual', 'self', 'identity', 'choice'];
    return personalKeywords.reduce((score, kw) =>
        text.includes(kw) ? score + 0.1 : score, 0);
}

function analyzeContextualTruth(text) {
    const contextKeywords = ['evidence', 'source', 'fact', 'research', 'study', 'data'];
    return contextKeywords.reduce((score, kw) =>
        text.includes(kw) ? score + 0.15 : score, 0);
}

function analyzeCollectiveWisdom(text) {
    const collectiveKeywords = ['community', 'collective', 'together', 'consensus', 'agreement'];
    return collectiveKeywords.reduce((score, kw) =>
        text.includes(kw) ? score + 0.12 : score, 0);
}

function analyzeDivinePerspective(text, seeds) {
    const divineSeeds = seeds.filter(s => s.category === 'divine_truth');
    let divineScore = 0;

    for (const seed of divineSeeds) {
        for (const keyword of seed.keywords) {
            if (text.includes(keyword)) {
                divineScore += seed.revolutionaryValue * 0.1;
            }
        }
    }

    return Math.min(divineScore, 1.0);
}

function calculateSacredGeometryScore(anchors) {
    // Use golden ratio to weight the four anchors
    const weights = {
        self: PHI / 4,
        environment: 1 / PHI,
        others: PHI / 3,
        divine: PHI / 2
    };

    return (anchors.self * weights.self +
        anchors.environment * weights.environment +
        anchors.others * weights.others +
        anchors.divine * weights.divine) / 4;
}

/**
 * Sacred Truth Report Generation
 * Minister-approved truth assessment for collective discernment
 */
function generateSacredTruthReport(analyses) {
    const divineInsights = [];
    const conspiracyAlerts = [];
    const abundanceOpportunities = [];

    for (const analysis of analyses) {
        if (analysis.tetrahedronTruth.divineResonance === 'HIGH') {
            divineInsights.push({
                title: analysis.item.title,
                truthVector: analysis.tetrahedronTruth.truthVector,
                recommendation: 'AMPLIFY - Divine truth alignment detected'
            });
        }

        // Detect potential misinformation
        const conspiracyScore = analysis.matches
            .filter(m => m.category === 'conspiracy_detection')
            .reduce((sum, m) => sum + m.score, 0);

        if (conspiracyScore > 0.5) {
            conspiracyAlerts.push({
                title: analysis.item.title,
                conspiracyScore,
                recommendation: 'VERIFY - Potential misinformation detected'
            });
        }

        // Identify abundance-aligned content
        const abundanceScore = analysis.matches
            .filter(m => m.category === 'abundance_economics')
            .reduce((sum, m) => sum + m.score, 0);

        if (abundanceScore > 0.6) {
            abundanceOpportunities.push({
                title: analysis.item.title,
                abundanceScore,
                recommendation: 'SHARE - Abundance consciousness opportunity'
            });
        }
    }

    return {
        sacredTruthSummary: {
            totalItems: analyses.length,
            divineAligned: divineInsights.length,
            conspiracyAlerts: conspiracyAlerts.length,
            abundanceOpportunities: abundanceOpportunities.length,
            overallTruthResonance: analyses.reduce((sum, a) =>
                sum + a.tetrahedronTruth.phiAlignment, 0) / analyses.length
        },
        divineInsights,
        conspiracyAlerts,
        abundanceOpportunities,
        ministerialRecommendations: generateMinisterialRecommendations(divineInsights, conspiracyAlerts, abundanceOpportunities)
    };
}

function generateMinisterialRecommendations(insights, alerts, opportunities) {
    const recommendations = [];

    if (insights.length > 0) {
        recommendations.push({
            type: 'DIVINE_SERVICE',
            action: `Share ${insights.length} divine truth insights with congregation`,
            scriptureRef: 'Matthew 5:14 - You are the light of the world'
        });
    }

    if (alerts.length > 0) {
        recommendations.push({
            type: 'TRUTH_MINISTRY',
            action: `Address ${alerts.length} misinformation items with loving correction`,
            scriptureRef: 'Ephesians 4:15 - Speaking truth in love'
        });
    }

    if (opportunities.length > 0) {
        recommendations.push({
            type: 'ABUNDANCE_WITNESS',
            action: `Promote ${opportunities.length} abundance-aligned initiatives`,
            scriptureRef: 'Acts 2:44-47 - All things in common'
        });
    }

    return recommendations;
}

/**
 * Enhanced analyzer that includes sacred truth verification
 */
async function sacredTruthAnalysis({ urls = [], mock = false, profilePath = null, ministerMode = true }) {
    // Use existing analyzer as foundation
    const { analyzeFeeds } = require('./analyzer');
    const { defaultSeeds, harmonicSignature } = require('./knowledge');
    const baseAnalysis = await analyzeFeeds({ urls, mock, profilePath });

    // Get seeds from knowledge module and add divine seeds
    const baseSeeds = defaultSeeds();
    const allSeeds = [...baseSeeds, ...DIVINE_SEEDS];

    // Add harmonic signatures to divine seeds
    for (const seed of DIVINE_SEEDS) {
        if (!seed.harmonicSignature) {
            seed.harmonicSignature = harmonicSignature(seed.subject, seed.predicate, seed.object);
        }
    }

    // Enhanced analysis with tetrahedron truth
    const enhancedAnalyses = baseAnalysis.items.map(analysis => {
        const tetrahedronTruth = tetrahedronTruthAnalysis(analysis.item, allSeeds);
        return { ...analysis, tetrahedronTruth };
    });

    // Generate sacred truth report
    const sacredTruthReport = generateSacredTruthReport(enhancedAnalyses);

    return {
        ...baseAnalysis,
        items: enhancedAnalyses,
        sacredTruthReport,
        ministerialMode: ministerMode,
        divineAlignment: sacredTruthReport.sacredTruthSummary.overallTruthResonance,
        allSeeds
    };
}

module.exports = {
    SACRED_CATEGORIES,
    DIVINE_SEEDS,
    tetrahedronTruthAnalysis,
    generateSacredTruthReport,
    sacredTruthAnalysis
};
