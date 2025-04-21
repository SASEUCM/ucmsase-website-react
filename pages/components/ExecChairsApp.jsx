import React from 'react';

// Simple version to debug
const ExecChairsApp = ({ profile }) => {
  // Debug the incoming profile data
  console.log('ExecChairsApp received profile:', {
    name: profile.name,
    hours: profile.hours,
    clubs: profile.clubs, 
    why: profile.why
  });
  
  // Helper function to check if field has meaningful content
  const hasContent = (field) => {
    return field && field.trim && field.trim() !== '';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-600">{hasContent(profile.name) ? profile.name : 'Unknown Name'}</h2>
        <p className="text-gray-600">{hasContent(profile.year) ? profile.year : 'Unknown Year'}</p>
        <p className="text-gray-600">{hasContent(profile.major) ? profile.major : 'Unknown Major'}</p>
        
        <div className="mt-4 text-left">
          <p className="font-semibold">Weekly Availability:</p>
          <p className="text-gray-700">
            {hasContent(profile.hours) ? `${profile.hours} hours per week` : 'Not specified'}
          </p>
          
          <p className="font-semibold mt-2">Other Clubs/Organizations:</p>
          <p className="text-gray-700">{hasContent(profile.clubs) ? profile.clubs : 'None specified'}</p>
          
          <p className="font-semibold mt-2">Why They Want to Join:</p>
          <p className="text-gray-700 italic">{hasContent(profile.why) ? profile.why : 'No information provided'}</p>
        </div>
        
        {profile.resumeUrl && (
          <a 
            href={profile.resumeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            View Resume
          </a>
        )}
      </div>
    </div>
  );
};

export default ExecChairsApp;