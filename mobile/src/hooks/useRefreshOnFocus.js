import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useRefreshOnFocus(refetch) {
  useFocusEffect(
    useCallback(() => {
      if (typeof refetch === 'function') {
        refetch();
      }
    }, [refetch])
  );
}
