import type { QuestionTree } from '@/lib/types/question-tree';

export const sampleTree: QuestionTree = {
  categories: [
    {
      id: 'cat-1',
      name: 'Impulsive Spending',
      entryQuestion: {
        id: 'eq-1',
        text: "What's the last thing you bought that you didn't plan for?",
        responseOptions: [
          {
            id: 'ro-1',
            label: 'Coffee/food',
            branch1Question: {
              id: 'b1q-1',
              text: 'Where does this usually happen?',
              type: 'context-gathering',
              isFixed: true,
              responseOptions: [
                { id: 'b1ro-1', label: 'Near work' },
                { id: 'b1ro-2', label: 'Near home' },
                { id: 'b1ro-3', label: 'Out and about' },
              ],
              explorationArea: {
                id: 'exp-1',
                goal: 'Coffee as escape from cognitive load. Does it help or just delay?',
                behavioralDimensions: [
                  {
                    id: 'bd-1',
                    name: 'proximity-vs-intentionality',
                    probeHints: [
                      'would you go out of your way?',
                      'is it seeing it that triggers it?',
                      'how often does passing by → purchase?',
                    ],
                  },
                  {
                    id: 'bd-2',
                    name: 'autopilot',
                    probeHints: [
                      'do you remember deciding, or just... doing?',
                      'what were you thinking about when you ordered?',
                    ],
                  },
                  {
                    id: 'bd-3',
                    name: 'fomo',
                    probeHints: [
                      'what would you miss if you skipped it?',
                      'does everyone else seem to be getting one?',
                    ],
                  },
                ],
              },
              evaluationArea: {
                id: 'eval-1',
                evaluationDimensions: [
                  {
                    id: 'ed-1',
                    name: 'cost-reality',
                    probeHints: [
                      'if convenience disappeared, would you save $108?',
                      "what's the 'convenience tax' each month?",
                    ],
                  },
                  {
                    id: 'ed-2',
                    name: 'tension-surfacing',
                    probeHints: [
                      'does it bother you that convenience is deciding?',
                      "what's the difference between wanting vs easy?",
                    ],
                  },
                ],
                conclusionHints: [
                  'You spend ~$X/month on convenience purchases...',
                  'Pattern: proximity triggers 60% of your unplanned buys',
                ],
              },
            },
          },
          {
            id: 'ro-2',
            label: 'Clothes/accessory',
            branch1Question: {
              id: 'b1q-2',
              text: 'What triggered the purchase?',
              type: 'context-gathering',
              isFixed: true,
              responseOptions: [
                { id: 'b1ro-4', label: 'Saw an ad' },
                { id: 'b1ro-5', label: 'Friend had one' },
                { id: 'b1ro-6', label: 'Just browsing' },
              ],
              explorationArea: {
                id: 'exp-2',
                goal: 'Clothing purchases as identity expression or filling emotional gaps',
                behavioralDimensions: [
                  {
                    id: 'bd-4',
                    name: 'social-comparison',
                    probeHints: [
                      'who were you thinking of when you bought it?',
                      'would you have bought it if no one would see?',
                    ],
                  },
                  {
                    id: 'bd-5',
                    name: 'retail-therapy',
                    probeHints: [
                      'how were you feeling before you bought it?',
                      'did the feeling last after the purchase?',
                    ],
                  },
                ],
              },
            },
          },
          {
            id: 'ro-3',
            label: 'Tech/gadget',
            branch1Question: {
              id: 'b1q-3',
              text: 'How long did you think about it before buying?',
              type: 'context-gathering',
              isFixed: true,
              responseOptions: [
                { id: 'b1ro-7', label: 'Minutes' },
                { id: 'b1ro-8', label: 'Hours' },
                { id: 'b1ro-9', label: 'Days/weeks' },
              ],
              explorationArea: {
                id: 'exp-3',
                goal: 'Tech as productivity promise or novelty chase',
                behavioralDimensions: [
                  {
                    id: 'bd-6',
                    name: 'productivity-fantasy',
                    probeHints: [
                      'what did you imagine it would help you do?',
                      'did you actually use it for that?',
                    ],
                  },
                  {
                    id: 'bd-7',
                    name: 'novelty-seeking',
                    probeHints: [
                      'how many similar things do you already own?',
                      'what happened to the last one?',
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    },
  ],
};

