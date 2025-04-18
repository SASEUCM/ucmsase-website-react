import React from 'react';

// Simple version to debug
const ExecChairsApp = ({ profile }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-600">{profile.name || 'Unknown Name'}</h2>
        <p className="text-gray-600">{profile.year || 'Unknown Year'}</p>
        <p className="text-gray-600">{profile.major || 'Unknown Major'}</p>
        <p className="mt-4 text-gray-700">{profile.why || 'No information provided'}</p>
        
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