import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

interface VoteStatus {
  hasVoted: boolean;
  loading: boolean;
  error: string | null;
  votedFor: string | null;
}

interface PositionVoteStatus {
  [position: string]: VoteStatus;
}

interface UseVotingReturn {
  voteStatus: VoteStatus;
  positionVotes: PositionVoteStatus;
  castVote: (candidateId: string, candidateType: string, position: string) => Promise<void>;
  checkVoteStatus: (candidateType?: string, position?: string) => Promise<void>;
}

function useVoting(): UseVotingReturn {
  const { isAuthenticated, userEmail } = useAuth();
  
  // Single vote status (legacy support)
  const [voteStatus, setVoteStatus] = useState<VoteStatus>({
    hasVoted: false,
    loading: false,
    error: null,
    votedFor: null,
  });
  
  // Position-based vote status
  const [positionVotes, setPositionVotes] = useState<PositionVoteStatus>({});

  // Initialize Amplify client once
  const client = generateClient<Schema>();

  // Effect to check vote status on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      checkVoteStatus();
    }
  }, [isAuthenticated, userEmail]);

  // Checks vote status for a specific candidate type and position (or all votes if not specified)
  const checkVoteStatus = async (candidateType?: string, position?: string): Promise<void> => {
    console.log(`checkVoteStatus called for ${candidateType || 'all'} ${position || ''}, auth status:`, isAuthenticated, "email:", userEmail);
    
    if (!isAuthenticated || !userEmail) {
      console.log("Not authenticated or no email");
      setVoteStatus(prev => ({
        ...prev,
        error: "You must be logged in to vote",
      }));
      return;
    }

    try {
      // Get the current user to ensure we're authenticated
      try {
        await getCurrentUser();
      } catch (error) {
        console.error("Failed to get current user:", error);
        const errorStatus = {
          hasVoted: false,
          loading: false,
          error: "Authentication error. Please sign in again.",
          votedFor: null,
        };
        
        setVoteStatus(errorStatus);
        return;
      }
      
      console.log("Checking vote status for:", userEmail);
      
      // If checking a specific position
      if (candidateType && position) {
        setPositionVotes(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            loading: true,
            error: null
          }
        }));
        
        // Check if the user has already voted for this position
        const existingVotes = await client.models.ExecChairVote.list({
          filter: {
            and: [
              { userEmail: { eq: userEmail } },
              { candidateType: { eq: candidateType } },
              { position: { eq: position } }
            ]
          },
        });
        
        console.log(`Vote check for position ${position}: found ${existingVotes.data.length} votes`);
        
        if (existingVotes.data.length > 0) {
          setPositionVotes(prev => ({
            ...prev,
            [position]: {
              hasVoted: true,
              loading: false,
              error: null,
              votedFor: existingVotes.data[0].candidateId,
            }
          }));
        } else {
          setPositionVotes(prev => ({
            ...prev,
            [position]: {
              hasVoted: false,
              loading: false,
              error: null,
              votedFor: null,
            }
          }));
        }
      } 
      // If checking legacy or all votes
      else {
        setVoteStatus(prev => ({
          ...prev,
          loading: true,
          error: null,
        }));
        
        // For loading state in position votes
        if (candidateType) {
          const positions = getPositionsForType(candidateType);
          for (const position of positions) {
            setPositionVotes(prev => ({
              ...prev,
              [position]: {
                ...prev[position],
                loading: true,
                error: null
              }
            }));
          }
        }
        
        // Check user's votes
        const existingVotes = await client.models.ExecChairVote.list({
          filter: {
            userEmail: { eq: userEmail }
          },
        });
        
        console.log(`Vote check complete, found ${existingVotes.data.length} votes`);
        
        // Legacy vote status handling (for backwards compatibility)
        const execChairVotes = existingVotes.data.filter(v => !v.candidateType || v.candidateType === 'execchair');
        if (execChairVotes.length > 0) {
          setVoteStatus({
            hasVoted: true,
            loading: false,
            error: null,
            votedFor: execChairVotes[0].candidateId,
          });
        } else {
          setVoteStatus({
            hasVoted: false,
            loading: false,
            error: null,
            votedFor: null,
          });
        }
        
        // Group votes by position
        const votesByPosition: Record<string, any> = {};
        for (const vote of existingVotes.data) {
          if (vote.position) {
            votesByPosition[vote.position] = vote;
          }
        }
        
        // Update position-based votes
        const updatedPositionVotes = { ...positionVotes };
        
        // If a specific candidate type, only update those positions
        if (candidateType) {
          const positions = getPositionsForType(candidateType);
          for (const position of positions) {
            if (votesByPosition[position]) {
              updatedPositionVotes[position] = {
                hasVoted: true,
                loading: false,
                error: null,
                votedFor: votesByPosition[position].candidateId,
              };
            } else {
              updatedPositionVotes[position] = {
                hasVoted: false,
                loading: false,
                error: null,
                votedFor: null,
              };
            }
          }
        } 
        // Otherwise, update all positions
        else {
          // Set all positions with votes
          for (const position in votesByPosition) {
            updatedPositionVotes[position] = {
              hasVoted: true,
              loading: false,
              error: null,
              votedFor: votesByPosition[position].candidateId,
            };
          }
        }
        
        setPositionVotes(updatedPositionVotes);
      }
    } catch (error) {
      console.error("Error in checkVoteStatus:", error);
      
      // Update status for specific position if provided
      if (position) {
        setPositionVotes(prev => ({
          ...prev,
          [position]: {
            hasVoted: false,
            loading: false,
            error: error instanceof Error ? error.message : 'Error checking vote status',
            votedFor: null,
          }
        }));
      } else {
        setVoteStatus({
          hasVoted: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Error checking vote status',
          votedFor: null,
        });
      }
    }
  };

  const castVote = async (candidateId: string, candidateType: string, position: string): Promise<void> => {
    console.log(`castVote called for candidate: ${candidateId}, type: ${candidateType}, position: ${position}`);
    
    if (!isAuthenticated || !userEmail) {
      console.log("Not authenticated or no email");
      const errorMsg = "You must be logged in to vote";
      
      // Update position vote status
      setPositionVotes(prev => ({
        ...prev,
        [position]: {
          ...prev[position],
          error: errorMsg
        }
      }));
      
      // Also update legacy vote status
      if (candidateType === 'execchair' && !position) {
        setVoteStatus(prev => ({
          ...prev,
          error: errorMsg,
        }));
      }
      
      return;
    }

    // First check if the user has already voted for this position
    try {
      console.log(`Checking existing votes for position ${position}`);
      
      // Set loading state
      if (position) {
        setPositionVotes(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            loading: true,
            error: null
          }
        }));
      } else {
        setVoteStatus(prev => ({
          ...prev,
          loading: true,
          error: null,
        }));
      }
      
      const filter = position 
        ? {
            and: [
              { userEmail: { eq: userEmail } },
              { candidateType: { eq: candidateType } },
              { position: { eq: position } }
            ]
          }
        : {
            and: [
              { userEmail: { eq: userEmail } },
              { candidateType: { eq: candidateType } }
            ]
          };
          
      const existingVotes = await client.models.ExecChairVote.list({ filter });
      
      if (existingVotes.data.length > 0) {
        console.log(`User has already voted for position ${position}:`, existingVotes.data[0].candidateId);
        
        // Update position vote status
        if (position) {
          setPositionVotes(prev => ({
            ...prev,
            [position]: {
              hasVoted: true,
              loading: false,
              error: "You have already voted for this position",
              votedFor: existingVotes.data[0].candidateId,
            }
          }));
        }
        
        // Also update legacy vote status
        if (candidateType === 'execchair' && !position) {
          setVoteStatus({
            hasVoted: true,
            loading: false,
            error: "You have already voted",
            votedFor: existingVotes.data[0].candidateId,
          });
        }
        
        return;
      }
    } catch (error) {
      console.error("Error checking existing votes:", error);
      const errorMsg = "Failed to check vote status. Please try again.";
      
      // Update position vote status
      if (position) {
        setPositionVotes(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            loading: false,
            error: errorMsg
          }
        }));
      } else {
        setVoteStatus(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
      }
      
      return;
    }

    // If we get here, user hasn't voted for this position yet
    try {
      console.log(`Casting vote for candidate: ${candidateId}, position: ${position}`);
      
      // Record the new vote
      try {
        const newVote = await client.models.ExecChairVote.create({
          userEmail,
          candidateId,
          candidateType,
          position,
          timestamp: new Date().toISOString(),
        });
        console.log("Vote recorded successfully:", newVote);

        // Update the vote summary (for admin dashboard)
        try {
          console.log("Updating vote summary...");
          const summaryResults = await client.models.VoteSummary.list({
            filter: {
              candidateId: {
                eq: candidateId,
              }
            }
          });

          if (summaryResults.data.length > 0) {
            // Update existing summary
            const summary = summaryResults.data[0];
            await client.models.VoteSummary.update({
              id: summary.id,
              voteCount: (summary.voteCount || 0) + 1,
              lastUpdated: new Date().toISOString(),
            });
          } else {
            // Create new summary
            await client.models.VoteSummary.create({
              candidateId,
              voteCount: 1,
              candidateName: '', // This would be populated from profile data in a real implementation
              lastUpdated: new Date().toISOString(),
            });
          }
          console.log("Vote summary updated");
        } catch (error) {
          console.error('Error updating vote summary:', error);
          // Don't fail the vote if summary update fails
        }

        // Update position vote status
        if (position) {
          setPositionVotes(prev => ({
            ...prev,
            [position]: {
              hasVoted: true,
              loading: false,
              error: null,
              votedFor: candidateId,
            }
          }));
        }
        
        // Also update legacy vote status
        if (candidateType === 'execchair' && !position) {
          setVoteStatus({
            hasVoted: true,
            loading: false,
            error: null,
            votedFor: candidateId,
          });
        }
        
        // Double-check vote status to ensure consistency
        setTimeout(() => checkVoteStatus(candidateType, position), 1000);
      } catch (error) {
        console.error("Error recording vote:", error);
        const errorMsg = error instanceof Error ? error.message : 'Error casting vote';
        
        // Update position vote status
        if (position) {
          setPositionVotes(prev => ({
            ...prev,
            [position]: {
              ...prev[position],
              loading: false,
              error: errorMsg
            }
          }));
        } else {
          setVoteStatus(prev => ({
            ...prev,
            loading: false,
            error: errorMsg,
          }));
        }
        
        // Re-check vote status in case the vote was actually recorded
        setTimeout(() => checkVoteStatus(candidateType, position), 1000);
      }
    } catch (error) {
      console.error("Outer error in castVote:", error);
      const errorMsg = 'Error casting vote';
      
      // Update position vote status
      if (position) {
        setPositionVotes(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            loading: false,
            error: errorMsg
          }
        }));
      } else {
        setVoteStatus(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
      }
    }
  };

  // Helper function to get positions for a candidate type
  // This is now a fallback for candidates without position preferences
  const getPositionsForType = (candidateType: string): string[] => {
    if (candidateType === 'execchair') {
      return ['president', 'vp', 'treasurer', 'secretary'];
    } else if (candidateType === 'sbod') {
      return [
        'webmaster', 
        'cultural', 
        'ui-ux-marketing', 
        'engineering-vanguard', 
        'natural-sciences-research'
      ];
    }
    return [];
  };

  return {
    voteStatus,
    positionVotes,
    castVote,
    checkVoteStatus,
  };
}

// Add a default export component to fix the Next.js page error
const DummyComponent = () => null;
export default DummyComponent;

// Re-export the hook for usage elsewhere
export { useVoting };