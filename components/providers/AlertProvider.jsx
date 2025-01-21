import { Toaster } from 'sonner';

export function AlertProvider() {
  return (
    <Toaster
      position="top-center"
      expand={false}
      richColors
      theme="dark"
      toastOptions={{
        style: {
          background: '#1f2937',
          border: '1px solid #374151',
          color: 'white',
        },
      }}
    />
  );
} 