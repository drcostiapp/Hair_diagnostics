interface ARButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function ARButton({ onClick, disabled }: ARButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: 600,
        background: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s'
      }}
    >
      Place Dr. Costi in Your Space (AR)
    </button>
  )
}
