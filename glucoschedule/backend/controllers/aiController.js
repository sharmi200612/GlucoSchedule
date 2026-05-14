// ============================================
// Controller: AI Health Analysis Module
// ============================================
// Analyzes glucose data from MongoDB and:
// 1. Predicts future sugar levels (trend analysis)
// 2. Detects health risks (patterns & alerts)
// 3. Provides personalized diet recommendations

const GlucoseReading = require('../models/Glucose');
const User = require('../models/User');

// ── Helper: Calculate average ───────────────
const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

// ── Helper: Linear regression for prediction
// Finds the trend line (slope) from past readings
const linearRegression = (values) => {
  const n = values.length;
  if (n < 2) return null;
  const xMean = (n - 1) / 2;
  const yMean = avg(values);
  let numerator = 0, denominator = 0;
  values.forEach((y, x) => {
    numerator   += (x - xMean) * (y - yMean);
    denominator += (x - xMean) ** 2;
  });
  const slope     = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
};

// ── Helper: Predict next N readings ─────────
const predictNext = (values, steps = 3) => {
  const reg = linearRegression(values);
  if (!reg) return [];
  return Array.from({ length: steps }, (_, i) => {
    const predicted = reg.intercept + reg.slope * (values.length + i);
    return Math.max(40, Math.round(predicted)); // floor at 40 mg/dL
  });
};

// ── Helper: Detect risk level ────────────────
const getRiskLevel = (avgGlucose, lowCount, highCount, total) => {
  if (total < 3) return { level: 'insufficient', label: 'Not Enough Data', color: '#8aada0' };
  const lowPct  = (lowCount  / total) * 100;
  const highPct = (highCount / total) * 100;
  if (lowPct > 30 || highPct > 40 || avgGlucose > 250)
    return { level: 'high',   label: 'High Risk',    color: '#e63946' };
  if (lowPct > 15 || highPct > 20 || avgGlucose > 180)
    return { level: 'medium', label: 'Moderate Risk', color: '#f4a261' };
  return { level: 'low', label: 'Low Risk', color: '#2d6a4f' };
};

// ── Helper: Build diet recommendations ───────
const getDietRecommendations = (avgGlucose, trend, diabetesType) => {
  const recommendations = [];

  // Universal recommendations
  recommendations.push({
    category: 'General',
    icon: '⏰',
    tip: 'Eat meals at consistent times every day to maintain stable glucose levels.',
    priority: 'normal',
  });
  recommendations.push({
    category: 'Hydration',
    icon: '💧',
    tip: 'Drink at least 8 glasses of water daily. Dehydration raises blood sugar.',
    priority: 'normal',
  });

  // High glucose recommendations
  if (avgGlucose > 180 || trend === 'rising') {
    recommendations.push({
      category: 'Carbohydrates',
      icon: '🌾',
      tip: 'Reduce refined carbs like white rice, white bread, and sugary snacks. Switch to brown rice, oats, or whole wheat.',
      priority: 'high',
    });
    recommendations.push({
      category: 'Fruits',
      icon: '🍓',
      tip: 'Choose low-GI fruits: berries, apples, pears. Avoid mangoes, bananas, and grapes in large amounts.',
      priority: 'high',
    });
    recommendations.push({
      category: 'Portion Control',
      icon: '🍽️',
      tip: 'Use smaller plates. Fill 50% with vegetables, 25% protein, 25% whole grains.',
      priority: 'high',
    });
  }

  // Low glucose recommendations
  if (avgGlucose < 70 || trend === 'falling') {
    recommendations.push({
      category: 'Emergency Snacks',
      icon: '🧃',
      tip: 'Keep fast-acting sugar nearby: 4 glucose tablets, 120ml fruit juice, or 3 teaspoons of sugar.',
      priority: 'urgent',
    });
    recommendations.push({
      category: 'Meal Timing',
      icon: '🕐',
      tip: 'Never skip meals. Eat every 3–4 hours. Include a bedtime snack if levels drop at night.',
      priority: 'high',
    });
  }

  // Normal range recommendations
  if (avgGlucose >= 70 && avgGlucose <= 180) {
    recommendations.push({
      category: 'Vegetables',
      icon: '🥦',
      tip: 'Great job! Keep eating non-starchy vegetables: spinach, broccoli, cauliflower, and cucumber.',
      priority: 'normal',
    });
    recommendations.push({
      category: 'Protein',
      icon: '🐟',
      tip: 'Include lean proteins at every meal: grilled fish, chicken, eggs, lentils, or tofu.',
      priority: 'normal',
    });
  }

  // Type-specific recommendations
  if (diabetesType === 'Type 1') {
    recommendations.push({
      category: 'Insulin Timing',
      icon: '💉',
      tip: 'Match carbohydrate intake with insulin doses. Learn carb counting for more precise management.',
      priority: 'high',
    });
  }
  if (diabetesType === 'Type 2') {
    recommendations.push({
      category: 'Weight Management',
      icon: '⚖️',
      tip: 'Even a 5–10% weight reduction can significantly improve blood sugar control.',
      priority: 'normal',
    });
  }
  if (diabetesType === 'Gestational') {
    recommendations.push({
      category: 'Prenatal Nutrition',
      icon: '🤱',
      tip: 'Focus on folate-rich foods: leafy greens, legumes, fortified cereals. Avoid processed foods.',
      priority: 'high',
    });
  }

  // Always add fiber tip
  recommendations.push({
    category: 'Fiber',
    icon: '🌿',
    tip: 'Aim for 25–30g of fiber daily. Fiber slows glucose absorption: beans, lentils, oats, vegetables.',
    priority: 'normal',
  });

  return recommendations;
};

