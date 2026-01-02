/**
 * Loading Screen Component
 * Ditampilkan saat first load untuk prevent flash of content
 * AGGRESSIVE VERSION - No animations, pure coverage
 */
const LoadingScreen = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 99999,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                margin: 0,
                padding: 0
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
            }}>
                {/* Logo Brand */}
                <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #84cc16, #22c55e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    DIVUS
                </div>

                {/* Loading Spinner */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #22c55e',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}>
                </div>

                {/* Loading Text */}
                <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    animation: 'fade 1.5s ease-in-out infinite'
                }}>
                    Memuat halaman...
                </p>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                @keyframes fade {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
