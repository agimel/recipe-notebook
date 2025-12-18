import { useEffect } from 'react';
import toast from 'react-hot-toast';

export const useConcurrentEditDetection = ({ recipeId, onRefresh }) => {
  useEffect(() => {
    if (!recipeId) return;

    const storageKey = `recipe_edit_${recipeId}`;
    const timestamp = Date.now().toString();
    
    localStorage.setItem(storageKey, timestamp);

    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue !== timestamp) {
        toast(
          (t) => (
            <div>
              <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                ⚠️ This recipe was modified in another tab
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                Refresh to see the latest changes
              </p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  if (onRefresh) {
                    const confirmRefresh = window.confirm(
                      'Refreshing will discard your unsaved changes. Continue?'
                    );
                    if (confirmRefresh) {
                      onRefresh();
                    }
                  }
                }}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginRight: '8px'
                }}
              >
                Refresh
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Dismiss
              </button>
            </div>
          ),
          {
            duration: Infinity,
            position: 'top-center',
            style: {
              maxWidth: '500px',
              padding: '16px'
            }
          }
        );
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.removeItem(storageKey);
    };
  }, [recipeId, onRefresh]);
};
