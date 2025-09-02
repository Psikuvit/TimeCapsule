'use client';

import { useState, useEffect } from 'react';
import { ENV_VARS, getEnvValidationSummary } from '../../lib/env-validation';

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [envValidation, setEnvValidation] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Fetch environment validation from server
    const fetchEnvValidation = async () => {
      try {
        const response = await fetch('/api/debug/env');
        if (response.ok) {
          const data = await response.json();
          setEnvValidation(data);
        } else {
          console.error('Failed to fetch environment validation');
        }
      } catch (error) {
        console.error('Error fetching environment validation:', error);
      }
    };
    
    fetchEnvValidation();
  }, []);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'test_code',
          state: encodeURIComponent(JSON.stringify({ provider: 'github' })),
        }),
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/session');
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testOAuthConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/config');
      if (response.ok) {
        const data = await response.json();
        setResult({
          type: 'oauth_config',
          config: data.oauthConfig,
          validation: data.validation,
          summary: {
            githubConfigured: data.validation.github.configured,
            googleConfigured: data.validation.google.configured,
          }
        });
      } else {
        throw new Error('Failed to fetch OAuth configuration');
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'network_error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Auth Complete API'}
        </button>

        <button 
          onClick={testSession}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Session API'}
        </button>

        <button 
          onClick={testOAuthConfig}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test OAuth Config'}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-black-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

             {isClient && envValidation && (
         <div className="mt-8">
           <h2 className="text-lg font-semibold mb-4">Environment Variables Check:</h2>
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {envValidation?.envVars && Object.entries(envValidation.envVars).map(([key, config]: [string, any]) => {
                const hasValue = config.isConfigured;
                const isRequired = config.required;
               
               return (
                 <div key={key} className="border rounded-lg p-4 bg-white shadow-sm">
                   <div className="flex items-center justify-between mb-2">
                     <h3 className="font-mono text-sm font-semibold">{config.name}</h3>
                     <span className="text-lg">
                       {!isRequired ? 'ℹ️' : hasValue ? '✅' : '❌'}
                     </span>
                   </div>
                   <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                   <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2 py-1 rounded ${
                     !isRequired ? 'bg-blue-100 text-blue-800' :
                     hasValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {!isRequired ? 'Optional' : hasValue ? 'Configured' : 'Missing'}
                   </span>
                   {hasValue && config.value && (
                     <span className="text-xs text-gray-500">
                       {config.value.length > 20 
                         ? `${config.value.substring(0, 20)}...` 
                         : config.value
                       }
                     </span>
                   )}
                 </div>
                 {!hasValue && config.defaultValue && (
                   <p className="text-xs text-orange-600 mt-1">
                     Default: {config.defaultValue}
                   </p>
                 )}
                 </div>
               );
             })}
           </div>

           {/* Validation Summary */}
           <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
             <h3 className="font-semibold text-gray-800 mb-2">Validation Summary:</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
               <span className="font-semibold">Total Variables:</span> {envValidation?.envValidation?.summary?.total || 0}
             </div>
             <div>
               <span className="font-semibold text-green-600">Configured:</span> {envValidation?.envValidation?.summary?.configured || 0}
             </div>
             <div>
               <span className="font-semibold text-red-600">Missing:</span> {envValidation?.envValidation?.summary?.missing || 0}
             </div>
             <div>
               <span className="font-semibold text-blue-600">Using Defaults:</span> {envValidation?.envValidation?.summary?.usingDefaults || 0}
             </div>
             </div>
             {!envValidation?.envValidation?.isValid && (
               <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                 <h4 className="font-semibold text-red-800 mb-2">Configuration Issues:</h4>
                 <ul className="text-sm text-red-700 space-y-1">
                   {envValidation?.envValidation?.errors?.map((error: string, index: number) => (
                     <li key={index}>• {error}</li>
                   ))}
                 </ul>
               </div>
             )}
           </div>

           <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
             <h3 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h3>
             <ol className="text-sm text-yellow-700 space-y-1">
               <li>1. Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in your project root</li>
               <li>2. Add the required environment variables listed above</li>
               <li>3. For OAuth: Set up GitHub and Google OAuth apps</li>
               <li>4. For Stripe: Create a Stripe account and get your API keys</li>
               <li>5. For JWT: Generate a secret using: <code className="bg-yellow-100 px-1 rounded">node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"</code></li>
             </ol>
           </div>
         </div>
       )}
    </div>
  );
}
