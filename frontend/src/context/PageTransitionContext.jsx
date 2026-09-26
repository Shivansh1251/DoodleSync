/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'

const PageTransitionContext = createContext(null)

export function usePageTransition() {
  return useContext(PageTransitionContext)
}

export default PageTransitionContext
