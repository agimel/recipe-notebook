import { useEffect, useContext, useCallback } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export const useNavigationBlocker = (shouldBlock, onBlock) => {
  const navigator = useContext(NavigationContext).navigator;

  useEffect(() => {
    if (!shouldBlock) return;

    if (!navigator.block) {
      return;
    }

    const unblock = navigator.block((tx) => {
      const autoUnblockingTx = {
        ...tx,
        retry() {
          unblock();
          tx.retry();
        }
      };

      onBlock(autoUnblockingTx);
    });

    return unblock;
  }, [shouldBlock, onBlock, navigator]);
};
