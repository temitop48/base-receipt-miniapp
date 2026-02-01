import { useCallback } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

export const useAddMiniApp = () => {
  const addMiniApp = useCallback(async () => {
  try {
    // ✅ Guard: only run inside Base / Farcaster environment
    if (!sdk?.actions?.addMiniApp) {
      return
    }

    await sdk.actions.addMiniApp()
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('RejectedByUser')) {
        // user closed the prompt — safe to ignore
      }
    }
  }
}, [sdk])


  return { addMiniApp }
}
