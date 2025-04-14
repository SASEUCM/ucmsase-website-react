import { useState } from 'react';

// Executive Chair Card Component
const ExecChairsApp = ({ profile }) => {
  // This displays the user's photo or a placeholder
  const PhotoDisplay = () => {
    if (profile.photoUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            <img 
              src={profile.photoUrl} 
              alt={`${profile.name || 'Chair'} photo`}
              className="max-w-full max-h-64 object-contain rounded-lg shadow-md"
              onError={(e) => {
                // If image fails to load (likely due to authentication requirements)
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-center p-4 border rounded-lg bg-gray-50">
              <p className="font-medium">Authentication Required</p>
              <p className="text-sm text-gray-600 mt-2">This image requires Google account access</p>
              <a 
                href={profile.photoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                View Image
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    // Fallback placeholder if no photo is available
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg p-6">
        <div className="text-gray-500 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <p className="text-gray-700 text-center font-medium">No Photo Available</p>
        <p className="text-gray-500 text-sm text-center mt-1">Photo will appear here</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row border-t border-gray-200 overflow-hidden">
      {/* Left side - Photo display */}
      <div className="w-full md:w-1/2 p-4 flex items-center justify-center border-r border-gray-200">
        <PhotoDisplay />
      </div>
      
      {/* Right side - Information */}
      <div className="w-full md:w-1/2 p-6 space-y-4">
        {/* Header information */}
        <div className="text-center">
          <h1 className="text-xl font-bold">{profile.name || 'Name'}</h1>
          <p className="text-md">{profile.year || 'Year'}</p>
          <p className="text-md">{profile.major || 'Major'}</p>
        </div>
        
        {/* Department */}
        <div className="text-center">
          <h2 className="text-lg font-semibold">{profile.department || 'Department'}</h2>
        </div>
        
        {/* Quote - with escaped quotes */}
        <div className="text-center">
          <p className="italic text-md">&ldquo;{profile.quote || 'Leadership quote'}&rdquo;</p>
        </div>
        
        {/* Qualifications */}
        <div>
          <h3 className="text-md font-medium text-center">Qualifications</h3>
          <p className="text-center text-sm">{profile.qualifications || 'Qualifications'}</p>
        </div>
        
        {/* Expertise areas */}
        <div>
          <p className="text-xs text-center">
            <span className="font-medium">Expertise: </span>
            {profile.expertise || 'Areas of expertise'}
          </p>
        </div>
        
        {/* Achievements */}
        <div>
          <p className="text-xs text-center">
            <span className="font-medium">Achievements: </span>
            {profile.achievements || 'Notable achievements'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecChairsApp;