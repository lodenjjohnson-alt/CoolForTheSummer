import React from "react";
import { CheckCircle2, Gift, Lock, Sparkles, Trophy } from "lucide-react";

const rewardTiers = [
  {
    id: "minor",
    points: 100,
    title: "Minor Reward",
    rank: "On Track",
    description:
      "You met the baseline for a productive day. This reward should feel good without pulling you off track.",
    suggestions: [
      "20 minutes of clean entertainment after responsibilities are done",
      "A good snack or drink that does not turn into a binge",
      "A short recovery walk, music session, or relaxed stretch",
      "A small purchase under a preset limit",
    ],
  },
  {
    id: "strong",
    points: 140,
    title: "Strong Reward",
    rank: "Strong Day",
    description:
      "You completed a serious day of execution. This reward can be more satisfying, but it should still protect tomorrow.",
    suggestions: [
      "Watch one movie or long video with a hard stop time",
      "Order or make a favorite meal that still supports training",
      "Go do something social, active, or outdoors",
      "Buy a useful item for training, learning, faith, or your room setup",
    ],
  },
  {
    id: "elite",
    points: 170,
    title: "Elite Reward",
    rank: "Elite Day",
    description:
      "You produced a high-level day. This reward should feel earned and memorable, not cheap or mindless.",
    suggestions: [
      "Plan a bigger experience: fishing, hiking, photography, or a day trip",
      "Upgrade a tool that helps your goals: book, app, gear, or course",
      "Take a longer guilt-free recovery block after the nightly reflection",
      "Choose a meaningful family or friend experience",
    ],
  },
  {
    id: "perfect",
    points: 200,
    title: "Perfect Day Reward",
    rank: "Perfect Day",
    description:
      "You hit the highest standard. This should be rare, protected, and worth remembering.",
    suggestions: [
      "Save toward a major reward instead of spending immediately",
      "Schedule a premium experience that fits your goals",
      "Buy a high-value tool for hockey, learning, business, or faith",
      "Take a fully intentional rest block with no guilt and no spiral",
    ],
  },
];

export default function RewardsPanel({ score, claimedRewards, onClaimReward }) {
  const claimedIds = new Set(claimedRewards.map((reward) => reward.tierId));
  const highestUnlocked = [...rewardTiers]
    .reverse()
    .find((tier) => score >= tier.points);

  return (
    <section className="panel rewards-panel">
      <div className="section-title">
        <Trophy size={24} />
        <h2>Rewards System</h2>
      </div>

      <div className="rewards-summary">
        <div>
          <span>Current Reward Status</span>
          <strong>{highestUnlocked ? highestUnlocked.rank : "Locked"}</strong>
        </div>

        <div>
          <span>Claimed Today</span>
          <strong>{claimedRewards.length}/{rewardTiers.length}</strong>
        </div>
      </div>

      <div className="reward-tier-grid">
        {rewardTiers.map((tier) => {
          const unlocked = score >= tier.points;
          const claimed = claimedIds.has(tier.id);

          return (
            <div
              key={tier.id}
              className={`reward-tier-card ${unlocked ? "unlocked" : "locked"} ${claimed ? "claimed" : ""}`}
            >
              <div className="reward-tier-header">
                <div>
                  <p>{tier.points} Points</p>
                  <h3>{tier.title}</h3>
                </div>

                {claimed ? (
                  <CheckCircle2 size={22} />
                ) : unlocked ? (
                  <Sparkles size={22} />
                ) : (
                  <Lock size={22} />
                )}
              </div>

              <p className="reward-description">{tier.description}</p>

              <div className="reward-suggestions">
                <h4>Suggestions</h4>
                <ul>
                  {tier.suggestions.map((suggestion) => (
                    <li key={suggestion}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <button
                className={unlocked && !claimed ? "primary-action" : "secondary-action"}
                disabled={!unlocked || claimed}
                onClick={() => onClaimReward(tier)}
              >
                <Gift size={18} />
                {claimed ? "Claimed" : unlocked ? "Claim Reward" : "Locked"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="claimed-reward-history">
        <h3>Claimed Reward History</h3>

        {claimedRewards.length === 0 ? (
          <p className="muted">No rewards claimed for this operation yet.</p>
        ) : (
          <div className="claimed-reward-list">
            {claimedRewards.map((reward) => (
              <div key={reward.id} className="claimed-reward-row">
                <strong>{reward.title}</strong>
                <span>{reward.points} pts · {reward.claimedAt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
