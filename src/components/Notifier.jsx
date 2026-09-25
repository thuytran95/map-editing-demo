/** Hiển thị thông báo ngắn (Snackbar) từ notificationAtom. */
import { useAtom } from 'jotai';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { notificationAtom } from '../store/atoms.js';

export default function Notifier() {
  const [notification, setNotification] = useAtom(notificationAtom);
  const close = () => setNotification(null);
  return (
    <Snackbar
      open={Boolean(notification)}
      autoHideDuration={3000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      {notification ? (
        <Alert severity={notification.severity} onClose={close} variant="filled">
          {notification.message}
        </Alert>
      ) : (
        <span />
      )}
    </Snackbar>
  );
}
