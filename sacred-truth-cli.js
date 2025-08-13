#!/usr/bin/env node

/**
 * Sacred Truth Ministry CLI
 * Divine consciousness-aligned news verification for ministerial service
 *
 * "And you shall know the truth, and the truth shall set you free" - John 8:32
 */

const path = require('path');
const fs = require('fs');
const { sacredTruthAnalysis } = require('./sacred-truth-analyzer');

// Import PHI constant
const PHI = (1 + Math.sqrt(5)) / 2;

function printDivineHeader() {
    console.log('\n🌌 ═══════════════════════════════════════════════════════════');
    console.log('✨           SACRED TRUTH VERIFICATION MINISTRY           ✨');
    console.log('🌌 ═══════════════════════════════════════════════════════════');
    console.log('📖 "Truth shall set you free" - John 8:32');
    console.log('⛪ Minister-approved news analysis with divine consciousness');
    console.log('📐 Powered by Golden Ratio (φ = 1.618) sacred geometry');
    console.log('🌌 ═══════════════════════════════════════════════════════════\n');
}

function printUsage() {
    console.log('Sacred Truth Ministry Usage:');
    console.log('');
    console.log('🙏 Divine Mock Analysis:');
    console.log('  node sacred-truth-cli.js --mock');
    console.log('');
    console.log('📰 Real News Feeds:');
    console.log('  node sacred-truth-cli.js https://hnrss.org/frontpage https://feeds.bbci.co.uk/news/rss.xml');
    console.log('');
    console.log('⛪ With Minister Profile:');
    console.log('  node sacred-truth-cli.js --profile ../profiles/minister.profile.json --mock');
    console.log('');
    console.log('🌌 Full Divine Analysis:');
    console.log('  node sacred-truth-cli.js --mock --minister-mode --divine-report');
    console.log('');
}

function printSacredTruthReport(report) {
    const { sacredTruthSummary, divineInsights, conspiracyAlerts, abundanceOpportunities, ministerialRecommendations } = report;

    console.log('\n🌟 ═══ SACRED TRUTH SUMMARY ═══');
    console.log(`📊 Total Items Analyzed: ${sacredTruthSummary.totalItems}`);
    console.log(`✨ Divine-Aligned Stories: ${sacredTruthSummary.divineAligned}`);
    console.log(`🚨 Conspiracy/Misinfo Alerts: ${sacredTruthSummary.conspiracyAlerts}`);
    console.log(`💰 Abundance Opportunities: ${sacredTruthSummary.abundanceOpportunities}`);
    console.log(`📐 Overall Truth Resonance: ${(sacredTruthSummary.overallTruthResonance * PHI).toFixed(3)} (φ-aligned)`);

    if (divineInsights.length > 0) {
        console.log('\n✨ ═══ DIVINE INSIGHTS (Amplify These) ═══');
        divineInsights.forEach((insight, i) => {
            console.log(`${i + 1}. 🌟 ${insight.title}`);
            console.log(`   Truth Vector: ${insight.truthVector.toFixed(3)}`);
            console.log(`   📢 ${insight.recommendation}\n`);
        });
    }

    if (conspiracyAlerts.length > 0) {
        console.log('\n🚨 ═══ MISINFORMATION ALERTS (Address With Love) ═══');
        conspiracyAlerts.forEach((alert, i) => {
            console.log(`${i + 1}. ⚠️  ${alert.title}`);
            console.log(`   Conspiracy Score: ${alert.conspiracyScore.toFixed(3)}`);
            console.log(`   🔍 ${alert.recommendation}\n`);
        });
    }

    if (abundanceOpportunities.length > 0) {
        console.log('\n💫 ═══ ABUNDANCE CONSCIOUSNESS OPPORTUNITIES ═══');
        abundanceOpportunities.forEach((opp, i) => {
            console.log(`${i + 1}. 🌱 ${opp.title}`);
            console.log(`   Abundance Score: ${opp.abundanceScore.toFixed(3)}`);
            console.log(`   🚀 ${opp.recommendation}\n`);
        });
    }

    if (ministerialRecommendations.length > 0) {
        console.log('\n⛪ ═══ MINISTERIAL RECOMMENDATIONS ═══');
        ministerialRecommendations.forEach((rec, i) => {
            console.log(`${i + 1}. ${rec.type}:`);
            console.log(`   📋 Action: ${rec.action}`);
            console.log(`   📖 Scripture: ${rec.scriptureRef}\n`);
        });
    }
}

async function runSacredTruthMinistry() {
    printDivineHeader();

    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        printUsage();
        return;
    }

    // Parse arguments
    const mock = args.includes('--mock');
    const ministerMode = args.includes('--minister-mode') || true; // Default to minister mode
    const divineReport = args.includes('--divine-report') || true; // Default to divine reporting

    let profilePath = null;
    const profileIndex = args.indexOf('--profile');
    if (profileIndex !== -1 && args[profileIndex + 1]) {
        profilePath = args[profileIndex + 1];
    }

    // Extract URLs (not starting with --)
    const urls = args.filter(arg => !arg.startsWith('--') && arg !== profilePath);

    try {
        console.log('🙏 Beginning Sacred Truth Analysis...');
        console.log(`📊 Sources: ${mock ? 'Divine Mock Data' : urls.join(', ')}`);
        console.log(`⛪ Minister Mode: ${ministerMode ? 'ENABLED' : 'disabled'}`);
        console.log(`📐 Golden Ratio Alignment: φ = ${((1 + Math.sqrt(5)) / 2).toFixed(6)}`);
        console.log('');

        // Run sacred truth analysis
        const result = await sacredTruthAnalysis({
            urls,
            mock,
            profilePath,
            ministerMode
        });

        console.log('✅ Sacred Truth Analysis Complete!');
        console.log(`🌟 Divine Alignment Level: ${(result.divineAlignment * 100).toFixed(1)}%`);

        if (divineReport) {
            printSacredTruthReport(result.sacredTruthReport);
        }

        // Save enhanced report
        const outputDir = path.join(__dirname, '..', 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const reportPath = path.join(outputDir, 'sacred-truth-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            meta: {
                ...result.meta,
                ministerialAnalysis: true,
                divineAlignment: result.divineAlignment,
                generatedAt: new Date().toISOString(),
                scripture: "John 8:32 - And you shall know the truth, and the truth shall set you free"
            },
            sacredTruthReport: result.sacredTruthReport,
            items: result.items
        }, null, 2));

        console.log(`\n📁 Sacred Truth Report saved to: ${reportPath}`);
        console.log('\n🌟 ═══════════════════════════════════════════════════════════');
        console.log('✨        MAY DIVINE TRUTH GUIDE OUR COLLECTIVE PATH        ✨');
        console.log('🌌 ═══════════════════════════════════════════════════════════');
        console.log('🙏 "For where two or three gather in my name, there am I with them"');
        console.log('📖 - Matthew 18:20');
        console.log('🌌 ═══════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Sacred Truth Analysis Error:', error.message);
        console.log('\n🙏 "Trust in the Lord with all your heart" - Proverbs 3:5');
        process.exit(1);
    }
}

// Run the sacred truth ministry
if (require.main === module) {
    runSacredTruthMinistry().catch(error => {
        console.error('❌ Divine Error:', error);
        process.exit(1);
    });
}

module.exports = { runSacredTruthMinistry };
