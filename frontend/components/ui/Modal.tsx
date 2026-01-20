import { ReactNode, useEffect, memo, useCallback } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Performance: Memoize body overflow handling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Performance: Stop propagation so clicks inside modal don't close it
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) return null

  return (
    <div className="onboarding-modal-overlay" onClick={onClose}>
      <div
        className="onboarding-modal"
        onClick={handleContentClick}
      >
        <div className="onboarding-modal-header">
          <h2 className="onboarding-modal-title">{title}</h2>
          <button type="button" onClick={onClose} className="onboarding-modal-close" aria-label="Close">
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Performance: Memoize Modal to prevent unnecessary re-renders
export default memo(Modal)

