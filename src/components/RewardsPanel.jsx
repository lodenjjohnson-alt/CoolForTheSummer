import React from "react";
import { CheckCircle2, Gift, Lock, Sparkles, Trophy } from "lucide-react";

const rewardTiers = [
  {
    id: "minor",
    points: 100,
    title: "Minor Reward",
    rank: "Acceptable Operation",
    description: "A small clean reward after crossing the minimum standard.",
  },
  {
    id: "strong",
    points: 140,
    title: "Strong Reward",
    rank: "Strong Operation",
    description: "A better reward earned by completing a serious day of work.",
  },
  {
    id: "elite",
    points: 170,
    title: "Elite Reward",
    rank: "Dominant Operation",
    description: "A high-value reward for an elite day of execution.",
  },
  {
    id: "perfect",
    points: 200,
    title: "Perfect Operation Reward",
    rank: "Perfect Operation",
    description: "The top reward tier. This should stay rare and meaningful.",
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
