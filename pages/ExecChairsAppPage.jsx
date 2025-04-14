import { useState, useEffect } from 'react';
import ExecChairsApp from './components/ExecChairsApp'; // Use your existing component

const ExecChairsAppPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Fetch data from Google Apps Script web app when component mounts
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        
        // Google Apps Script deployed web app URL - Replace with your actual URL
        const appScriptUrl = 'https://script.google.com/macros/s/AKfycbzSLpwNAP-ggXKEprG2mEnCp_DnF56VEwdv24ioD9U1UZ5__7nXbYV8QjDLmWb3EvOK/exec';
        
        console.log('Fetching data from Google Apps Script');
        
        const response = await fetch(appScriptUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.profiles || data.profiles.length === 0) {
          throw new Error('No data found in the Google Apps Script response');
        }
        
        console.log('Received profiles:', data.profiles);
        setProfiles(data.profiles);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError(`Failed to load executive chairs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, []);

  // Get unique departments for the filter dropdown
  const departments = [...new Set(profiles.map(profile => profile.department))].filter(Boolean);

  // Filter profiles based on selected department
  const filteredProfiles = filterDepartment 
    ? profiles.filter(profile => profile.department === filterDepartment)
    : profiles;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Executive Chairs</h1>
        <p className="text-gray-600 mb-6">
          Meet our leadership team and department chairs
        </p>
        
        {/* Department filter */}
        <div className="max-w-md mx-auto">
          <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Department:
          </label>
          <div className="relative">
            <select
              id="department-filter"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No Executive Chairs Found</h2>
          <p>There are no chairs available for the selected department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <ExecChairsApp profile={profile} />
            </div>
          ))}
        </div>
      )}
      
      <footer className="mt-10 text-center text-sm text-gray-500">
        <p>Data populated from Google Apps Script.</p>
        <p className="mt-1">Total executive chairs: {profiles.length}</p>
      </footer>
    </div>
  );
};

export default ExecChairsAppPage;