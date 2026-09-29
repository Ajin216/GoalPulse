export function getMockMatchDetails(matchId, homeTeam, awayTeam) {
  return {
    events: [
      { id: 1, minute: 12, player: 'John Doe', team: homeTeam, type: 'goal' },
      { id: 2, minute: 24, player: 'Mike Smith', team: awayTeam, type: 'yellow_card' },
      { id: 3, minute: 45, player: 'James Brown', team: homeTeam, type: 'yellow_card' },
      { id: 4, minute: 60, player: 'Tom Wilson', team: awayTeam, type: 'goal' },
      { id: 5, minute: 75, player: 'Alex Johnson', team: homeTeam, type: 'substitution' },
      { id: 6, minute: 88, player: 'Chris Lee', team: awayTeam, type: 'red_card' }
    ],
    lineups: {
      home: {
        formation: '4-3-3',
        startingXI: [
          { id: 1, name: 'Keeper 1', number: 1, position: { bottom: '5%', left: '50%' } },
          { id: 2, name: 'Def 1', number: 2, position: { bottom: '20%', left: '20%' } },
          { id: 3, name: 'Def 2', number: 3, position: { bottom: '20%', left: '40%' } },
          { id: 4, name: 'Def 3', number: 4, position: { bottom: '20%', left: '60%' } },
          { id: 5, name: 'Def 4', number: 5, position: { bottom: '20%', left: '80%' } },
          { id: 6, name: 'Mid 1', number: 6, position: { bottom: '40%', left: '30%' } },
          { id: 7, name: 'Mid 2', number: 8, position: { bottom: '40%', left: '50%' } },
          { id: 8, name: 'Mid 3', number: 10, position: { bottom: '40%', left: '70%' } },
          { id: 9, name: 'Fwd 1', number: 7, position: { bottom: '45%', left: '25%' } },
          { id: 10, name: 'Fwd 2', number: 9, position: { bottom: '48%', left: '50%' } },
          { id: 11, name: 'Fwd 3', number: 11, position: { bottom: '45%', left: '75%' } },
        ],
        substitutes: [
          { id: 12, name: 'Sub 1', number: 12 },
          { id: 13, name: 'Sub 2', number: 13 },
          { id: 14, name: 'Sub 3', number: 14 },
          { id: 15, name: 'Sub 4', number: 15 },
          { id: 16, name: 'Sub 5', number: 16 }
        ]
      },
      away: {
        formation: '4-2-3-1',
        startingXI: [
          { id: 101, name: 'Keeper 2', number: 1, position: { top: '5%', left: '50%' } },
          { id: 102, name: 'Def 5', number: 2, position: { top: '20%', left: '20%' } },
          { id: 103, name: 'Def 6', number: 3, position: { top: '20%', left: '40%' } },
          { id: 104, name: 'Def 7', number: 4, position: { top: '20%', left: '60%' } },
          { id: 105, name: 'Def 8', number: 5, position: { top: '20%', left: '80%' } },
          { id: 106, name: 'Mid 4', number: 6, position: { top: '35%', left: '35%' } },
          { id: 107, name: 'Mid 5', number: 8, position: { top: '35%', left: '65%' } },
          { id: 108, name: 'Mid 6', number: 10, position: { top: '45%', left: '50%' } },
          { id: 109, name: 'Fwd 4', number: 7, position: { top: '42%', left: '20%' } },
          { id: 110, name: 'Fwd 5', number: 11, position: { top: '42%', left: '80%' } },
          { id: 111, name: 'Fwd 6', number: 9, position: { top: '48%', left: '50%' } },
        ],
        substitutes: [
          { id: 112, name: 'Sub 6', number: 12 },
          { id: 113, name: 'Sub 7', number: 13 },
          { id: 114, name: 'Sub 8', number: 14 },
          { id: 115, name: 'Sub 9', number: 15 },
          { id: 116, name: 'Sub 10', number: 16 }
        ]
      }
    }
  };
}