// ── Main Controller ───────────────────────────
// @route  GET /api/ai/analyze
// @desc   Full AI analysis of user's glucose data
// @access Private
const analyzeHealth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const readings = await GlucoseReading
      .find({ user: req.user._id })
      .sort({ recordedAt: 1 }); // oldest first for trend

    // ── Not enough data ──────────────────────
    if (readings.length < 3) {
      return res.json({
        hasEnoughData: false,
        message: `You need at least 3 glucose readings for AI analysis. You currently have ${readings.length}.`,
        readings: readings.length,
      });
    }

    const levels     = readings.map(r => r.level);
    const recentLevels = levels.slice(-10); // last 10 readings
    const avgLevel   = Math.round(avg(levels));
    const avgRecent  = Math.round(avg(recentLevels));
    const minLevel   = Math.min(...levels);
    const maxLevel   = Math.max(...levels);
    const lowCount   = levels.filter(l => l < 70).length;
    const highCount  = levels.filter(l => l > 180).length;
    const normalCount= levels.filter(l => l >= 70 && l <= 180).length;
    const inRangePct = Math.round((normalCount / levels.length) * 100);

    // ── Trend detection ──────────────────────
    const reg = linearRegression(recentLevels);
    let trend = 'stable';
    if (reg && reg.slope > 2)       trend = 'rising';
    else if (reg && reg.slope < -2) trend = 'falling';

    // ── Predictions (next 3 readings) ────────
    const predictions = predictNext(recentLevels, 3);

    // ── Estimated HbA1c (approximation formula)
    // Formula: (avgGlucose + 46.7) / 28.7
    const estimatedHbA1c = ((avgLevel + 46.7) / 28.7).toFixed(1);

    // ── Risk assessment ──────────────────────
    const risk = getRiskLevel(avgLevel, lowCount, highCount, levels.length);

    // ── Health alerts ─────────────────────────
    const alerts = [];
    if (lowCount > 0)
      alerts.push({ type: 'danger', icon: '🔴', message: `${lowCount} low glucose episode(s) detected (below 70 mg/dL). Risk of hypoglycemia. Consult your doctor.` });
    if (highCount > readings.length * 0.4)
      alerts.push({ type: 'warning', icon: '🟠', message: `${highCount} high glucose readings (above 180 mg/dL) detected. Consider reviewing your diet and medication.` });
    if (trend === 'rising')
      alerts.push({ type: 'warning', icon: '📈', message: 'Your glucose levels are showing an upward trend. Monitor closely and reduce carbohydrate intake.' });
    if (trend === 'falling')
      alerts.push({ type: 'info', icon: '📉', message: 'Your glucose levels are trending downward. Ensure you are eating regularly to avoid hypoglycemia.' });
    if (inRangePct >= 70)
      alerts.push({ type: 'success', icon: '✅', message: `Excellent! ${inRangePct}% of your readings are in the healthy range (70–180 mg/dL).` });

    // ── Diet recommendations ──────────────────
    const dietRecommendations = getDietRecommendations(avgLevel, trend, user?.diabetesType);

    // ── Return full analysis ──────────────────
    res.json({
      hasEnoughData: true,
      summary: {
        totalReadings: readings.length,
        avgGlucose: avgLevel,
        avgRecentGlucose: avgRecent,
        minGlucose: minLevel,
        maxGlucose: maxLevel,
        lowCount,
        highCount,
        normalCount,
        inRangePct,
        estimatedHbA1c,
        trend,
        diabetesType: user?.diabetesType || 'Unknown',
        targetMin: user?.targetGlucoseMin || 70,
        targetMax: user?.targetGlucoseMax || 180,
      },
      risk,
      predictions: {
        nextReadings: predictions,
        trend,
        message: trend === 'rising'
          ? 'Your glucose is trending upward. Take action to prevent further rise.'
          : trend === 'falling'
          ? 'Your glucose is trending downward. Monitor carefully to avoid low sugar.'
          : 'Your glucose levels are relatively stable.',
      },
      alerts,
      dietRecommendations,
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeHealth };
