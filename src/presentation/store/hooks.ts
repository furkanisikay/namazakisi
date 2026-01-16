/**
 * Redux hooks - tip guvenli versiyonlar
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Tip guvenli dispatch hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Tip guvenli selector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

