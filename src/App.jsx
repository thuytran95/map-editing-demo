/** Bố cục chính: thanh tiêu đề - panel trái (Danh sách / Thuộc tính) - bản đồ bên phải. */
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { panelTabAtom } from './store/atoms.js';
import { useFeatureActions } from './hooks/useFeatureActions.js';
import MapView from './components/MapView.jsx';
import MapToolbar from './components/MapToolbar.jsx';
import FeatureList from './components/FeatureList.jsx';
import EditorPanel from './components/EditorPanel.jsx';
import Notifier from './components/Notifier.jsx';
import { MapIcon } from './components/icons.jsx';

export default function App() {
  const [tab, setTab] = useAtom(panelTabAtom);
  const { reloadAll } = useFeatureActions();

  useEffect(() => {
    reloadAll(); // tải toàn bộ đối tượng cho bản đồ khi mở ứng dụng
  }, [reloadAll]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <MapIcon />
          <Typography variant="h6" component="h1" sx={{ fontSize: 18 }}>
            Map Editing Demo
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, ml: 1 }}>
            Biên tập dữ liệu bản đồ với ReactJS + OpenLayers
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Paper square elevation={2} sx={{ width: 400, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth">
            <Tab value="list" label="Danh sách" />
            <Tab value="form" label="Thuộc tính" />
          </Tabs>
          <Box sx={{ flex: 1, overflow: 'auto' }}>{tab === 'list' ? <FeatureList /> : <EditorPanel />}</Box>
        </Paper>

        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapView />
          <MapToolbar />
        </Box>
      </Box>

      <Notifier />
    </Box>
  );
}
